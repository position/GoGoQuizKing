-- ============================================
-- Phase 2: 포인트 시스템 & 레벨 시스템
-- ============================================

-- 1. profiles 테이블에 포인트/레벨 관련 컬럼 추가
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE;

-- 2. 포인트 히스토리 테이블 생성
CREATE TABLE IF NOT EXISTS public.point_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_point_history_user_id ON public.point_history(user_id);
CREATE INDEX IF NOT EXISTS idx_point_history_created_at ON public.point_history(created_at);
CREATE INDEX IF NOT EXISTS idx_point_history_action_type ON public.point_history(action_type);

-- 3. 포인트 액션 타입 상수
COMMENT ON TABLE public.point_history IS '포인트 히스토리
action_type 값:
- quiz_correct: 퀴즈 정답 (+10)
- streak_bonus: 연속 정답 보너스 (+5, 3연속 이상)
- quiz_create: 퀴즈 생성 (+20)
- daily_attendance: 일일 출석 (+5)
- quiz_share: 퀴즈 공유 (+10)
';

-- 4. 레벨 계산 함수
CREATE OR REPLACE FUNCTION public.calculate_level(total_points INTEGER)
RETURNS INTEGER AS $$
BEGIN
    -- Lv.1: 0~100, Lv.2: 101~300, Lv.3: 301~600, 
    -- Lv.4: 601~1000, Lv.5: 1001~2000, Lv.6: 2001~5000, Lv.7: 5001+
    IF total_points >= 5001 THEN
        RETURN 7;
    ELSIF total_points >= 2001 THEN
        RETURN 6;
    ELSIF total_points >= 1001 THEN
        RETURN 5;
    ELSIF total_points >= 601 THEN
        RETURN 4;
    ELSIF total_points >= 301 THEN
        RETURN 3;
    ELSIF total_points >= 101 THEN
        RETURN 2;
    ELSE
        RETURN 1;
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 5. 포인트 추가 함수
CREATE OR REPLACE FUNCTION public.add_points(
    p_user_id UUID,
    p_points INTEGER,
    p_action_type VARCHAR(50),
    p_description TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS TABLE(new_points INTEGER, new_level INTEGER, level_up BOOLEAN) AS $$
DECLARE
    v_old_level INTEGER;
    v_new_level INTEGER;
    v_new_points INTEGER;
BEGIN
    -- 현재 레벨 조회
    SELECT level INTO v_old_level FROM public.profiles WHERE id = p_user_id;
    
    -- 포인트 추가
    UPDATE public.profiles 
    SET 
        points = GREATEST(0, points + p_points),
        updated_at = NOW()
    WHERE id = p_user_id
    RETURNING points INTO v_new_points;
    
    -- 새 레벨 계산
    v_new_level := public.calculate_level(v_new_points);
    
    -- 레벨 업데이트
    UPDATE public.profiles 
    SET level = v_new_level
    WHERE id = p_user_id;
    
    -- 히스토리 기록
    INSERT INTO public.point_history (user_id, points, action_type, description, metadata)
    VALUES (p_user_id, p_points, p_action_type, p_description, p_metadata);
    
    RETURN QUERY SELECT v_new_points, v_new_level, (v_new_level > v_old_level);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 일일 출석 체크 함수
CREATE OR REPLACE FUNCTION public.check_daily_attendance(p_user_id UUID)
RETURNS TABLE(attendance_points INTEGER, new_streak INTEGER, already_checked BOOLEAN) AS $$
DECLARE
    v_last_active DATE;
    v_today DATE := CURRENT_DATE;
    v_streak INTEGER;
BEGIN
    -- 마지막 활동일 조회
    SELECT 
        last_active_at::DATE,
        streak_days 
    INTO v_last_active, v_streak
    FROM public.profiles 
    WHERE id = p_user_id;
    
    -- 오늘 이미 출석했는지 확인
    IF v_last_active = v_today THEN
        RETURN QUERY SELECT 0, v_streak, TRUE;
        RETURN;
    END IF;
    
    -- 연속 출석 계산
    IF v_last_active = v_today - INTERVAL '1 day' THEN
        v_streak := COALESCE(v_streak, 0) + 1;
    ELSE
        v_streak := 1;
    END IF;
    
    -- 프로필 업데이트
    UPDATE public.profiles 
    SET 
        last_active_at = NOW(),
        streak_days = v_streak,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- 포인트 추가 (5점)
    PERFORM public.add_points(
        p_user_id,
        5,
        'daily_attendance',
        '일일 출석 보너스',
        jsonb_build_object('streak_days', v_streak)
    );
    
    RETURN QUERY SELECT 5, v_streak, FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 퀴즈 정답 시 포인트 부여 함수
CREATE OR REPLACE FUNCTION public.award_quiz_points(
    p_user_id UUID,
    p_quiz_id UUID,
    p_correct_count INTEGER,
    p_total_questions INTEGER,
    p_consecutive_correct INTEGER DEFAULT 0
)
RETURNS TABLE(total_earned INTEGER, base_points INTEGER, bonus_points INTEGER) AS $$
DECLARE
    v_base_points INTEGER;
    v_bonus_points INTEGER := 0;
    v_total INTEGER;
BEGIN
    -- 기본 포인트 (정답당 10점)
    v_base_points := p_correct_count * 10;
    
    -- 연속 정답 보너스 (3연속 이상일 때 +5점)
    IF p_consecutive_correct >= 3 THEN
        v_bonus_points := 5;
    END IF;
    
    v_total := v_base_points + v_bonus_points;
    
    -- 포인트 추가
    IF v_base_points > 0 THEN
        PERFORM public.add_points(
            p_user_id,
            v_base_points,
            'quiz_correct',
            format('퀴즈 정답 (%s/%s)', p_correct_count, p_total_questions),
            jsonb_build_object('quiz_id', p_quiz_id, 'correct_count', p_correct_count)
        );
    END IF;
    
    IF v_bonus_points > 0 THEN
        PERFORM public.add_points(
            p_user_id,
            v_bonus_points,
            'streak_bonus',
            format('%s 연속 정답 보너스', p_consecutive_correct),
            jsonb_build_object('quiz_id', p_quiz_id, 'consecutive', p_consecutive_correct)
        );
    END IF;
    
    RETURN QUERY SELECT v_total, v_base_points, v_bonus_points;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. 퀴즈 생성 시 포인트 부여 함수
CREATE OR REPLACE FUNCTION public.award_quiz_create_points(p_user_id UUID, p_quiz_id UUID)
RETURNS INTEGER AS $$
BEGIN
    PERFORM public.add_points(
        p_user_id,
        20,
        'quiz_create',
        '퀴즈 생성 보너스',
        jsonb_build_object('quiz_id', p_quiz_id)
    );
    RETURN 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. RLS 정책
ALTER TABLE public.point_history ENABLE ROW LEVEL SECURITY;

-- 본인의 포인트 히스토리만 조회 가능
CREATE POLICY "Users can view own point history"
    ON public.point_history FOR SELECT
    USING (auth.uid() = user_id);

-- 시스템만 포인트 히스토리 삽입 가능 (함수 통해서만)
CREATE POLICY "System can insert point history"
    ON public.point_history FOR INSERT
    WITH CHECK (FALSE);

-- 10. 레벨 정보 뷰 생성
CREATE OR REPLACE VIEW public.level_info AS
SELECT 
    1 AS level, '퀴즈 새싹' AS name, '🌱' AS icon, 0 AS min_points, 100 AS max_points
UNION ALL SELECT 2, '퀴즈 풀잎', '🌿', 101, 300
UNION ALL SELECT 3, '퀴즈 나무', '🌳', 301, 600
UNION ALL SELECT 4, '퀴즈 숲', '🌲', 601, 1000
UNION ALL SELECT 5, '퀴즈 마스터', '⭐', 1001, 2000
UNION ALL SELECT 6, '퀴즈 챔피언', '🏆', 2001, 5000
UNION ALL SELECT 7, '퀴즈 킹', '👑', 5001, 999999;

-- 11. 사용자 포인트 요약 뷰
CREATE OR REPLACE VIEW public.user_point_summary AS
SELECT 
    p.id AS user_id,
    p.points,
    p.level,
    p.streak_days,
    p.last_active_at,
    li.name AS level_name,
    li.icon AS level_icon,
    li.min_points,
    li.max_points,
    CASE 
        WHEN li.max_points = 999999 THEN 100
        ELSE ROUND(((p.points - li.min_points)::NUMERIC / (li.max_points - li.min_points + 1)) * 100)
    END AS level_progress
FROM public.profiles p
LEFT JOIN public.level_info li ON p.level = li.level;

-- RLS for view
GRANT SELECT ON public.level_info TO authenticated;
GRANT SELECT ON public.user_point_summary TO authenticated;

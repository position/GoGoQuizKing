-- ============================================
-- Phase 2 Week 7: 뱃지 시스템 & 업적
-- ============================================

-- 1. 뱃지 마스터 테이블
CREATE TABLE IF NOT EXISTS public.badges (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(10) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'quiz', 'streak', 'social', 'category'
    condition_type VARCHAR(50) NOT NULL, -- 조건 타입
    condition_value INTEGER NOT NULL DEFAULT 1, -- 달성 조건값
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 사용자 획득 뱃지 테이블
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id VARCHAR(50) NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- 3. 업적 진행률 테이블
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(50) NOT NULL,
    current_value INTEGER DEFAULT 0,
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_type)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON public.user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);

-- 4. 뱃지 마스터 데이터 삽입
INSERT INTO public.badges (id, name, description, icon, category, condition_type, condition_value, sort_order) VALUES
    -- 퀴즈 관련
    ('first_step', '첫 발걸음', '첫 번째 퀴즈를 완료했어요!', '👣', 'quiz', 'quiz_completed', 1, 1),
    ('quiz_10', '퀴즈 도전자', '퀴즈 10개를 완료했어요!', '🎯', 'quiz', 'quiz_completed', 10, 2),
    ('quiz_50', '퀴즈 탐험가', '퀴즈 50개를 완료했어요!', '🗺️', 'quiz', 'quiz_completed', 50, 3),
    ('quiz_100', '퀴즈 정복자', '퀴즈 100개를 완료했어요!', '🏅', 'quiz', 'quiz_completed', 100, 4),
    ('perfect_score', '백점왕', '퀴즈에서 전체 정답을 맞췄어요!', '💯', 'quiz', 'perfect_score', 1, 5),
    
    -- 퀴즈 생성 관련
    ('quiz_creator', '문제 제작자', '첫 번째 퀴즈를 만들었어요!', '✏️', 'quiz', 'quiz_created', 1, 10),
    ('quiz_creator_5', '퀴즈 작가', '퀴즈 5개를 만들었어요!', '📝', 'quiz', 'quiz_created', 5, 11),
    ('quiz_creator_20', '퀴즈 명장', '퀴즈 20개를 만들었어요!', '📚', 'quiz', 'quiz_created', 20, 12),
    ('popular_quiz', '인기스타', '내 퀴즈가 100번 풀렸어요!', '⭐', 'social', 'quiz_played', 100, 13),
    
    -- 연속 접속 관련
    ('streak_3', '출석 스타트', '3일 연속 접속했어요!', '🌟', 'streak', 'streak_days', 3, 20),
    ('streak_5', '연속 5일', '5일 연속 접속했어요!', '🔥', 'streak', 'streak_days', 5, 21),
    ('streak_7', '주간 챔피언', '7일 연속 접속했어요!', '🌈', 'streak', 'streak_days', 7, 22),
    ('streak_30', '월간 챔피언', '30일 연속 접속했어요!', '👑', 'streak', 'streak_days', 30, 23),
    
    -- 카테고리별 정답 관련
    ('math_master', '수학 천재', '수학 문제 50개를 맞췄어요!', '🧮', 'category', 'category_correct_수학', 50, 30),
    ('science_expert', '과학 박사', '과학 문제 50개를 맞췄어요!', '🔬', 'category', 'category_correct_과학', 50, 31),
    ('korean_master', '국어 달인', '국어 문제 50개를 맞췄어요!', '📖', 'category', 'category_correct_국어', 50, 32),
    ('english_expert', '영어 고수', '영어 문제 50개를 맞췄어요!', '🔤', 'category', 'category_correct_영어', 50, 33),
    ('social_expert', '사회 박사', '사회 문제 50개를 맞췄어요!', '🌍', 'category', 'category_correct_사회', 50, 34)
ON CONFLICT (id) DO NOTHING;

-- 5. 뱃지 획득 함수
CREATE OR REPLACE FUNCTION public.award_badge(
    p_user_id UUID,
    p_badge_id VARCHAR(50)
)
RETURNS BOOLEAN AS $$
DECLARE
    v_already_has BOOLEAN;
BEGIN
    -- 이미 획득했는지 확인
    SELECT EXISTS(
        SELECT 1 FROM public.user_badges 
        WHERE user_id = p_user_id AND badge_id = p_badge_id
    ) INTO v_already_has;
    
    IF v_already_has THEN
        RETURN FALSE;
    END IF;
    
    -- 뱃지 부여
    INSERT INTO public.user_badges (user_id, badge_id)
    VALUES (p_user_id, p_badge_id)
    ON CONFLICT (user_id, badge_id) DO NOTHING;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 업적 진행률 업데이트 함수
CREATE OR REPLACE FUNCTION public.update_achievement_progress(
    p_user_id UUID,
    p_achievement_type VARCHAR(50),
    p_increment INTEGER DEFAULT 1
)
RETURNS INTEGER AS $$
DECLARE
    v_new_value INTEGER;
BEGIN
    INSERT INTO public.user_achievements (user_id, achievement_type, current_value, last_updated_at)
    VALUES (p_user_id, p_achievement_type, p_increment, NOW())
    ON CONFLICT (user_id, achievement_type) DO UPDATE
    SET 
        current_value = public.user_achievements.current_value + p_increment,
        last_updated_at = NOW()
    RETURNING current_value INTO v_new_value;
    
    RETURN v_new_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 뱃지 조건 확인 및 자동 부여 함수
CREATE OR REPLACE FUNCTION public.check_and_award_badges(p_user_id UUID)
RETURNS TABLE(badge_id VARCHAR(50), badge_name VARCHAR(100), badge_icon VARCHAR(10), newly_awarded BOOLEAN) AS $$
DECLARE
    r RECORD;
    v_current_value INTEGER;
    v_awarded BOOLEAN;
BEGIN
    FOR r IN SELECT * FROM public.badges WHERE is_active = TRUE
    LOOP
        -- 현재 진행률 확인
        SELECT COALESCE(current_value, 0) INTO v_current_value
        FROM public.user_achievements
        WHERE user_id = p_user_id AND achievement_type = r.condition_type;
        
        -- streak_days는 profiles에서 확인
        IF r.condition_type = 'streak_days' THEN
            SELECT COALESCE(streak_days, 0) INTO v_current_value
            FROM public.profiles
            WHERE id = p_user_id;
        END IF;
        
        v_current_value := COALESCE(v_current_value, 0);
        
        -- 조건 충족 시 뱃지 부여
        IF v_current_value >= r.condition_value THEN
            SELECT public.award_badge(p_user_id, r.id) INTO v_awarded;
            IF v_awarded THEN
                badge_id := r.id;
                badge_name := r.name;
                badge_icon := r.icon;
                newly_awarded := TRUE;
                RETURN NEXT;
            END IF;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. 퀴즈 완료 시 뱃지 체크 함수
CREATE OR REPLACE FUNCTION public.on_quiz_completed(
    p_user_id UUID,
    p_quiz_id UUID,
    p_correct_count INTEGER,
    p_total_questions INTEGER,
    p_category VARCHAR(50) DEFAULT NULL
)
RETURNS TABLE(badge_id VARCHAR(50), badge_name VARCHAR(100), badge_icon VARCHAR(10)) AS $$
DECLARE
    v_is_perfect BOOLEAN;
    v_category_type VARCHAR(100);
BEGIN
    -- 퀴즈 완료 카운트 증가
    PERFORM public.update_achievement_progress(p_user_id, 'quiz_completed', 1);
    
    -- 전체 정답인 경우
    v_is_perfect := (p_correct_count = p_total_questions AND p_total_questions > 0);
    IF v_is_perfect THEN
        PERFORM public.update_achievement_progress(p_user_id, 'perfect_score', 1);
    END IF;
    
    -- 카테고리별 정답 수 증가
    IF p_category IS NOT NULL AND p_correct_count > 0 THEN
        v_category_type := 'category_correct_' || p_category;
        PERFORM public.update_achievement_progress(p_user_id, v_category_type, p_correct_count);
    END IF;
    
    -- 뱃지 확인 및 부여
    RETURN QUERY 
    SELECT b.badge_id, b.badge_name, b.badge_icon 
    FROM public.check_and_award_badges(p_user_id) b
    WHERE b.newly_awarded = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. 퀴즈 생성 시 뱃지 체크 함수
CREATE OR REPLACE FUNCTION public.on_quiz_created(
    p_user_id UUID,
    p_quiz_id UUID
)
RETURNS TABLE(badge_id VARCHAR(50), badge_name VARCHAR(100), badge_icon VARCHAR(10)) AS $$
BEGIN
    -- 퀴즈 생성 카운트 증가
    PERFORM public.update_achievement_progress(p_user_id, 'quiz_created', 1);
    
    -- 뱃지 확인 및 부여
    RETURN QUERY 
    SELECT b.badge_id, b.badge_name, b.badge_icon 
    FROM public.check_and_award_badges(p_user_id) b
    WHERE b.newly_awarded = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. 출석 체크 후 뱃지 확인 (streak 관련)
CREATE OR REPLACE FUNCTION public.check_streak_badges(p_user_id UUID)
RETURNS TABLE(badge_id VARCHAR(50), badge_name VARCHAR(100), badge_icon VARCHAR(10)) AS $$
BEGIN
    RETURN QUERY 
    SELECT b.badge_id, b.badge_name, b.badge_icon 
    FROM public.check_and_award_badges(p_user_id) b
    WHERE b.newly_awarded = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. 사용자 뱃지 목록 조회 뷰
CREATE OR REPLACE VIEW public.user_badges_view AS
SELECT 
    ub.user_id,
    b.id AS badge_id,
    b.name AS badge_name,
    b.description AS badge_description,
    b.icon AS badge_icon,
    b.category,
    b.sort_order,
    ub.earned_at,
    TRUE AS is_earned
FROM public.user_badges ub
JOIN public.badges b ON ub.badge_id = b.id
WHERE b.is_active = TRUE;

-- 12. 전체 뱃지 + 획득 여부 조회 함수
CREATE OR REPLACE FUNCTION public.get_user_badges_with_status(p_user_id UUID)
RETURNS TABLE(
    badge_id VARCHAR(50),
    badge_name VARCHAR(100),
    badge_description TEXT,
    badge_icon VARCHAR(10),
    category VARCHAR(50),
    condition_type VARCHAR(50),
    condition_value INTEGER,
    current_progress INTEGER,
    is_earned BOOLEAN,
    earned_at TIMESTAMP WITH TIME ZONE,
    sort_order INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        b.name,
        b.description,
        b.icon,
        b.category,
        b.condition_type,
        b.condition_value,
        CASE 
            WHEN b.condition_type = 'streak_days' THEN COALESCE(p.streak_days, 0)
            ELSE COALESCE(ua.current_value, 0)
        END AS current_progress,
        (ub.id IS NOT NULL) AS is_earned,
        ub.earned_at,
        b.sort_order
    FROM public.badges b
    LEFT JOIN public.user_badges ub ON b.id = ub.badge_id AND ub.user_id = p_user_id
    LEFT JOIN public.user_achievements ua ON ua.achievement_type = b.condition_type AND ua.user_id = p_user_id
    LEFT JOIN public.profiles p ON p.id = p_user_id
    WHERE b.is_active = TRUE
    ORDER BY b.sort_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. RLS 정책
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- 뱃지 목록은 모두 조회 가능
CREATE POLICY "Anyone can view badges"
    ON public.badges FOR SELECT
    USING (TRUE);

-- 사용자 뱃지는 본인만 조회 가능
CREATE POLICY "Users can view own badges"
    ON public.user_badges FOR SELECT
    USING (auth.uid() = user_id);

-- 사용자 업적은 본인만 조회 가능
CREATE POLICY "Users can view own achievements"
    ON public.user_achievements FOR SELECT
    USING (auth.uid() = user_id);

-- 시스템만 삽입/수정 가능 (함수 통해서만)
CREATE POLICY "System can insert user badges"
    ON public.user_badges FOR INSERT
    WITH CHECK (FALSE);

CREATE POLICY "System can manage achievements"
    ON public.user_achievements FOR ALL
    USING (FALSE);

-- 권한 부여
GRANT SELECT ON public.badges TO authenticated;
GRANT SELECT ON public.user_badges TO authenticated;
GRANT SELECT ON public.user_achievements TO authenticated;
GRANT SELECT ON public.user_badges_view TO authenticated;

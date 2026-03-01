-- =============================================
-- Phase 3: 오늘의 퀴즈 & 데일리 미션 시스템
-- =============================================

-- 1. 오늘의 퀴즈 테이블
CREATE TABLE IF NOT EXISTS daily_quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    feature_date DATE NOT NULL UNIQUE,
    bonus_points INT DEFAULT 15,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_daily_quizzes_date ON daily_quizzes(feature_date);

-- 2. 데일리 미션 정의 테이블
CREATE TABLE IF NOT EXISTS daily_missions (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(10) NOT NULL,
    mission_type VARCHAR(50) NOT NULL,
    target_value INT DEFAULT 1,
    reward_points INT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 사용자별 데일리 미션 진행 상황
CREATE TABLE IF NOT EXISTS user_daily_missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mission_id VARCHAR(50) NOT NULL REFERENCES daily_missions(id) ON DELETE CASCADE,
    mission_date DATE NOT NULL DEFAULT CURRENT_DATE,
    current_value INT DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    reward_claimed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, mission_id, mission_date)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_user_daily_missions_user_date ON user_daily_missions(user_id, mission_date);
CREATE INDEX IF NOT EXISTS idx_user_daily_missions_completed ON user_daily_missions(user_id, is_completed);

-- =============================================
-- 초기 미션 데이터
-- =============================================
INSERT INTO daily_missions (id, name, description, icon, mission_type, target_value, reward_points, sort_order) VALUES
    ('solve_quiz', '퀴즈 풀기', '퀴즈 1개를 풀어보세요!', '🎯', 'quiz_solve', 1, 10, 1),
    ('streak_3', '3문제 연속 정답', '3문제 연속으로 맞춰보세요!', '🔥', 'consecutive_correct', 3, 15, 2),
    ('today_quiz', '오늘의 퀴즈 도전', '오늘의 추천 퀴즈에 도전하세요!', '⭐', 'today_quiz', 1, 15, 3),
    ('create_quiz', '퀴즈 만들기', '나만의 퀴즈를 만들어보세요!', '✏️', 'quiz_create', 1, 20, 4)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- RPC 함수들
-- =============================================

-- 오늘의 퀴즈 가져오기 (없으면 자동 선정)
CREATE OR REPLACE FUNCTION get_today_quiz()
RETURNS TABLE (
    quiz_id UUID,
    title VARCHAR(100),
    description TEXT,
    category VARCHAR(50),
    difficulty VARCHAR(20),
    play_count INT,
    bonus_points INT,
    author_name TEXT,
    author_avatar TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_today DATE := CURRENT_DATE;
    v_quiz_id UUID;
BEGIN
    -- 오늘의 퀴즈가 있는지 확인
    SELECT dq.quiz_id INTO v_quiz_id
    FROM daily_quizzes dq
    WHERE dq.feature_date = v_today;
    
    -- 없으면 자동 선정
    IF v_quiz_id IS NULL THEN
        -- 인기 퀴즈 중 최근 7일 내 featured 되지 않은 퀴즈 선택
        SELECT q.id INTO v_quiz_id
        FROM quizzes q
        WHERE q.is_public = true
          AND q.id NOT IN (
              SELECT dq2.quiz_id 
              FROM daily_quizzes dq2 
              WHERE dq2.feature_date >= v_today - INTERVAL '7 days'
          )
        ORDER BY q.play_count DESC, q.created_at DESC
        LIMIT 1;
        
        -- 퀴즈가 있으면 등록
        IF v_quiz_id IS NOT NULL THEN
            INSERT INTO daily_quizzes (quiz_id, feature_date, bonus_points)
            VALUES (v_quiz_id, v_today, 15)
            ON CONFLICT (feature_date) DO NOTHING;
        END IF;
    END IF;
    
    -- 결과 반환
    RETURN QUERY
    SELECT 
        q.id AS quiz_id,
        q.title,
        q.description,
        q.category,
        q.difficulty,
        q.play_count,
        COALESCE(dq.bonus_points, 15) AS bonus_points,
        COALESCE(p.full_name, p.preferred_username, '익명') AS author_name,
        p.avatar_url AS author_avatar
    FROM daily_quizzes dq
    JOIN quizzes q ON q.id = dq.quiz_id
    LEFT JOIN profiles p ON p.id = q.created_by
    WHERE dq.feature_date = v_today;
END;
$$;

-- 사용자의 오늘 미션 목록 가져오기 (없으면 자동 생성)
CREATE OR REPLACE FUNCTION get_user_daily_missions(p_user_id UUID)
RETURNS TABLE (
    mission_id VARCHAR(50),
    name VARCHAR(100),
    description TEXT,
    icon VARCHAR(10),
    mission_type VARCHAR(50),
    target_value INT,
    current_value INT,
    reward_points INT,
    is_completed BOOLEAN,
    reward_claimed BOOLEAN,
    sort_order INT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_today DATE := CURRENT_DATE;
BEGIN
    -- 오늘 미션이 없으면 생성
    INSERT INTO user_daily_missions (user_id, mission_id, mission_date, current_value)
    SELECT p_user_id, dm.id, v_today, 0
    FROM daily_missions dm
    WHERE dm.is_active = true
      AND NOT EXISTS (
          SELECT 1 
          FROM user_daily_missions udm 
          WHERE udm.user_id = p_user_id 
            AND udm.mission_id = dm.id 
            AND udm.mission_date = v_today
      )
    ON CONFLICT (user_id, mission_id, mission_date) DO NOTHING;
    
    -- 결과 반환
    RETURN QUERY
    SELECT 
        dm.id AS mission_id,
        dm.name,
        dm.description,
        dm.icon,
        dm.mission_type,
        dm.target_value,
        COALESCE(udm.current_value, 0) AS current_value,
        dm.reward_points,
        COALESCE(udm.is_completed, false) AS is_completed,
        COALESCE(udm.reward_claimed, false) AS reward_claimed,
        dm.sort_order
    FROM daily_missions dm
    LEFT JOIN user_daily_missions udm 
        ON udm.mission_id = dm.id 
        AND udm.user_id = p_user_id 
        AND udm.mission_date = v_today
    WHERE dm.is_active = true
    ORDER BY dm.sort_order;
END;
$$;

-- 미션 진행 상황 업데이트
CREATE OR REPLACE FUNCTION update_mission_progress(
    p_user_id UUID,
    p_mission_type VARCHAR(50),
    p_increment INT DEFAULT 1
)
RETURNS TABLE (
    mission_id VARCHAR(50),
    mission_name VARCHAR(100),
    is_newly_completed BOOLEAN,
    reward_points INT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_today DATE := CURRENT_DATE;
    v_mission RECORD;
    v_new_value INT;
    v_newly_completed BOOLEAN := false;
BEGIN
    -- 해당 타입의 활성 미션 찾기
    FOR v_mission IN 
        SELECT dm.id, dm.name, dm.target_value, dm.reward_points
        FROM daily_missions dm
        WHERE dm.mission_type = p_mission_type AND dm.is_active = true
    LOOP
        -- 미션 진행 상황 업데이트
        INSERT INTO user_daily_missions (user_id, mission_id, mission_date, current_value)
        VALUES (p_user_id, v_mission.id, v_today, p_increment)
        ON CONFLICT (user_id, mission_id, mission_date) 
        DO UPDATE SET 
            current_value = LEAST(user_daily_missions.current_value + p_increment, v_mission.target_value)
        RETURNING current_value INTO v_new_value;
        
        -- 목표 달성 확인
        IF v_new_value >= v_mission.target_value THEN
            -- 완료 상태로 업데이트 (이미 완료되지 않은 경우만)
            UPDATE user_daily_missions 
            SET is_completed = true, 
                completed_at = NOW()
            WHERE user_id = p_user_id 
              AND mission_id = v_mission.id 
              AND mission_date = v_today
              AND is_completed = false;
            
            IF FOUND THEN
                v_newly_completed := true;
            END IF;
        END IF;
        
        RETURN QUERY SELECT 
            v_mission.id,
            v_mission.name,
            v_newly_completed,
            v_mission.reward_points;
            
        v_newly_completed := false;
    END LOOP;
END;
$$;

-- 미션 보상 수령
CREATE OR REPLACE FUNCTION claim_mission_reward(
    p_user_id UUID,
    p_mission_id VARCHAR(50)
)
RETURNS TABLE (
    success BOOLEAN,
    points_earned INT,
    message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_today DATE := CURRENT_DATE;
    v_mission_record RECORD;
    v_reward INT;
BEGIN
    -- 미션 상태 확인
    SELECT udm.is_completed, udm.reward_claimed, dm.reward_points, dm.name
    INTO v_mission_record
    FROM user_daily_missions udm
    JOIN daily_missions dm ON dm.id = udm.mission_id
    WHERE udm.user_id = p_user_id 
      AND udm.mission_id = p_mission_id 
      AND udm.mission_date = v_today;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 0, '미션을 찾을 수 없습니다.'::TEXT;
        RETURN;
    END IF;
    
    IF NOT v_mission_record.is_completed THEN
        RETURN QUERY SELECT false, 0, '미션을 아직 완료하지 않았습니다.'::TEXT;
        RETURN;
    END IF;
    
    IF v_mission_record.reward_claimed THEN
        RETURN QUERY SELECT false, 0, '이미 보상을 받았습니다.'::TEXT;
        RETURN;
    END IF;
    
    v_reward := v_mission_record.reward_points;
    
    -- 보상 수령 처리
    UPDATE user_daily_missions 
    SET reward_claimed = true
    WHERE user_id = p_user_id 
      AND mission_id = p_mission_id 
      AND mission_date = v_today;
    
    -- 포인트 지급
    PERFORM add_points(
        p_user_id,
        v_reward,
        'daily_mission',
        v_mission_record.name || ' 미션 완료',
        jsonb_build_object('mission_id', p_mission_id)
    );
    
    RETURN QUERY SELECT true, v_reward, '보상을 받았습니다!'::TEXT;
END;
$$;

-- 오늘의 퀴즈 완료 처리 (보너스 포인트)
CREATE OR REPLACE FUNCTION complete_today_quiz(
    p_user_id UUID,
    p_quiz_id UUID
)
RETURNS TABLE (
    is_today_quiz BOOLEAN,
    bonus_awarded BOOLEAN,
    bonus_points INT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_today DATE := CURRENT_DATE;
    v_today_quiz_id UUID;
    v_bonus INT;
    v_already_completed BOOLEAN;
BEGIN
    -- 오늘의 퀴즈인지 확인
    SELECT dq.quiz_id, dq.bonus_points INTO v_today_quiz_id, v_bonus
    FROM daily_quizzes dq
    WHERE dq.feature_date = v_today;
    
    IF v_today_quiz_id IS NULL OR v_today_quiz_id != p_quiz_id THEN
        RETURN QUERY SELECT false, false, 0;
        RETURN;
    END IF;
    
    -- 이미 오늘의 퀴즈 보너스를 받았는지 확인 (point_history로)
    SELECT EXISTS(
        SELECT 1 FROM point_history ph
        WHERE ph.user_id = p_user_id
          AND ph.action_type = 'today_quiz_bonus'
          AND ph.created_at::DATE = v_today
    ) INTO v_already_completed;
    
    IF v_already_completed THEN
        RETURN QUERY SELECT true, false, 0;
        RETURN;
    END IF;
    
    -- 보너스 포인트 지급
    PERFORM add_points(
        p_user_id,
        v_bonus,
        'today_quiz_bonus',
        '오늘의 퀴즈 보너스',
        jsonb_build_object('quiz_id', p_quiz_id)
    );
    
    -- today_quiz 미션 업데이트
    PERFORM update_mission_progress(p_user_id, 'today_quiz', 1);
    
    RETURN QUERY SELECT true, true, v_bonus;
END;
$$;

-- =============================================
-- RLS 정책
-- =============================================

ALTER TABLE daily_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_missions ENABLE ROW LEVEL SECURITY;

-- daily_quizzes: 모든 사용자가 읽기 가능
CREATE POLICY "daily_quizzes_read_all" ON daily_quizzes
    FOR SELECT USING (true);

-- daily_missions: 모든 사용자가 읽기 가능
CREATE POLICY "daily_missions_read_all" ON daily_missions
    FOR SELECT USING (true);

-- user_daily_missions: 자신의 데이터만 접근
CREATE POLICY "user_daily_missions_own" ON user_daily_missions
    FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- GRANT 권한
-- =============================================
GRANT SELECT ON daily_quizzes TO authenticated;
GRANT SELECT ON daily_missions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_daily_missions TO authenticated;
GRANT EXECUTE ON FUNCTION get_today_quiz() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_daily_missions(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_mission_progress(UUID, VARCHAR, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION claim_mission_reward(UUID, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_today_quiz(UUID, UUID) TO authenticated;

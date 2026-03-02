-- =============================================
-- Fix: mission_id 컬럼 참조 모호성 해결
-- =============================================

-- 기존 함수 삭제 (반환 타입 변경을 위해 필수)
DROP FUNCTION IF EXISTS update_mission_progress(UUID, VARCHAR, INT);
DROP FUNCTION IF EXISTS get_user_daily_missions(UUID);
DROP FUNCTION IF EXISTS claim_mission_reward(UUID, VARCHAR);

-- 미션 진행 상황 업데이트 함수 수정
CREATE OR REPLACE FUNCTION update_mission_progress(
    p_user_id UUID,
    p_mission_type VARCHAR(50),
    p_increment INT DEFAULT 1
)
RETURNS TABLE (
    out_mission_id VARCHAR(50),
    out_mission_name VARCHAR(100),
    out_is_newly_completed BOOLEAN,
    out_reward_points INT
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
            UPDATE user_daily_missions udm
            SET is_completed = true,
                completed_at = NOW()
            WHERE udm.user_id = p_user_id
              AND udm.mission_id = v_mission.id
              AND udm.mission_date = v_today
              AND udm.is_completed = false;

            IF FOUND THEN
                v_newly_completed := true;
            END IF;
        END IF;

        out_mission_id := v_mission.id;
        out_mission_name := v_mission.name;
        out_is_newly_completed := v_newly_completed;
        out_reward_points := v_mission.reward_points;
        RETURN NEXT;

        v_newly_completed := false;
    END LOOP;
END;
$$;

-- 사용자의 오늘 미션 목록 가져오기 함수 수정
CREATE OR REPLACE FUNCTION get_user_daily_missions(p_user_id UUID)
RETURNS TABLE (
    out_mission_id VARCHAR(50),
    out_name VARCHAR(100),
    out_description TEXT,
    out_icon VARCHAR(10),
    out_mission_type VARCHAR(50),
    out_target_value INT,
    out_current_value INT,
    out_reward_points INT,
    out_is_completed BOOLEAN,
    out_reward_claimed BOOLEAN,
    out_sort_order INT
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
        dm.id,
        dm.name,
        dm.description,
        dm.icon,
        dm.mission_type,
        dm.target_value,
        COALESCE(udm.current_value, 0),
        dm.reward_points,
        COALESCE(udm.is_completed, false),
        COALESCE(udm.reward_claimed, false),
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

-- 미션 보상 수령 함수 수정
CREATE OR REPLACE FUNCTION claim_mission_reward(
    p_user_id UUID,
    p_mission_id VARCHAR(50)
)
RETURNS TABLE (
    out_success BOOLEAN,
    out_points_earned INT,
    out_message TEXT
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
    UPDATE user_daily_missions udm
    SET reward_claimed = true
    WHERE udm.user_id = p_user_id
      AND udm.mission_id = p_mission_id
      AND udm.mission_date = v_today;

    -- 포인트 지급 (profiles.points 컬럼 사용)
    UPDATE profiles
    SET points = points + v_reward
    WHERE id = p_user_id;

    -- 포인트 히스토리 기록 (올바른 컬럼명 사용)
    INSERT INTO point_history (user_id, points, action_type, description)
    VALUES (p_user_id, v_reward, 'mission_reward', v_mission_record.name || ' 미션 완료');

    RETURN QUERY SELECT true, v_reward, ('🎉 ' || v_reward || ' 포인트를 받았습니다!')::TEXT;
END;
$$;


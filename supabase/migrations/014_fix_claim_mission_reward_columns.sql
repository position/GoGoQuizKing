-- =============================================
-- Fix: claim_mission_reward 함수의 컬럼명 수정
-- profiles.points, point_history 컬럼명 수정
-- =============================================

-- 기존 함수 삭제
DROP FUNCTION IF EXISTS claim_mission_reward(UUID, VARCHAR);

-- 수정된 미션 보상 수령 함수
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


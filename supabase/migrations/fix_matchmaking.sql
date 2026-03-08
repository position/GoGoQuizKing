-- =============================================
-- 매칭 시스템 수정
-- Supabase SQL Editor에서 실행하세요
-- =============================================

-- 함수: 매칭 대기열 등록 (수정)
CREATE OR REPLACE FUNCTION join_matchmaking(
    p_user_id UUID,
    p_battle_type VARCHAR(20) DEFAULT 'quick',
    p_same_grade_only BOOLEAN DEFAULT false
)
RETURNS TABLE (
    success BOOLEAN,
    matched_room_id UUID,
    message TEXT
) AS $$
DECLARE
    v_user_level INT;
    v_match battle_matchmaking%ROWTYPE;
    v_new_room_id UUID;
    v_room_code VARCHAR(10);
    v_question_count INT;
    v_attempt INT := 0;
BEGIN
    -- 사용자 레벨 조회
    SELECT level INTO v_user_level FROM profiles WHERE id = p_user_id;
    v_user_level := COALESCE(v_user_level, 1);

    -- 기존 대기열에 있으면 제거
    DELETE FROM battle_matchmaking WHERE user_id = p_user_id;

    -- 매칭 상대 찾기 (레벨 범위 내)
    SELECT * INTO v_match
    FROM battle_matchmaking
    WHERE battle_type = p_battle_type
    AND user_id != p_user_id
    AND ABS(user_level - v_user_level) <= 5 -- ±5 레벨 범위로 확대
    AND created_at > NOW() - INTERVAL '60 seconds' -- 60초 이내 등록자로 확대
    ORDER BY ABS(user_level - v_user_level), created_at
    LIMIT 1
    FOR UPDATE SKIP LOCKED;

    IF FOUND THEN
        -- 매칭 성공! 방 직접 생성

        -- 문제 수 결정
        v_question_count := CASE p_battle_type
            WHEN 'quick' THEN 5
            WHEN 'normal' THEN 10
            WHEN 'ranked' THEN 10
            ELSE 5
        END;

        -- 고유 방 코드 생성
        LOOP
            v_room_code := generate_room_code();
            v_attempt := v_attempt + 1;

            EXIT WHEN NOT EXISTS (
                SELECT 1 FROM battle_rooms WHERE battle_rooms.room_code = v_room_code
            ) OR v_attempt >= 10;
        END LOOP;

        -- 대결 방 생성 (호스트: 매칭 대기열에 있던 사람, 게스트: 현재 요청한 사람)
        INSERT INTO battle_rooms (host_id, guest_id, room_code, battle_type, question_count, status)
        VALUES (v_match.user_id, p_user_id, v_room_code, p_battle_type, v_question_count, 'ready')
        RETURNING id INTO v_new_room_id;

        -- 매칭 대기열에서 상대 제거
        DELETE FROM battle_matchmaking WHERE id = v_match.id;

        RETURN QUERY SELECT true, v_new_room_id, '매칭 성공!';
    ELSE
        -- 대기열에 등록
        INSERT INTO battle_matchmaking (user_id, user_level, battle_type, same_grade_only)
        VALUES (p_user_id, v_user_level, p_battle_type, p_same_grade_only)
        ON CONFLICT (user_id) DO UPDATE SET
            user_level = EXCLUDED.user_level,
            battle_type = EXCLUDED.battle_type,
            same_grade_only = EXCLUDED.same_grade_only,
            created_at = NOW();

        RETURN QUERY SELECT false, NULL::UUID, '매칭 대기 중...';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 매칭 대기열 테이블 30초 후 자동 정리 (오래된 항목 삭제용)
-- 실시간 매칭을 위해 pg_cron 또는 애플리케이션 레벨에서 정리 필요

-- 확인 쿼리
SELECT
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_name = 'join_matchmaking'
AND routine_schema = 'public';


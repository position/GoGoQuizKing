-- =============================================
-- 실시간 1:1 퀴즈 대결 시스템
-- =============================================

-- 1. 대결 방 테이블
CREATE TABLE IF NOT EXISTS battle_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code VARCHAR(10) UNIQUE, -- 초대 링크용 코드
    host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    guest_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    quiz_id UUID REFERENCES quizzes(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'ready', 'playing', 'finished', 'cancelled')),
    battle_type VARCHAR(20) DEFAULT 'quick' CHECK (battle_type IN ('quick', 'normal', 'ranked')),
    question_count INT DEFAULT 5, -- quick: 5, normal: 10
    current_question_index INT DEFAULT 0,
    host_score INT DEFAULT 0,
    guest_score INT DEFAULT 0,
    host_answers JSONB DEFAULT '[]',
    guest_answers JSONB DEFAULT '[]',
    host_streak INT DEFAULT 0,
    guest_streak INT DEFAULT 0,
    winner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    question_started_at TIMESTAMPTZ, -- 현재 문제 시작 시간
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 매칭 대기열 테이블
CREATE TABLE IF NOT EXISTS battle_matchmaking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    user_level INT NOT NULL DEFAULT 1,
    grade_level INT,
    battle_type VARCHAR(20) DEFAULT 'quick' CHECK (battle_type IN ('quick', 'normal', 'ranked')),
    same_grade_only BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 대결 기록 테이블
CREATE TABLE IF NOT EXISTS battle_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES battle_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    opponent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    result VARCHAR(10) NOT NULL CHECK (result IN ('win', 'lose', 'draw')),
    my_score INT NOT NULL DEFAULT 0,
    opponent_score INT NOT NULL DEFAULT 0,
    correct_count INT DEFAULT 0,
    total_questions INT DEFAULT 0,
    avg_response_time DECIMAL(5,2), -- 평균 응답 시간 (초)
    points_earned INT DEFAULT 0,
    ranking_points_earned INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 랭킹전 통계 테이블
CREATE TABLE IF NOT EXISTS user_ranking_stats (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    ranking_points INT DEFAULT 1000, -- 기본 1000 RP (ELO 방식)
    season_wins INT DEFAULT 0,
    season_losses INT DEFAULT 0,
    season_draws INT DEFAULT 0,
    total_wins INT DEFAULT 0,
    total_losses INT DEFAULT 0,
    total_draws INT DEFAULT 0,
    win_streak INT DEFAULT 0,
    best_win_streak INT DEFAULT 0,
    total_battles INT DEFAULT 0,
    perfect_wins INT DEFAULT 0, -- 전문제 정답 승리
    season_id INT DEFAULT 1,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 인덱스 생성
-- =============================================

CREATE INDEX IF NOT EXISTS idx_battle_rooms_host ON battle_rooms(host_id);
CREATE INDEX IF NOT EXISTS idx_battle_rooms_guest ON battle_rooms(guest_id);
CREATE INDEX IF NOT EXISTS idx_battle_rooms_status ON battle_rooms(status);
CREATE INDEX IF NOT EXISTS idx_battle_rooms_room_code ON battle_rooms(room_code);
CREATE INDEX IF NOT EXISTS idx_battle_matchmaking_created ON battle_matchmaking(created_at);
CREATE INDEX IF NOT EXISTS idx_battle_matchmaking_level ON battle_matchmaking(user_level);
CREATE INDEX IF NOT EXISTS idx_battle_history_user ON battle_history(user_id);
CREATE INDEX IF NOT EXISTS idx_battle_history_created ON battle_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_ranking_stats_points ON user_ranking_stats(ranking_points DESC);

-- =============================================
-- RLS 정책
-- =============================================

ALTER TABLE battle_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_matchmaking ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ranking_stats ENABLE ROW LEVEL SECURITY;

-- battle_rooms 정책
CREATE POLICY "Anyone can view battle rooms" ON battle_rooms
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create rooms" ON battle_rooms
    FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Participants can update rooms" ON battle_rooms
    FOR UPDATE USING (
        auth.uid() = host_id OR auth.uid() = guest_id
    );

CREATE POLICY "Host can delete room" ON battle_rooms
    FOR DELETE USING (auth.uid() = host_id);

-- battle_matchmaking 정책
CREATE POLICY "Users can view matchmaking queue" ON battle_matchmaking
    FOR SELECT USING (true);

CREATE POLICY "Users can join matchmaking" ON battle_matchmaking
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave matchmaking" ON battle_matchmaking
    FOR DELETE USING (auth.uid() = user_id);

-- battle_history 정책
CREATE POLICY "Users can view own history" ON battle_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert history" ON battle_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- user_ranking_stats 정책
CREATE POLICY "Anyone can view ranking stats" ON user_ranking_stats
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own stats" ON user_ranking_stats
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own stats" ON user_ranking_stats
    FOR UPDATE USING (auth.uid() = id);

-- =============================================
-- 함수: 방 코드 생성
-- =============================================

CREATE OR REPLACE FUNCTION generate_room_code()
RETURNS VARCHAR(6) AS $$
DECLARE
    chars VARCHAR(36) := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- 혼동 가능한 문자 제외 (0, O, I, 1)
    result VARCHAR(6) := '';
    i INT;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 함수: 대결 방 생성
-- =============================================

CREATE OR REPLACE FUNCTION create_battle_room(
    p_host_id UUID,
    p_battle_type VARCHAR(20) DEFAULT 'quick',
    p_quiz_id UUID DEFAULT NULL
)
RETURNS TABLE (
    room_id UUID,
    room_code VARCHAR(10)
) AS $$
DECLARE
    v_room_id UUID;
    v_room_code VARCHAR(6);
    v_question_count INT;
    v_attempt INT := 0;
BEGIN
    -- 문제 수 결정
    v_question_count := CASE p_battle_type
        WHEN 'quick' THEN 5
        WHEN 'normal' THEN 10
        WHEN 'ranked' THEN 10
        ELSE 5
    END;
    
    -- 고유 방 코드 생성 (최대 10번 시도)
    LOOP
        v_room_code := generate_room_code();
        v_attempt := v_attempt + 1;
        
        EXIT WHEN NOT EXISTS (
            SELECT 1 FROM battle_rooms WHERE battle_rooms.room_code = v_room_code
        ) OR v_attempt >= 10;
    END LOOP;
    
    -- 대결 방 생성
    INSERT INTO battle_rooms (host_id, room_code, battle_type, question_count, quiz_id)
    VALUES (p_host_id, v_room_code, p_battle_type, v_question_count, p_quiz_id)
    RETURNING id INTO v_room_id;
    
    RETURN QUERY SELECT v_room_id, v_room_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 함수: 방 참가
-- =============================================

CREATE OR REPLACE FUNCTION join_battle_room(
    p_room_code VARCHAR(10),
    p_user_id UUID
)
RETURNS TABLE (
    success BOOLEAN,
    room_id UUID,
    message TEXT
) AS $$
DECLARE
    v_room battle_rooms%ROWTYPE;
BEGIN
    -- 방 찾기
    SELECT * INTO v_room
    FROM battle_rooms
    WHERE battle_rooms.room_code = UPPER(p_room_code)
    AND status = 'waiting';
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, NULL::UUID, '방을 찾을 수 없거나 이미 시작된 대결입니다.';
        RETURN;
    END IF;
    
    -- 호스트인지 확인
    IF v_room.host_id = p_user_id THEN
        RETURN QUERY SELECT false, NULL::UUID, '자신의 방에는 참가할 수 없습니다.';
        RETURN;
    END IF;
    
    -- 이미 다른 참가자가 있는지 확인
    IF v_room.guest_id IS NOT NULL THEN
        RETURN QUERY SELECT false, NULL::UUID, '이미 다른 참가자가 있습니다.';
        RETURN;
    END IF;
    
    -- 참가 처리
    UPDATE battle_rooms
    SET guest_id = p_user_id, status = 'ready'
    WHERE id = v_room.id;
    
    RETURN QUERY SELECT true, v_room.id, '참가 성공!';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 함수: 매칭 대기열 등록
-- =============================================

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
    v_user_grade INT;
    v_match battle_matchmaking%ROWTYPE;
    v_new_room_id UUID;
    v_room_code VARCHAR(10);
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
    AND ABS(user_level - v_user_level) <= 2 -- ±2 레벨 범위
    AND created_at > NOW() - INTERVAL '30 seconds' -- 30초 이내 등록자
    ORDER BY ABS(user_level - v_user_level), created_at
    LIMIT 1
    FOR UPDATE SKIP LOCKED;
    
    IF FOUND THEN
        -- 매칭 성공! 방 생성
        SELECT * INTO v_new_room_id, v_room_code
        FROM create_battle_room(v_match.user_id, p_battle_type);
        
        -- 방에 현재 사용자를 게스트로 추가
        UPDATE battle_rooms
        SET guest_id = p_user_id, status = 'ready'
        WHERE id = v_new_room_id;
        
        -- 매칭 대기열에서 상대 제거
        DELETE FROM battle_matchmaking WHERE id = v_match.id;
        
        RETURN QUERY SELECT true, v_new_room_id, '매칭 성공!';
    ELSE
        -- 대기열에 등록
        INSERT INTO battle_matchmaking (user_id, user_level, battle_type, same_grade_only)
        VALUES (p_user_id, v_user_level, p_battle_type, p_same_grade_only);
        
        RETURN QUERY SELECT false, NULL::UUID, '매칭 대기 중...';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 함수: 매칭 대기열 나가기
-- =============================================

CREATE OR REPLACE FUNCTION leave_matchmaking(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    DELETE FROM battle_matchmaking WHERE user_id = p_user_id;
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 함수: 대결 점수 계산
-- =============================================

CREATE OR REPLACE FUNCTION calculate_battle_score(
    p_is_correct BOOLEAN,
    p_response_time DECIMAL, -- 초 단위
    p_streak INT
)
RETURNS INT AS $$
DECLARE
    v_base_score INT := 100;
    v_time_bonus INT := 0;
    v_streak_bonus INT := 0;
BEGIN
    IF NOT p_is_correct THEN
        RETURN 0;
    END IF;
    
    -- 시간 보너스 (15초 기준, 빨리 맞출수록 높음)
    v_time_bonus := GREATEST(0, FLOOR((15 - p_response_time) * 3.33)::INT);
    v_time_bonus := LEAST(v_time_bonus, 50); -- 최대 50점
    
    -- 연속 정답 보너스
    v_streak_bonus := CASE
        WHEN p_streak >= 5 THEN 50
        WHEN p_streak >= 3 THEN 30
        ELSE 0
    END;
    
    RETURN v_base_score + v_time_bonus + v_streak_bonus;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =============================================
-- 함수: 답변 제출
-- =============================================

CREATE OR REPLACE FUNCTION submit_battle_answer(
    p_room_id UUID,
    p_user_id UUID,
    p_question_index INT,
    p_answer TEXT,
    p_response_time DECIMAL -- 초 단위
)
RETURNS TABLE (
    success BOOLEAN,
    is_correct BOOLEAN,
    score_earned INT,
    new_total_score INT,
    new_streak INT
) AS $$
DECLARE
    v_room battle_rooms%ROWTYPE;
    v_is_host BOOLEAN;
    v_question quiz_questions%ROWTYPE;
    v_is_correct BOOLEAN;
    v_current_streak INT;
    v_score_earned INT;
    v_answers JSONB;
    v_answer_record JSONB;
BEGIN
    -- 방 정보 조회
    SELECT * INTO v_room FROM battle_rooms WHERE id = p_room_id FOR UPDATE;
    
    IF NOT FOUND OR v_room.status != 'playing' THEN
        RETURN QUERY SELECT false, false, 0, 0, 0;
        RETURN;
    END IF;
    
    -- 호스트/게스트 확인
    v_is_host := (v_room.host_id = p_user_id);
    IF NOT v_is_host AND v_room.guest_id != p_user_id THEN
        RETURN QUERY SELECT false, false, 0, 0, 0;
        RETURN;
    END IF;
    
    -- 현재 문제 인덱스 확인
    IF p_question_index != v_room.current_question_index THEN
        RETURN QUERY SELECT false, false, 0, 0, 0;
        RETURN;
    END IF;
    
    -- 문제 정보 조회
    SELECT * INTO v_question
    FROM quiz_questions
    WHERE quiz_id = v_room.quiz_id
    ORDER BY order_index
    OFFSET p_question_index
    LIMIT 1;
    
    -- 정답 확인
    v_is_correct := (LOWER(TRIM(p_answer)) = LOWER(TRIM(v_question.correct_answer)));
    
    -- 현재 스트릭 조회
    v_current_streak := CASE WHEN v_is_host THEN v_room.host_streak ELSE v_room.guest_streak END;
    
    -- 스트릭 업데이트
    IF v_is_correct THEN
        v_current_streak := v_current_streak + 1;
    ELSE
        v_current_streak := 0;
    END IF;
    
    -- 점수 계산
    v_score_earned := calculate_battle_score(v_is_correct, p_response_time, v_current_streak);
    
    -- 답변 기록 생성
    v_answer_record := jsonb_build_object(
        'question_index', p_question_index,
        'answer', p_answer,
        'is_correct', v_is_correct,
        'response_time', p_response_time,
        'score', v_score_earned
    );
    
    -- 방 업데이트
    IF v_is_host THEN
        UPDATE battle_rooms
        SET host_answers = host_answers || v_answer_record,
            host_score = host_score + v_score_earned,
            host_streak = v_current_streak
        WHERE id = p_room_id;
        
        RETURN QUERY SELECT true, v_is_correct, v_score_earned, 
            (v_room.host_score + v_score_earned), v_current_streak;
    ELSE
        UPDATE battle_rooms
        SET guest_answers = guest_answers || v_answer_record,
            guest_score = guest_score + v_score_earned,
            guest_streak = v_current_streak
        WHERE id = p_room_id;
        
        RETURN QUERY SELECT true, v_is_correct, v_score_earned, 
            (v_room.guest_score + v_score_earned), v_current_streak;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 함수: 대결 종료 및 보상 지급
-- =============================================

CREATE OR REPLACE FUNCTION finish_battle(p_room_id UUID)
RETURNS TABLE (
    success BOOLEAN,
    winner_id UUID,
    host_final_score INT,
    guest_final_score INT,
    host_points_earned INT,
    guest_points_earned INT,
    host_rp_earned INT,
    guest_rp_earned INT
) AS $$
DECLARE
    v_room battle_rooms%ROWTYPE;
    v_winner_id UUID;
    v_host_result VARCHAR(10);
    v_guest_result VARCHAR(10);
    v_host_points INT := 0;
    v_guest_points INT := 0;
    v_host_rp INT := 0;
    v_guest_rp INT := 0;
    v_is_perfect_win BOOLEAN;
    v_host_correct INT;
    v_guest_correct INT;
BEGIN
    -- 방 정보 조회
    SELECT * INTO v_room FROM battle_rooms WHERE id = p_room_id FOR UPDATE;
    
    IF NOT FOUND OR v_room.status != 'playing' THEN
        RETURN QUERY SELECT false, NULL::UUID, 0, 0, 0, 0, 0, 0;
        RETURN;
    END IF;
    
    -- 정답 수 계산
    SELECT COUNT(*) INTO v_host_correct 
    FROM jsonb_array_elements(v_room.host_answers) AS elem 
    WHERE (elem->>'is_correct')::boolean = true;
    
    SELECT COUNT(*) INTO v_guest_correct 
    FROM jsonb_array_elements(v_room.guest_answers) AS elem 
    WHERE (elem->>'is_correct')::boolean = true;
    
    -- 승자 결정
    IF v_room.host_score > v_room.guest_score THEN
        v_winner_id := v_room.host_id;
        v_host_result := 'win';
        v_guest_result := 'lose';
        v_is_perfect_win := (v_host_correct = v_room.question_count);
    ELSIF v_room.guest_score > v_room.host_score THEN
        v_winner_id := v_room.guest_id;
        v_host_result := 'lose';
        v_guest_result := 'win';
        v_is_perfect_win := (v_guest_correct = v_room.question_count);
    ELSE
        v_winner_id := NULL;
        v_host_result := 'draw';
        v_guest_result := 'draw';
        v_is_perfect_win := false;
    END IF;
    
    -- 포인트 계산
    v_host_points := CASE v_host_result
        WHEN 'win' THEN CASE WHEN v_is_perfect_win AND v_winner_id = v_room.host_id THEN 100 ELSE 50 END
        WHEN 'draw' THEN 20
        ELSE 10
    END;
    
    v_guest_points := CASE v_guest_result
        WHEN 'win' THEN CASE WHEN v_is_perfect_win AND v_winner_id = v_room.guest_id THEN 100 ELSE 50 END
        WHEN 'draw' THEN 20
        ELSE 10
    END;
    
    -- 랭킹 포인트 계산 (랭킹전만)
    IF v_room.battle_type = 'ranked' THEN
        v_host_rp := CASE v_host_result
            WHEN 'win' THEN CASE WHEN v_is_perfect_win AND v_winner_id = v_room.host_id THEN 50 ELSE 25 END
            WHEN 'draw' THEN 5
            ELSE -10
        END;
        
        v_guest_rp := CASE v_guest_result
            WHEN 'win' THEN CASE WHEN v_is_perfect_win AND v_winner_id = v_room.guest_id THEN 50 ELSE 25 END
            WHEN 'draw' THEN 5
            ELSE -10
        END;
    END IF;
    
    -- 방 상태 업데이트
    UPDATE battle_rooms
    SET status = 'finished',
        winner_id = v_winner_id,
        finished_at = NOW()
    WHERE id = p_room_id;
    
    -- 대결 기록 저장 (호스트)
    INSERT INTO battle_history (
        room_id, user_id, opponent_id, result,
        my_score, opponent_score, correct_count, total_questions,
        points_earned, ranking_points_earned
    ) VALUES (
        p_room_id, v_room.host_id, v_room.guest_id, v_host_result,
        v_room.host_score, v_room.guest_score, v_host_correct, v_room.question_count,
        v_host_points, v_host_rp
    );
    
    -- 대결 기록 저장 (게스트)
    INSERT INTO battle_history (
        room_id, user_id, opponent_id, result,
        my_score, opponent_score, correct_count, total_questions,
        points_earned, ranking_points_earned
    ) VALUES (
        p_room_id, v_room.guest_id, v_room.host_id, v_guest_result,
        v_room.guest_score, v_room.host_score, v_guest_correct, v_room.question_count,
        v_guest_points, v_guest_rp
    );
    
    -- 포인트 지급
    PERFORM add_points(v_room.host_id, v_host_points, 'battle_reward', 
        CASE v_host_result WHEN 'win' THEN '대결 승리!' WHEN 'draw' THEN '대결 무승부' ELSE '대결 패배' END);
    PERFORM add_points(v_room.guest_id, v_guest_points, 'battle_reward',
        CASE v_guest_result WHEN 'win' THEN '대결 승리!' WHEN 'draw' THEN '대결 무승부' ELSE '대결 패배' END);
    
    -- 랭킹 통계 업데이트
    INSERT INTO user_ranking_stats (id) VALUES (v_room.host_id) ON CONFLICT (id) DO NOTHING;
    INSERT INTO user_ranking_stats (id) VALUES (v_room.guest_id) ON CONFLICT (id) DO NOTHING;
    
    UPDATE user_ranking_stats
    SET ranking_points = ranking_points + v_host_rp,
        season_wins = season_wins + CASE WHEN v_host_result = 'win' THEN 1 ELSE 0 END,
        season_losses = season_losses + CASE WHEN v_host_result = 'lose' THEN 1 ELSE 0 END,
        season_draws = season_draws + CASE WHEN v_host_result = 'draw' THEN 1 ELSE 0 END,
        total_wins = total_wins + CASE WHEN v_host_result = 'win' THEN 1 ELSE 0 END,
        total_losses = total_losses + CASE WHEN v_host_result = 'lose' THEN 1 ELSE 0 END,
        total_draws = total_draws + CASE WHEN v_host_result = 'draw' THEN 1 ELSE 0 END,
        total_battles = total_battles + 1,
        perfect_wins = perfect_wins + CASE WHEN v_is_perfect_win AND v_winner_id = v_room.host_id THEN 1 ELSE 0 END,
        win_streak = CASE WHEN v_host_result = 'win' THEN win_streak + 1 ELSE 0 END,
        best_win_streak = GREATEST(best_win_streak, CASE WHEN v_host_result = 'win' THEN win_streak + 1 ELSE win_streak END),
        updated_at = NOW()
    WHERE id = v_room.host_id;
    
    UPDATE user_ranking_stats
    SET ranking_points = ranking_points + v_guest_rp,
        season_wins = season_wins + CASE WHEN v_guest_result = 'win' THEN 1 ELSE 0 END,
        season_losses = season_losses + CASE WHEN v_guest_result = 'lose' THEN 1 ELSE 0 END,
        season_draws = season_draws + CASE WHEN v_guest_result = 'draw' THEN 1 ELSE 0 END,
        total_wins = total_wins + CASE WHEN v_guest_result = 'win' THEN 1 ELSE 0 END,
        total_losses = total_losses + CASE WHEN v_guest_result = 'lose' THEN 1 ELSE 0 END,
        total_draws = total_draws + CASE WHEN v_guest_result = 'draw' THEN 1 ELSE 0 END,
        total_battles = total_battles + 1,
        perfect_wins = perfect_wins + CASE WHEN v_is_perfect_win AND v_winner_id = v_room.guest_id THEN 1 ELSE 0 END,
        win_streak = CASE WHEN v_guest_result = 'win' THEN win_streak + 1 ELSE 0 END,
        best_win_streak = GREATEST(best_win_streak, CASE WHEN v_guest_result = 'win' THEN win_streak + 1 ELSE win_streak END),
        updated_at = NOW()
    WHERE id = v_room.guest_id;
    
    RETURN QUERY SELECT true, v_winner_id, v_room.host_score, v_room.guest_score,
        v_host_points, v_guest_points, v_host_rp, v_guest_rp;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 함수: 대결 기록 조회
-- =============================================

CREATE OR REPLACE FUNCTION get_battle_history(
    p_user_id UUID,
    p_limit INT DEFAULT 20,
    p_offset INT DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    room_id UUID,
    result VARCHAR(10),
    my_score INT,
    opponent_score INT,
    correct_count INT,
    total_questions INT,
    points_earned INT,
    ranking_points_earned INT,
    opponent_id UUID,
    opponent_name TEXT,
    opponent_avatar TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bh.id,
        bh.room_id,
        bh.result,
        bh.my_score,
        bh.opponent_score,
        bh.correct_count,
        bh.total_questions,
        bh.points_earned,
        bh.ranking_points_earned,
        bh.opponent_id,
        COALESCE(p.preferred_username, p.full_name, 'Unknown')::TEXT as opponent_name,
        p.avatar_url::TEXT as opponent_avatar,
        bh.created_at
    FROM battle_history bh
    LEFT JOIN profiles p ON p.id = bh.opponent_id
    WHERE bh.user_id = p_user_id
    ORDER BY bh.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 함수: 대결 랭킹 조회
-- =============================================

CREATE OR REPLACE FUNCTION get_battle_rankings(p_limit INT DEFAULT 50)
RETURNS TABLE (
    rank BIGINT,
    user_id UUID,
    full_name TEXT,
    preferred_username TEXT,
    avatar_url TEXT,
    ranking_points INT,
    total_wins INT,
    total_battles INT,
    win_rate DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROW_NUMBER() OVER (ORDER BY urs.ranking_points DESC) as rank,
        urs.id as user_id,
        p.full_name::TEXT,
        p.preferred_username::TEXT,
        p.avatar_url::TEXT,
        urs.ranking_points,
        urs.total_wins,
        urs.total_battles,
        CASE WHEN urs.total_battles > 0 
            THEN ROUND((urs.total_wins::DECIMAL / urs.total_battles) * 100, 2)
            ELSE 0 
        END as win_rate
    FROM user_ranking_stats urs
    JOIN profiles p ON p.id = urs.id
    WHERE urs.total_battles > 0
    ORDER BY urs.ranking_points DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 함수: 랜덤 퀴즈 선택 (대결용)
-- =============================================

CREATE OR REPLACE FUNCTION get_random_quiz_for_battle(
    p_question_count INT DEFAULT 5
)
RETURNS UUID AS $$
DECLARE
    v_quiz_id UUID;
BEGIN
    -- 충분한 문제가 있는 공개 퀴즈 중 랜덤 선택
    SELECT q.id INTO v_quiz_id
    FROM quizzes q
    WHERE q.is_public = true
    AND (
        SELECT COUNT(*) FROM quiz_questions qq WHERE qq.quiz_id = q.id
    ) >= p_question_count
    ORDER BY random()
    LIMIT 1;
    
    RETURN v_quiz_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Realtime 활성화
-- =============================================

ALTER PUBLICATION supabase_realtime ADD TABLE battle_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE battle_matchmaking;

-- =============================================
-- 대결 뱃지 추가
-- =============================================

INSERT INTO badges (id, name, description, icon, category, condition_type, condition_value, sort_order) VALUES
    ('first_battle_win', '첫 승리', '첫 대결에서 승리하기', '⚔️', 'battle', 'battle_wins', 1, 100),
    ('battle_streak_5', '연승왕', '5연승 달성하기', '🔥', 'battle', 'battle_win_streak', 5, 101),
    ('speed_master', '스피드스터', '평균 응답 3초 이내로 승리', '⚡', 'battle', 'speed_win', 1, 102),
    ('battle_master', '대결왕', '100승 달성하기', '👑', 'battle', 'battle_wins', 100, 103),
    ('perfect_win_10', '완벽한 승리', '전문제 정답 승리 10회', '💎', 'battle', 'perfect_wins', 10, 104),
    ('battle_veteran', '대결 베테랑', '50회 대결 참여', '🎖️', 'battle', 'total_battles', 50, 105)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    condition_type = EXCLUDED.condition_type,
    condition_value = EXCLUDED.condition_value,
    sort_order = EXCLUDED.sort_order;

-- 완료 메시지
COMMENT ON TABLE battle_rooms IS '실시간 1:1 퀴즈 대결 방';
COMMENT ON TABLE battle_matchmaking IS '매칭 대기열';
COMMENT ON TABLE battle_history IS '대결 기록';
COMMENT ON TABLE user_ranking_stats IS '대결 랭킹 통계';

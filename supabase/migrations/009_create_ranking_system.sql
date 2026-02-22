-- =====================================================
-- 009: 랭킹 시스템 구축
-- =====================================================

-- 전체 랭킹 뷰 (총 포인트 기준)
CREATE OR REPLACE VIEW user_rankings AS
SELECT
    p.id AS user_id,
    p.full_name,
    p.preferred_username,
    p.avatar_url,
    p.points,
    p.level,
    p.streak_days,
    p.last_active_at,
    RANK() OVER (ORDER BY p.points DESC) AS rank,
    DENSE_RANK() OVER (ORDER BY p.points DESC) AS dense_rank
FROM profiles p
WHERE p.points > 0
ORDER BY p.points DESC;

-- 기간별 포인트 합계 함수
CREATE OR REPLACE FUNCTION get_period_rankings(
    p_period TEXT DEFAULT 'all', -- 'all', 'weekly', 'monthly'
    p_limit INT DEFAULT 100
)
RETURNS TABLE (
    user_id UUID,
    full_name TEXT,
    preferred_username TEXT,
    avatar_url TEXT,
    period_points BIGINT,
    total_points INT,
    level INT,
    rank BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    start_date TIMESTAMPTZ;
BEGIN
    -- 기간 설정
    IF p_period = 'weekly' THEN
        start_date := date_trunc('week', NOW());
    ELSIF p_period = 'monthly' THEN
        start_date := date_trunc('month', NOW());
    ELSE
        start_date := '1970-01-01'::TIMESTAMPTZ;
    END IF;

    RETURN QUERY
    SELECT
        pr.id AS user_id,
        pr.full_name,
        pr.preferred_username,
        pr.avatar_url,
        COALESCE(SUM(ph.points), 0)::BIGINT AS period_points,
        pr.points AS total_points,
        pr.level,
        RANK() OVER (ORDER BY COALESCE(SUM(ph.points), 0) DESC)::BIGINT AS rank
    FROM profiles pr
    LEFT JOIN point_history ph ON pr.id = ph.user_id
        AND ph.created_at >= start_date
        AND ph.points > 0
    GROUP BY pr.id, pr.full_name, pr.preferred_username, pr.avatar_url, pr.points, pr.level
    HAVING COALESCE(SUM(ph.points), 0) > 0 OR p_period = 'all'
    ORDER BY period_points DESC
    LIMIT p_limit;
END;
$$;

-- 특정 사용자의 순위 조회 함수
CREATE OR REPLACE FUNCTION get_user_ranking(
    p_user_id UUID,
    p_period TEXT DEFAULT 'all'
)
RETURNS TABLE (
    user_id UUID,
    full_name TEXT,
    preferred_username TEXT,
    avatar_url TEXT,
    period_points BIGINT,
    total_points INT,
    level INT,
    rank BIGINT,
    total_users BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    start_date TIMESTAMPTZ;
BEGIN
    -- 기간 설정
    IF p_period = 'weekly' THEN
        start_date := date_trunc('week', NOW());
    ELSIF p_period = 'monthly' THEN
        start_date := date_trunc('month', NOW());
    ELSE
        start_date := '1970-01-01'::TIMESTAMPTZ;
    END IF;

    RETURN QUERY
    WITH ranked_users AS (
        SELECT
            pr.id,
            pr.full_name,
            pr.preferred_username,
            pr.avatar_url,
            COALESCE(SUM(ph.points), 0)::BIGINT AS period_points,
            pr.points AS total_points,
            pr.level,
            RANK() OVER (ORDER BY COALESCE(SUM(ph.points), 0) DESC)::BIGINT AS rank
        FROM profiles pr
        LEFT JOIN point_history ph ON pr.id = ph.user_id
            AND ph.created_at >= start_date
            AND ph.points > 0
        GROUP BY pr.id, pr.full_name, pr.preferred_username, pr.avatar_url, pr.points, pr.level
    )
    SELECT
        ru.id AS user_id,
        ru.full_name,
        ru.preferred_username,
        ru.avatar_url,
        ru.period_points,
        ru.total_points,
        ru.level,
        ru.rank,
        (SELECT COUNT(*)::BIGINT FROM ranked_users WHERE ranked_users.period_points > 0) AS total_users
    FROM ranked_users ru
    WHERE ru.id = p_user_id;
END;
$$;

-- 카테고리별 랭킹 함수 (퀴즈 카테고리 기준)
CREATE OR REPLACE FUNCTION get_category_rankings(
    p_category TEXT,
    p_limit INT DEFAULT 100
)
RETURNS TABLE (
    user_id UUID,
    full_name TEXT,
    preferred_username TEXT,
    avatar_url TEXT,
    category_points BIGINT,
    total_points INT,
    level INT,
    rank BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        pr.id AS user_id,
        pr.full_name,
        pr.preferred_username,
        pr.avatar_url,
        COALESCE(SUM(
            CASE
                WHEN ph.metadata->>'quiz_category' = p_category THEN ph.points
                ELSE 0
            END
        ), 0)::BIGINT AS category_points,
        pr.points AS total_points,
        pr.level,
        RANK() OVER (
            ORDER BY COALESCE(SUM(
                CASE
                    WHEN ph.metadata->>'quiz_category' = p_category THEN ph.points
                    ELSE 0
                END
            ), 0) DESC
        )::BIGINT AS rank
    FROM profiles pr
    LEFT JOIN point_history ph ON pr.id = ph.user_id AND ph.points > 0
    GROUP BY pr.id, pr.full_name, pr.preferred_username, pr.avatar_url, pr.points, pr.level
    HAVING COALESCE(SUM(
        CASE
            WHEN ph.metadata->>'quiz_category' = p_category THEN ph.points
            ELSE 0
        END
    ), 0) > 0
    ORDER BY category_points DESC
    LIMIT p_limit;
END;
$$;

-- 퀴즈 풀이 횟수 랭킹 함수
CREATE OR REPLACE FUNCTION get_quiz_attempt_rankings(
    p_limit INT DEFAULT 100
)
RETURNS TABLE (
    user_id UUID,
    full_name TEXT,
    preferred_username TEXT,
    avatar_url TEXT,
    attempt_count BIGINT,
    total_points INT,
    level INT,
    rank BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        pr.id AS user_id,
        pr.full_name,
        pr.preferred_username,
        pr.avatar_url,
        COUNT(qa.id)::BIGINT AS attempt_count,
        pr.points AS total_points,
        pr.level,
        RANK() OVER (ORDER BY COUNT(qa.id) DESC)::BIGINT AS rank
    FROM profiles pr
    LEFT JOIN quiz_attempts qa ON pr.id = qa.user_id
    GROUP BY pr.id, pr.full_name, pr.preferred_username, pr.avatar_url, pr.points, pr.level
    HAVING COUNT(qa.id) > 0
    ORDER BY attempt_count DESC
    LIMIT p_limit;
END;
$$;

-- RLS 정책 (뷰는 기본 SELECT 허용)
-- 함수는 SECURITY DEFINER로 실행하므로 별도 RLS 불필요

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_point_history_created_at ON point_history(created_at);
CREATE INDEX IF NOT EXISTS idx_point_history_user_points ON point_history(user_id, points);
CREATE INDEX IF NOT EXISTS idx_profiles_points ON profiles(points DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_level ON profiles(level);

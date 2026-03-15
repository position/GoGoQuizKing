-- =============================================
-- 016: 대결 랭킹 정렬 순서 수정
-- ranking_points가 같을 때 total_wins, win_rate 순으로 정렬
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
        ROW_NUMBER() OVER (
            ORDER BY
                urs.ranking_points DESC,
                urs.total_wins DESC,
                CASE WHEN urs.total_battles > 0
                    THEN (urs.total_wins::DECIMAL / urs.total_battles)
                    ELSE 0
                END DESC,
                urs.total_battles ASC
        ) as rank,
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
    ORDER BY
        urs.ranking_points DESC,
        urs.total_wins DESC,
        CASE WHEN urs.total_battles > 0
            THEN (urs.total_wins::DECIMAL / urs.total_battles)
            ELSE 0
        END DESC,
        urs.total_battles ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_battle_rankings IS '대결 랭킹 조회 - ranking_points > total_wins > win_rate > total_battles 순으로 정렬';


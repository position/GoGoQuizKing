-- ============================================
-- 퀴즈 공유 포인트 지급 함수 (1일 3회 제한)
-- ============================================

-- 공유 포인트 지급 RPC
CREATE OR REPLACE FUNCTION public.award_share_points(
    p_user_id UUID,
    p_quiz_id TEXT DEFAULT NULL
)
RETURNS TABLE(success BOOLEAN, points_earned INTEGER, message TEXT) AS $$
DECLARE
    v_today DATE := CURRENT_DATE;
    v_daily_count INTEGER;
    v_max_daily INTEGER := 3;
    v_share_points INTEGER := 10;
    v_result RECORD;
BEGIN
    -- 오늘 공유 횟수 조회
    SELECT COUNT(*)
    INTO v_daily_count
    FROM public.point_history
    WHERE user_id = p_user_id
      AND action_type = 'quiz_share'
      AND created_at::date = v_today;

    -- 1일 3회 제한 체크
    IF v_daily_count >= v_max_daily THEN
        RETURN QUERY SELECT
            false,
            0,
            ('오늘 공유 보상은 최대 ' || v_max_daily || '회까지 받을 수 있어요! (현재 ' || v_daily_count || '/' || v_max_daily || ')')::TEXT;
        RETURN;
    END IF;

    -- 포인트 지급 (기존 add_points 함수 활용)
    SELECT * INTO v_result
    FROM public.add_points(
        p_user_id,
        v_share_points,
        'quiz_share',
        '퀴즈 공유 보상',
        jsonb_build_object('quiz_id', COALESCE(p_quiz_id, ''), 'daily_count', v_daily_count + 1)
    );

    RETURN QUERY SELECT
        true,
        v_share_points,
        ('🎉 공유 보상 +' || v_share_points || '점! (' || (v_daily_count + 1) || '/' || v_max_daily || ')')::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC 실행 권한 부여
GRANT EXECUTE ON FUNCTION public.award_share_points(UUID, TEXT) TO authenticated;


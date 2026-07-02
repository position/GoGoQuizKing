-- ============================================
-- 퀴즈 자동 생성 스케줄 업데이트
-- - 매시간 정각 실행
-- - pg_net으로 generate-daily-quiz Edge Function 실제 호출
-- ============================================

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION public.trigger_daily_quiz_generation()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    function_url TEXT;
    anon_key TEXT;
    request_id BIGINT;
BEGIN
    -- SQL Editor에서 프로젝트별로 설정하세요:
    -- ALTER DATABASE postgres SET app.supabase_url = 'https://PROJECT_REF.supabase.co';
    -- ALTER DATABASE postgres SET app.supabase_anon_key = 'YOUR_ANON_KEY';
    function_url := current_setting('app.supabase_url', true) || '/functions/v1/generate-daily-quiz';
    anon_key := current_setting('app.supabase_anon_key', true);

    IF function_url IS NULL OR function_url = '/functions/v1/generate-daily-quiz' THEN
        RAISE EXCEPTION 'app.supabase_url 설정이 필요합니다.';
    END IF;

    IF anon_key IS NULL OR anon_key = '' THEN
        RAISE EXCEPTION 'app.supabase_anon_key 설정이 필요합니다.';
    END IF;

    SELECT net.http_post(
        url := function_url,
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || anon_key,
            'apikey', anon_key
        ),
        body := jsonb_build_object('mode', 'daily')
    ) INTO request_id;

    RAISE NOTICE '퀴즈 자동 생성 Edge Function 호출 완료: request_id=%, executed_at=%', request_id, NOW();
END;
$$;

SELECT cron.unschedule('daily-quiz-generation')
WHERE EXISTS (
    SELECT 1
    FROM cron.job
    WHERE jobname = 'daily-quiz-generation'
);

SELECT cron.schedule(
    'daily-quiz-generation',
    '0 * * * *',  -- 매시간 정각
    $$SELECT public.trigger_daily_quiz_generation();$$
);

COMMENT ON FUNCTION public.trigger_daily_quiz_generation() IS '매시간 정각에 학년별 자동 퀴즈 생성을 호출하는 함수';

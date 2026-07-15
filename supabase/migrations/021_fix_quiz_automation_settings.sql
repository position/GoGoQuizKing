-- ============================================
-- 퀴즈 자동 생성 설정 경로 수정
-- - DB GUC 의존성 제거
-- - quiz_automation_settings 테이블 사용
-- - 매시간 정각 스케줄 유지
-- ============================================

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE TABLE IF NOT EXISTS public.quiz_automation_settings (
    setting_key TEXT PRIMARY KEY,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

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
    SELECT setting_value
      INTO function_url
      FROM public.quiz_automation_settings
     WHERE setting_key = 'supabase_url';

    SELECT setting_value
      INTO anon_key
      FROM public.quiz_automation_settings
     WHERE setting_key = 'supabase_anon_key';

    IF function_url IS NULL OR function_url = '' THEN
        RAISE EXCEPTION 'quiz_automation_settings.supabase_url 설정이 필요합니다.';
    END IF;

    IF anon_key IS NULL OR anon_key = '' THEN
        RAISE EXCEPTION 'quiz_automation_settings.supabase_anon_key 설정이 필요합니다.';
    END IF;

    function_url := rtrim(function_url, '/') || '/functions/v1/generate-daily-quiz';

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
    '0 * * * *',
    $$SELECT public.trigger_daily_quiz_generation();$$
);

COMMENT ON TABLE public.quiz_automation_settings IS '퀴즈 자동 생성 호출에 필요한 프로젝트 설정 저장 테이블';
COMMENT ON FUNCTION public.trigger_daily_quiz_generation() IS '매시간 정각에 자동으로 퀴즈를 생성하는 함수';

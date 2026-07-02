-- ============================================
-- 퀴즈 자동 생성 시스템 설정
-- ============================================

-- pg_cron extension 활성화 (스케줄링을 위해)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 퀴즈 생성 이력 추적 테이블 생성
CREATE TABLE IF NOT EXISTS public.quiz_generation_history (
    id BIGSERIAL PRIMARY KEY,
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    template_name TEXT NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    status TEXT DEFAULT 'success',
    error_message TEXT
);

-- RLS 활성화
ALTER TABLE public.quiz_generation_history ENABLE ROW LEVEL SECURITY;

-- 모두가 볼 수 있도록 정책 설정
DROP POLICY IF EXISTS "Anyone can view quiz generation history"
    ON public.quiz_generation_history;

CREATE POLICY "Anyone can view quiz generation history"
    ON public.quiz_generation_history FOR SELECT
    USING (true);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_quiz_generation_history_quiz_id ON public.quiz_generation_history(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_generation_history_generated_at ON public.quiz_generation_history(generated_at DESC);

-- Edge Function 호출을 위한 함수 생성
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
    -- Supabase 프로젝트 URL과 anon key를 설정해야 합니다
    -- SQL Editor에서 아래 값을 프로젝트별로 설정하세요:
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

-- 매시간 정각에 퀴즈 생성 스케줄 등록
-- 주의: pg_cron은 UTC 시간대를 사용합니다
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

-- 수동 실행을 위한 함수
CREATE OR REPLACE FUNCTION public.generate_quiz_now()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    -- 퀴즈 생성 트리거 실행
    PERFORM public.trigger_daily_quiz_generation();
    
    result := json_build_object(
        'success', true,
        'message', '퀴즈 생성이 트리거되었습니다.',
        'triggered_at', NOW()
    );
    
    RETURN result;
END;
$$;

COMMENT ON TABLE public.quiz_generation_history IS '퀴즈 자동 생성 이력을 추적하는 테이블';
COMMENT ON FUNCTION public.trigger_daily_quiz_generation() IS '매시간 정각에 자동으로 퀴즈를 생성하는 함수';
COMMENT ON FUNCTION public.generate_quiz_now() IS '수동으로 퀴즈를 즉시 생성하는 함수';

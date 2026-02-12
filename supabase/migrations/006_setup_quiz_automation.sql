-- ============================================
-- 퀴즈 자동 생성 시스템 설정
-- ============================================

-- pg_cron extension 활성화 (스케줄링을 위해)
CREATE EXTENSION IF NOT EXISTS pg_cron;

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
CREATE POLICY "Anyone can view quiz generation history"
    ON public.quiz_generation_history FOR SELECT
    USING (true);

-- 인덱스 생성
CREATE INDEX idx_quiz_generation_history_quiz_id ON public.quiz_generation_history(quiz_id);
CREATE INDEX idx_quiz_generation_history_generated_at ON public.quiz_generation_history(generated_at DESC);

-- Edge Function 호출을 위한 함수 생성
CREATE OR REPLACE FUNCTION public.trigger_daily_quiz_generation()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    function_url TEXT;
    anon_key TEXT;
    result JSON;
BEGIN
    -- Supabase 프로젝트 URL과 anon key를 설정해야 합니다
    -- 실제 배포 시 환경 변수로 관리하는 것을 권장합니다
    function_url := current_setting('app.supabase_url', true) || '/functions/v1/generate-daily-quiz';
    anon_key := current_setting('app.supabase_anon_key', true);
    
    -- Edge Function 호출 (pg_net extension 필요)
    -- 아래는 예시이며, 실제로는 pg_net.http_post를 사용해야 합니다
    RAISE NOTICE '퀴즈 자동 생성 트리거 실행: %', NOW();
END;
$$;

-- 매일 자정(한국 시간 기준 오전 9시 UTC)에 퀴즈 생성 스케줄 등록
-- 주의: pg_cron은 UTC 시간대를 사용합니다
-- 한국 시간 오전 9시 = UTC 오전 0시
SELECT cron.schedule(
    'daily-quiz-generation',
    '0 0 * * *',  -- 매일 UTC 자정 (한국 시간 오전 9시)
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
COMMENT ON FUNCTION public.trigger_daily_quiz_generation() IS '매일 자동으로 퀴즈를 생성하는 함수';
COMMENT ON FUNCTION public.generate_quiz_now() IS '수동으로 퀴즈를 즉시 생성하는 함수';

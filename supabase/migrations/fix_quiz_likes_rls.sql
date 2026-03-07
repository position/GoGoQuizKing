-- ============================================
-- Quiz Likes 문제 진단 및 수정 스크립트
-- Supabase SQL Editor에서 실행하세요
-- ============================================

-- ============================================
-- 1단계: 현재 상태 진단
-- ============================================

-- RLS가 활성화되어 있는지 확인
SELECT
    relname AS table_name,
    relrowsecurity AS rls_enabled
FROM pg_class
WHERE relname = 'quiz_likes';

-- 현재 정책 확인
SELECT
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'quiz_likes';

-- ============================================
-- 2단계: RLS 정책 재설정
-- ============================================

-- 기존 정책 삭제 (중복 방지)
DROP POLICY IF EXISTS "Anyone can view likes" ON public.quiz_likes;
DROP POLICY IF EXISTS "Authenticated users can create likes" ON public.quiz_likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON public.quiz_likes;

-- RLS 활성화
ALTER TABLE public.quiz_likes ENABLE ROW LEVEL SECURITY;

-- 정책 생성
CREATE POLICY "Anyone can view likes"
    ON public.quiz_likes FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create likes"
    ON public.quiz_likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
    ON public.quiz_likes FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- 3단계: 트리거 확인 및 재설정
-- ============================================

-- 트리거 함수 재생성 (SECURITY DEFINER로 RLS 우회)
CREATE OR REPLACE FUNCTION update_quiz_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.quizzes
        SET like_count = COALESCE(like_count, 0) + 1
        WHERE id = NEW.quiz_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.quizzes
        SET like_count = GREATEST(COALESCE(like_count, 0) - 1, 0)
        WHERE id = OLD.quiz_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 재생성
DROP TRIGGER IF EXISTS trigger_update_quiz_like_count ON public.quiz_likes;
CREATE TRIGGER trigger_update_quiz_like_count
    AFTER INSERT OR DELETE ON public.quiz_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_quiz_like_count();

-- ============================================
-- 4단계: 최종 확인
-- ============================================

-- 정책 확인
SELECT
    policyname,
    cmd,
    permissive
FROM pg_policies
WHERE tablename = 'quiz_likes';

-- 트리거 확인
SELECT
    trigger_name,
    event_manipulation
FROM information_schema.triggers
WHERE event_object_table = 'quiz_likes';

-- ============================================
-- 5단계: 테스트 (선택사항)
-- 아래 쿼리로 직접 테스트해보세요
-- YOUR_QUIZ_ID와 YOUR_USER_ID를 실제 값으로 변경
-- ============================================

-- 테스트: 좋아요 추가
-- INSERT INTO public.quiz_likes (quiz_id, user_id)
-- VALUES ('YOUR_QUIZ_ID', 'YOUR_USER_ID');

-- 테스트: 좋아요 확인
-- SELECT * FROM public.quiz_likes WHERE quiz_id = 'YOUR_QUIZ_ID';

-- 테스트: quizzes의 like_count 확인
-- SELECT id, title, like_count FROM public.quizzes WHERE id = 'YOUR_QUIZ_ID';


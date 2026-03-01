-- ============================================
-- GoGoQuizKing Phase 3: 퀴즈 댓글/좋아요 시스템
-- ============================================

-- ============================================
-- Quiz Comments 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS public.quiz_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.quiz_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ============================================
-- Quiz Likes 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS public.quiz_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(quiz_id, user_id)
);

-- ============================================
-- Quizzes에 like_count 컬럼 추가
-- ============================================
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS like_count INT DEFAULT 0;

-- ============================================
-- RLS 활성화
-- ============================================
ALTER TABLE public.quiz_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_likes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Quiz Comments RLS Policies
-- ============================================

-- 공개 퀴즈의 댓글은 누구나 볼 수 있음
CREATE POLICY "Anyone can view comments of public quizzes"
    ON public.quiz_comments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.quizzes
            WHERE id = quiz_comments.quiz_id
            AND (is_public = true OR created_by = auth.uid())
        )
    );

-- 로그인한 사용자만 댓글 작성 가능
CREATE POLICY "Authenticated users can create comments"
    ON public.quiz_comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 자신의 댓글만 수정 가능
CREATE POLICY "Users can update own comments"
    ON public.quiz_comments FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 자신의 댓글만 삭제 가능
CREATE POLICY "Users can delete own comments"
    ON public.quiz_comments FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- Quiz Likes RLS Policies
-- ============================================

-- 좋아요는 누구나 볼 수 있음 (카운트 확인용)
CREATE POLICY "Anyone can view likes"
    ON public.quiz_likes FOR SELECT
    USING (true);

-- 로그인한 사용자만 좋아요 가능
CREATE POLICY "Authenticated users can create likes"
    ON public.quiz_likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 자신의 좋아요만 삭제 가능
CREATE POLICY "Users can delete own likes"
    ON public.quiz_likes FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_quiz_comments_quiz_id ON public.quiz_comments(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_comments_user_id ON public.quiz_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_comments_parent_id ON public.quiz_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_quiz_comments_created_at ON public.quiz_comments(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_quiz_likes_quiz_id ON public.quiz_likes(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_likes_user_id ON public.quiz_likes(user_id);

-- ============================================
-- Function: 좋아요 수 업데이트 트리거
-- ============================================
CREATE OR REPLACE FUNCTION update_quiz_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.quizzes
        SET like_count = like_count + 1
        WHERE id = NEW.quiz_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.quizzes
        SET like_count = like_count - 1
        WHERE id = OLD.quiz_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for like count
DROP TRIGGER IF EXISTS trigger_update_quiz_like_count ON public.quiz_likes;
CREATE TRIGGER trigger_update_quiz_like_count
    AFTER INSERT OR DELETE ON public.quiz_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_quiz_like_count();

-- Trigger for comments updated_at
DROP TRIGGER IF EXISTS update_quiz_comments_updated_at ON public.quiz_comments;
CREATE TRIGGER update_quiz_comments_updated_at
    BEFORE UPDATE ON public.quiz_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

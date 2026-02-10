-- ============================================
-- GoGoQuizKing 퀴즈 시스템 테이블
-- Phase 1: MVP
-- ============================================

-- 퀴즈 테이블
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    grade_level INT CHECK (grade_level BETWEEN 1 AND 6) DEFAULT 3,
    difficulty VARCHAR(20) DEFAULT 'leaf',
    is_public BOOLEAN DEFAULT true,
    play_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 퀴즈 문제 테이블
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    question_type VARCHAR(20) NOT NULL DEFAULT 'multiple',
    question_text TEXT NOT NULL,
    question_image_url TEXT,
    correct_answer TEXT NOT NULL,
    options JSONB,
    hint TEXT,
    order_index INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 퀴즈 시도 테이블
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    score INT NOT NULL,
    total_questions INT NOT NULL,
    time_spent INT,
    answers JSONB,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS 활성화
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Quizzes RLS Policies
-- ============================================

-- 공개 퀴즈는 누구나 볼 수 있음
CREATE POLICY "Anyone can view public quizzes"
    ON public.quizzes FOR SELECT
    USING (is_public = true);

-- 자신의 퀴즈는 항상 볼 수 있음
CREATE POLICY "Users can view own quizzes"
    ON public.quizzes FOR SELECT
    USING (auth.uid() = created_by);

-- 로그인한 사용자만 퀴즈 생성 가능
CREATE POLICY "Authenticated users can create quizzes"
    ON public.quizzes FOR INSERT
    WITH CHECK (auth.uid() = created_by);

-- 자신의 퀴즈만 수정 가능
CREATE POLICY "Users can update own quizzes"
    ON public.quizzes FOR UPDATE
    USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

-- 자신의 퀴즈만 삭제 가능
CREATE POLICY "Users can delete own quizzes"
    ON public.quizzes FOR DELETE
    USING (auth.uid() = created_by);

-- ============================================
-- Quiz Questions RLS Policies
-- ============================================

-- 공개 퀴즈의 문제는 누구나 볼 수 있음
CREATE POLICY "Anyone can view questions of public quizzes"
    ON public.quiz_questions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.quizzes
            WHERE id = quiz_questions.quiz_id
            AND (is_public = true OR created_by = auth.uid())
        )
    );

-- 자신의 퀴즈에만 문제 추가 가능
CREATE POLICY "Users can create questions for own quizzes"
    ON public.quiz_questions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.quizzes
            WHERE id = quiz_questions.quiz_id
            AND created_by = auth.uid()
        )
    );

-- 자신의 퀴즈 문제만 수정 가능
CREATE POLICY "Users can update questions of own quizzes"
    ON public.quiz_questions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.quizzes
            WHERE id = quiz_questions.quiz_id
            AND created_by = auth.uid()
        )
    );

-- 자신의 퀴즈 문제만 삭제 가능
CREATE POLICY "Users can delete questions of own quizzes"
    ON public.quiz_questions FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.quizzes
            WHERE id = quiz_questions.quiz_id
            AND created_by = auth.uid()
        )
    );

-- ============================================
-- Quiz Attempts RLS Policies
-- ============================================

-- 자신의 시도만 볼 수 있음
CREATE POLICY "Users can view own attempts"
    ON public.quiz_attempts FOR SELECT
    USING (auth.uid() = user_id);

-- 로그인한 사용자만 시도 생성 가능
CREATE POLICY "Authenticated users can create attempts"
    ON public.quiz_attempts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Indexes for Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_quizzes_created_by ON public.quizzes(created_by);
CREATE INDEX IF NOT EXISTS idx_quizzes_category ON public.quizzes(category);
CREATE INDEX IF NOT EXISTS idx_quizzes_difficulty ON public.quizzes(difficulty);
CREATE INDEX IF NOT EXISTS idx_quizzes_grade_level ON public.quizzes(grade_level);
CREATE INDEX IF NOT EXISTS idx_quizzes_is_public ON public.quizzes(is_public);
CREATE INDEX IF NOT EXISTS idx_quizzes_play_count ON public.quizzes(play_count DESC);
CREATE INDEX IF NOT EXISTS idx_quizzes_created_at ON public.quizzes(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_order ON public.quiz_questions(quiz_id, order_index);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON public.quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_completed ON public.quiz_attempts(completed_at DESC);

-- ============================================
-- Function to increment play count
-- ============================================

CREATE OR REPLACE FUNCTION increment_quiz_play_count(quiz_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.quizzes
    SET play_count = play_count + 1
    WHERE id = quiz_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function to update updated_at timestamp
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for quizzes updated_at
CREATE TRIGGER update_quizzes_updated_at
    BEFORE UPDATE ON public.quizzes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

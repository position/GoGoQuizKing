-- ============================================
-- GoGoQuizKing: 내 댓글, 프로필 멘션, 멘션 알림
-- ============================================

-- 마이페이지의 내 댓글 최신순 조회 최적화
CREATE INDEX IF NOT EXISTS idx_quiz_comments_user_created_at
    ON public.quiz_comments(user_id, created_at DESC);

-- 댓글에서 선택된 프로필 멘션 위치와 사용자를 연결한다.
CREATE TABLE IF NOT EXISTS public.quiz_comment_mentions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comment_id UUID NOT NULL REFERENCES public.quiz_comments(id) ON DELETE CASCADE,
    mentioned_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    mention_text VARCHAR(50) NOT NULL,
    start_offset INTEGER NOT NULL CHECK (start_offset >= 0),
    length INTEGER NOT NULL CHECK (length > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(comment_id, mentioned_user_id, start_offset)
);

CREATE INDEX IF NOT EXISTS idx_quiz_comment_mentions_comment_id
    ON public.quiz_comment_mentions(comment_id);
CREATE INDEX IF NOT EXISTS idx_quiz_comment_mentions_user_created_at
    ON public.quiz_comment_mentions(mentioned_user_id, created_at DESC);

-- 멘션 전용 알림. 같은 댓글에서 같은 사용자는 한 건만 보관한다.
CREATE TABLE IF NOT EXISTS public.comment_mention_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    comment_id UUID NOT NULL REFERENCES public.quiz_comments(id) ON DELETE CASCADE,
    preview TEXT NOT NULL DEFAULT '',
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(recipient_id, comment_id)
);

CREATE INDEX IF NOT EXISTS idx_comment_mention_notifications_recipient
    ON public.comment_mention_notifications(recipient_id, is_read, created_at DESC);

ALTER TABLE public.quiz_comment_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_mention_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view visible comment mentions" ON public.quiz_comment_mentions;
CREATE POLICY "Users can view visible comment mentions"
    ON public.quiz_comment_mentions FOR SELECT
    USING (
        mentioned_user_id = auth.uid()
        OR EXISTS (
            SELECT 1
            FROM public.quiz_comments qc
            JOIN public.quizzes q ON q.id = qc.quiz_id
            WHERE qc.id = quiz_comment_mentions.comment_id
              AND (q.is_public = true OR q.created_by = auth.uid())
        )
    );

-- 멘션 쓰기는 검증 및 알림 동기화를 담당하는 함수만 수행한다.
DROP POLICY IF EXISTS "Comment authors can insert mentions" ON public.quiz_comment_mentions;
DROP POLICY IF EXISTS "Comment authors can delete mentions" ON public.quiz_comment_mentions;

DROP POLICY IF EXISTS "Users can view own mention notifications" ON public.comment_mention_notifications;
CREATE POLICY "Users can view own mention notifications"
    ON public.comment_mention_notifications FOR SELECT
    USING (recipient_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own mention notifications" ON public.comment_mention_notifications;
CREATE POLICY "Users can update own mention notifications"
    ON public.comment_mention_notifications FOR UPDATE
    USING (recipient_id = auth.uid())
    WITH CHECK (recipient_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own mention notifications" ON public.comment_mention_notifications;
CREATE POLICY "Users can delete own mention notifications"
    ON public.comment_mention_notifications FOR DELETE
    USING (recipient_id = auth.uid());

-- 댓글 작성자가 선택한 멘션을 검증하고 알림까지 한 트랜잭션에서 동기화한다.
CREATE OR REPLACE FUNCTION public.sync_quiz_comment_mentions(
    p_comment_id UUID,
    p_mentions JSONB DEFAULT '[]'::JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_actor_id UUID;
    v_quiz_id UUID;
    v_content TEXT;
BEGIN
    SELECT qc.user_id, qc.quiz_id, qc.content
      INTO v_actor_id, v_quiz_id, v_content
      FROM public.quiz_comments qc
     WHERE qc.id = p_comment_id;

    IF v_actor_id IS NULL OR v_actor_id <> auth.uid() THEN
        RAISE EXCEPTION 'Only the comment author can update mentions';
    END IF;

    DELETE FROM public.quiz_comment_mentions
     WHERE comment_id = p_comment_id;

    INSERT INTO public.quiz_comment_mentions (
        comment_id,
        mentioned_user_id,
        mention_text,
        start_offset,
        length
    )
    SELECT DISTINCT ON (candidate.user_id, candidate.start_offset)
        p_comment_id,
        candidate.user_id,
        left(candidate.mention_text, 50),
        candidate.start_offset,
        candidate.length
    FROM jsonb_to_recordset(COALESCE(p_mentions, '[]'::JSONB)) AS candidate(
        user_id UUID,
        mention_text TEXT,
        start_offset INTEGER,
        length INTEGER
    )
    WHERE candidate.user_id IS NOT NULL
      AND candidate.mention_text IS NOT NULL
      AND candidate.start_offset >= 0
      AND candidate.length > 0
      AND candidate.start_offset + candidate.length <= char_length(v_content)
      AND substring(v_content FROM candidate.start_offset + 1 FOR candidate.length)
            = '@' || candidate.mention_text
      AND (
          EXISTS (
              SELECT 1 FROM public.quizzes q
               WHERE q.id = v_quiz_id AND q.created_by = candidate.user_id
          )
          OR EXISTS (
              SELECT 1 FROM public.quiz_comments participant
               WHERE participant.quiz_id = v_quiz_id
                 AND participant.user_id = candidate.user_id
          )
          OR candidate.user_id = v_actor_id
      )
    ORDER BY candidate.user_id, candidate.start_offset;

    DELETE FROM public.comment_mention_notifications notification
     WHERE notification.comment_id = p_comment_id
       AND NOT EXISTS (
           SELECT 1
             FROM public.quiz_comment_mentions mention
            WHERE mention.comment_id = p_comment_id
              AND mention.mentioned_user_id = notification.recipient_id
       );

    INSERT INTO public.comment_mention_notifications (
        recipient_id,
        actor_id,
        quiz_id,
        comment_id,
        preview
    )
    SELECT DISTINCT
        mention.mentioned_user_id,
        v_actor_id,
        v_quiz_id,
        p_comment_id,
        left(v_content, 40)
      FROM public.quiz_comment_mentions mention
     WHERE mention.comment_id = p_comment_id
       AND mention.mentioned_user_id <> v_actor_id
    ON CONFLICT (recipient_id, comment_id)
    DO UPDATE SET
        actor_id = EXCLUDED.actor_id,
        quiz_id = EXCLUDED.quiz_id,
        preview = EXCLUDED.preview;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_quiz_comment_mentions(UUID, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sync_quiz_comment_mentions(UUID, JSONB) TO authenticated;


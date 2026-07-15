-- ============================================
-- GoGoQuizKing: 공개 프로필과 프로필 방명록
-- ============================================

CREATE TABLE IF NOT EXISTS public.profile_guestbook_settings (
    profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    visibility TEXT NOT NULL DEFAULT 'members'
        CHECK (visibility IN ('members', 'friends', 'private')),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

INSERT INTO public.profile_guestbook_settings (profile_id)
SELECT id FROM public.profiles
ON CONFLICT (profile_id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.profile_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(blocker_id, blocked_id),
    CHECK (blocker_id <> blocked_id)
);

CREATE TABLE IF NOT EXISTS public.profile_guestbook_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(trim(content)) BETWEEN 1 AND 300),
    status TEXT NOT NULL DEFAULT 'visible'
        CHECK (status IN ('visible', 'hidden', 'deleted')),
    hidden_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    hidden_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    CHECK (profile_owner_id <> author_id)
);

CREATE TABLE IF NOT EXISTS public.guestbook_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    entry_id UUID NOT NULL REFERENCES public.profile_guestbook_entries(id) ON DELETE CASCADE,
    preview TEXT NOT NULL DEFAULT '',
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(recipient_id, entry_id)
);

CREATE TABLE IF NOT EXISTS public.community_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('guestbook')),
    target_id UUID NOT NULL,
    reason TEXT NOT NULL CHECK (reason IN ('spam', 'abuse', 'privacy', 'other')),
    detail TEXT,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(reporter_id, target_type, target_id)
);

CREATE INDEX IF NOT EXISTS idx_guestbook_entries_owner_created
    ON public.profile_guestbook_entries(profile_owner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guestbook_entries_author_created
    ON public.profile_guestbook_entries(author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profile_blocks_blocked
    ON public.profile_blocks(blocked_id, blocker_id);
CREATE INDEX IF NOT EXISTS idx_guestbook_notifications_recipient
    ON public.guestbook_notifications(recipient_id, is_read, created_at DESC);

CREATE OR REPLACE FUNCTION public.are_profiles_blocked(p_first UUID, p_second UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profile_blocks
        WHERE (blocker_id = p_first AND blocked_id = p_second)
           OR (blocker_id = p_second AND blocked_id = p_first)
    );
$$;

ALTER TABLE public.profile_guestbook_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_guestbook_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guestbook_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view guestbook settings" ON public.profile_guestbook_settings;
CREATE POLICY "Members can view guestbook settings"
    ON public.profile_guestbook_settings FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Owners can update guestbook settings" ON public.profile_guestbook_settings;
CREATE POLICY "Owners can update guestbook settings"
    ON public.profile_guestbook_settings FOR UPDATE TO authenticated
    USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());
DROP POLICY IF EXISTS "Owners can insert guestbook settings" ON public.profile_guestbook_settings;
CREATE POLICY "Owners can insert guestbook settings"
    ON public.profile_guestbook_settings FOR INSERT TO authenticated
    WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "Users can view own blocks" ON public.profile_blocks;
CREATE POLICY "Users can view own blocks"
    ON public.profile_blocks FOR SELECT TO authenticated USING (blocker_id = auth.uid());
DROP POLICY IF EXISTS "Users can create own blocks" ON public.profile_blocks;
CREATE POLICY "Users can create own blocks"
    ON public.profile_blocks FOR INSERT TO authenticated WITH CHECK (blocker_id = auth.uid());
DROP POLICY IF EXISTS "Users can remove own blocks" ON public.profile_blocks;
CREATE POLICY "Users can remove own blocks"
    ON public.profile_blocks FOR DELETE TO authenticated USING (blocker_id = auth.uid());

DROP POLICY IF EXISTS "Members can view allowed guestbook entries" ON public.profile_guestbook_entries;
CREATE POLICY "Members can view allowed guestbook entries"
    ON public.profile_guestbook_entries FOR SELECT TO authenticated
    USING (
        profile_owner_id = auth.uid()
        OR author_id = auth.uid()
        OR (
            status = 'visible'
            AND EXISTS (
                SELECT 1 FROM public.profile_guestbook_settings settings
                WHERE settings.profile_id = profile_owner_id
                  AND settings.is_enabled = true
                  AND settings.visibility = 'members'
            )
            AND NOT public.are_profiles_blocked(auth.uid(), profile_owner_id)
            AND NOT public.are_profiles_blocked(auth.uid(), author_id)
        )
    );

DROP POLICY IF EXISTS "Recipients can view guestbook notifications" ON public.guestbook_notifications;
CREATE POLICY "Recipients can view guestbook notifications"
    ON public.guestbook_notifications FOR SELECT TO authenticated
    USING (recipient_id = auth.uid());
DROP POLICY IF EXISTS "Recipients can update guestbook notifications" ON public.guestbook_notifications;
CREATE POLICY "Recipients can update guestbook notifications"
    ON public.guestbook_notifications FOR UPDATE TO authenticated
    USING (recipient_id = auth.uid()) WITH CHECK (recipient_id = auth.uid());
DROP POLICY IF EXISTS "Recipients can delete guestbook notifications" ON public.guestbook_notifications;
CREATE POLICY "Recipients can delete guestbook notifications"
    ON public.guestbook_notifications FOR DELETE TO authenticated
    USING (recipient_id = auth.uid());

DROP POLICY IF EXISTS "Users can create own reports" ON public.community_reports;
CREATE POLICY "Users can create own reports"
    ON public.community_reports FOR INSERT TO authenticated
    WITH CHECK (
        reporter_id = auth.uid()
        AND target_type = 'guestbook'
        AND EXISTS (
            SELECT 1 FROM public.profile_guestbook_entries entry
            WHERE entry.id = target_id AND entry.author_id <> auth.uid()
        )
    );
DROP POLICY IF EXISTS "Users can view own reports" ON public.community_reports;
CREATE POLICY "Users can view own reports"
    ON public.community_reports FOR SELECT TO authenticated USING (reporter_id = auth.uid());

CREATE OR REPLACE FUNCTION public.ensure_guestbook_settings()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    INSERT INTO public.profile_guestbook_settings (profile_id)
    VALUES (NEW.id) ON CONFLICT (profile_id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_create_guestbook_settings ON public.profiles;
CREATE TRIGGER on_profile_create_guestbook_settings
    AFTER INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.ensure_guestbook_settings();

CREATE OR REPLACE FUNCTION public.create_profile_guestbook_entry(
    p_profile_owner_id UUID,
    p_content TEXT
)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_author_id UUID := auth.uid();
    v_entry_id UUID;
    v_settings public.profile_guestbook_settings%ROWTYPE;
BEGIN
    IF v_author_id IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
    IF v_author_id = p_profile_owner_id THEN RAISE EXCEPTION 'SELF_ENTRY_NOT_ALLOWED'; END IF;
    IF char_length(trim(COALESCE(p_content, ''))) NOT BETWEEN 1 AND 300 THEN
        RAISE EXCEPTION 'INVALID_CONTENT';
    END IF;
    IF trim(p_content) ~* '(씨발|시발|개새끼|병신)' OR trim(p_content) ~ '(.)\1{9,}' THEN
        RAISE EXCEPTION 'FORBIDDEN_CONTENT';
    END IF;

    SELECT * INTO v_settings FROM public.profile_guestbook_settings
     WHERE profile_id = p_profile_owner_id;
    IF NOT FOUND OR NOT v_settings.is_enabled OR v_settings.visibility <> 'members' THEN
        RAISE EXCEPTION 'GUESTBOOK_NOT_AVAILABLE';
    END IF;
    IF EXISTS (
        SELECT 1 FROM public.profile_blocks
        WHERE (blocker_id = v_author_id AND blocked_id = p_profile_owner_id)
           OR (blocker_id = p_profile_owner_id AND blocked_id = v_author_id)
    ) THEN RAISE EXCEPTION 'PROFILE_BLOCKED'; END IF;
    IF EXISTS (
        SELECT 1 FROM public.profile_guestbook_entries
        WHERE author_id = v_author_id
          AND created_at > timezone('utc'::text, now()) - interval '60 seconds'
    ) THEN RAISE EXCEPTION 'WRITE_COOLDOWN'; END IF;
    IF (
        SELECT count(*) FROM public.profile_guestbook_entries
        WHERE author_id = v_author_id
          AND profile_owner_id = p_profile_owner_id
          AND status <> 'deleted'
          AND created_at >= date_trunc('day', timezone('Asia/Seoul', now())) AT TIME ZONE 'Asia/Seoul'
    ) >= 3 THEN RAISE EXCEPTION 'DAILY_LIMIT_REACHED'; END IF;
    IF EXISTS (
        SELECT 1 FROM public.profile_guestbook_entries
        WHERE author_id = v_author_id
          AND lower(trim(content)) = lower(trim(p_content))
          AND status <> 'deleted'
          AND created_at > timezone('utc'::text, now()) - interval '24 hours'
    ) THEN RAISE EXCEPTION 'DUPLICATE_CONTENT'; END IF;

    INSERT INTO public.profile_guestbook_entries (profile_owner_id, author_id, content)
    VALUES (p_profile_owner_id, v_author_id, trim(p_content)) RETURNING id INTO v_entry_id;
    INSERT INTO public.guestbook_notifications (recipient_id, actor_id, entry_id, preview)
    VALUES (p_profile_owner_id, v_author_id, v_entry_id, left(trim(p_content), 40));
    RETURN v_entry_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_profile_guestbook_entry(p_entry_id UUID, p_content TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    IF char_length(trim(COALESCE(p_content, ''))) NOT BETWEEN 1 AND 300 THEN
        RAISE EXCEPTION 'INVALID_CONTENT';
    END IF;
    IF trim(p_content) ~* '(씨발|시발|개새끼|병신)' OR trim(p_content) ~ '(.)\1{9,}' THEN
        RAISE EXCEPTION 'FORBIDDEN_CONTENT';
    END IF;
    UPDATE public.profile_guestbook_entries
       SET content = trim(p_content), updated_at = timezone('utc'::text, now())
     WHERE id = p_entry_id AND author_id = auth.uid() AND status = 'visible';
    IF NOT FOUND THEN RAISE EXCEPTION 'ENTRY_NOT_EDITABLE'; END IF;
    UPDATE public.guestbook_notifications SET preview = left(trim(p_content), 40)
     WHERE entry_id = p_entry_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_profile_guestbook_entry_status(
    p_entry_id UUID,
    p_status TEXT
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_entry public.profile_guestbook_entries%ROWTYPE;
BEGIN
    IF p_status NOT IN ('visible', 'hidden', 'deleted') THEN RAISE EXCEPTION 'INVALID_STATUS'; END IF;
    SELECT * INTO v_entry FROM public.profile_guestbook_entries WHERE id = p_entry_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'ENTRY_NOT_FOUND'; END IF;
    IF auth.uid() = v_entry.author_id AND p_status <> 'deleted' THEN RAISE EXCEPTION 'NOT_ALLOWED'; END IF;
    IF auth.uid() NOT IN (v_entry.author_id, v_entry.profile_owner_id) THEN RAISE EXCEPTION 'NOT_ALLOWED'; END IF;

    UPDATE public.profile_guestbook_entries
       SET status = p_status,
           hidden_by = CASE WHEN p_status = 'visible' THEN NULL ELSE auth.uid() END,
           hidden_at = CASE WHEN p_status = 'visible' THEN NULL ELSE timezone('utc'::text, now()) END,
           updated_at = timezone('utc'::text, now())
     WHERE id = p_entry_id;
    IF p_status <> 'visible' THEN DELETE FROM public.guestbook_notifications WHERE entry_id = p_entry_id; END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.create_profile_guestbook_entry(UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_profile_guestbook_entry(UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_profile_guestbook_entry_status(UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.are_profiles_blocked(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_profile_guestbook_entry(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_profile_guestbook_entry(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_profile_guestbook_entry_status(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.are_profiles_blocked(UUID, UUID) TO authenticated;

GRANT SELECT, INSERT, UPDATE ON public.profile_guestbook_settings TO authenticated;
GRANT SELECT ON public.profile_guestbook_entries TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.profile_blocks TO authenticated;
GRANT SELECT, UPDATE, DELETE ON public.guestbook_notifications TO authenticated;
GRANT SELECT, INSERT ON public.community_reports TO authenticated;

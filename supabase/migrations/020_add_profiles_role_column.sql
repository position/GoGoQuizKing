-- ============================================
-- profiles.role 컬럼 보강
-- - admin role 사용자 기반 퀴즈 생성 지원
-- ============================================

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS role TEXT;

UPDATE public.profiles
SET role = 'user'
WHERE role IS NULL;

ALTER TABLE public.profiles
    ALTER COLUMN role SET DEFAULT 'user';

ALTER TABLE public.profiles
    ALTER COLUMN role SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

COMMENT ON COLUMN public.profiles.role IS '사용자 역할(user/admin/moderator)';

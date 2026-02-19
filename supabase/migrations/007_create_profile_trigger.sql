-- ============================================
-- 새 사용자 가입 시 profiles 테이블에 자동 레코드 생성
-- ============================================

-- 새 사용자 처리 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, preferred_username, provider, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'preferred_username',
        NEW.raw_app_meta_data->>'provider',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
        preferred_username = COALESCE(EXCLUDED.preferred_username, public.profiles.preferred_username),
        provider = COALESCE(EXCLUDED.provider, public.profiles.provider),
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 기존 트리거가 있다면 삭제
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 새 사용자 생성 시 트리거
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 기존 사용자 업데이트 시 트리거 (선택사항)
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 기존 auth.users 중 profiles에 없는 사용자 추가
-- ============================================
INSERT INTO public.profiles (id, email, full_name, avatar_url, preferred_username, provider, created_at, updated_at)
SELECT
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name'),
    u.raw_user_meta_data->>'avatar_url',
    u.raw_user_meta_data->>'preferred_username',
    u.raw_app_meta_data->>'provider',
    u.created_at,
    NOW()
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = u.id
);


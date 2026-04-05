-- ============================================
-- profiles_pkey 중복 키 에러 수정
-- Race condition 방지를 위한 트리거 함수 개선
-- ============================================

-- 기존 트리거 삭제
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

-- 개선된 사용자 처리 함수 (예외 처리 추가)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- INSERT 시도, 실패하면 UPDATE로 폴백
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
EXCEPTION
    -- 중복 키 에러 발생 시 무시하고 진행 (race condition 대응)
    WHEN unique_violation THEN
        -- 이미 존재하는 경우 UPDATE만 수행
        UPDATE public.profiles SET
            email = NEW.email,
            full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', full_name),
            avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', avatar_url),
            preferred_username = COALESCE(NEW.raw_user_meta_data->>'preferred_username', preferred_username),
            provider = COALESCE(NEW.raw_app_meta_data->>'provider', provider),
            updated_at = NOW()
        WHERE id = NEW.id;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- INSERT 트리거만 생성 (UPDATE 트리거는 불필요한 호출을 유발할 수 있음)
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 주의: UPDATE 트리거는 제거함
-- 사용자 메타데이터 업데이트는 프론트엔드에서 직접 profiles 테이블 upsert로 처리


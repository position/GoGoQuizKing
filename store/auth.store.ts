import { defineStore } from 'pinia';
import { DTO } from '@/models';
import { ToastMessage } from '@/helper/message';
import type { LoginResponse, UserRole } from '~/models/auth';
import type { PersistenceOptions } from 'pinia-plugin-persistedstate';

interface AuthStore {
    isLogin: boolean;
    userInfo: LoginResponse;
    token: string;
}

const defaultUserInfo = {
    id: null,
    avatar_url: null,
    email: null,
    email_verified: false,
    full_name: null,
    iss: null,
    name: null,
    phone_verified: false,
    preferred_username: null,
    provider_id: null,
    sub: null,
    user_name: null,
    provider: null,
    role: 'user' as UserRole,
} as LoginResponse;

export const useAuthStore = defineStore('auth', {
    state: (): AuthStore => ({
        isLogin: false,
        userInfo: { ...defaultUserInfo },
        token: '',
    }),
    getters: {
        userId: (state): string | null => state.userInfo.id ?? null,
        isAdmin: (state) => state.userInfo.role === 'admin',
        isModerator: (state) => state.userInfo.role === 'moderator',
        hasAdminAccess: (state) =>
            state.userInfo.role === 'admin' || state.userInfo.role === 'moderator',
    },
    actions: {
        registerInfo(
            userId: string,
            loginResponse: DTO.Auth.LoginResponse,
            provider: string | undefined,
            role?: UserRole,
        ) {
            this.isLogin = true;

            this.userInfo = {
                id: userId,
                avatar_url: loginResponse.avatar_url,
                email: loginResponse.email,
                email_verified: loginResponse.email_verified,
                full_name: loginResponse.full_name,
                iss: loginResponse.iss,
                name: loginResponse.name,
                phone_verified: loginResponse.phone_verified,
                preferred_username: loginResponse.preferred_username,
                provider_id: loginResponse.provider_id,
                sub: loginResponse.sub,
                user_name: loginResponse.user_name,
                provider,
                role: role || 'user',
            };
        },
        async fetchUserRole(userId: string) {
            const supabase = useSupabaseClient();
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', userId)
                    .single();

                if (error) {
                    console.error('Failed to fetch user role:', error);
                    return;
                }

                const profileData = data as { role?: string } | null;
                if (profileData?.role) {
                    this.userInfo.role = profileData.role as UserRole;
                }
            } catch (e) {
                console.error('Failed to fetch user role:', e);
            }
        },
        async signOut() {
            const router = useRouter();
            const supabase = useSupabaseClient();

            try {
                await supabase.auth.signOut();
            } catch (e) {
                console.error(e);
                ToastMessage.error('Sign Out Error');
            } finally {
                // 스토어 상태 및 persisted state 초기화 (단일 진실 소스 정리)
                this.userInfo = { ...defaultUserInfo };
                this.isLogin = false;
                this.token = '';

                // localStorage는 클라이언트 사이드에서만 사용 가능
                if (process.client) {
                    try {
                        localStorage.removeItem('auth');
                    } catch (storageError) {
                        console.error('Failed to clear auth storage:', storageError);
                    }
                }

                // 라우팅은 호출 측에서 책임지도록 하고, 여기서는 중복 네비게이션을 피한다.
                // 기존 동작 유지가 필요한 곳에서는 signOut() 호출 후 직접 router.push('/login') 수행.
                try {
                    if (router.currentRoute.value.path !== '/login') {
                        await router.push('/login');
                    }
                } catch (navigationError) {
                    console.error('Failed to navigate after sign out:', navigationError);
                }
            }
        },
        async checkSession() {
            const supabase = useSupabaseClient();

            try {
                const { data, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('checkSession error:', error);
                    // 세션 에러가 난 경우에도 안전하게 로그아웃 상태로 동기화
                    this.isLogin = false;
                    this.userInfo = { ...defaultUserInfo };
                    this.token = '';
                    return null;
                }

                const session = data.session;

                if (!session) {
                    // 세션이 없으면 스토어 상태를 명시적으로 초기화하여
                    // Navbar 등에서 로그인 상태처럼 보이지 않도록 맞춘다.
                    this.isLogin = false;
                    this.userInfo = { ...defaultUserInfo };
                    this.token = '';
                    return null;
                }

                // 세션이 있으면 토큰과 로그인 상태를 동기화한다.
                this.token = session.access_token || '';
                this.isLogin = true;

                return session;
            } catch (e) {
                console.error('checkSession exception:', e);
                this.isLogin = false;
                this.userInfo = { ...defaultUserInfo };
                this.token = '';
                return null;
            }
        },
    },
    persist: {
        storage: process.client ? localStorage : undefined,
        paths: ['isLogin', 'userInfo'],
    } as PersistenceOptions,
});

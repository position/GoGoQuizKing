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
        isAdmin: (state) => state.userInfo.role === 'admin',
        isModerator: (state) => state.userInfo.role === 'moderator',
        hasAdminAccess: (state) => state.userInfo.role === 'admin' || state.userInfo.role === 'moderator',
    },
    actions: {
        registerInfo(loginResponse: DTO.Auth.LoginResponse, provider: string | undefined, role?: UserRole) {
            this.isLogin = true;

            this.userInfo = {
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

                if (error) throw error;
                
                if (data && data.role) {
                    this.userInfo.role = data.role as UserRole;
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
                await router.push('/login');
                // localStorage는 클라이언트 사이드에서만 사용 가능
                if (process.client) {
                    localStorage.removeItem('auth');
                }
                this.userInfo = { ...defaultUserInfo };
                this.isLogin = false;
                this.token = '';
            }
        },
        async checkSession() {
            const supabase = useSupabaseClient();
            const res = await supabase.auth.getSession();
            if (!res) {
                return null;
            }
            this.token = res.data.session?.access_token || '';
            return res.data.session;
        },
    },
    persist: {
        storage: process.client ? localStorage : undefined,
        paths: ['isLogin', 'userInfo'],
    } as PersistenceOptions,
});

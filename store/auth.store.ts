import { defineStore } from 'pinia';
import { DTO } from '@/models';
import { ToastMessage } from '@/helper/message';
import type { LoginResponse } from '~/models/auth';
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
} as LoginResponse;

export const useAuthStore = defineStore('auth', {
    state: (): AuthStore => ({
        isLogin: false,
        userInfo: { ...defaultUserInfo },
        token: '',
    }),
    getters: {},
    actions: {
        registerInfo(loginResponse: DTO.Auth.LoginResponse, provider: string | undefined) {
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
            };
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
                localStorage.removeItem('auth');
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
        storage: piniaPluginPersistedstate.localStorage(),
        paths: ['isLogin', 'userInfo'],
    } as PersistenceOptions,
});

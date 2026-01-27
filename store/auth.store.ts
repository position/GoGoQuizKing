import { defineStore } from 'pinia';
import { DTO } from '@/models';
import { ToastMessage } from '@/helper/message';
import authService from '@/services/auth.service.ts';
import { router } from '@/router';

interface AuthStore {
    isLogin: boolean;
    userInfo: StaffInfo;
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
};

export const useAuthStore = defineStore('auth', {
    state: (): AuthStore => ({
        isLogin: false,
        userInfo: { ...defaultUserInfo },
        token: '',
    }),
    getters: {},
    actions: {
        registerInfo(loginResponse: DTO.Auth.LoginResponse, provider: string) {
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
            try {
                await authService.signOut();
            } catch (e) {
                console.error(e);
                ToastMessage.error('Sign Out Error');
            } finally {
                router.push('/login');
                localStorage.removeItem('auth');
                this.userInfo = { ...defaultUserInfo };
                this.isLogin = false;
            }
        },
        async checkSession() {
            const res = await authService.checkSession();
            if (!res) {
                return null;
            }
            return res.data.session;
        },
    },
    persist: {
        storage: localStorage,
        paths: ['isLogin', 'userInfo'],
    },
});

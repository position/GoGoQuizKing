import { useAuthStore } from '~/store/auth.store';

export default defineNuxtRouteMiddleware(async (to, from) => {
    // 로그인 페이지에서는 미들웨어 패스
    if (to.path === '/login') {
        return;
    }
    const authStore = useAuthStore();
    const session = await authStore.checkSession();
    if (!session) {
        try {
            await authStore.signOut();
        } catch (e) {
            console.error('로그아웃 실패:', e);
        }
        return navigateTo({ path: '/login', query: { redirectUrl: to.fullPath } });
    }
});

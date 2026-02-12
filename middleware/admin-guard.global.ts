import { useAuthStore } from '~/store/auth.store';

export default defineNuxtRouteMiddleware(async (to) => {
    // /admin 경로가 아니면 패스
    if (!to.path.startsWith('/admin')) {
        return;
    }

    const authStore = useAuthStore();

    // 세션 체크 및 role 가져오기
    const session = await authStore.checkSession();
    if (session && !authStore.userInfo.role) {
        await authStore.fetchUserRole(session.user.id);
    }

    // admin이 아니면 홈으로 리다이렉트
    if (!authStore.isAdmin) {
        return navigateTo('/');
    }
});

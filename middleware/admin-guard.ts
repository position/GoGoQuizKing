import { useAuthStore } from '~/store/auth.store';

export default defineNuxtRouteMiddleware(async () => {
    const authStore = useAuthStore();

    // role이 아직 로드되지 않았을 수 있으므로 세션 체크 및 role 가져오기
    const session = await authStore.checkSession();
    if (session && !authStore.userInfo.role) {
        await authStore.fetchUserRole(session.user.id);
    }

    if (!authStore.isAdmin) {
        return navigateTo('/');
    }
});

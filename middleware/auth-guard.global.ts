import { useAuthStore } from '~/store/auth.store';

// 인증 없이 접근 가능한 public 경로들
const publicPaths = [
    '/login',
    '/confirm',
    '/notice/notice-list',
    '/notice/notice-detail',
];

// public 경로 체크 함수
const isPublicPath = (path: string): boolean => {
    return publicPaths.some(publicPath => path.startsWith(publicPath));
};

export default defineNuxtRouteMiddleware(async (to, from) => {
    // Public 페이지에서는 미들웨어 패스
    if (isPublicPath(to.path)) {
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

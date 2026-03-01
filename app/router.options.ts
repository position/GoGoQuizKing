import type { RouterConfig } from '@nuxt/schema';

// https://router.vuejs.org/api/interfaces/routeroptions.html
export default <RouterConfig>{
    scrollBehavior(to, from, savedPosition) {
        // 브라우저 뒤로가기/앞으로가기 시 이전 스크롤 위치 복원
        if (savedPosition) {
            return savedPosition;
        }

        // 해시가 있는 경우 해당 요소로 스크롤
        if (to.hash) {
            return {
                el: to.hash,
                behavior: 'smooth',
            };
        }

        // 기본: 항상 페이지 상단으로 스크롤
        return {
            top: 0,
            left: 0,
            behavior: 'smooth',
        };
    },
};

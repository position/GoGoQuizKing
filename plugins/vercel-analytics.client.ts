import { inject } from '@vercel/analytics';

export default defineNuxtPlugin(() => {
    // 클라이언트 사이드에서만 실행
    if (import.meta.client) {
        inject();
    }
});

import { injectSpeedInsights } from '@vercel/speed-insights';

export default defineNuxtPlugin(() => {
    // 클라이언트 사이드에서만 실행
    if (import.meta.client) {
        injectSpeedInsights();
    }
});

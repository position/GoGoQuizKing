/**
 * PWA 서비스워커 플러그인
 *
 * 참고: @vite-pwa/nuxt 모듈이 서비스워커를 자동으로 등록합니다.
 * 이 플러그인은 추가적인 PWA 이벤트 처리를 위해 사용됩니다.
 */
export default defineNuxtPlugin(() => {
    // @vite-pwa/nuxt가 자동으로 서비스워커를 등록하므로
    // 수동 등록은 필요하지 않습니다.

    // PWA 업데이트 감지 (선택적)
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
            console.log('Service Worker is ready:', registration.scope);

            // 업데이트 확인
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // 새 버전이 설치됨 - 사용자에게 알림 가능
                            console.log('New version available! Refresh to update.');
                        }
                    });
                }
            });
        });
    }
});

/**
 * PWA 서비스워커 플러그인
 * 프로덕션 빌드에서만 서비스워커가 등록됩니다.
 * @vite-pwa/nuxt 모듈이 서비스워커를 자동으로 등록합니다.
 */
export default defineNuxtPlugin(() => {
    if (typeof window === 'undefined') return;

    // PWA 설치 이벤트 감지
    window.addEventListener('beforeinstallprompt', () => {
        console.log('PWA 설치 가능!');
    });

    window.addEventListener('appinstalled', () => {
        console.log('PWA가 설치되었습니다!');
    });
});

declare global {
    interface Window {
        dataLayer?: Array<Record<string, unknown>>;
        __gtmLoaded?: boolean;
    }
}

function injectGtm(gtmId: string) {
    if (window.__gtmLoaded) {
        return;
    }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        'gtm.start': Date.now(),
        event: 'gtm.js',
    });

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
    script.id = 'nuxt-gtm-loader';

    document.head.appendChild(script);

    const noscript = document.createElement('noscript');
    noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
    document.body.prepend(noscript);

    window.__gtmLoaded = true;
}

export default defineNuxtPlugin(() => {
    const gtmId = useRuntimeConfig().public.gtmId as string;

    if (!gtmId) {
        if (import.meta.dev) {
            console.warn('[GTM] NUXT_PUBLIC_GTM_ID 환경 변수가 설정되지 않았습니다.');
        }
        return;
    }

    const init = () => injectGtm(gtmId);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
});



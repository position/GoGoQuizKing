declare global {
    interface Window {
        dataLayer?: Array<Record<string, unknown>>;
        gtag?: (...args: unknown[]) => void;
        __gtmLoaded?: boolean;
        __gtagLoaded?: boolean;
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

function injectGtag(gaId: string) {
    if (window.__gtagLoaded) {
        return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    script.id = 'nuxt-gtag-loader';
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function (...args: unknown[]) {
        window.dataLayer!.push(args as unknown as Record<string, unknown>);
    };
    window.gtag('js', new Date());
    window.gtag('config', gaId);

    window.__gtagLoaded = true;
}

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig().public;
    const gtmId = (config.gtmId as string) || '';
    const gaId = (config.gaId as string) || '';

    const init = () => {
        if (gtmId) {
            injectGtm(gtmId);
        }
        if (gaId) {
            injectGtag(gaId);
        }
    };

    if (!gtmId && !gaId) {
        if (import.meta.dev) {
            console.warn('[Analytics] GTM/GA 환경 변수가 설정되지 않았습니다.');
        }
        return;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
});



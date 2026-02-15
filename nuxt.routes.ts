import type { NitroConfig } from 'nitropack';

export const routeRules: NitroConfig['routeRules'] = {
    /*
        Home
     */

    '/': {
        ssr: true,
        prerender: false,
    },
    '/login': {
        ssr: false,
        prerender: false,
    },
    '/notice/**': {
        ssr: true,
        prerender: false,
    },
    '/quiz/**': {
        ssr: true,
        prerender: false,
    },

    /*
        API Cache Rules
     */
    '/api/quiz/questions': {
        cache: {
            maxAge: 60, // 1분 캐시
        },
    },

    /*
        Static Assets Cache
     */
    '/_nuxt/**': {
        headers: {
            'cache-control': 'public, max-age=31536000, immutable',
        },
    },
    '/favicon.ico': {
        headers: {
            'cache-control': 'public, max-age=86400',
        },
    },
};

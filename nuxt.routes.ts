import type { NitroConfig } from 'nitropack';

export const routeRules: NitroConfig['routeRules'] = {
    /*
        Home
     */

    '/': {
        swr: 60,
        prerender: false,
    },

    /*
        Auth
     */

    '/auth/login': {
        ssr: false,
        prerender: false,
    },
    '/auth/register': {
        ssr: false,
        prerender: false,
    },
    '/auth/logout': {
        ssr: false,
        prerender: false,
        appMiddleware: ['logout'],
    },
    '/auth/**': {
        ssr: false,
        prerender: false,
    },

    /*
        User
     */

    '/my-profile/**': {
        ssr: false,
        prerender: false,
    },
    '/manage-follow-player': {
        ssr: false,
        prerender: false,
    },
    '/my-staking/**': {
        ssr: false,
        prerender: false,
        appMiddleware: ['my-staking-guard'],
    },
    '/profiles/**': {
        ssr: false,
        prerender: false,
    },

    /*
        Payment
     */

    '/payment': {
        redirect: '/payment/deposit',
    },
    '/payment/**': {
        ssr: false,
        prerender: false,
    },

    /*
        Staking
     */

    '/staking': {
        ssr: false,
        redirect: '/staking/poker-staking',
    },
    '/staking/poker-staking': {
        ssr: true,
        prerender: false,
    },
    '/staking/**': {
        ssr: true,
        prerender: false,
    },
    '/staking/poker-staking/**': {
        ssr: true,
    },

    /*
        News
     */

    '/news': {
        prerender: false,
    },
    '/news/**': {
        cache: {
            swr: true,
            maxAge: 60,
            base: 'news',
        },
        prerender: false,
    },
    '/articles/**': {
        redirect: '/news/**',
    },

    /*
        ETC
     */

    '/maintenance': {
        ssr: false,
        prerender: false,
    },
    '/etc/**': {
        ssr: false,
        prerender: false,
    },
    '/external/**': {
        ssr: false,
        prerender: false,
    },

    /*
        Promotions
     */

    '/promotions/**': {
        static: true,
        prerender: false,
    },

    /*
        Static
     */

    '/about-us': {
        static: true,
        prerender: false,
    },
    '/cookie-policy': {
        static: true,
        prerender: false,
    },
    '/dmca-notice': {
        static: true,
        prerender: false,
    },
    '/faq': {
        static: true,
        prerender: false,
    },
    '/privacy-policy': {
        static: true,
        prerender: false,
    },
    '/terms-and-conditions': {
        static: true,
        prerender: false,
    },
};

import type { NitroConfig } from 'nitropack';

export const routeRules: NitroConfig['routeRules'] = {
    /*
        Home
     */

    '/': {
        ssr: false,
        prerender: false,
    },
    '/login': {
        ssr: false,
        prerender: false,
    },
    '/notice/**': {
        ssr: false,
        prerender: false,
    },
    '/quiz/**': {
        ssr: false,
        prerender: false,
    },
};

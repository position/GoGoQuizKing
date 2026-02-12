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
};

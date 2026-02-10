// https://nuxt.com/docs/api/configuration/nuxt-config
import { routeRules } from './nuxt.routes';

export default defineNuxtConfig({
    runtimeConfig: {
        public: {
            supabaseUrl: process.env.SUPABASE_URL,
            supabaseKey: process.env.SUPABASE_KEY,
            apiTimeout: '',
            triviaApi: '',
            supabaseStorage: '',
            cdnBase: '',
        },
    },
    components: [
        {
            path: '~/components',
            pathPrefix: false,
        },
    ],
    css: ['~/assets/scss/styles.scss', 'quasar/src/css/index.sass'],
    routeRules,
    modules: [
        '@nuxt/eslint',
        'nuxt-time',
        '@nuxt/image',
        'dayjs-nuxt',
        '@pinia/nuxt',
        'pinia-plugin-persistedstate/nuxt',
        '@nuxtjs/seo',
        'nuxt-quasar-ui',
        '@nuxtjs/supabase',
    ],
    supabase: {
        // @nuxtjs/supabase 모듈은 기본적으로 SUPABASE_URL, SUPABASE_KEY 환경변수를 사용
        // 또는 NUXT_PUBLIC_SUPABASE_URL, NUXT_PUBLIC_SUPABASE_KEY도 지원
        redirect: false, // OAuth 등 리다이렉트 자동 처리 끌지 여부
        redirectOptions: {
            login: '/login',
            callback: '/confirm',
        },
    },
    quasar: {
        plugins: ['Notify', 'Dialog'],
        quietSassWarnings: true,
        lang: 'en-US',
        iconSet: 'material-icons',
        config: {},
        extras: {
            font: null,
            fontIcons: ['material-icons', 'fontawesome-v6', 'mdi-v7'],
            svgIcons: [],
            animations: [],
        },
    },
    sourcemap: false,
    nitro: {
        minify: true,
        esbuild: {
            options: {
                target: 'esnext',
            },
        },
    },

    build: {
        analyze: true,
    },

    compatibilityDate: '2024-11-01',
    devtools: {
        enabled: true,
        timeline: {
            enabled: true,
        },
        vscode: {
            enabled: false,
        },
    },
});

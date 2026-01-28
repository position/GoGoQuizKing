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
        // runtimeConfig 로 읽도록 넘겨 주면, 클라이언트/서버 양쪽에서 자동으로 주입됩니다.
        redirect: false, // OAuth 등 리다이렉트 자동 처리 끌지 여부
        url: process.env.SUPABASE_URL!,
        key: process.env.SUPABASE_KEY!,
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

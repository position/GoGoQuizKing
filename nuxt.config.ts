// https://nuxt.com/docs/api/configuration/nuxt-config
import { routeRules } from './nuxt.routes';

export default defineNuxtConfig({
    // SEO 설정
    site: {
        url: process.env.NUXT_PUBLIC_SITE_URL || 'https://gogoquizking.com',
        name: 'GoGoQuizKing',
        description: '반짝반짝 퀴즈 세상! 친구들과 함께 재미있는 퀴즈를 풀어보세요.',
        defaultLocale: 'ko',
    },

    app: {
        head: {
            htmlAttrs: {
                lang: 'ko',
            },
            charset: 'utf-8',
            viewport: 'width=device-width, initial-scale=1',
            title: 'GoGoQuizKing - 신나는 퀴즈 세상',
            meta: [
                { name: 'theme-color', content: '#667eea' },
                { name: 'author', content: 'GoGoQuizKing Team' },
                { name: 'robots', content: 'index, follow' },
                { property: 'og:type', content: 'website' },
                { property: 'og:locale', content: 'ko_KR' },
                { property: 'og:site_name', content: 'GoGoQuizKing' },
                { name: 'twitter:card', content: 'summary_large_image' },
            ],
            link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
        },
    },

    runtimeConfig: {
        public: {
            supabaseUrl: process.env.SUPABASE_URL,
            supabaseKey: process.env.SUPABASE_KEY,
            supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
            apiTimeout: '',
            triviaApi: '',
            supabaseStorage: '',
            cdnBase: '',
            siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://gogoquizking.com',
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
        'nuxt-vitalizer',
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

    vitalizer: {
        disableStylesheets: 'entry',
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

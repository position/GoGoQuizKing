// https://nuxt.com/docs/api/configuration/nuxt-config
import { routeRules } from './nuxt.routes';

export default defineNuxtConfig({
    // SEO 설정
    site: {
        url: process.env.NUXT_PUBLIC_SITE_URL || 'https://gogoquizking.com',
        name: '고고퀴즈킹 - GoGoQuizKing',
        description:
            '고고퀴즈킹 - 실시간 퀴즈 게임, 상식 퀴즈, OX 퀴즈, 객관식 퀴즈를 친구들과 함께 즐겨보세요! 무료 온라인 퀴즈 플랫폼',
        defaultLocale: 'ko',
    },

    app: {
        head: {
            htmlAttrs: {
                lang: 'ko',
            },
            charset: 'utf-8',
            viewport: 'width=device-width, initial-scale=1',
            title: '고고퀴즈킹 | 실시간 퀴즈 게임 - 상식퀴즈, OX퀴즈, 객관식 퀴즈',
            meta: [
                {
                    name: 'description',
                    content:
                        '고고퀴즈킹에서 친구들과 실시간 퀴즈 대결! 상식 퀴즈, OX 퀴즈, 객관식 퀴즈, 넌센스 퀴즈 등 다양한 퀴즈를 무료로 즐기세요. 퀴즈 만들기, 퀴즈 풀기, 퀴즈 게임 모두 가능!',
                },
                {
                    name: 'keywords',
                    content:
                        '퀴즈, 퀴즈게임, 상식퀴즈, OX퀴즈, 객관식퀴즈, 넌센스퀴즈, 퀴즈대회, 실시간퀴즈, 온라인퀴즈, 무료퀴즈, 퀴즈만들기, 퀴즈풀기, 고고퀴즈킹, GoGoQuizKing, 친구퀴즈, 단체퀴즈, 퀴즈앱',
                },
                { name: 'theme-color', content: '#667eea' },
                { name: 'author', content: 'GoGoQuizKing Team' },
                { name: 'robots', content: 'index, follow' },
                { property: 'og:type', content: 'website' },
                { property: 'og:locale', content: 'ko_KR' },
                { property: 'og:site_name', content: '고고퀴즈킹' },
                {
                    property: 'og:title',
                    content: '고고퀴즈킹 | 실시간 퀴즈 게임 - 상식퀴즈, OX퀴즈, 객관식 퀴즈',
                },
                {
                    property: 'og:description',
                    content:
                        '친구들과 실시간 퀴즈 대결! 상식 퀴즈, OX 퀴즈, 객관식 퀴즈 등 다양한 퀴즈를 무료로 즐기세요.',
                },
                { name: 'twitter:card', content: 'summary_large_image' },
                {
                    name: 'twitter:title',
                    content: '고고퀴즈킹 | 실시간 퀴즈 게임',
                },
                {
                    name: 'twitter:description',
                    content:
                        '친구들과 실시간 퀴즈 대결! 상식 퀴즈, OX 퀴즈, 객관식 퀴즈 등 다양한 퀴즈를 무료로 즐기세요.',
                },
                { name: 'naver-site-verification', content: '' },
                { name: 'google-site-verification', content: '' },
            ],
            link: [
                { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
                {
                    rel: 'stylesheet',
                    href: 'https://hangeul.pstatic.net/hangeul_static/css/nanum-square.css',
                    media: 'print',
                    onload: "this.media='all'",
                },
                {
                    rel: 'preconnect',
                    href: 'https://hangeul.pstatic.net',
                },
            ],
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
    css: ['~/assets/scss/styles.scss'],
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
    image: {
        // 외부 이미지 도메인 허용
        domains: ['k.kakaocdn.net', 't1.kakaocdn.net', 'img1.kakaocdn.net'],
        // 외부 이미지는 최적화 없이 그대로 사용
        provider: 'ipx',
        ipx: {
            // 외부 이미지에 대한 최적화 비활성화 (CORS 문제 방지)
            modifiers: {
                format: 'webp',
                quality: 80,
            },
        },
    },
    sourcemap: false,
    nitro: {
        minify: true,
        compressPublicAssets: true,
        esbuild: {
            options: {
                target: 'esnext',
            },
        },
        prerender: {
            crawlLinks: true,
        },
    },

    vite: {
        build: {
            cssCodeSplit: true,
            rollupOptions: {
                output: {
                    manualChunks: {
                        quasar: ['quasar'],
                        supabase: ['@supabase/supabase-js'],
                        pinia: ['pinia'],
                    },
                },
            },
        },
        css: {
            devSourcemap: false,
        },
    },

    vitalizer: {
        disableStylesheets: 'entry',
        disablePrefetchLinks: true,
    },

    experimental: {
        payloadExtraction: true,
        renderJsonPayloads: true,
        componentIslands: true,
    },

    build: {
        analyze: false,
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

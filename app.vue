<template>
    <NuxtLayout>
        <q-layout view="lHh lpr lFf" container class="quiz-container">
            <Header />
            <Navbar />
            <q-page-container>
                <q-page class="q-pa-md main-page">
                    <NuxtPage />
                </q-page>
            </q-page-container>
            <Footer />
        </q-layout>

        <!-- 뱃지 획득 다이얼로그 -->
        <BadgeUnlockDialog v-model="showBadgeDialog" />
    </NuxtLayout>
</template>

<script setup lang="ts">
import { useBadgeStore } from '@/store/badge.store';
import { storeToRefs } from 'pinia';

// CLS 개선: 레이아웃 컴포넌트는 동기 로딩 (레이아웃 시프트 방지)
import Header from '@/components/layout/Header.vue';
import Footer from '@/components/layout/Footer.vue';
import Navbar from '@/components/layout/Navbar.vue';

// 뱃지 다이얼로그는 비동기 로딩 (초기 렌더링에 불필요)
const BadgeUnlockDialog = defineAsyncComponent(
    () => import('@/components/badge/BadgeUnlockDialog.vue'),
);

const badgeStore = useBadgeStore();
const { showUnlockDialog: showBadgeDialog } = storeToRefs(badgeStore);

const route = useRoute();
const runtimeConfig = useRuntimeConfig();
const siteUrl = runtimeConfig.public.siteUrl || 'https://gogoquizking.com';
const imgHost = runtimeConfig.public.supabaseStorage as string;

// Canonical URL 설정
useHead({
    link: [
        {
            rel: 'canonical',
            href: computed(() => `${siteUrl}${route.path}`),
        },
    ],
});

// SEO 설정
useSeoMeta({
    title: '고고퀴즈킹 | 실시간 퀴즈 게임 - 상식퀴즈, OX퀴즈, 객관식 퀴즈',
    description:
        '고고퀴즈킹에서 친구들과 실시간 퀴즈 대결! 상식 퀴즈, OX 퀴즈, 객관식 퀴즈, 넌센스 퀴즈 등 다양한 퀴즈를 무료로 즐기세요. 퀴즈 만들기, 퀴즈 풀기, 퀴즈 게임 모두 가능!',
    ogTitle: '고고퀴즈킹 | 실시간 퀴즈 게임 - 상식퀴즈, OX퀴즈, 객관식 퀴즈',
    ogDescription:
        '친구들과 실시간 퀴즈 대결! 상식 퀴즈, OX 퀴즈, 객관식 퀴즈 등 다양한 퀴즈를 무료로 즐기세요.',
    ogUrl: computed(() => `${siteUrl}${route.path}`),
    ogType: 'website',
    ogImage: `${imgHost}/img/quizking-character.png`,
    twitterCard: 'summary_large_image',
    twitterTitle: '고고퀴즈킹 | 실시간 퀴즈 게임',
    twitterDescription:
        '친구들과 실시간 퀴즈 대결! 상식 퀴즈, OX 퀴즈, 객관식 퀴즈 등 다양한 퀴즈를 무료로 즐기세요.',
});
</script>

<style scoped>
.quiz-container {
    height: 100%;
    background-color: var(--bg-primary);
    transition: background-color 0.3s ease;
    contain: layout style;
}

.main-page {
    background-color: var(--bg-primary);
    transition: background-color 0.3s ease;
    /* CLS 방지 - Header/Footer 높이를 제외한 최소 높이 */
    min-height: calc(100vh - var(--header-height) - var(--footer-height) - 32px);
    contain: content;
}
</style>

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
    </NuxtLayout>
</template>

<script setup lang="ts">
import Header from '@/components/layout/Header.vue';
import Footer from '@/components/layout/Footer.vue';
import Navbar from '@/components/layout/Navbar.vue';

const route = useRoute();
const runtimeConfig = useRuntimeConfig();
const siteUrl = runtimeConfig.public.siteUrl || 'https://gogoquizking.com';

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
}

.main-page {
    background-color: var(--bg-primary);
    transition: background-color 0.3s ease;
}
</style>

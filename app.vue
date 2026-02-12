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

// SEO 설정
useSeoMeta({
    title: 'GoGoQuizKing - 신나는 퀴즈 세상',
    description:
        '반짝반짝 퀴즈 세상으로 함께 떠나요! 친구들과 함께 재미있는 퀴즈를 만들고 풀어보세요. 다양한 카테고리의 퀴즈가 준비되어 있습니다.',
    ogTitle: 'GoGoQuizKing - 신나는 퀴즈 세상',
    ogDescription:
        '반짝반짝 퀴즈 세상으로 함께 떠나요! 친구들과 함께 재미있는 퀴즈를 만들고 풀어보세요.',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: 'GoGoQuizKing - 신나는 퀴즈 세상',
    twitterDescription:
        '반짝반짝 퀴즈 세상으로 함께 떠나요! 친구들과 함께 재미있는 퀴즈를 만들고 풀어보세요.',
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

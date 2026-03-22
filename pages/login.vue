<template>
    <Login />
</template>

<script setup lang="ts">
definePageMeta({
    name: 'Sign In',
    isRequireLogout: true,
});

// SEO 설정
useSeoMeta({
    title: '로그인 - 고고퀴즈킹(GoGo QuizKing) | 카카오 간편 로그인',
    description:
        '고고퀴즈킹에 카카오 계정으로 간편 로그인! 친구들과 실시간 퀴즈 대결, 상식 퀴즈, OX 퀴즈를 즐겨보세요.',
    ogTitle: '로그인 - 고고퀴즈킹(GoGo QuizKing)(GoGoQuizKing)',
    ogDescription:
        '고고퀴즈킹에 로그인하고 친구들과 함께 재미있는 퀴즈를 풀어보세요! 카카오 간편 로그인 지원.',
    robots: 'noindex, nofollow',
});
</script>

<style scoped lang="scss"></style>

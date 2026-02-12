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
    title: '로그인 - GoGoQuizKing',
    description: 'GoGoQuizKing에 로그인하고 친구들과 함께 재미있는 퀴즈를 풀어보세요!',
    ogTitle: '로그인 - GoGoQuizKing',
    ogDescription: 'GoGoQuizKing에 로그인하고 친구들과 함께 재미있는 퀴즈를 풀어보세요!',
});
</script>

<style scoped lang="scss"></style>

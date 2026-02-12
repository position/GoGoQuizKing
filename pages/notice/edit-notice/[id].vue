<template>
    <NoticeDetail :is-edit="true" />
</template>

<script setup lang="ts">
// SEO 설정 - 관리자 전용 수정 페이지는 검색 엔진에서 제외
useSeoMeta({
    title: '공지사항 수정 - GoGoQuizKing',
    robots: 'noindex, nofollow',
});
</script>

<style scoped lang="scss"></style>

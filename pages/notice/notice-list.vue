<template>
    <div class="notice-list-page">
        <NoticeList />
    </div>
</template>

<script setup lang="ts">
// SEO 설정
useSeoMeta({
    title: '공지사항 - GoGoQuizKing',
    description: 'GoGoQuizKing의 공지사항을 확인하세요. 새로운 기능, 이벤트, 업데이트 소식을 알려드립니다.',
    ogTitle: '공지사항 - GoGoQuizKing',
    ogDescription: 'GoGoQuizKing의 공지사항을 확인하세요. 새로운 기능, 이벤트, 업데이트 소식을 알려드립니다.',
});
</script>

<style scoped lang="scss">
@import '@/assets/scss/variables';

.notice-list-page {
    padding: $spacing-lg;
    max-width: 1200px;
    margin: 0 auto;
    min-height: calc(100vh - 120px);
    background: var(--bg-primary);
}

@media (max-width: 768px) {
    .notice-list-page {
        padding: $spacing-md;
    }
}
</style>

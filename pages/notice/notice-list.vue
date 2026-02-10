<template>
    <div class="notice-list-page">
        <NoticeList />
    </div>
</template>

<script setup lang="ts"></script>

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

<template>
    <div class="badges-page">
        <header class="page-header">
            <h1 class="page-title">🏅 내 뱃지</h1>
            <p class="page-description">퀴즈 활동으로 획득한 뱃지를 확인하세요!</p>
        </header>

        <!-- 뱃지 목록 -->
        <section class="badges-section">
            <BadgeList
                :show-summary="true"
                :show-category-filter="true"
                :show-progress="true"
            />
        </section>

        <!-- 뱃지 획득 다이얼로그 -->
        <BadgeUnlockDialog v-model="badgeStore.showUnlockDialog" />
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useBadgeStore } from '@/store/badge.store';
import { BadgeList, BadgeUnlockDialog } from '@/components/badge';

definePageMeta({
    layout: 'default',
});

const badgeStore = useBadgeStore();

onMounted(async () => {
    await badgeStore.fetchBadges();
});
</script>

<style scoped lang="scss">
.badges-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px 16px 80px;
}

.page-header {
    text-align: center;
    margin-bottom: 24px;

    .page-title {
        font-size: 28px;
        font-weight: 800;
        color: var(--text-primary);
        margin: 0 0 8px 0;
    }

    .page-description {
        font-size: 14px;
        color: #757575;
        margin: 0;
    }
}

.badges-section {
    // BadgeList component handles its own styling
}

@media (max-width: 600px) {
    .badges-page {
        padding: 16px 12px 100px;
    }

    .page-header {
        .page-title {
            font-size: 24px;
        }
    }
}
</style>

<template>
    <div class="badge-list">
        <!-- 뱃지 요약 -->
        <div v-if="showSummary" class="badge-summary">
            <div class="summary-item">
                <span class="summary-value">{{ badgeStore.earnedCount }}</span>
                <span class="summary-label">획득</span>
            </div>
            <div class="summary-divider">/</div>
            <div class="summary-item">
                <span class="summary-value">{{ badgeStore.totalBadges }}</span>
                <span class="summary-label">전체</span>
            </div>
            <q-linear-progress
                :value="badgeStore.earnedPercentage / 100"
                color="primary"
                track-color="grey-3"
                rounded
                size="12px"
                class="summary-progress"
            />
        </div>

        <!-- 카테고리 필터 -->
        <div v-if="showCategoryFilter" class="category-filter">
            <q-btn-toggle
                v-model="selectedCategory"
                toggle-color="primary"
                :options="categoryOptions"
                rounded
                unelevated
                size="sm"
            />
        </div>

        <!-- 뱃지 그리드 -->
        <div class="badge-grid">
            <BadgeCard
                v-for="badge in filteredBadges"
                :key="badge.badge_id"
                :badge="badge"
                :show-progress="showProgress"
            />
        </div>

        <!-- 빈 상태 -->
        <div v-if="filteredBadges.length === 0 && !badgeStore.isLoading" class="empty-state">
            <q-icon name="emoji_events" size="48px" color="grey-5" />
            <p>아직 획득한 뱃지가 없어요</p>
            <p class="hint">퀴즈를 풀고 뱃지를 모아보세요!</p>
        </div>

        <!-- 로딩 -->
        <div v-if="badgeStore.isLoading" class="loading-state">
            <q-spinner-dots size="40px" color="primary" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useBadgeStore } from '@/store/badge.store';
import type { BadgeCategory, BadgeWithStatus } from '@/models/badge';
import { BADGE_CATEGORY_LABELS } from '@/models/badge';
import BadgeCard from './BadgeCard.vue';

interface Props {
    showSummary?: boolean;
    showCategoryFilter?: boolean;
    showProgress?: boolean;
    earnedOnly?: boolean;
    category?: BadgeCategory;
}

const props = withDefaults(defineProps<Props>(), {
    showSummary: true,
    showCategoryFilter: true,
    showProgress: true,
    earnedOnly: false,
    category: undefined,
});

const badgeStore = useBadgeStore();
const selectedCategory = ref<BadgeCategory | 'all'>('all');

const categoryOptions = computed(() => [
    { label: '전체', value: 'all' },
    ...Object.entries(BADGE_CATEGORY_LABELS).map(([key, label]) => ({
        label,
        value: key as BadgeCategory,
    })),
]);

const filteredBadges = computed((): BadgeWithStatus[] => {
    let badges = badgeStore.badges;

    // 카테고리 필터 (props 또는 선택된 카테고리)
    const categoryToFilter =
        props.category || (selectedCategory.value !== 'all' ? selectedCategory.value : null);
    if (categoryToFilter) {
        badges = badges.filter((b) => b.category === categoryToFilter);
    }

    // 획득한 뱃지만 표시
    if (props.earnedOnly) {
        badges = badges.filter((b) => b.is_earned);
    }

    return badges;
});

onMounted(async () => {
    if (badgeStore.badges.length === 0) {
        await badgeStore.fetchBadges();
    }
});
</script>

<style scoped lang="scss">
.badge-list {
    .badge-summary {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 16px;
        background: linear-gradient(
            135deg,
            rgba(92, 107, 192, 0.15) 0%,
            rgba(121, 134, 203, 0.15) 100%
        );
        border-radius: 16px;
        margin-bottom: 16px;

        .dark-mode & {
            background: linear-gradient(
                135deg,
                rgba(92, 107, 192, 0.25) 0%,
                rgba(121, 134, 203, 0.25) 100%
            );
        }

        .summary-item {
            display: flex;
            flex-direction: column;
            align-items: center;

            .summary-value {
                font-size: 24px;
                font-weight: 700;
                color: #5c6bc0;

                .dark-mode & {
                    color: #9fa8da;
                }
            }

            .summary-label {
                font-size: 12px;
                color: var(--text-secondary);
            }
        }

        .summary-divider {
            font-size: 24px;
            color: var(--text-light);
            margin: 0 4px;
        }

        .summary-progress {
            flex: 1;
            margin-left: 16px;
        }
    }

    .category-filter {
        margin-bottom: 16px;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;

        &::-webkit-scrollbar {
            display: none;
        }
    }

    .badge-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 12px;
    }

    .empty-state {
        text-align: center;
        padding: 48px 24px;
        color: var(--text-secondary);

        p {
            margin: 8px 0 0;
            font-size: 14px;

            &.hint {
                font-size: 12px;
                color: var(--text-light);
            }
        }
    }

    .loading-state {
        display: flex;
        justify-content: center;
        padding: 48px;
    }
}
</style>

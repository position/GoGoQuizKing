<template>
    <div class="ranking-page">
        <header class="page-header">
            <h1 class="page-title">🏆 리더보드</h1>
            <p class="page-description">퀴즈 킹들의 순위를 확인하세요!</p>
        </header>

        <!-- 내 랭킹 -->
        <section class="my-ranking-section">
            <MyRanking :my-ranking="rankingStore.myRanking" />
        </section>

        <!-- 필터 -->
        <section class="filters-section">
            <RankingFilters
                :period="rankingStore.filter.period"
                :type="rankingStore.filter.type"
                :category="rankingStore.filter.category"
                @change="onFilterChange"
            />
        </section>

        <!-- 리더보드 -->
        <section class="leaderboard-section">
            <Leaderboard
                :rankings="currentRankings"
                :current-user-id="currentUserId"
                :type="rankingStore.filter.type"
                :loading="rankingStore.isLoading"
            />
        </section>

        <!-- 새로고침 FAB -->
        <q-page-sticky position="bottom-right" :offset="[18, 18]">
            <q-btn
                fab
                icon="refresh"
                color="primary"
                :loading="rankingStore.isLoading"
                @click="refreshRankings"
            >
                <q-tooltip>새로고침</q-tooltip>
            </q-btn>
        </q-page-sticky>
    </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useRankingStore } from '@/store/ranking.store';
import type { RankingPeriod, RankingType } from '@/models/ranking';
import type { QuizCategory } from '@/models/quiz';
import { MyRanking, RankingFilters, Leaderboard } from '@/components/ranking';

definePageMeta({
    layout: 'default',
});

// SEO 설정
useSeoMeta({
    title: '랭킹 & 리더보드 - 고고퀴즈킹(GoGo QuizKing) | 퀴즈 킹을 찾아라!',
    description:
        '고고퀴즈킹 랭킹 리더보드! 전체 랭킹, 주간 랭킹, 과목별 랭킹으로 나의 순위를 확인하고 퀴즈 킹에 도전하세요.',
    ogTitle: '랭킹 & 리더보드 - 고고퀴즈킹(GoGo QuizKing)',
    ogDescription:
        '퀴즈 킹은 누구? 전체·주간·과목별 랭킹을 확인하고 친구들과 순위를 겨뤄보세요!',
});

const rankingStore = useRankingStore();
const user = useSupabaseUser();

const currentUserId = computed(() => user.value?.id);

const currentRankings = computed(() => {
    if (rankingStore.filter.type === 'category') {
        return rankingStore.categoryRankings;
    }
    if (rankingStore.filter.type === 'quizzes') {
        return rankingStore.quizAttemptRankings;
    }
    return rankingStore.rankings;
});

async function loadInitialData() {
    await Promise.all([rankingStore.fetchRankings('all', 100), rankingStore.fetchMyRanking('all')]);
}

async function onFilterChange(filter: {
    period: RankingPeriod;
    type: RankingType;
    category?: QuizCategory;
}) {
    await rankingStore.applyFilter({
        period: filter.period,
        type: filter.type,
        category: filter.category,
    });
}

async function refreshRankings() {
    await rankingStore.applyFilter(rankingStore.filter);
}

onMounted(() => {
    loadInitialData();
});
</script>

<style scoped lang="scss">
.ranking-page {
    max-width: 800px;
    margin: 0 auto;
    padding-bottom: 80px;
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

.my-ranking-section {
    margin-bottom: 20px;
}

.filters-section {
    margin-bottom: 20px;
}

.leaderboard-section {
    // Leaderboard component handles its own styling
}

@media (max-width: 600px) {
    .ranking-page {
        padding: 16px 12px 100px;
    }

    .page-header {
        .page-title {
            font-size: 24px;
        }
    }
}
</style>

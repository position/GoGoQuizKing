<script setup lang="ts">
// 대결 기록 페이지
import { useBattleStore } from '~/store/battle.store';
import { useAuthStore } from '~/store/auth.store';
import { storeToRefs } from 'pinia';

definePageMeta({
    layout: 'default',
});

const route = useRoute();
const router = useRouter();
const battleStore = useBattleStore();
const authStore = useAuthStore();
const { userId } = storeToRefs(authStore);

// URL query에서 탭 상태 초기화
const activeTab = computed({
    get: () => {
        const tab = route.query.tab as string;
        return tab === 'ranking' ? 'ranking' : 'history';
    },
    set: (value: 'history' | 'ranking') => {
        router.replace({
            query: { ...route.query, tab: value },
        });
    },
});

// 더 보기
const historyOffset = ref(0);
const hasMoreHistory = ref(false);
const HISTORY_PAGE_SIZE = 20;

// 초기 데이터 로드
onMounted(async () => {
    await Promise.all([
        battleStore.fetchHistory(HISTORY_PAGE_SIZE, 0),
        battleStore.fetchRankings(),
        battleStore.fetchMyRankingStats(),
    ]);

    // 초기 로드된 데이터가 페이지 크기와 같으면 더 있을 수 있음
    hasMoreHistory.value = battleStore.history.length >= HISTORY_PAGE_SIZE;
});

async function loadMoreHistory() {
    historyOffset.value += HISTORY_PAGE_SIZE;
    const prevLength = battleStore.history.length;
    await battleStore.fetchHistory(HISTORY_PAGE_SIZE, historyOffset.value);

    // 새로 로드된 데이터가 없거나 페이지 크기보다 적으면 더 이상 없음
    const newItems = battleStore.history.length - prevLength;
    if (newItems < HISTORY_PAGE_SIZE) {
        hasMoreHistory.value = false;
    }
}
</script>

<template>
    <q-page padding class="battle-history">
        <!-- 헤더 -->
        <header class="battle-history__header">
            <h1 class="battle-history__title">⚔️ 대결 기록</h1>
        </header>

        <!-- 내 통계 -->
        <section v-if="battleStore.myRankingStats" class="battle-history__stats">
            <div class="battle-history__stat">
                <span class="battle-history__stat-value battle-history__stat-value--primary">
                    {{ battleStore.myRankingStats.ranking_points }}
                </span>
                <span class="battle-history__stat-label">랭킹 포인트</span>
            </div>
            <div class="battle-history__stat">
                <span class="battle-history__stat-value battle-history__stat-value--positive">
                    {{ battleStore.myRankingStats.total_wins }}
                </span>
                <span class="battle-history__stat-label">승리</span>
            </div>
            <div class="battle-history__stat">
                <span class="battle-history__stat-value battle-history__stat-value--negative">
                    {{ battleStore.myRankingStats.total_losses }}
                </span>
                <span class="battle-history__stat-label">패배</span>
            </div>
            <div class="battle-history__stat">
                <span class="battle-history__stat-value">{{ battleStore.winRate }}%</span>
                <span class="battle-history__stat-label">승률</span>
            </div>
        </section>

        <!-- 탭 -->
        <q-tabs
            v-model="activeTab"
            class="battle-history__tabs"
            active-color="primary"
            indicator-color="primary"
            align="justify"
        >
            <q-tab name="history" label="대결 기록" icon="history" />
            <q-tab name="ranking" label="랭킹" icon="leaderboard" />
        </q-tabs>

        <!-- 탭 패널 -->
        <q-tab-panels v-model="activeTab" animated class="battle-history__panels">
            <!-- 대결 기록 탭 -->
            <q-tab-panel name="history" class="battle-history__panel">
                <!-- 로딩 -->
                <div
                    v-if="battleStore.historyLoading && !battleStore.history.length"
                    class="battle-history__loading"
                >
                    <q-spinner-dots size="40px" color="primary" />
                </div>

                <!-- 기록 없음 -->
                <div v-else-if="!battleStore.history.length" class="battle-history__empty">
                    <q-icon name="sports_esports" size="60px" color="grey-5" />
                    <p class="battle-history__empty-text">아직 대결 기록이 없어요</p>
                    <q-btn label="대결 시작하기" color="primary" to="/battle/lobby" size="large" />
                </div>

                <!-- 기록 목록 -->
                <div v-else class="battle-history__list">
                    <BattleHistoryItem
                        v-for="item in battleStore.history"
                        :key="item.id"
                        :history="item"
                    />

                    <!-- 더 보기 -->
                    <div v-if="hasMoreHistory" class="battle-history__more">
                        <q-btn
                            label="더 보기"
                            flat
                            color="primary"
                            :loading="battleStore.historyLoading"
                            @click="loadMoreHistory"
                        />
                    </div>
                </div>
            </q-tab-panel>

            <!-- 랭킹 탭 -->
            <q-tab-panel name="ranking" class="battle-history__panel">
                <!-- 로딩 -->
                <div v-if="battleStore.rankingsLoading" class="battle-history__loading">
                    <q-spinner-dots size="40px" color="primary" />
                </div>

                <!-- 랭킹 없음 -->
                <div v-else-if="!battleStore.rankings.length" class="battle-history__empty">
                    <q-icon name="leaderboard" size="60px" color="grey-5" />
                    <p class="battle-history__empty-text">아직 랭킹 데이터가 없어요</p>
                </div>

                <!-- 랭킹 목록 -->
                <div v-else class="battle-history__list">
                    <BattleRankingItem
                        v-for="entry in battleStore.rankings"
                        :key="entry.user_id"
                        :entry="entry"
                        :is-current-user="entry.user_id === userId"
                    />
                </div>
            </q-tab-panel>
        </q-tab-panels>
    </q-page>
</template>

<style scoped lang="scss">
.battle-history {
    max-width: 700px;
    margin: 0 auto;

    // 헤더
    &__header {
        text-align: center;
        margin-bottom: $spacing-lg;
    }

    &__title {
        font-weight: 700;
        color: var(--text-primary);
        margin: 0;
    }

    // 내 통계
    &__stats {
        display: flex;
        gap: $spacing-md;
        padding: $spacing-md;
        border-radius: $radius-lg;
        margin-bottom: $spacing-lg;

        .body--light & {
            background: linear-gradient(135deg, rgba($primary, 0.08) 0%, #fff 100%);
        }

        .body--dark & {
            background: linear-gradient(135deg, rgba($primary, 0.15) 0%, $dark-bg-card 100%);
        }
    }

    &__stat {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    &__stat-value {
        font-size: $font-size-2xl;
        font-weight: 700;
        color: var(--text-primary);

        &--primary {
            color: $primary;
        }

        &--positive {
            color: $success;
        }

        &--negative {
            color: $negative;
        }
    }

    &__stat-label {
        font-size: $font-size-xs;
        color: var(--text-light);
        margin-top: $spacing-xs;
    }

    // 탭
    &__tabs {
        margin-bottom: $spacing-md;

        :deep(.q-tab__content .q-tab__label) {
            font-size: $font-size-lg;
            font-weight: 600;
        }
    }

    &__panels {
        background: transparent;
    }

    &__panel {
        padding: 0;
    }

    // 로딩
    &__loading {
        display: flex;
        justify-content: center;
        padding: $spacing-xxl;
    }

    // 빈 상태
    &__empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: $spacing-md;
        padding: $spacing-xxl;
        text-align: center;
    }

    &__empty-text {
        font-size: $font-size-base;
        color: var(--text-secondary);
        margin: 0;
    }

    // 목록
    &__list {
        display: flex;
        flex-direction: column;
    }

    // 더 보기
    &__more {
        text-align: center;
        padding: $spacing-md;
    }
}
</style>

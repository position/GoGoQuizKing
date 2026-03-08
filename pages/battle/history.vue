<script setup lang="ts">
// 대결 기록 페이지
import { useBattleStore } from '~/store/battle.store';
import { useAuthStore } from '~/store/auth.store';

definePageMeta({
    layout: 'default',
    middleware: ['auth-guard'],
});

const battleStore = useBattleStore();
const authStore = useAuthStore();

const activeTab = ref<'history' | 'ranking'>('history');

// 초기 데이터 로드
onMounted(async () => {
    await Promise.all([
        battleStore.fetchHistory(),
        battleStore.fetchRankings(),
        battleStore.fetchMyRankingStats(),
    ]);
});

// 더 보기
const historyOffset = ref(0);
const hasMoreHistory = ref(true);

async function loadMoreHistory() {
    historyOffset.value += 20;
    const prevLength = battleStore.history.length;
    await battleStore.fetchHistory(20, historyOffset.value);
    
    if (battleStore.history.length === prevLength) {
        hasMoreHistory.value = false;
    }
}

// 현재 사용자 ID
const currentUserId = computed(() => authStore.user?.id);
</script>

<template>
    <q-page padding class="battle-history-page">
        <!-- 헤더 -->
        <div class="text-center q-mb-lg">
            <div class="text-h4 text-weight-bold q-mb-sm">
                ⚔️ 대결 기록
            </div>
        </div>

        <!-- 내 통계 -->
        <q-card v-if="battleStore.myRankingStats" flat class="stats-card q-mb-lg">
            <q-card-section>
                <div class="row q-gutter-md text-center">
                    <div class="col">
                        <div class="text-h4 text-weight-bold text-primary">
                            {{ battleStore.myRankingStats.ranking_points }}
                        </div>
                        <div class="text-caption text-grey-7">랭킹 포인트</div>
                    </div>
                    <div class="col">
                        <div class="text-h4 text-weight-bold text-positive">
                            {{ battleStore.myRankingStats.total_wins }}
                        </div>
                        <div class="text-caption text-grey-7">승리</div>
                    </div>
                    <div class="col">
                        <div class="text-h4 text-weight-bold text-negative">
                            {{ battleStore.myRankingStats.total_losses }}
                        </div>
                        <div class="text-caption text-grey-7">패배</div>
                    </div>
                    <div class="col">
                        <div class="text-h4 text-weight-bold">
                            {{ battleStore.winRate }}%
                        </div>
                        <div class="text-caption text-grey-7">승률</div>
                    </div>
                </div>
            </q-card-section>
        </q-card>

        <!-- 탭 -->
        <q-tabs
            v-model="activeTab"
            class="q-mb-md"
            active-color="primary"
            indicator-color="primary"
            align="justify"
        >
            <q-tab name="history" label="대결 기록" icon="history" />
            <q-tab name="ranking" label="랭킹" icon="leaderboard" />
        </q-tabs>

        <!-- 대결 기록 탭 -->
        <q-tab-panels v-model="activeTab" animated>
            <q-tab-panel name="history" class="q-pa-none">
                <!-- 로딩 -->
                <div v-if="battleStore.historyLoading && battleStore.history.length === 0" class="text-center q-pa-xl">
                    <q-spinner-dots size="40px" color="primary" />
                </div>

                <!-- 기록 없음 -->
                <div v-else-if="battleStore.history.length === 0" class="text-center q-pa-xl">
                    <q-icon name="sports_esports" size="60px" color="grey-5" class="q-mb-md" />
                    <div class="text-subtitle1 text-grey-7">
                        아직 대결 기록이 없어요
                    </div>
                    <q-btn
                        label="대결 시작하기"
                        color="primary"
                        class="q-mt-md"
                        to="/battle/lobby"
                    />
                </div>

                <!-- 기록 목록 -->
                <q-list v-else class="history-list">
                    <BattleHistoryItem
                        v-for="item in battleStore.history"
                        :key="item.id"
                        :history="item"
                    />

                    <!-- 더 보기 -->
                    <div v-if="hasMoreHistory" class="text-center q-pa-md">
                        <q-btn
                            label="더 보기"
                            flat
                            color="primary"
                            :loading="battleStore.historyLoading"
                            @click="loadMoreHistory"
                        />
                    </div>
                </q-list>
            </q-tab-panel>

            <!-- 랭킹 탭 -->
            <q-tab-panel name="ranking" class="q-pa-none">
                <!-- 로딩 -->
                <div v-if="battleStore.rankingsLoading" class="text-center q-pa-xl">
                    <q-spinner-dots size="40px" color="primary" />
                </div>

                <!-- 랭킹 없음 -->
                <div v-else-if="battleStore.rankings.length === 0" class="text-center q-pa-xl">
                    <q-icon name="leaderboard" size="60px" color="grey-5" class="q-mb-md" />
                    <div class="text-subtitle1 text-grey-7">
                        아직 랭킹 데이터가 없어요
                    </div>
                </div>

                <!-- 랭킹 목록 -->
                <q-list v-else class="ranking-list">
                    <BattleRankingItem
                        v-for="entry in battleStore.rankings"
                        :key="entry.user_id"
                        :entry="entry"
                        :is-current-user="entry.user_id === currentUserId"
                    />
                </q-list>
            </q-tab-panel>
        </q-tab-panels>
    </q-page>
</template>

<style scoped lang="scss">
.battle-history-page {
    max-width: 700px;
    margin: 0 auto;
}

.stats-card {
    background: linear-gradient(135deg, #e8f4f8 0%, #fff 100%);
    border-radius: 16px;
}

.history-list,
.ranking-list {
    background: transparent;
}
</style>

<template>
    <div class="stats-page">
        <!-- 페이지 헤더 -->
        <header class="page-header">
            <q-btn
                flat
                round
                dense
                icon="sym_o_arrow_back"
                class="back-btn"
                @click="$router.push('/profile')"
            />
            <div class="header-content">
                <h1 class="page-title">📊 상세 통계</h1>
                <p class="page-description">퀴즈 활동을 분석하고 성장을 확인하세요!</p>
            </div>
        </header>

        <!-- 로딩 상태 -->
        <div v-if="isLoading" class="loading-container">
            <q-spinner-dots color="primary" size="60px" />
            <p>통계를 불러오는 중...</p>
        </div>

        <template v-else>
            <!-- 요약 카드 -->
            <section class="summary-section">
                <StatsSummaryCards :stats="statsStore.userStats" />
            </section>

            <!-- 차트 그리드 -->
            <div class="charts-grid">
                <!-- 카테고리별 정답률 (레이더 차트) -->
                <section class="chart-section category-chart">
                    <q-card class="chart-card">
                        <q-card-section class="card-header">
                            <div class="card-title">
                                <q-icon name="sym_o_category" size="20px" />
                                <span>카테고리별 정답률</span>
                            </div>
                            <q-chip
                                v-if="statsStore.categoryStats.length > 0"
                                color="primary"
                                text-color="white"
                                size="sm"
                            >
                                {{ statsStore.categoryStats.length }}개 카테고리
                            </q-chip>
                        </q-card-section>
                        <q-card-section class="chart-content">
                            <CategoryRadarChart :data="statsStore.categoryStats" />
                        </q-card-section>
                    </q-card>
                </section>

                <!-- 난이도별 성과 (바 차트) -->
                <section class="chart-section difficulty-chart">
                    <q-card class="chart-card">
                        <q-card-section class="card-header">
                            <div class="card-title">
                                <q-icon name="sym_o_signal_cellular_alt" size="20px" />
                                <span>난이도별 성과</span>
                            </div>
                        </q-card-section>
                        <q-card-section class="chart-content">
                            <DifficultyBarChart :data="statsStore.difficultyStats" />
                        </q-card-section>
                    </q-card>
                </section>

                <!-- 일별 활동 추이 (라인 차트) -->
                <section class="chart-section activity-chart">
                    <q-card class="chart-card">
                        <q-card-section class="card-header">
                            <div class="card-title">
                                <q-icon name="sym_o_show_chart" size="20px" />
                                <span>일별 활동 추이</span>
                            </div>
                            <q-btn-toggle
                                v-model="activityPeriod"
                                flat
                                dense
                                toggle-color="primary"
                                :options="[
                                    { label: '7일', value: 7 },
                                    { label: '30일', value: 30 },
                                ]"
                            />
                        </q-card-section>
                        <q-card-section class="chart-content chart-content-large">
                            <ActivityLineChart :data="filteredDailyActivity" />
                        </q-card-section>
                    </q-card>
                </section>

                <!-- 포인트 획득 추이 (에어리어 차트) -->
                <section class="chart-section point-chart">
                    <q-card class="chart-card">
                        <q-card-section class="card-header">
                            <div class="card-title">
                                <q-icon name="sym_o_trending_up" size="20px" />
                                <span>포인트 획득 추이</span>
                            </div>
                            <q-toggle
                                v-model="showCumulativePoints"
                                label="누적 표시"
                                color="primary"
                                size="sm"
                            />
                        </q-card-section>
                        <q-card-section class="chart-content chart-content-large">
                            <PointTrendChart
                                :data="statsStore.pointTrends"
                                :show-cumulative="showCumulativePoints"
                            />
                        </q-card-section>
                    </q-card>
                </section>
            </div>

            <!-- 카테고리 상세 테이블 -->
            <section class="detail-section">
                <q-card class="detail-card">
                    <q-card-section class="card-header">
                        <div class="card-title">
                            <q-icon name="sym_o_table_chart" size="20px" />
                            <span>카테고리별 상세 통계</span>
                        </div>
                    </q-card-section>
                    <q-card-section class="table-content">
                        <q-table
                            v-if="statsStore.categoryStats.length > 0"
                            :rows="statsStore.categoryStats"
                            :columns="categoryColumns"
                            row-key="category"
                            flat
                            dense
                            hide-pagination
                            class="stats-table"
                        >
                            <template v-slot:body-cell-accuracy="props">
                                <q-td :props="props">
                                    <div class="accuracy-cell">
                                        <q-linear-progress
                                            :value="props.value / 100"
                                            size="8px"
                                            :color="getAccuracyColor(props.value)"
                                            track-color="grey-3"
                                            rounded
                                            class="accuracy-bar"
                                        />
                                        <span class="accuracy-value">{{ props.value }}%</span>
                                    </div>
                                </q-td>
                            </template>
                        </q-table>
                        <div v-else class="no-data-table">
                            <p>카테고리별 데이터가 없습니다</p>
                        </div>
                    </q-card-section>
                </q-card>
            </section>

            <!-- 최근 퀴즈 기록 -->
            <section class="recent-section">
                <q-card class="recent-card">
                    <q-card-section class="card-header">
                        <div class="card-title">
                            <q-icon name="sym_o_history" size="20px" />
                            <span>최근 퀴즈 기록</span>
                        </div>
                    </q-card-section>
                    <q-card-section class="list-content">
                        <RecentPerformanceList :data="statsStore.recentPerformance" />
                    </q-card-section>
                </q-card>
            </section>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useStatsStore } from '@/store/stats.store';
import {
    StatsSummaryCards,
    CategoryRadarChart,
    DifficultyBarChart,
    ActivityLineChart,
    PointTrendChart,
    RecentPerformanceList,
} from '@/components/stats';

definePageMeta({
    layout: 'default',
});

const statsStore = useStatsStore();

const isLoading = ref(true);
const activityPeriod = ref(7);
const showCumulativePoints = ref(false);

const filteredDailyActivity = computed(() => {
    return statsStore.dailyActivity.slice(-activityPeriod.value);
});

const categoryColumns = [
    {
        name: 'category',
        label: '카테고리',
        field: 'category',
        align: 'left' as const,
        sortable: true,
    },
    {
        name: 'attemptCount',
        label: '풀이 수',
        field: 'attemptCount',
        align: 'center' as const,
        sortable: true,
    },
    {
        name: 'correctCount',
        label: '정답',
        field: 'correctCount',
        align: 'center' as const,
        sortable: true,
    },
    {
        name: 'totalQuestions',
        label: '전체 문제',
        field: 'totalQuestions',
        align: 'center' as const,
        sortable: true,
    },
    {
        name: 'accuracy',
        label: '정답률',
        field: 'accuracy',
        align: 'center' as const,
        sortable: true,
        style: 'width: 180px',
    },
];

function getAccuracyColor(accuracy: number): string {
    if (accuracy >= 80) return 'positive';
    if (accuracy >= 60) return 'primary';
    if (accuracy >= 40) return 'warning';
    return 'negative';
}

async function loadData() {
    isLoading.value = true;
    try {
        await statsStore.fetchAllStats();
    } catch (e) {
        console.error('Failed to load stats:', e);
    } finally {
        isLoading.value = false;
    }
}

onMounted(() => {
    loadData();
});
</script>

<style scoped lang="scss">
.stats-page {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px 16px 100px;
}

.page-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;

    .back-btn {
        color: #757575;
    }

    .header-content {
        .page-title {
            font-size: 24px;
            font-weight: 800;
            color: var(--text-primary);
            margin: 0;
        }

        .page-description {
            font-size: 14px;
            color: #757575;
            margin: 4px 0 0;
        }
    }
}

.loading-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 400px;
    color: #757575;

    p {
        margin-top: 16px;
    }
}

.summary-section {
    margin-bottom: 24px;
}

// Charts Grid
.charts-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-bottom: 24px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
}

.chart-section {
    &.activity-chart,
    &.point-chart {
        grid-column: span 2;

        @media (max-width: 768px) {
            grid-column: span 1;
        }
    }
}

.chart-card,
.detail-card,
.recent-card {
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    height: 100%;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 8px;

    .card-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 600;
        color: #212121;

        .q-icon {
            color: #5c6bc0;
        }
    }
}

.chart-content {
    height: 280px;
    padding-top: 0;

    &.chart-content-large {
        height: 320px;
    }
}

// Detail Section
.detail-section,
.recent-section {
    margin-bottom: 24px;
}

.table-content {
    padding-top: 0;
}

.stats-table {
    .accuracy-cell {
        display: flex;
        align-items: center;
        gap: 12px;

        .accuracy-bar {
            flex: 1;
            border-radius: 4px;
        }

        .accuracy-value {
            min-width: 45px;
            font-weight: 600;
            text-align: right;
        }
    }
}

.no-data-table {
    text-align: center;
    padding: 40px;
    color: #9e9e9e;
}

.list-content {
    padding-top: 0;
}

@media (max-width: 600px) {
    .page-header {
        .header-content {
            .page-title {
                font-size: 20px;
            }
        }
    }

    .chart-content {
        height: 240px;

        &.chart-content-large {
            height: 280px;
        }
    }
}
</style>

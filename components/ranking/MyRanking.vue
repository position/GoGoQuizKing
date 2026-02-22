<template>
    <div v-if="myRanking" class="my-ranking">
        <div class="my-ranking-header">
            <span class="header-icon">🎯</span>
            <span class="header-title">내 순위</span>
        </div>

        <div class="my-ranking-content">
            <div class="rank-info">
                <span class="rank-number">{{ myRanking.rank }}</span>
                <span class="rank-suffix">위</span>
            </div>

            <div class="stats-info">
                <div class="stat-item">
                    <span class="stat-value">{{ myRanking.period_points.toLocaleString() }}</span>
                    <span class="stat-label">포인트</span>
                </div>
                <div class="stat-divider" />
                <div class="stat-item">
                    <span class="stat-value">{{ percentileText }}</span>
                    <span class="stat-label">{{ myRanking.total_users }}명 중</span>
                </div>
            </div>

            <div class="progress-bar">
                <div class="progress-fill" :style="{ width: `${myRanking.percentile}%` }" />
            </div>
        </div>
    </div>

    <div v-else class="my-ranking-empty">
        <span class="empty-icon">📊</span>
        <span class="empty-text">퀴즈를 풀어 랭킹에 참여하세요!</span>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { MyRankingInfo } from '@/models/ranking';

interface Props {
    myRanking: MyRankingInfo | null;
}

const props = defineProps<Props>();

const percentileText = computed(() => {
    if (!props.myRanking) return '';
    const percentile = props.myRanking.percentile;
    if (percentile >= 99) return '상위 1%';
    if (percentile >= 95) return '상위 5%';
    if (percentile >= 90) return '상위 10%';
    if (percentile >= 75) return '상위 25%';
    if (percentile >= 50) return '상위 50%';
    return `상위 ${100 - percentile}%`;
});
</script>

<style scoped lang="scss">
.my-ranking {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16px;
    padding: 20px;
    color: white;
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.my-ranking-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;

    .header-icon {
        font-size: 20px;
    }

    .header-title {
        font-size: 16px;
        font-weight: 600;
    }
}

.my-ranking-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.rank-info {
    display: flex;
    align-items: baseline;
    gap: 4px;

    .rank-number {
        font-size: 48px;
        font-weight: 800;
        line-height: 1;
    }

    .rank-suffix {
        font-size: 20px;
        font-weight: 600;
        opacity: 0.9;
    }
}

.stats-info {
    display: flex;
    align-items: center;
    gap: 16px;
}

.stat-item {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .stat-value {
        font-size: 16px;
        font-weight: 600;
    }

    .stat-label {
        font-size: 12px;
        opacity: 0.8;
    }
}

.stat-divider {
    width: 1px;
    height: 30px;
    background: rgba(255, 255, 255, 0.3);
}

.progress-bar {
    height: 8px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    overflow: hidden;

    .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #ffd700 0%, #ffec80 100%);
        border-radius: 4px;
        transition: width 0.5s ease;
    }
}

.my-ranking-empty {
    background: #f5f5f5;
    border-radius: 16px;
    padding: 32px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;

    .empty-icon {
        font-size: 48px;
    }

    .empty-text {
        font-size: 14px;
        color: #757575;
    }
}
</style>

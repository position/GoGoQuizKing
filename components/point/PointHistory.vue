<template>
    <div class="point-history">
        <div class="history-header">
            <h3>포인트 히스토리</h3>
            <q-btn flat dense icon="refresh" @click="refresh" :loading="isLoading" />
        </div>

        <q-list v-if="history.length > 0" separator>
            <q-item v-for="item in history" :key="item.id" class="history-item">
                <q-item-section avatar>
                    <q-avatar :color="getActionColor(item.action_type)" text-color="white" size="36px">
                        <q-icon :name="getActionIcon(item.action_type)" size="20px" />
                    </q-avatar>
                </q-item-section>
                <q-item-section>
                    <q-item-label>{{ getActionLabel(item.action_type) }}</q-item-label>
                    <q-item-label caption>{{ item.description || getDefaultDescription(item.action_type) }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                    <div class="point-change" :class="item.points >= 0 ? 'positive' : 'negative'">
                        {{ item.points >= 0 ? '+' : '' }}{{ item.points }}
                    </div>
                    <q-item-label caption>{{ formatDate(item.created_at) }}</q-item-label>
                </q-item-section>
            </q-item>
        </q-list>

        <div v-else class="empty-state">
            <q-icon name="history" size="48px" color="grey-4" />
            <p>아직 포인트 기록이 없어요</p>
            <p class="sub">퀴즈를 풀고 포인트를 모아보세요!</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { usePointStore } from '@/store/point.store';
import type { PointActionType } from '@/models/point';

const pointStore = usePointStore();

const history = computed(() => pointStore.pointHistory);
const isLoading = computed(() => pointStore.isLoading);

const refresh = async () => {
    await pointStore.fetchPointHistory();
};

const getActionIcon = (actionType: string): string => {
    const icons: Record<string, string> = {
        quiz_correct: 'check_circle',
        streak_bonus: 'local_fire_department',
        quiz_create: 'edit',
        daily_attendance: 'event_available',
        quiz_share: 'share',
    };
    return icons[actionType] || 'stars';
};

const getActionColor = (actionType: string): string => {
    const colors: Record<string, string> = {
        quiz_correct: 'green',
        streak_bonus: 'orange',
        quiz_create: 'purple',
        daily_attendance: 'blue',
        quiz_share: 'teal',
    };
    return colors[actionType] || 'grey';
};

const getActionLabel = (actionType: string): string => {
    const labels: Record<string, string> = {
        quiz_correct: '퀴즈 정답',
        streak_bonus: '연속 정답 보너스',
        quiz_create: '퀴즈 생성',
        daily_attendance: '일일 출석',
        quiz_share: '퀴즈 공유',
    };
    return labels[actionType] || actionType;
};

const getDefaultDescription = (actionType: string): string => {
    const descriptions: Record<string, string> = {
        quiz_correct: '퀴즈를 맞혔어요!',
        streak_bonus: '연속으로 정답을 맞혔어요!',
        quiz_create: '새로운 퀴즈를 만들었어요!',
        daily_attendance: '오늘도 방문해주셨네요!',
        quiz_share: '퀴즈를 공유했어요!',
    };
    return descriptions[actionType] || '';
};

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;

    return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
    });
};

onMounted(() => {
    if (history.value.length === 0) {
        refresh();
    }
});
</script>

<style scoped lang="scss">
.point-history {
    background: #fff;
    border-radius: 16px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    .history-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;

        h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: #333;
        }
    }

    .history-item {
        padding: 12px 0;

        .point-change {
            font-size: 16px;
            font-weight: 700;

            &.positive {
                color: #4caf50;
            }

            &.negative {
                color: #f44336;
            }
        }
    }

    .empty-state {
        text-align: center;
        padding: 32px 16px;
        color: #999;

        p {
            margin: 8px 0 0;
            font-size: 14px;
        }

        .sub {
            font-size: 12px;
            color: #bbb;
        }
    }
}
</style>

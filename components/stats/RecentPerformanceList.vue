<template>
    <div class="recent-performance-list">
        <div v-if="data.length > 0" class="performance-list">
            <div
                v-for="item in data"
                :key="item.quizId + item.completedAt"
                class="performance-item"
            >
                <div class="item-info">
                    <div class="quiz-title">{{ item.quizTitle }}</div>
                    <div class="quiz-meta">
                        <span class="date">{{ formatDate(item.completedAt) }}</span>
                        <span class="time">
                            <q-icon name="sym_o_schedule" size="14px" />
                            {{ formatTime(item.timeSpent) }}
                        </span>
                    </div>
                </div>
                <div class="item-score" :class="getScoreClass(item.score, item.totalQuestions)">
                    <span class="score">{{ item.score }}</span>
                    <span class="total">/{{ item.totalQuestions }}</span>
                </div>
            </div>
        </div>
        <div v-else class="no-data">
            <q-icon name="sym_o_history" size="48px" color="grey-5" />
            <p>최근 풀이 기록이 없습니다</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { QuizPerformance } from '@/models/stats';
import dayjs from 'dayjs';

interface Props {
    data: QuizPerformance[];
}

defineProps<Props>();

function formatDate(dateStr: string): string {
    return dayjs(dateStr).format('MM/DD HH:mm');
}

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}분 ${secs}초` : `${secs}초`;
}

function getScoreClass(score: number, total: number): string {
    const ratio = total > 0 ? score / total : 0;
    if (ratio >= 0.8) return 'excellent';
    if (ratio >= 0.6) return 'good';
    if (ratio >= 0.4) return 'average';
    return 'poor';
}
</script>

<style scoped lang="scss">
.recent-performance-list {
    .performance-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .performance-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background: #f5f5f5;
        border-radius: 12px;
        transition: background-color 0.2s;

        &:hover {
            background: #eeeeee;
        }
    }

    .item-info {
        flex: 1;
        min-width: 0;

        .quiz-title {
            font-size: 14px;
            font-weight: 600;
            color: #212121;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .quiz-meta {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-top: 4px;
            font-size: 12px;
            color: #757575;

            .time {
                display: flex;
                align-items: center;
                gap: 3px;
            }
        }
    }

    .item-score {
        display: flex;
        align-items: baseline;
        padding: 6px 12px;
        border-radius: 8px;
        font-weight: 700;

        .score {
            font-size: 18px;
        }

        .total {
            font-size: 13px;
            opacity: 0.7;
        }

        &.excellent {
            background: #e8f5e9;
            color: #2e7d32;
        }

        &.good {
            background: #e3f2fd;
            color: #1565c0;
        }

        &.average {
            background: #fff3e0;
            color: #ef6c00;
        }

        &.poor {
            background: #ffebee;
            color: #c62828;
        }
    }

    .no-data {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
        color: #9e9e9e;

        p {
            margin-top: 12px;
            font-size: 14px;
        }
    }
}
</style>

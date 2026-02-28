<template>
    <div class="stats-summary-cards">
        <div class="stats-grid">
            <q-card class="stat-card">
                <q-card-section>
                    <div class="stat-icon quiz-icon">
                        <q-icon name="sym_o_quiz" size="24px" />
                    </div>
                    <div class="stat-value">{{ stats?.totalQuizzesTaken || 0 }}</div>
                    <div class="stat-label">풀이한 퀴즈</div>
                </q-card-section>
            </q-card>

            <q-card class="stat-card">
                <q-card-section>
                    <div class="stat-icon accuracy-icon">
                        <q-icon name="sym_o_check_circle" size="24px" />
                    </div>
                    <div class="stat-value">{{ stats?.averageScore || 0 }}<span class="stat-unit">%</span></div>
                    <div class="stat-label">평균 정답률</div>
                </q-card-section>
            </q-card>

            <q-card class="stat-card">
                <q-card-section>
                    <div class="stat-icon create-icon">
                        <q-icon name="sym_o_edit_note" size="24px" />
                    </div>
                    <div class="stat-value">{{ stats?.totalQuizzesCreated || 0 }}</div>
                    <div class="stat-label">생성한 퀴즈</div>
                </q-card-section>
            </q-card>

            <q-card class="stat-card">
                <q-card-section>
                    <div class="stat-icon time-icon">
                        <q-icon name="sym_o_schedule" size="24px" />
                    </div>
                    <div class="stat-value">{{ formattedTime }}</div>
                    <div class="stat-label">총 학습 시간</div>
                </q-card-section>
            </q-card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { UserStats } from '@/models/stats';

interface Props {
    stats: UserStats | null;
}

const props = defineProps<Props>();

const formattedTime = computed(() => {
    const seconds = props.stats?.totalTimeSpent || 0;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
        return `${hours}시간 ${minutes}분`;
    }
    return `${minutes}분`;
});
</script>

<style scoped lang="scss">
.stats-summary-cards {
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;

        @media (max-width: 900px) {
            grid-template-columns: repeat(2, 1fr);
        }

        @media (max-width: 480px) {
            grid-template-columns: 1fr;
        }
    }

    .stat-card {
        border-radius: 16px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        transition: transform 0.2s, box-shadow 0.2s;

        &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .q-card__section {
            text-align: center;
            padding: 20px 16px;
        }

        .stat-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 12px;

            &.quiz-icon {
                background: linear-gradient(135deg, #5c6bc0, #7986cb);
                color: white;
            }

            &.accuracy-icon {
                background: linear-gradient(135deg, #66bb6a, #81c784);
                color: white;
            }

            &.create-icon {
                background: linear-gradient(135deg, #ff7043, #ff8a65);
                color: white;
            }

            &.time-icon {
                background: linear-gradient(135deg, #42a5f5, #64b5f6);
                color: white;
            }
        }

        .stat-value {
            font-size: 28px;
            font-weight: 700;
            color: #212121;
            line-height: 1.2;

            .stat-unit {
                font-size: 16px;
                font-weight: 500;
                margin-left: 2px;
            }
        }

        .stat-label {
            font-size: 13px;
            color: #757575;
            margin-top: 4px;
        }
    }
}
</style>

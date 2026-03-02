<template>
    <div class="today-quiz-card" @click="handleClick">
        <section class="card-header">
            <div class="badge">
                <q-icon name="star" size="16px" color="primary" />
                <span>오늘의 퀴즈</span>
            </div>
            <span v-if="quiz?.bonus_points" class="bonus">+{{ quiz.bonus_points }}P 보너스!</span>
        </section>

        <!-- 로딩 상태 -->
        <template v-if="isLoading">
            <div class="skeleton-content">
                <q-skeleton
                    type="text"
                    width="70%"
                    height="22px"
                    animation="wave"
                    class="skeleton-title"
                />
                <q-skeleton type="text" width="90%" height="14px" animation="wave" />
                <div class="skeleton-meta">
                    <q-skeleton type="QChip" width="60px" height="24px" animation="wave" />
                    <q-skeleton type="QChip" width="50px" height="24px" animation="wave" />
                    <q-skeleton type="QChip" width="70px" height="24px" animation="wave" />
                </div>
                <div class="skeleton-author">
                    <q-skeleton type="circle" size="20px" animation="wave" />
                    <q-skeleton type="text" width="80px" height="14px" animation="wave" />
                </div>
            </div>
        </template>

        <!-- 퀴즈 존재 -->
        <template v-else-if="quiz">
            <section class="quiz-content">
                <h3 class="quiz-title">{{ quiz.title }}</h3>
                <p v-if="quiz.description" class="quiz-description">
                    {{ truncateDescription(quiz.description) }}
                </p>
                <div class="quiz-meta">
                    <span class="category">
                        {{ getCategoryLabel(quiz.category) }}
                    </span>
                    <span class="difficulty">
                        {{ getDifficultyLabel(quiz.difficulty) }}
                    </span>
                    <span class="play-count">
                        <q-icon name="play_circle" size="14px" color="black" />
                        {{ quiz.play_count }}회
                    </span>
                </div>
                <div v-if="quiz.author_name" class="author">
                    <q-avatar size="20px">
                        <img
                            v-if="quiz.author_avatar"
                            :src="quiz.author_avatar"
                            :alt="quiz.author_name"
                        />
                        <q-icon v-else name="person" />
                    </q-avatar>
                    <span>{{ quiz.author_name }}</span>
                </div>
            </section>
            <section class="action-area">
                <q-btn
                    class="challenge-btn"
                    unelevated
                    color="amber"
                    text-color="dark"
                    label="도전하기! 🚀"
                    @click.stop="handleClick"
                />
            </section>
        </template>

        <!-- 퀴즈 없음 -->
        <template v-else>
            <div class="empty-state">
                <q-icon name="quiz" size="48px" />
                <p>오늘의 퀴즈가 아직 없어요~</p>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { TodayQuiz } from '@/models/dailyMission';
import { CATEGORIES, DIFFICULTIES, type QuizCategory, type DifficultyLevel } from '@/models/quiz';

interface Props {
    quiz: TodayQuiz | null;
    isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    isLoading: false,
});

const router = useRouter();

function handleClick() {
    if (props.quiz) {
        router.push(`/quiz/play/${props.quiz.quiz_id}`);
    }
}

function truncateDescription(text: string, maxLength: number = 60): string {
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength) + '...';
}

function getCategoryLabel(category: string): string {
    return CATEGORIES[category as QuizCategory]?.label || category;
}

function getDifficultyLabel(difficulty: string): string {
    return DIFFICULTIES[difficulty as DifficultyLevel]?.label || difficulty;
}
</script>

<style scoped lang="scss">
.today-quiz-card {
    background: linear-gradient(135deg, #ffe66d 0%, #f7b32b 100%);
    border-radius: 20px;
    padding: 20px;
    cursor: pointer;
    min-height: 180px; // CLS 방지 - 최소 높이 보장
    contain: layout; // 레이아웃 격리
    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;
    box-shadow: 0 8px 24px rgba(247, 179, 43, 0.3);

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 32px rgba(247, 179, 43, 0.4);
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(255, 255, 255, 0.9);
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 700;
            color: #f57c00;
        }

        .bonus {
            display: block;
            background: var(--color-negative);
            color: white;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 700;
            animation: pulse 2s infinite;
        }
    }

    // 스켈레톤 로딩 UI
    .skeleton-content {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 8px 0;

        .skeleton-title {
            margin-bottom: 4px;
        }

        .skeleton-meta {
            display: flex;
            gap: 8px;
            margin-top: 4px;
        }

        .skeleton-author {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 8px;
        }
    }

    .quiz-content {
        .quiz-title {
            margin: 0 0 8px;
            font-size: 20px;
            font-weight: 700;
            color: #333;
            line-height: 1.3;
        }

        .quiz-description {
            margin: 0 0 12px;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.7);
            line-height: 1.4;
        }

        .quiz-meta {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-bottom: 12px;

            span {
                background: rgba(255, 255, 255, 0.7);
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
                color: #555;
                display: inline-flex;
                align-items: center;
                gap: 4px;
            }
        }

        .author {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            color: rgba(0, 0, 0, 0.6);
        }
    }

    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 40px 0;
        color: rgba(0, 0, 0, 0.5);

        p {
            margin: 12px 0 0;
            font-size: 14px;
        }
    }

    .action-area {
        margin-top: 16px;

        .challenge-btn {
            width: 100%;
            font-weight: 700;
            font-size: 16px;
            padding: 12px;
            border-radius: 12px;
        }
    }
}

@keyframes pulse {
    0%,
    100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
}
</style>

<template>
    <div class="quiz-result">
        <!-- 결과 헤더 -->
        <div class="result-header">
            <div class="score-circle" :class="scoreClass">
                <div class="score-value">{{ result.score }}</div>
                <div class="score-total">/ {{ result.totalQuestions }}</div>
            </div>
            <h1 class="result-title">{{ resultMessage }}</h1>
            <p class="result-subtitle">{{ result.quiz.title }}</p>
        </div>

        <!-- 통계 -->
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">✅</div>
                <div class="stat-value">{{ result.score }}</div>
                <div class="stat-label">맞았어요!</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">❌</div>
                <div class="stat-value">{{ result.totalQuestions - result.score }}</div>
                <div class="stat-label">아쉬워요~</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">⏱️</div>
                <div class="stat-value">{{ formattedTime }}</div>
                <div class="stat-label">걸린 시간</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">📊</div>
                <div class="stat-value">{{ accuracy }}%</div>
                <div class="stat-label">정답률</div>
            </div>
        </div>

        <!-- 문제 리뷰 -->
        <div class="review-section">
            <h2 class="section-title">📝 어떻게 풀었나 볼까요?</h2>

            <div
                v-for="(question, index) in result.questions"
                :key="question.id"
                class="review-item"
                :class="{ correct: isCorrect(question.id), wrong: !isCorrect(question.id) }"
            >
                <div class="review-header">
                    <span class="question-number">Q{{ index + 1 }}</span>
                    <span class="result-badge" :class="isCorrect(question.id) ? 'correct' : 'wrong'"
                        >{{ isCorrect(question.id) ? '정답! 🎯' : '오답 💦' }}
                    </span>
                </div>

                <p class="question-text">{{ question.question_text }}</p>

                <div class="answers-compare">
                    <div class="answer-row">
                        <span class="answer-label">내 답:</span>
                        <span class="answer-value user-answer">{{
                            result.answers[question.id] || '(안 적었어요)'
                        }}</span>
                    </div>
                    <div v-if="!isCorrect(question.id)" class="answer-row">
                        <span class="answer-label">정답은:</span>
                        <span class="answer-value correct-answer">{{
                            question.correct_answer
                        }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 버튼 -->
        <div class="action-buttons">
            <q-btn
                @click="$emit('retry')"
                label="다시 풀어볼래요! 🔄"
                icon="refresh"
                outline
                color="primary"
                class="action-btn"
                size="lg"
            />
            <q-btn
                @click="$emit('home')"
                label="홈으로 🏠"
                icon="home"
                color="primary"
                unelevated
                class="action-btn"
                size="lg"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { QuizResultData } from '@/models/quiz';

const props = defineProps<{
    result: QuizResultData;
}>();

defineEmits<{
    (e: 'retry'): void;
    (e: 'home'): void;
}>();

const accuracy = computed(() => {
    return Math.round((props.result.score / props.result.totalQuestions) * 100);
});

const formattedTime = computed(() => {
    const minutes = Math.floor(props.result.timeSpent / 60);
    const seconds = props.result.timeSpent % 60;
    if (minutes > 0) {
        return `${minutes}분 ${seconds}초`;
    }
    return `${seconds}초`;
});

const resultMessage = computed(() => {
    const rate = accuracy.value;
    if (rate === 100) return '🎉 완벽해요! 천재인가요?!';
    if (rate >= 80) return '👏 와우~ 대단해요!';
    if (rate >= 60) return '😊 잘했어요! 조금만 더!';
    if (rate >= 40) return '💪 괜찮아요! 다시 도전!';
    return '📚 아쉬워요~ 한번 더!';
});

const scoreClass = computed(() => {
    const rate = accuracy.value;
    if (rate >= 80) return 'excellent';
    if (rate >= 60) return 'good';
    if (rate >= 40) return 'average';
    return 'needs-improvement';
});

function isCorrect(questionId: string): boolean {
    return props.result.correctAnswers.includes(questionId);
}
</script>

<style scoped lang="scss">
.quiz-result {
    max-width: 600px;
    margin: 0 auto;
    padding: 24px 16px;

    .result-header {
        text-align: center;
        margin-bottom: 32px;

        .score-circle {
            width: 160px;
            height: 160px;
            margin: 0 auto 24px;
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);

            &.excellent {
                background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
                box-shadow: 0 8px 32px rgba(78, 205, 196, 0.3);
            }

            &.good {
                background: linear-gradient(135deg, #45b7d1 0%, #667eea 100%);
                box-shadow: 0 8px 32px rgba(69, 183, 209, 0.3);
            }

            &.average {
                background: linear-gradient(135deg, #f7b32b 0%, #fc575e 100%);
                box-shadow: 0 8px 32px rgba(247, 179, 43, 0.3);
            }

            &.needs-improvement {
                background: linear-gradient(135deg, #ff6b6b 0%, #c44569 100%);
                box-shadow: 0 8px 32px rgba(255, 107, 107, 0.3);
            }

            .score-value {
                font-size: 56px;
                font-weight: 800;
                line-height: 1;
            }

            .score-total {
                font-size: 20px;
                opacity: 0.9;
            }
        }

        .result-title {
            font-size: 28px;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0 0 8px;
        }

        .result-subtitle {
            font-size: 16px;
            color: var(--text-secondary);
            margin: 0;
        }
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        margin-bottom: 32px;

        .stat-card {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 4px 12px var(--shadow-color);
            transition: background-color 0.3s ease;

            .stat-icon {
                font-size: 28px;
                margin-bottom: 8px;
            }

            .stat-value {
                font-size: 24px;
                font-weight: 700;
                color: var(--text-primary);
            }

            .stat-label {
                font-size: 13px;
                color: var(--text-light);
                margin-top: 4px;
            }
        }
    }

    .review-section {
        margin-bottom: 32px;

        .section-title {
            font-size: 18px;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0 0 16px;
        }

        .review-item {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 16px;
            margin-bottom: 12px;
            border-left: 4px solid var(--border-color);
            box-shadow: 0 2px 8px var(--shadow-color);
            transition: background-color 0.3s ease;

            &.correct {
                border-left-color: #4ecdc4;
            }

            &.wrong {
                border-left-color: #ff6b6b;
            }

            .review-header {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 12px;

                .question-number {
                    font-weight: 700;
                    color: var(--text-secondary);
                }

                .result-badge {
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;

                    &.correct {
                        background: rgba(78, 205, 196, 0.15);
                        color: #00b894;
                    }

                    &.wrong {
                        background: rgba(255, 107, 107, 0.15);
                        color: #ff6b6b;
                    }
                }
            }

            .question-text {
                font-size: 15px;
                color: var(--text-primary);
                margin: 0 0 12px;
                line-height: 1.5;
            }

            .answers-compare {
                background: var(--bg-surface);
                border-radius: 10px;
                padding: 12px;

                .answer-row {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 6px;

                    &:last-child {
                        margin-bottom: 0;
                    }

                    .answer-label {
                        font-size: 13px;
                        color: var(--text-secondary);
                        min-width: 60px;
                    }

                    .answer-value {
                        font-size: 14px;
                        font-weight: 600;
                        color: var(--text-primary);

                        &.correct-answer {
                            color: #00b894;
                        }
                    }
                }
            }
        }
    }

    .action-buttons {
        display: flex;
        gap: 16px;

        .action-btn {
            flex: 1;
            border-radius: 12px;
            font-weight: 600;
        }
    }
}
</style>

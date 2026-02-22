<template>
    <div class="quiz-player">
        <!-- 헤더 -->
        <div class="player-header">
            <q-btn @click="$emit('exit')" icon="arrow_back" flat round color="white" />
            <div class="progress-info">
                <span class="question-count">Q.{{ currentIndex + 1 }}/{{ questions.length }}</span>
            </div>
            <div class="timer">
                <q-icon name="schedule" size="20px" />
                <span>{{ formattedTime }}</span>
            </div>
        </div>

        <!-- 진행바 -->
        <q-linear-progress
            :value="progress / 100"
            color="accent"
            track-color="grey-4"
            class="progress-bar"
        />

        <!-- 문제 -->
        <div class="question-container">
            <div v-if="currentQuestion" class="question-content animate-fade-in">
                <!-- 문제 유형 표시 -->
                <div class="question-type-badge">
                    {{ questionTypeLabel }}
                </div>

                <!-- 문제 텍스트 -->
                <h2 class="question-text">{{ currentQuestion.question_text }}</h2>

                <!-- 문제 이미지 -->
                <div v-if="currentQuestion.question_image_url" class="question-image">
                    <NuxtImg
                        :src="currentQuestion.question_image_url"
                        alt="문제 이미지"
                        loading="lazy"
                        format="webp"
                        quality="85"
                    />
                </div>

                <!-- 보기 (객관식) -->
                <div v-if="currentQuestion.question_type === 'multiple'" class="options-grid">
                    <button
                        v-for="(option, index) in currentQuestion.options"
                        :key="index"
                        @click="selectAnswer(option)"
                        :class="[
                            'option-btn',
                            { selected: selectedAnswer === option },
                            `option-${index}`,
                        ]"
                    >
                        <span class="option-number">{{ index + 1 }}</span>
                        <span class="option-text">{{ option }}</span>
                    </button>
                </div>

                <!-- OX 선택 -->
                <div v-else-if="currentQuestion.question_type === 'ox'" class="ox-buttons">
                    <button
                        @click="selectAnswer('O')"
                        :class="['ox-btn', 'o-btn', { selected: selectedAnswer === 'O' }]"
                    >
                        <span class="ox-icon">⭕</span>
                        <span class="ox-label">O</span>
                    </button>
                    <button
                        @click="selectAnswer('X')"
                        :class="['ox-btn', 'x-btn', { selected: selectedAnswer === 'X' }]"
                    >
                        <span class="ox-icon">❌</span>
                        <span class="ox-label">X</span>
                    </button>
                </div>

                <!-- 단답형 입력 -->
                <div v-else-if="currentQuestion.question_type === 'short'" class="short-input">
                    <q-input
                        v-model="shortAnswer"
                        placeholder="정답을 적어주세요~ 💭"
                        outlined
                        class="answer-input"
                        @keyup.enter="submitShortAnswer"
                    />
                    <q-btn
                        @click="submitShortAnswer"
                        label="정답 확인! ✔️"
                        color="primary"
                        unelevated
                        class="submit-short-btn"
                    />
                </div>

                <!-- 힌트 -->
                <div v-if="currentQuestion.hint && showHint" class="hint-box">
                    <q-icon name="lightbulb" color="warning" size="24px" />
                    <span>{{ currentQuestion.hint }}</span>
                </div>
                <q-btn
                    v-else-if="currentQuestion.hint"
                    @click="showHint = true"
                    label="💡 힌트 보기"
                    flat
                    color="warning"
                    class="hint-btn"
                />
            </div>
        </div>

        <!-- 하단 버튼 -->
        <div class="player-footer">
            <q-btn
                v-if="currentIndex > 0"
                @click="$emit('prev')"
                label="⬅️ 이전"
                icon="arrow_back"
                flat
                color="white"
                size="large"
                rounded
            />
            <div v-else></div>

            <q-btn
                v-if="!isLastQuestion"
                @click="handleNext"
                label="다음 ➡️"
                icon-right="arrow_forward"
                color="primary"
                unelevated
                :disable="!selectedAnswer && !shortAnswer"
                class="next-btn"
                size="large"
            />
            <q-btn
                v-else
                @click="handleComplete"
                label="결과 보러가기! 🎉"
                icon-right="check"
                color="positive"
                unelevated
                :disable="!selectedAnswer && !shortAnswer"
                class="complete-btn"
                size="large"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import type { Question } from '@/models/quiz';

const props = defineProps<{
    questions: Question[];
    currentIndex: number;
    answers: Record<string, string>;
}>();

const emit = defineEmits<{
    (e: 'answer', questionId: string, answer: string): void;
    (e: 'next'): void;
    (e: 'prev'): void;
    (e: 'complete'): void;
    (e: 'exit'): void;
}>();

const selectedAnswer = ref<string>('');
const shortAnswer = ref<string>('');
const showHint = ref(false);
const elapsedSeconds = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;

const currentQuestion = computed(() => props.questions[props.currentIndex] || null);
const progress = computed(() => ((props.currentIndex + 1) / props.questions.length) * 100);
const isLastQuestion = computed(() => props.currentIndex === props.questions.length - 1);

const questionTypeLabel = computed(() => {
    const labels: Record<string, string> = {
        multiple: '📝 객관식',
        ox: '⭕ OX 퀴즈',
        short: '✏️ 단답형',
    };
    return labels[currentQuestion.value?.question_type || 'multiple'];
});

const formattedTime = computed(() => {
    const minutes = Math.floor(elapsedSeconds.value / 60);
    const seconds = elapsedSeconds.value % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

// 타이머 시작
onMounted(() => {
    timer = setInterval(() => {
        elapsedSeconds.value++;
    }, 1000);
});

onUnmounted(() => {
    if (timer) clearInterval(timer);
});

// 문제 변경시 초기화
watch(
    () => props.currentIndex,
    () => {
        const questionId = currentQuestion.value?.id;
        if (questionId && props.answers[questionId]) {
            if (currentQuestion.value?.question_type === 'short') {
                shortAnswer.value = props.answers[questionId];
                selectedAnswer.value = '';
            } else {
                selectedAnswer.value = props.answers[questionId];
                shortAnswer.value = '';
            }
        } else {
            selectedAnswer.value = '';
            shortAnswer.value = '';
        }
        showHint.value = false;
    },
    { immediate: true },
);

function selectAnswer(answer: string) {
    selectedAnswer.value = answer;
    if (currentQuestion.value) {
        emit('answer', currentQuestion.value.id, answer);
    }
}

function submitShortAnswer() {
    if (shortAnswer.value.trim() && currentQuestion.value) {
        emit('answer', currentQuestion.value.id, shortAnswer.value.trim());
    }
}

function handleNext() {
    if (currentQuestion.value?.question_type === 'short' && shortAnswer.value.trim()) {
        submitShortAnswer();
    }
    emit('next');
}

function handleComplete() {
    if (currentQuestion.value?.question_type === 'short' && shortAnswer.value.trim()) {
        submitShortAnswer();
    }
    emit('complete');
}
</script>

<style scoped lang="scss">
.quiz-player {
    display: flex;
    flex-direction: column;

    .player-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        color: white;

        .progress-info {
            .question-count {
                font-size: 18px;
                font-weight: 700;
            }
        }

        .timer {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 16px;
            font-weight: 600;
            background: rgba(255, 255, 255, 0.2);
            padding: 8px 16px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
        }
    }

    .progress-bar {
        height: 6px;
    }

    .question-container {
        flex: 1;
        padding: 24px 16px;
        overflow-y: auto;

        .question-content {
            background: var(--bg-card);
            border-radius: 24px;
            padding: 24px;
            min-height: 400px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
            transition: background-color 0.3s ease;

            .question-type-badge {
                display: inline-block;
                padding: 6px 14px;
                background: var(--bg-surface);
                border-radius: 20px;
                font-size: 14px;
                font-weight: 600;
                color: var(--text-secondary);
                margin-bottom: 20px;
            }

            .question-text {
                font-size: 20px;
                font-weight: 700;
                color: var(--text-primary);
                line-height: 1.5;
                margin: 0 0 24px;
            }

            .question-image {
                margin-bottom: 24px;
                text-align: center;

                img {
                    max-width: 100%;
                    max-height: 200px;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px var(--shadow-color);
                }
            }

            .options-grid {
                display: flex;
                flex-direction: column;
                gap: 12px;

                .option-btn {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px 20px;
                    background: var(--bg-surface);
                    border: 2px solid var(--border-color);
                    border-radius: 16px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-align: left;
                    color: var(--text-primary);

                    &:hover {
                        background: var(--hover-overlay);
                        transform: translateX(4px);
                        border-color: var(--color-secondary);
                    }

                    &.selected {
                        background: #4ecdc4;
                        border-color: #4ecdc4;
                        color: white;

                        .option-number {
                            background: white;
                            color: #4ecdc4;
                        }
                    }

                    .option-number {
                        width: 36px;
                        height: 36px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: var(--border-color);
                        border-radius: 50%;
                        font-weight: 700;
                        font-size: 16px;
                    }

                    .option-text {
                        flex: 1;
                        font-size: 16px;
                        font-weight: 500;
                    }
                }
            }

            .ox-buttons {
                display: flex;
                gap: 16px;
                justify-content: center;

                .ox-btn {
                    width: 140px;
                    height: 140px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    border: 3px solid var(--border-color);
                    border-radius: 24px;
                    background: var(--bg-card);
                    cursor: pointer;
                    transition: all 0.2s ease;
                    color: var(--text-primary);

                    .ox-icon {
                        font-size: 48px;
                    }

                    .ox-label {
                        font-size: 24px;
                        font-weight: 700;
                    }

                    &.o-btn {
                        &:hover,
                        &.selected {
                            border-color: #4ecdc4;
                            background: rgba(78, 205, 196, 0.1);
                        }
                    }

                    &.x-btn {
                        &:hover,
                        &.selected {
                            border-color: #ff6b6b;
                            background: rgba(255, 107, 107, 0.1);
                        }
                    }
                }
            }

            .short-input {
                display: flex;
                flex-direction: column;
                gap: 16px;
                max-width: 400px;
                margin: 0 auto;

                .answer-input {
                    font-size: 18px;
                }

                .submit-short-btn {
                    border-radius: 12px;
                    min-height: 48px;
                }
            }

            .hint-box {
                display: flex;
                align-items: flex-start;
                gap: 12px;
                margin-top: 24px;
                padding: 16px;
                background: #fffbeb;
                border-radius: 12px;
                font-size: 15px;
                color: #92400e;
            }

            .hint-btn {
                margin-top: 20px;
            }
        }
    }

    .player-footer {
        display: flex;
        justify-content: space-between;
        padding: 16px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);

        .next-btn,
        .complete-btn {
            min-width: 200px;
            border-radius: 12px;
            font-weight: 900;
        }
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in {
    animation: fadeIn 0.3s ease-out;
}
</style>

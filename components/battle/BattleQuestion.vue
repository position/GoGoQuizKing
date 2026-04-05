<script setup lang="ts">
// 대결 문제 표시 컴포넌트
import type { QuestionType } from '~/models/quiz';

interface Props {
    questionIndex: number;
    totalQuestions: number;
    questionText: string;
    questionType: QuestionType;
    questionImageUrl: string | null;
    options: string[] | null;
    timeRemaining: number;
    maxTime?: number;
    hasAnswered: boolean;
    selectedAnswer: string | null;
    disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    maxTime: 15,
    disabled: false,
});

const emit = defineEmits<{
    (e: 'answer', answer: string): void;
}>();

const timeProgress = computed(() => (props.timeRemaining / props.maxTime) * 100);

const timeColor = computed(() => {
    if (props.timeRemaining <= 3) {
        return 'negative';
    }
    if (props.timeRemaining <= 7) {
        return 'warning';
    }
    return 'primary';
});

const optionLabels = ['①', '②', '③', '④'];

function selectAnswer(answer: string) {
    if (!props.disabled && !props.hasAnswered) {
        emit('answer', answer);
    }
}

function isSelected(option: string): boolean {
    return props.selectedAnswer === option;
}
</script>

<template>
    <div class="battle-question">
        <!-- 상단: 문제 번호 & 타이머 -->
        <div class="header">
            <div class="progress">
                Q.{{ questionIndex + 1 }} / {{ totalQuestions }}
            </div>
            <div class="timer">
                <q-icon name="timer" :color="timeColor" />
                <span :class="['time', `text-${timeColor}`]">
                    {{ timeRemaining }}초
                </span>
            </div>
        </div>

        <!-- 타이머 프로그레스 바 -->
        <q-linear-progress
            :value="timeProgress / 100"
            :color="timeColor"
            size="8px"
            rounded
            class="progress-bar"
            :animation-speed="100"
        />

        <!-- 문제 이미지 -->
        <q-img
            v-if="questionImageUrl"
            :src="questionImageUrl"
            class="image"
            fit="contain"
            spinner-color="primary"
        />

        <!-- 문제 텍스트 -->
        <div class="card">
            <div class="text">
                {{ questionText }}
            </div>
        </div>

        <!-- 답변 옵션 -->
        <div class="options">
            <!-- 객관식 -->
            <template v-if="questionType === 'multiple' && options">
                <button
                    v-for="(option, index) in options"
                    :key="index"
                    :class="[
                        'option',
                        { 'is-selected': isSelected(option) },
                    ]"
                    :disabled="disabled || hasAnswered"
                    @click="selectAnswer(option)"
                >
                    <span class="option-label">{{ optionLabels[index] }}</span>
                    <span class="option-text">{{ option }}</span>
                </button>
            </template>

            <!-- OX 퀴즈 -->
            <template v-else-if="questionType === 'ox'">
                <div class="ox-container">
                    <button
                        :class="[
                            'ox-btn is-o',
                            { 'is-selected': isSelected('O') },
                        ]"
                        :disabled="disabled || hasAnswered"
                        @click="selectAnswer('O')"
                    >
                        ⭕ O
                    </button>
                    <button
                        :class="[
                            'ox-btn is-x',
                            { 'is-selected': isSelected('X') },
                        ]"
                        :disabled="disabled || hasAnswered"
                        @click="selectAnswer('X')"
                    >
                        ❌ X
                    </button>
                </div>
            </template>
        </div>

        <!-- 답변 완료 표시 -->
        <div v-if="hasAnswered" class="answered">
            <q-chip color="positive" text-color="white" icon="check">
                답변 완료! 상대방 대기 중...
            </q-chip>
        </div>
    </div>
</template>

<style scoped lang="scss">
.battle-question {
    max-width: 600px;
    margin: 0 auto;

    // 헤더 (문제 번호 + 타이머)
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: $spacing-md;

        .progress {
            font-size: $font-size-base;
            font-weight: 600;
            color: var(--text-primary);
        }

        .timer {
            display: flex;
            align-items: center;
            gap: $spacing-xs;

            .time {
                font-size: $font-size-lg;
                font-weight: 700;
            }
        }
    }

    // 프로그레스 바
    .progress-bar {
        margin-bottom: $spacing-lg;
    }

    // 문제 이미지
    .image {
        max-height: 200px;
        border-radius: $radius-md;
        margin-bottom: $spacing-md;
    }

    // 문제 카드
    .card {
        padding: $spacing-lg;
        border-radius: $radius-lg;
        margin-bottom: $spacing-lg;

        .body--light & {
            background: linear-gradient(135deg, #fff9f0 0%, #fff 100%);
        }

        .body--dark & {
            background: linear-gradient(135deg, $dark-bg-surface 0%, $dark-bg-card 100%);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .text {
            font-size: $font-size-lg;
            font-weight: 500;
            text-align: center;
            color: var(--text-primary);
            line-height: 1.6;
        }
    }

    // 옵션 컨테이너
    .options {
        display: flex;
        flex-direction: column;
        gap: $spacing-sm;
    }

    // 객관식 옵션 버튼
    .option {
        display: flex;
        align-items: center;
        width: 100%;
        padding: $spacing-md $spacing-lg;
        border-radius: $radius-md;
        border: 2px solid var(--border-color);
        background: var(--bg-card);
        cursor: pointer;
        transition: all $transition-fast;
        text-align: left;

        &:hover:not(:disabled) {
            transform: translateX(4px);
            border-color: $primary;
        }

        &:disabled {
            cursor: not-allowed;
            opacity: 0.6;
        }

        &.is-selected {
            background: $primary;
            border-color: $primary;

            .option-label,
            .option-text {
                color: #fff;
            }
        }

        .option-label {
            font-size: $font-size-lg;
            font-weight: 600;
            margin-right: $spacing-md;
            color: $primary;

            .body--dark & {
                color: rgba($primary, 0.9);
            }
        }

        .option-text {
            font-size: $font-size-base;
            color: var(--text-primary);
        }
    }

    // OX 퀴즈 버튼
    .ox-container {
        display: flex;
        justify-content: center;
        gap: $spacing-lg;
    }

    .ox-btn {
        width: 120px;
        height: 80px;
        border-radius: $radius-lg;
        font-size: $font-size-2xl;
        font-weight: 700;
        cursor: pointer;
        transition: all $transition-fast;
        border: 3px solid;

        &.is-o {
            color: $success;
            border-color: $success;
            background: transparent;

            &:hover:not(:disabled) {
                background: rgba($success, 0.1);
            }

            &.is-selected {
                background: $success;
                color: #fff;
            }
        }

        &.is-x {
            color: $negative;
            border-color: $negative;
            background: transparent;

            &:hover:not(:disabled) {
                background: rgba($negative, 0.1);
            }

            &.is-selected {
                background: $negative;
                color: #fff;
            }
        }

        &:disabled {
            cursor: not-allowed;
            opacity: 0.6;
        }
    }

    // 답변 완료
    .answered {
        text-align: center;
        margin-top: $spacing-md;
    }
}
</style>

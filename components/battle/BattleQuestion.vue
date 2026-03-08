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
        <div class="question-header q-mb-md">
            <div class="text-subtitle1 text-weight-bold">
                Q.{{ questionIndex + 1 }} / {{ totalQuestions }}
            </div>
            <div class="timer-container">
                <q-icon name="timer" :color="timeColor" class="q-mr-xs" />
                <span :class="`text-${timeColor} text-weight-bold`">
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
            class="q-mb-lg"
            :animation-speed="100"
        />

        <!-- 문제 이미지 -->
        <q-img
            v-if="questionImageUrl"
            :src="questionImageUrl"
            class="question-image q-mb-md"
            fit="contain"
            spinner-color="primary"
        />

        <!-- 문제 텍스트 -->
        <q-card flat class="question-card q-mb-lg">
            <q-card-section>
                <div class="text-h6 text-center">
                    {{ questionText }}
                </div>
            </q-card-section>
        </q-card>

        <!-- 답변 옵션 -->
        <div class="options-container">
            <!-- 객관식 -->
            <template v-if="questionType === 'multiple' && options">
                <q-btn
                    v-for="(option, index) in options"
                    :key="index"
                    :label="`${optionLabels[index]} ${option}`"
                    :color="isSelected(option) ? 'primary' : 'white'"
                    :text-color="isSelected(option) ? 'white' : 'dark'"
                    :outline="!isSelected(option)"
                    :disable="disabled || hasAnswered"
                    size="lg"
                    class="option-btn q-mb-sm full-width"
                    no-caps
                    @click="selectAnswer(option)"
                />
            </template>

            <!-- OX 퀴즈 -->
            <template v-else-if="questionType === 'ox'">
                <div class="row q-gutter-md justify-center">
                    <q-btn
                        label="⭕ O"
                        :color="isSelected('O') ? 'positive' : 'white'"
                        :text-color="isSelected('O') ? 'white' : 'positive'"
                        :outline="!isSelected('O')"
                        :disable="disabled || hasAnswered"
                        size="xl"
                        class="ox-btn"
                        @click="selectAnswer('O')"
                    />
                    <q-btn
                        label="❌ X"
                        :color="isSelected('X') ? 'negative' : 'white'"
                        :text-color="isSelected('X') ? 'white' : 'negative'"
                        :outline="!isSelected('X')"
                        :disable="disabled || hasAnswered"
                        size="xl"
                        class="ox-btn"
                        @click="selectAnswer('X')"
                    />
                </div>
            </template>

            <!-- 단답형 (대결에서는 지원 안함 - 객관식/OX만) -->
        </div>

        <!-- 답변 완료 표시 -->
        <div v-if="hasAnswered" class="text-center q-mt-md">
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
}

.question-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.timer-container {
    display: flex;
    align-items: center;
    font-size: 18px;
}

.question-image {
    max-height: 200px;
    border-radius: 12px;
}

.question-card {
    background: linear-gradient(135deg, #fff9f0 0%, #fff 100%);
    border-radius: 16px;
}

.option-btn {
    justify-content: flex-start;
    text-align: left;
    padding: 16px 20px;
    border-radius: 12px;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
        transform: translateX(4px);
    }
}

.ox-btn {
    width: 120px;
    height: 80px;
    border-radius: 16px;
    font-size: 24px;
}
</style>

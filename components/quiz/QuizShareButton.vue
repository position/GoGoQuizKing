<script setup lang="ts">
import { useQuizShare } from '~/composables/use-quiz-share';
import QuizShareDialog from '~/components/quiz/QuizShareDialog.vue';

interface Props {
    quizId: string;
    title: string;
    description?: string;
    /** 버튼 크기 */
    size?: 'sm' | 'md' | 'lg';
    /** 라벨 표시 여부 */
    showLabel?: boolean;
    /** 결과 공유 모드 */
    resultMode?: boolean;
    /** 결과 모드 시 점수 */
    score?: number;
    /** 결과 모드 시 전체 문제 수 */
    totalQuestions?: number;
}

const props = withDefaults(defineProps<Props>(), {
    description: '',
    size: 'md',
    showLabel: true,
    resultMode: false,
    score: 0,
    totalQuestions: 0,
});

const { isNativeShareSupported, shareQuiz, shareResult } = useQuizShare();
const showDialog = ref(false);

async function handleShare() {
    if (props.resultMode) {
        const success = await shareResult({
            title: props.title,
            score: props.score,
            totalQuestions: props.totalQuestions,
            quizId: props.quizId,
        });
        // 네이티브 공유가 성공하면 다이얼로그 불필요
        if (!success && !isNativeShareSupported.value) {
            showDialog.value = true;
        }
        return;
    }

    if (isNativeShareSupported.value) {
        await shareQuiz({
            title: props.title,
            description: props.description,
            quizId: props.quizId,
        });
    } else {
        showDialog.value = true;
    }
}

const buttonSize = computed(() => {
    const sizes: Record<string, string> = {
        sm: 'sm',
        md: 'md',
        lg: 'lg',
    };
    return sizes[props.size] || 'md';
});
</script>

<template>
    <div class="quiz-share-button">
        <q-btn flat round :size="buttonSize" icon="share" color="primary" @click="handleShare">
            <q-tooltip>공유하기</q-tooltip>
        </q-btn>

        <!-- 데스크탑 폴백 다이얼로그 -->
        <QuizShareDialog
            v-model="showDialog"
            :quiz-id="quizId"
            :title="title"
            :description="description"
        />
    </div>
</template>

<style scoped lang="scss">
.quiz-share-button {
    display: inline-flex;
    align-items: center;
    gap: 2px;

    .share-label {
        font-size: 14px;
        font-weight: 500;
        color: var(--text-secondary);
        cursor: pointer;
        user-select: none;
        transition: color 0.2s ease;

        &:hover {
            color: var(--color-primary);
        }
    }
}
</style>

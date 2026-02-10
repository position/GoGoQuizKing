<template>
    <div class="quiz-play-page">
        <div v-if="isLoading" class="loading-state">
            <q-spinner-dots color="primary" size="60px" />
            <p>퀴즈를 불러오는 중...</p>
        </div>

        <div v-else-if="error" class="error-state">
            <q-icon name="error_outline" color="negative" size="60px" />
            <p>{{ error }}</p>
            <q-btn @click="router.back()" label="돌아가기" color="primary" />
        </div>

        <QuizPlayer
            v-else-if="!showResult"
            :questions="quizStore.playState.questions"
            :current-index="quizStore.playState.currentIndex"
            :answers="quizStore.playState.answers"
            @answer="handleAnswer"
            @next="handleNext"
            @prev="handlePrev"
            @complete="handleComplete"
            @exit="handleExit"
        />

        <QuizResult
            v-else-if="resultData"
            :result="resultData"
            @retry="handleRetry"
            @home="handleHome"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useQuizStore } from '@/store/quiz.store';
import type { QuizResultData } from '@/models/quiz';
import QuizPlayer from '@/components/quiz/QuizPlayer.vue';
import QuizResult from '@/components/quiz/QuizResult.vue';

const route = useRoute();
const router = useRouter();
const quizStore = useQuizStore();

const isLoading = ref(true);
const error = ref<string | null>(null);
const showResult = ref(false);
const resultData = ref<QuizResultData | null>(null);

onMounted(async () => {
    const quizId = route.params.id as string;

    if (!quizId) {
        error.value = '퀴즈를 찾을 수 없습니다.';
        isLoading.value = false;
        return;
    }

    const success = await quizStore.startPlay(quizId);
    if (!success) {
        error.value = quizStore.error || '퀴즈를 불러올 수 없습니다.';
    }

    isLoading.value = false;
});

onUnmounted(() => {
    quizStore.resetPlay();
});

function handleAnswer(questionId: string, answer: string) {
    quizStore.submitAnswer(questionId, answer);
}

function handleNext() {
    quizStore.nextQuestion();
}

function handlePrev() {
    quizStore.prevQuestion();
}

async function handleComplete() {
    resultData.value = await quizStore.completeQuiz();
    showResult.value = true;
}

function handleExit() {
    if (confirm('정말 나가시겠습니까? 진행 상황이 저장되지 않습니다.')) {
        router.push('/quiz/quiz-list');
    }
}

async function handleRetry() {
    showResult.value = false;
    const quizId = route.params.id as string;
    await quizStore.startPlay(quizId);
}

function handleHome() {
    router.push('/quiz/quiz-list');
}
</script>

<style scoped lang="scss">
.quiz-play-page {
    min-height: 100vh;
    margin: -16px;

    .loading-state,
    .error-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 60vh;
        gap: 16px;
        text-align: center;

        p {
            font-size: 16px;
            color: #636e72;
        }
    }
}
</style>

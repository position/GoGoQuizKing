<template>
    <div class="quiz-create-page">
        <div class="page-header">
            <h1 class="page-title">✏️ 새 퀴즈 만들기</h1>
            <p class="page-subtitle">친구들과 함께 풀 재미있는 퀴즈를 만들어보세요!</p>
        </div>

        <QuizForm :is-loading="quizStore.isLoading" @submit="handleSubmit" @cancel="handleCancel" />
    </div>
</template>

<script setup lang="ts">
import { useQuizStore } from '@/store/quiz.store';
import type { QuizFormData } from '@/models/quiz';
import QuizForm from '@/components/quiz/QuizForm.vue';

// SEO 설정 - 퀴즈 생성 페이지는 검색 엔진에서 제외
useSeoMeta({
    title: '퀴즈 만들기 - GoGoQuizKing',
    robots: 'noindex, nofollow',
});

const router = useRouter();
const quizStore = useQuizStore();

async function handleSubmit(formData: QuizFormData) {
    const quizId = await quizStore.createQuiz(formData);
    if (quizId) {
        router.push({ path: `/quiz/quiz-list` });
    }
}

function handleCancel() {
    router.back();
}
</script>

<style scoped lang="scss">
.quiz-create-page {
    max-width: 900px;
    margin: 0 auto;

    .page-header {
        text-align: center;
        margin-bottom: 32px;

        .page-title {
            font-size: 28px;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0 0 8px;
        }

        .page-subtitle {
            font-size: 16px;
            color: var(--text-secondary);
            margin: 0;
        }
    }
}
</style>

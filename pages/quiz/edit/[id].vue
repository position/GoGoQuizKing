<template>
    <div class="quiz-edit-page">
        <div v-if="isLoading" class="loading-state">
            <q-spinner-dots color="primary" size="60px" />
            <p>퀴즈를 불러오는 중...</p>
        </div>

        <div v-else-if="error" class="error-state">
            <q-icon name="error_outline" color="negative" size="60px" />
            <p>{{ error }}</p>
            <q-btn @click="router.back()" label="돌아가기" color="primary" />
        </div>

        <template v-else>
            <div class="page-header">
                <h1 class="page-title">✏️ 퀴즈 수정</h1>
                <p class="page-subtitle">퀴즈 내용을 수정해보세요</p>
            </div>

            <QuizForm
                :initial-data="formData"
                :is-edit="true"
                :is-loading="quizStore.isLoading"
                @submit="handleSubmit"
                @cancel="handleCancel"
            />
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuizStore } from '@/store/quiz.store';
import type { QuizFormData, QuestionFormData } from '@/models/quiz';
import QuizForm from '@/components/quiz/QuizForm.vue';

// SEO 설정 - 퀴즈 수정 페이지는 검색 엔진에서 제외
useSeoMeta({
    title: '퀴즈 수정 - GoGoQuizKing',
    robots: 'noindex, nofollow',
});

const route = useRoute();
const router = useRouter();
const quizStore = useQuizStore();

const isLoading = ref(true);
const error = ref<string | null>(null);
const formData = ref<QuizFormData | undefined>(undefined);

onMounted(async () => {
    const quizId = route.params.id as string;

    if (!quizId) {
        error.value = '퀴즈를 찾을 수 없습니다.';
        isLoading.value = false;
        return;
    }

    await quizStore.fetchQuiz(quizId);

    if (quizStore.currentQuiz && quizStore.currentQuestions.length > 0) {
        // 수정용 폼 데이터 구성
        formData.value = {
            title: quizStore.currentQuiz.title,
            description: quizStore.currentQuiz.description || '',
            category: quizStore.currentQuiz.category,
            grade_level: quizStore.currentQuiz.grade_level,
            difficulty: quizStore.currentQuiz.difficulty,
            is_public: quizStore.currentQuiz.is_public,
            questions: quizStore.currentQuestions.map(
                (q, index): QuestionFormData => ({
                    question_type: q.question_type,
                    question_text: q.question_text,
                    question_image_url: q.question_image_url,
                    correct_answer: q.correct_answer,
                    options: (q.options as string[]) || ['', '', '', ''],
                    hint: q.hint || '',
                    order_index: index,
                })
            ),
        };
    } else {
        error.value = quizStore.error || '퀴즈를 불러올 수 없습니다.';
    }

    isLoading.value = false;
});

async function handleSubmit(data: QuizFormData) {
    const quizId = route.params.id as string;
    const success = await quizStore.updateQuiz(quizId, data);
    if (success) {
        router.push({ path: `/quiz/my-quizzes` });
    }
}

function handleCancel() {
    router.back();
}
</script>

<style scoped lang="scss">
.quiz-edit-page {
    max-width: 900px;
    margin: 0 auto;

    .page-header {
        text-align: center;
        margin-bottom: 32px;

        .page-title {
            font-size: 28px;
            font-weight: 700;
            color: #2d3436;
            margin: 0 0 8px;
        }

        .page-subtitle {
            font-size: 16px;
            color: #636e72;
            margin: 0;
        }
    }

    .loading-state,
    .error-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 40vh;
        gap: 16px;
        text-align: center;

        p {
            font-size: 16px;
            color: #636e72;
        }
    }
}
</style>

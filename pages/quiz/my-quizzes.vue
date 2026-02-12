<template>
    <div class="my-quizzes-page">
        <!-- 페이지 헤더 -->
        <div class="page-header">
            <div class="header-content">
                <h1 class="page-title">📝 내 퀴즈 관리</h1>
                <p class="page-subtitle">내가 만든 퀴즈를 관리하세요</p>
            </div>
            <q-btn
                :to="{ path: '/quiz/quiz-create' }"
                label="새 퀴즈 만들기"
                icon="add"
                color="primary"
                unelevated
                class="create-btn"
            />
        </div>

        <!-- 로딩 -->
        <div v-if="quizStore.isLoading" class="loading-state">
            <q-spinner-dots color="primary" size="50px" />
            <p>퀴즈를 불러오는 중...</p>
        </div>

        <!-- 빈 상태 -->
        <div v-else-if="quizStore.myQuizzes.length === 0" class="empty-state">
            <q-icon name="edit_note" size="80px" color="grey-4" />
            <h3>아직 만든 퀴즈가 없어요</h3>
            <p>첫 번째 퀴즈를 만들어보세요!</p>
            <q-btn
                :to="{ path: '/quiz/quiz-create' }"
                label="퀴즈 만들기"
                icon="add"
                color="primary"
                unelevated
            />
        </div>

        <!-- 퀴즈 목록 -->
        <div v-else class="quiz-list">
            <QuizCard
                v-for="quiz in quizStore.myQuizzes"
                :key="quiz.id"
                :quiz="quiz"
                :show-actions="true"
                :show-play-button="false"
                @edit="handleEdit"
                @delete="handleDelete"
                @click="handlePreview"
            />
        </div>

        <!-- 삭제 확인 다이얼로그 -->
        <q-dialog v-model="showDeleteDialog">
            <q-card class="delete-dialog">
                <q-card-section>
                    <div class="text-h6">퀴즈 삭제</div>
                </q-card-section>

                <q-card-section class="q-pt-none">
                    정말로 이 퀴즈를 삭제하시겠습니까?<br />
                    삭제된 퀴즈는 복구할 수 없습니다.
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn v-close-popup label="취소" flat color="grey" />
                    <q-btn
                        v-close-popup
                        @click="confirmDelete"
                        label="삭제"
                        color="negative"
                        unelevated
                    />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuizStore } from '@/store/quiz.store';
import QuizCard from '@/components/quiz/QuizCard.vue';

definePageMeta({
    title: '내 퀴즈 관리',
});

// SEO 설정 - 사용자 전용 페이지는 검색 엔진에서 제외
useSeoMeta({
    title: '내 퀴즈 관리 - GoGoQuizKing',
    robots: 'noindex, nofollow',
});

const router = useRouter();
const quizStore = useQuizStore();

const showDeleteDialog = ref(false);
const deleteTargetId = ref<string | null>(null);

onMounted(() => {
    quizStore.fetchMyQuizzes();
});

function handleEdit(quizId: string) {
    router.push({ path: `/quiz/edit/${quizId}` });
}

function handleDelete(quizId: string) {
    deleteTargetId.value = quizId;
    showDeleteDialog.value = true;
}

async function confirmDelete() {
    if (deleteTargetId.value) {
        await quizStore.deleteQuiz(deleteTargetId.value);
        deleteTargetId.value = null;
    }
}

function handlePreview(quizId: string) {
    router.push({ path: `/quiz/play/${quizId}` });
}
</script>

<style scoped lang="scss">
.my-quizzes-page {
    max-width: 900px;
    margin: 0 auto;

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        flex-wrap: wrap;
        gap: 16px;

        .header-content {
            .page-title {
                font-size: 28px;
                font-weight: 700;
                color: var(--text-primary);
                margin: 0 0 4px;
            }

            .page-subtitle {
                font-size: 16px;
                color: var(--text-secondary);
                margin: 0;
            }
        }

        .create-btn {
            border-radius: 12px;
            font-weight: 600;
        }
    }

    .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        gap: 16px;

        p {
            font-size: 16px;
            color: var(--text-secondary);
        }
    }

    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        text-align: center;

        h3 {
            font-size: 20px;
            font-weight: 600;
            color: var(--text-secondary);
            margin: 16px 0 8px;
        }

        p {
            font-size: 14px;
            color: var(--text-light);
            margin: 0 0 20px;
        }
    }

    .quiz-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .delete-dialog {
        min-width: 320px;
        border-radius: 16px;
        background: var(--bg-card);
    }
}
</style>

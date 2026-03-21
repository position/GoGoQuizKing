<script setup lang="ts">
import { useQuizComments } from '~/composables/use-quiz-comments';
import type { Database } from '~/models/database.types';

interface Props {
    quizId: string;
}

const props = defineProps<Props>();

const {
    comments,
    loading,
    error,
    totalCount,
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
} = useQuizComments({ quizId: props.quizId });

// 현재 사용자 ID
const supabase = useSupabaseClient<Database>();
const currentUserId = ref<string | undefined>();

// 대댓글 작성 상태
const replyingTo = ref<string | null>(null);

onMounted(async () => {
    await fetchComments();

    const { data } = await supabase.auth.getUser();
    currentUserId.value = data.user?.id;
});

async function handleCreateComment(content: string) {
    await createComment({
        quiz_id: props.quizId,
        content,
    });
}

async function handleCreateReply(content: string) {
    if (!replyingTo.value) {
        return;
    }

    const result = await createComment({
        quiz_id: props.quizId,
        content,
        parent_id: replyingTo.value,
    });

    if (result) {
        replyingTo.value = null;
    }
}

async function handleUpdateComment(commentId: string, content: string) {
    await updateComment(commentId, content);
}

async function handleDeleteComment(commentId: string) {
    await deleteComment(commentId);
}

function handleReply(commentId: string) {
    replyingTo.value = commentId;
}

function handleCancelReply() {
    replyingTo.value = null;
}
</script>

<template>
    <div class="quiz-comment-list">
        <!-- 헤더 -->
        <div class="comment-header">
            <h3 class="section-title">
                <q-icon name="chat_bubble_outline" class="q-mr-sm" />
                댓글
                <span class="comment-count">({{ totalCount }})</span>
            </h3>
        </div>

        <!-- 로딩 상태 -->
        <div v-if="loading && !comments.length" class="loading-container">
            <q-spinner-dots color="primary" size="40px" />
        </div>

        <!-- 에러 상태 -->
        <q-banner v-else-if="error" class="bg-negative text-white q-mb-md" rounded>
            {{ error }}
            <template #action>
                <q-btn flat label="다시 시도" @click="fetchComments" />
            </template>
        </q-banner>

        <!-- 댓글 작성 폼 -->
        <div class="comment-form-container q-mb-md">
            <QuizCommentForm
                :quiz-id="quizId"
                placeholder="퀴즈에 대한 의견을 남겨주세요!"
                @submit="handleCreateComment"
            />
        </div>

        <!-- 댓글 목록 -->
        <div v-if="comments.length" class="comments-container">
            <template v-for="comment in comments" :key="comment.id">
                <QuizCommentItem
                    :comment="comment"
                    :current-user-id="currentUserId"
                    @reply="handleReply"
                    @update="handleUpdateComment"
                    @delete="handleDeleteComment"
                />

                <!-- 대댓글 작성 폼 -->
                <div v-if="replyingTo === comment.id" class="reply-form-container">
                    <QuizCommentForm
                        :quiz-id="quizId"
                        :parent-id="comment.id"
                        placeholder="답글을 입력하세요..."
                        submit-label="답글"
                        @submit="handleCreateReply"
                        @cancel="handleCancelReply"
                    />
                </div>
            </template>
        </div>

        <!-- 빈 상태 -->
        <div v-else-if="!loading" class="empty-state">
            <q-icon name="chat" size="48px" color="grey-4" />
            <p class="empty-text">아직 댓글이 없어요!</p>
            <p class="empty-subtext">첫 번째 댓글을 남겨보세요 😊</p>
        </div>
    </div>
</template>

<style scoped lang="scss">
.quiz-comment-list {
    padding: 16px 0;

    .comment-header {
        margin-bottom: 16px;

        .section-title {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: var(--text-primary);
            display: flex;
            align-items: center;

            .comment-count {
                font-weight: normal;
                color: var(--text-light);
                margin-left: 4px;
            }
        }
    }

    .loading-container {
        display: flex;
        justify-content: center;
        padding: 40px 0;
    }

    .comment-form-container,
    .reply-form-container {
        margin-bottom: 16px;
    }

    .reply-form-container {
        margin-left: 32px;
        margin-top: 8px;
    }


    .comments-container {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .empty-state {
        text-align: center;
        padding: 40px 20px;
        color: var(--text-secondary);

        .empty-text {
            margin: 16px 0 8px;
            font-size: 16px;
            font-weight: 500;
            color: var(--text-secondary);
        }

        .empty-subtext {
            margin: 0;
            font-size: 14px;
            color: var(--text-light);
        }
    }
}
</style>

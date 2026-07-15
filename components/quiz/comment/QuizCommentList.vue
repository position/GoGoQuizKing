<script setup lang="ts">
import { useQuizComments } from '~/composables/use-quiz-comments';
import { ToastMessage } from '~/helper/message';
import type { MentionCandidate, QuizComment, QuizCommentMention } from '~/models/comment';
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
    mentionCandidates,
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
} = useQuizComments({ quizId: props.quizId });

// 현재 사용자 ID
const supabase = useSupabaseClient<Database>();
const route = useRoute();
const currentUserId = ref<string | undefined>();

// 대댓글 작성 상태
const replyingTo = ref<string | null>(null);
const highlightedCommentId = ref<string | null>(null);

function flattenComments(items: readonly QuizComment[]): QuizComment[] {
    return items.flatMap((comment) => [comment, ...flattenComments(comment.replies || [])]);
}

const replyTarget = computed(() => {
    if (!replyingTo.value) {
        return null;
    }
    return (
        flattenComments(comments.value).find((comment) => comment.id === replyingTo.value) || null
    );
});

const replyTargetCandidate = computed<MentionCandidate | null>(() => {
    if (!replyTarget.value) {
        return null;
    }
    return (
        mentionCandidates.value.find(
            (candidate) => candidate.user_id === replyTarget.value?.user_id,
        ) || null
    );
});

const replyRootId = computed(() => {
    if (!replyingTo.value) {
        return null;
    }

    const containsTarget = (comment: QuizComment): boolean =>
        comment.id === replyingTo.value ||
        Boolean(comment.replies?.some((reply) => containsTarget(reply)));

    return comments.value.find((comment) => containsTarget(comment))?.id || null;
});

onMounted(async () => {
    await fetchComments();

    const { data } = await supabase.auth.getUser();
    currentUserId.value = data.user?.id;
    await scrollToRequestedComment();
});

watch(
    () => route.query.comment,
    (current, previous) => {
        if (current && current !== previous && comments.value.length) {
            scrollToRequestedComment();
        }
    },
);

async function handleCreateComment(content: string, mentions: QuizCommentMention[]) {
    await createComment({
        quiz_id: props.quizId,
        content,
        mentions,
    });
}

async function handleCreateReply(content: string, mentions: QuizCommentMention[]) {
    if (!replyingTo.value) {
        return;
    }

    const result = await createComment({
        quiz_id: props.quizId,
        content,
        parent_id: replyingTo.value,
        mentions,
    });

    if (result) {
        replyingTo.value = null;
    }
}

async function handleUpdateComment(
    commentId: string,
    content: string,
    mentions: QuizCommentMention[],
) {
    await updateComment(commentId, content, mentions);
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

async function scrollToRequestedComment() {
    const requested = Array.isArray(route.query.comment)
        ? route.query.comment[0]
        : route.query.comment;
    if (!requested) {
        return;
    }

    await nextTick();
    const element = document.getElementById(`comment-${requested}`);
    if (!element) {
        ToastMessage.warning('댓글을 찾을 수 없어요. 삭제되었거나 볼 수 없는 댓글일 수 있습니다.');
        document.querySelector('.quiz-comment-list')?.scrollIntoView({ behavior: 'smooth' });
        return;
    }

    highlightedCommentId.value = requested;
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => {
        if (highlightedCommentId.value === requested) {
            highlightedCommentId.value = null;
        }
    }, 2200);
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
                :mention-candidates="mentionCandidates"
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
                    :mention-candidates="mentionCandidates"
                    :highlighted-comment-id="highlightedCommentId"
                    @reply="handleReply"
                    @update="handleUpdateComment"
                    @delete="handleDeleteComment"
                />

                <!-- 대댓글 작성 폼 -->
                <div v-if="replyRootId === comment.id" class="reply-form-container">
                    <QuizCommentForm
                        :key="replyingTo || undefined"
                        :quiz-id="quizId"
                        :parent-id="replyingTo || undefined"
                        :mention-candidates="mentionCandidates"
                        :auto-mention="replyTargetCandidate"
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

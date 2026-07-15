<script setup lang="ts">
import { CATEGORIES } from '~/models/quiz';
import type { QuizCategory } from '~/models/quiz';
import type { MyQuizComment } from '~/models/comment';
import type { Database } from '~/models/database.types';

definePageMeta({
    title: '내가 쓴 댓글',
});

useSeoMeta({
    title: '내가 쓴 댓글 - 고고퀴즈킹(GoGo QuizKing)',
    robots: 'noindex, nofollow',
});

const PAGE_SIZE = 20;
const supabase = useSupabaseClient<Database>();
const router = useRouter();
const comments = ref<MyQuizComment[]>([]);
const loading = ref(true);
const loadingMore = ref(false);
const error = ref<string | null>(null);
const hasMore = ref(false);

async function fetchComments(reset = false) {
    if (reset) {
        comments.value = [];
        loading.value = true;
    } else {
        loadingMore.value = true;
    }
    error.value = null;

    try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
            throw new Error('로그인이 필요합니다.');
        }

        const from = comments.value.length;
        const { data, error: fetchError } = await supabase
            .from('quiz_comments')
            .select(
                `
                id,
                quiz_id,
                user_id,
                parent_id,
                content,
                created_at,
                updated_at,
                quizzes!quiz_comments_quiz_id_fkey (
                    title,
                    category
                )
            `,
            )
            .eq('user_id', userData.user.id)
            .order('created_at', { ascending: false })
            .range(from, from + PAGE_SIZE - 1);

        if (fetchError) {
            throw fetchError;
        }

        const nextItems = (data || []) as unknown as MyQuizComment[];
        comments.value.push(...nextItems.filter((comment) => comment.quizzes));
        hasMore.value = nextItems.length === PAGE_SIZE;
    } catch (e) {
        error.value = e instanceof Error ? e.message : '댓글을 불러오지 못했습니다.';
    } finally {
        loading.value = false;
        loadingMore.value = false;
    }
}

function categoryLabel(category?: string): string {
    if (!category) {
        return '퀴즈';
    }
    return CATEGORIES[category as QuizCategory]?.label || category;
}

function formatDate(value: string): string {
    return new Date(value).toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function openComment(comment: MyQuizComment) {
    router.push({
        path: `/quiz/${comment.quiz_id}`,
        query: { comment: comment.id },
        hash: `#comment-${comment.id}`,
    });
}

onMounted(() => fetchComments(true));
</script>

<template>
    <div class="my-comments-page">
        <div class="page-header">
            <q-btn flat round icon="arrow_back" aria-label="마이페이지로 돌아가기" to="/profile" />
            <div>
                <h1>💬 내가 쓴 댓글</h1>
                <p>내가 남긴 댓글과 답글을 다시 확인해 보세요.</p>
            </div>
        </div>

        <div v-if="loading" class="center-state">
            <q-spinner-dots color="primary" size="48px" />
        </div>

        <q-banner v-else-if="error" rounded class="bg-negative text-white">
            {{ error }}
            <template #action>
                <q-btn flat label="다시 시도" @click="fetchComments(true)" />
            </template>
        </q-banner>

        <div v-else-if="comments.length" class="comment-list">
            <q-card
                v-for="comment in comments"
                :key="comment.id"
                flat
                bordered
                class="comment-card cursor-pointer"
                tabindex="0"
                @click="openComment(comment)"
                @keydown.enter="openComment(comment)"
            >
                <q-card-section>
                    <div class="comment-meta">
                        <q-badge :color="comment.parent_id ? 'secondary' : 'primary'">
                            {{ comment.parent_id ? '답글' : '댓글' }}
                        </q-badge>
                        <span>{{ formatDate(comment.created_at) }}</span>
                        <span v-if="comment.updated_at !== comment.created_at">수정됨</span>
                    </div>
                    <p class="comment-preview">{{ comment.content }}</p>
                    <div class="quiz-info">
                        <q-icon name="quiz" color="primary" />
                        <span class="quiz-title">{{ comment.quizzes?.title }}</span>
                        <q-chip dense size="sm">
                            {{ categoryLabel(comment.quizzes?.category) }}
                        </q-chip>
                        <q-icon name="chevron_right" color="grey-6" />
                    </div>
                </q-card-section>
            </q-card>

            <div v-if="hasMore" class="load-more">
                <q-btn
                    outline
                    color="primary"
                    label="더 보기"
                    :loading="loadingMore"
                    @click="fetchComments(false)"
                />
            </div>
        </div>

        <div v-else class="center-state empty-state">
            <q-icon name="chat_bubble_outline" size="64px" color="grey-4" />
            <h2>아직 작성한 댓글이 없어요</h2>
            <p>퀴즈에 첫 댓글을 남겨보세요!</p>
            <q-btn color="primary" label="퀴즈 둘러보기" to="/quiz/quiz-list" />
        </div>
    </div>
</template>

<style scoped lang="scss">
.my-comments-page {
    max-width: 760px;
    margin: 0 auto;
    padding: 16px 16px 100px;
}

.page-header {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 24px;

    h1 {
        margin: 0;
        color: var(--text-primary);
        font-size: 26px;
    }

    p {
        margin: 6px 0 0;
        color: var(--text-secondary);
    }
}

.comment-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.comment-card {
    border-radius: 14px;
    background: var(--bg-card);
    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;

    &:hover,
    &:focus-visible {
        transform: translateY(-2px);
        box-shadow: 0 6px 18px var(--shadow-color);
        outline: 2px solid var(--color-primary);
    }
}

.comment-meta,
.quiz-info {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-light);
    font-size: 12px;
}

.comment-preview {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    margin: 12px 0;
    color: var(--text-primary);
    line-height: 1.5;
    white-space: pre-wrap;
}

.quiz-info {
    .quiz-title {
        flex: 1;
        overflow: hidden;
        color: var(--text-secondary);
        font-weight: 600;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}

.center-state {
    display: flex;
    min-height: 280px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: var(--text-secondary);
}

.empty-state h2 {
    margin: 16px 0 4px;
    color: var(--text-primary);
}

.empty-state p {
    margin: 0 0 20px;
}

.load-more {
    display: flex;
    justify-content: center;
    padding: 16px;
}
</style>

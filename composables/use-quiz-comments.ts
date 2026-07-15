// ~/composables/use-quiz-comments.ts
import { ref, computed, readonly } from 'vue';
import type { Ref, ComputedRef } from 'vue';
import type {
    MentionCandidate,
    QuizComment,
    QuizCommentCreateRequest,
    QuizCommentMention,
} from '~/models/comment';
import type { Database } from '~/models/database.types';
import type { Json } from '~/models/database.types';

interface UseQuizCommentsOptions {
    quizId: string;
}

interface UseQuizCommentsReturn {
    comments: Readonly<Ref<QuizComment[]>>;
    loading: Readonly<Ref<boolean>>;
    error: Readonly<Ref<string | null>>;
    totalCount: ComputedRef<number>;
    mentionCandidates: ComputedRef<MentionCandidate[]>;
    fetchComments: () => Promise<void>;
    createComment: (data: QuizCommentCreateRequest) => Promise<QuizComment | null>;
    updateComment: (
        commentId: string,
        content: string,
        mentions?: QuizCommentMention[],
    ) => Promise<boolean>;
    deleteComment: (commentId: string) => Promise<boolean>;
}

export function useQuizComments(options: UseQuizCommentsOptions): UseQuizCommentsReturn {
    const supabase = useSupabaseClient<Database>();
    const { quizId } = options;

    const comments = ref<QuizComment[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const quizAuthor = ref<MentionCandidate | null>(null);

    const totalCount = computed(() => {
        let count = 0;
        const countRecursive = (items: QuizComment[]) => {
            items.forEach((item) => {
                count++;
                if (item.replies) {
                    countRecursive(item.replies);
                }
            });
        };
        countRecursive(comments.value);
        return count;
    });

    const mentionCandidates = computed(() => {
        const candidates = new Map<string, MentionCandidate>();

        if (quizAuthor.value) {
            candidates.set(quizAuthor.value.user_id, quizAuthor.value);
        }

        const collect = (items: QuizComment[]) => {
            items.forEach((comment) => {
                candidates.set(comment.user_id, {
                    user_id: comment.user_id,
                    full_name: comment.profiles?.full_name || null,
                    preferred_username: comment.profiles?.preferred_username || null,
                    avatar_url: comment.profiles?.avatar_url || null,
                    level: comment.profiles?.level,
                });
                if (comment.replies?.length) {
                    collect(comment.replies);
                }
            });
        };
        collect(comments.value);

        return [...candidates.values()];
    });

    async function fetchQuizAuthor(): Promise<void> {
        const { data, error: authorError } = await supabase
            .from('quizzes')
            .select(
                `
                created_by,
                profiles!quizzes_created_by_fkey (
                    full_name,
                    preferred_username,
                    avatar_url,
                    level
                )
            `,
            )
            .eq('id', quizId)
            .single();

        if (authorError || !data) {
            return;
        }

        const author = data.profiles as unknown as {
            full_name: string | null;
            preferred_username: string | null;
            avatar_url: string | null;
            level: number;
        } | null;

        if (author) {
            quizAuthor.value = {
                user_id: data.created_by,
                ...author,
            };
        }
    }

    // 댓글 목록 조회 (대댓글 포함)
    async function fetchComments(): Promise<void> {
        loading.value = true;
        error.value = null;

        try {
            const { data, error: fetchError } = await supabase
                .from('quiz_comments')
                .select(
                    `
                    *,
                    profiles!quiz_comments_user_id_fkey (
                        full_name,
                        preferred_username,
                        avatar_url,
                        level
                    )
                `,
                )
                .eq('quiz_id', quizId)
                .order('created_at', { ascending: true });

            if (fetchError) {
                throw fetchError;
            }

            const allComments = data as unknown as QuizComment[];
            const commentIds = allComments.map((comment) => comment.id);

            if (commentIds.length) {
                const { data: mentionRows, error: mentionError } = await supabase
                    .from('quiz_comment_mentions')
                    .select('*')
                    .in('comment_id', commentIds)
                    .order('start_offset', { ascending: true });

                if (mentionError) {
                    throw mentionError;
                }

                const mentionsByComment = new Map<string, QuizCommentMention[]>();
                (mentionRows || []).forEach((mention) => {
                    const list = mentionsByComment.get(mention.comment_id) || [];
                    list.push(mention);
                    mentionsByComment.set(mention.comment_id, list);
                });

                allComments.forEach((comment) => {
                    comment.mentions = mentionsByComment.get(comment.id) || [];
                });
            }

            // 모든 깊이의 답글이 유지되도록 ID 맵으로 트리를 구성한다.
            const commentMap = new Map<string, QuizComment>();
            allComments.forEach((comment) => {
                comment.replies = [];
                commentMap.set(comment.id, comment);
            });

            const rootComments: QuizComment[] = [];
            allComments.forEach((comment) => {
                const parent = comment.parent_id ? commentMap.get(comment.parent_id) : null;
                if (parent) {
                    parent.replies?.push(comment);
                } else {
                    rootComments.push(comment);
                }
            });

            comments.value = rootComments;
            await fetchQuizAuthor();
        } catch (e) {
            error.value = e instanceof Error ? e.message : '댓글을 불러오는데 실패했습니다.';
        } finally {
            loading.value = false;
        }
    }

    // 댓글 작성
    async function createComment(data: QuizCommentCreateRequest): Promise<QuizComment | null> {
        loading.value = true;
        error.value = null;

        try {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) {
                throw new Error('로그인이 필요합니다.');
            }

            const { data: newComment, error: insertError } = await supabase
                .from('quiz_comments')
                .insert({
                    quiz_id: data.quiz_id,
                    user_id: userData.user.id,
                    parent_id: data.parent_id || null,
                    content: data.content,
                })
                .select(
                    `
                    *,
                    profiles!quiz_comments_user_id_fkey (
                        full_name,
                        preferred_username,
                        avatar_url,
                        level
                    )
                `,
                )
                .single();

            if (insertError) {
                throw insertError;
            }

            const { error: mentionError } = await supabase.rpc('sync_quiz_comment_mentions', {
                p_comment_id: newComment.id,
                p_mentions: JSON.parse(JSON.stringify(data.mentions || [])) as Json,
            });

            if (mentionError) {
                throw mentionError;
            }

            // 로컬 상태 업데이트
            await fetchComments();

            return newComment as QuizComment;
        } catch (e) {
            error.value = e instanceof Error ? e.message : '댓글 작성에 실패했습니다.';
            return null;
        } finally {
            loading.value = false;
        }
    }

    // 댓글 수정
    async function updateComment(
        commentId: string,
        content: string,
        mentions: QuizCommentMention[] = [],
    ): Promise<boolean> {
        loading.value = true;
        error.value = null;

        try {
            const { error: updateError } = await supabase
                .from('quiz_comments')
                .update({ content })
                .eq('id', commentId);

            if (updateError) {
                throw updateError;
            }

            const { error: mentionError } = await supabase.rpc('sync_quiz_comment_mentions', {
                p_comment_id: commentId,
                p_mentions: JSON.parse(JSON.stringify(mentions)) as Json,
            });

            if (mentionError) {
                throw mentionError;
            }

            // 로컬 상태 업데이트
            await fetchComments();

            return true;
        } catch (e) {
            error.value = e instanceof Error ? e.message : '댓글 수정에 실패했습니다.';
            return false;
        } finally {
            loading.value = false;
        }
    }

    // 댓글 삭제
    async function deleteComment(commentId: string): Promise<boolean> {
        loading.value = true;
        error.value = null;

        try {
            const { error: deleteError } = await supabase
                .from('quiz_comments')
                .delete()
                .eq('id', commentId);

            if (deleteError) {
                throw deleteError;
            }

            // 로컬 상태 업데이트
            await fetchComments();

            return true;
        } catch (e) {
            error.value = e instanceof Error ? e.message : '댓글 삭제에 실패했습니다.';
            return false;
        } finally {
            loading.value = false;
        }
    }

    return {
        comments,
        loading: readonly(loading),
        error: readonly(error),
        totalCount,
        mentionCandidates,
        fetchComments,
        createComment,
        updateComment,
        deleteComment,
    };
}

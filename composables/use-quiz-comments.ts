// ~/composables/use-quiz-comments.ts
import { ref, computed, readonly } from 'vue';
import type { Ref, ComputedRef } from 'vue';
import type { QuizComment, QuizCommentCreateRequest } from '~/models/comment';
import type { Database } from '~/models/database.types';

interface UseQuizCommentsOptions {
    quizId: string;
}

interface UseQuizCommentsReturn {
    comments: Readonly<Ref<QuizComment[]>>;
    loading: Readonly<Ref<boolean>>;
    error: Readonly<Ref<string | null>>;
    totalCount: ComputedRef<number>;
    fetchComments: () => Promise<void>;
    createComment: (data: QuizCommentCreateRequest) => Promise<QuizComment | null>;
    updateComment: (commentId: string, content: string) => Promise<boolean>;
    deleteComment: (commentId: string) => Promise<boolean>;
}

export function useQuizComments(options: UseQuizCommentsOptions): UseQuizCommentsReturn {
    const supabase = useSupabaseClient<Database>();
    const { quizId } = options;

    const comments = ref<QuizComment[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

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

    // 댓글 목록 조회 (대댓글 포함)
    async function fetchComments(): Promise<void> {
        loading.value = true;
        error.value = null;

        try {
            const { data, error: fetchError } = await supabase
                .from('quiz_comments')
                .select(`
                    *,
                    profiles (
                        full_name,
                        avatar_url
                    )
                `)
                .eq('quiz_id', quizId)
                .order('created_at', { ascending: true });

            if (fetchError) {
                throw fetchError;
            }

            // 트리 구조로 변환 (parent_id가 null인 것을 루트로)
            const allComments = data as QuizComment[];
            const rootComments: QuizComment[] = [];
            const replyMap = new Map<string, QuizComment[]>();

            allComments.forEach((comment) => {
                if (comment.parent_id) {
                    const replies = replyMap.get(comment.parent_id) || [];
                    replies.push(comment);
                    replyMap.set(comment.parent_id, replies);
                } else {
                    rootComments.push(comment);
                }
            });

            // 대댓글 연결
            rootComments.forEach((comment) => {
                comment.replies = replyMap.get(comment.id) || [];
            });

            comments.value = rootComments;
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
                .select(`
                    *,
                    profiles (
                        full_name,
                        avatar_url
                    )
                `)
                .single();

            if (insertError) {
                throw insertError;
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
    async function updateComment(commentId: string, content: string): Promise<boolean> {
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
        comments: readonly(comments),
        loading: readonly(loading),
        error: readonly(error),
        totalCount,
        fetchComments,
        createComment,
        updateComment,
        deleteComment,
    };
}

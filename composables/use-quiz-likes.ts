// ~/composables/use-quiz-likes.ts
import { ref, readonly } from 'vue';
import type { Ref } from 'vue';
import type { Database } from '~/models/database.types';

interface UseQuizLikesOptions {
    quizId: string;
}

interface UseQuizLikesReturn {
    isLiked: Readonly<Ref<boolean>>;
    likeCount: Readonly<Ref<number>>;
    loading: Readonly<Ref<boolean>>;
    error: Readonly<Ref<string | null>>;
    fetchLikeStatus: () => Promise<void>;
    toggleLike: () => Promise<boolean>;
}

export function useQuizLikes(options: UseQuizLikesOptions): UseQuizLikesReturn {
    const supabase = useSupabaseClient<Database>();
    const { quizId } = options;

    const isLiked = ref(false);
    const likeCount = ref(0);
    const loading = ref(false);
    const error = ref<string | null>(null);

    // 좋아요 상태 조회
    async function fetchLikeStatus(): Promise<void> {
        loading.value = true;
        error.value = null;

        try {
            // 퀴즈의 좋아요 수 조회
            const { data: quizData, error: quizError } = await supabase
                .from('quizzes')
                .select('like_count')
                .eq('id', quizId)
                .single();

            if (quizError) {
                throw quizError;
            }

            likeCount.value = quizData?.like_count || 0;

            // 현재 사용자의 좋아요 여부 확인
            const { data: userData } = await supabase.auth.getUser();
            if (userData.user) {
                const { data: likeData, error: likeError } = await supabase
                    .from('quiz_likes')
                    .select('id')
                    .eq('quiz_id', quizId)
                    .eq('user_id', userData.user.id)
                    .maybeSingle();

                if (likeError) {
                    throw likeError;
                }

                isLiked.value = !!likeData;
            } else {
                isLiked.value = false;
            }
        } catch (e) {
            error.value = e instanceof Error ? e.message : '좋아요 상태를 불러오는데 실패했습니다.';
        } finally {
            loading.value = false;
        }
    }

    // 좋아요 토글
    async function toggleLike(): Promise<boolean> {
        loading.value = true;
        error.value = null;

        try {
            const { data: userData } = await supabase.auth.getUser();
            if (!userData.user) {
                throw new Error('로그인이 필요합니다.');
            }

            console.log('좋아요 토글 시작:', {
                quizId,
                userId: userData.user.id,
                isLiked: isLiked.value,
            });

            if (isLiked.value) {
                // 좋아요 취소
                const { error: deleteError } = await supabase
                    .from('quiz_likes')
                    .delete()
                    .eq('quiz_id', quizId)
                    .eq('user_id', userData.user.id);

                if (deleteError) {
                    console.error('좋아요 취소 실패:', deleteError);
                    throw deleteError;
                }

                console.log('좋아요 취소 성공');
                isLiked.value = false;
                likeCount.value = Math.max(0, likeCount.value - 1);
            } else {
                // 좋아요 추가
                const { data: insertData, error: insertError } = await supabase
                    .from('quiz_likes')
                    .insert({
                        quiz_id: quizId,
                        user_id: userData.user.id,
                    })
                    .select();

                if (insertError) {
                    console.error('좋아요 추가 실패:', insertError);
                    throw insertError;
                }

                console.log('좋아요 추가 성공:', insertData);
                isLiked.value = true;
                likeCount.value = likeCount.value + 1;
            }

            return true;
        } catch (e) {
            console.error('좋아요 처리 에러:', e);
            error.value = e instanceof Error ? e.message : '좋아요 처리에 실패했습니다.';
            return false;
        } finally {
            loading.value = false;
        }
    }

    return {
        isLiked: readonly(isLiked),
        likeCount: readonly(likeCount),
        loading: readonly(loading),
        error: readonly(error),
        fetchLikeStatus,
        toggleLike,
    };
}

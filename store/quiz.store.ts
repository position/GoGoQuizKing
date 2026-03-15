import { defineStore } from 'pinia';
import type {
    Quiz,
    Question,
    QuizFormData,
    QuizAttempt,
    QuizListFilter,
    QuizWithAuthor,
    QuizPlayState,
    QuizResultData,
} from '@/models/quiz';
import { DEFAULT_QUIZ_FILTER } from '@/models/quiz';
import { ToastMessage } from '@/helper/message';
import type { Database } from '@/models/database.types';

interface QuizStoreState {
    // 퀴즈 목록
    quizzes: QuizWithAuthor[];
    myQuizzes: Quiz[];
    isLoading: boolean;
    error: string | null;

    // 페이지네이션
    pagination: {
        page: number;
        pageSize: number;
        hasMore: boolean;
    };

    // 필터
    filter: QuizListFilter;

    // 현재 퀴즈
    currentQuiz: Quiz | null;
    currentQuestions: Question[];

    // 플레이 상태
    playState: QuizPlayState;
}

const initialPlayState: QuizPlayState = {
    quiz: null,
    questions: [],
    currentIndex: 0,
    answers: {},
    startTime: 0,
    isCompleted: false,
};

export const useQuizStore = defineStore('quiz', {
    state: (): QuizStoreState => ({
        quizzes: [],
        myQuizzes: [],
        isLoading: false,
        error: null,
        pagination: {
            page: 0,
            pageSize: 12,
            hasMore: true,
        },
        filter: { ...DEFAULT_QUIZ_FILTER },
        currentQuiz: null,
        currentQuestions: [],
        playState: { ...initialPlayState },
    }),

    getters: {
        filteredQuizzes(state): QuizWithAuthor[] {
            let result = [...state.quizzes];

            // 카테고리 필터
            if (state.filter.category) {
                result = result.filter((q) => q.category === state.filter.category);
            }

            // 난이도 필터
            if (state.filter.difficulty) {
                result = result.filter((q) => q.difficulty === state.filter.difficulty);
            }

            // 학년 필터
            if (state.filter.gradeLevel) {
                result = result.filter((q) => q.grade_level === state.filter.gradeLevel);
            }

            // 검색어 필터
            if (state.filter.searchQuery) {
                const query = state.filter.searchQuery.toLowerCase();
                result = result.filter(
                    (q) =>
                        q.title.toLowerCase().includes(query) ||
                        q.description?.toLowerCase().includes(query)
                );
            }

            // 정렬
            result.sort((a, b) => {
                const aVal = a[state.filter.sortBy];
                const bVal = b[state.filter.sortBy];

                if (state.filter.sortBy === 'title') {
                    return state.filter.sortOrder === 'asc'
                        ? (aVal as string).localeCompare(bVal as string)
                        : (bVal as string).localeCompare(aVal as string);
                }

                if (state.filter.sortOrder === 'asc') {
                    return aVal < bVal ? -1 : 1;
                }
                return aVal > bVal ? -1 : 1;
            });

            return result;
        },

        currentQuestion(state): Question | null {
            if (state.playState.questions.length === 0) return null;
            return state.playState.questions[state.playState.currentIndex] || null;
        },

        progress(state): number {
            if (state.playState.questions.length === 0) return 0;
            return Math.round(
                (state.playState.currentIndex / state.playState.questions.length) * 100
            );
        },

        isLastQuestion(state): boolean {
            return state.playState.currentIndex === state.playState.questions.length - 1;
        },
    },

    actions: {
        // 퀴즈 목록 불러오기 (페이지네이션 + 필터)
        async fetchQuizzesPaginated() {
            if (this.isLoading || !this.pagination.hasMore) return;

            this.isLoading = true;
            this.error = null;

            try {
                const supabase = useSupabaseClient<Database>();
                const from = this.pagination.page * this.pagination.pageSize;
                const to = from + this.pagination.pageSize - 1;

                let query = supabase
                    .from('quizzes')
                    .select(
                        `
                        *,
                        profiles:created_by (
                            full_name,
                            avatar_url
                        )
                    `
                    )
                    .eq('is_public', true);

                // 필터 적용
                if (this.filter.category) {
                    query = query.eq('category', this.filter.category);
                }

                if (this.filter.difficulty) {
                    query = query.eq('difficulty', this.filter.difficulty);
                }

                if (this.filter.gradeLevel) {
                    query = query.eq('grade_level', this.filter.gradeLevel);
                }

                // 검색 필터 (제목 또는 설명에서 검색)
                if (this.filter.searchQuery) {
                    const searchTerm = `%${this.filter.searchQuery}%`;
                    query = query.or(
                        `title.ilike.${searchTerm},description.ilike.${searchTerm}`
                    );
                }

                // 정렬
                const ascending = this.filter.sortOrder === 'asc';
                query = query.order(this.filter.sortBy, { ascending });

                // 페이지네이션
                const { data, error } = await query.range(from, to);

                if (error) throw error;

                const newQuizzes = (data as QuizWithAuthor[]) || [];
                this.quizzes = [...this.quizzes, ...newQuizzes];
                this.pagination.page++;
                this.pagination.hasMore = newQuizzes.length === this.pagination.pageSize;
            } catch (e) {
                console.error('Failed to fetch quizzes:', e);
                this.error = '퀴즈 목록을 불러오는데 실패했습니다.';
                ToastMessage.error(this.error);
            } finally {
                this.isLoading = false;
            }
        },

        // 퀴즈 목록 리셋 (필터 변경 시 호출)
        resetQuizzes() {
            this.quizzes = [];
            this.pagination.page = 0;
            this.pagination.hasMore = true;
        },

        // 퀴즈 목록 불러오기 (캐시 활용)
        async fetchQuizzes(forceRefresh = false) {
            // 이미 데이터가 있고 강제 새로고침이 아니면 스킵
            if (!forceRefresh && this.quizzes.length > 0) {
                return;
            }

            this.isLoading = true;
            this.error = null;

            try {
                const supabase = useSupabaseClient<Database>();
                const { data, error } = await supabase
                    .from('quizzes')
                    .select(
                        `
                        id,
                        title,
                        description,
                        category,
                        difficulty,
                        play_count,
                        created_at,
                        profiles:created_by (
                            full_name,
                            avatar_url
                        )
                    `
                    )
                    .eq('is_public', true)
                    .order('created_at', { ascending: false })
                    .limit(50); // 초기 로드 제한

                if (error) throw error;
                this.quizzes = (data as QuizWithAuthor[]) || [];
            } catch (e) {
                console.error('Failed to fetch quizzes:', e);
                this.error = '퀴즈 목록을 불러오는데 실패했습니다.';
                ToastMessage.error(this.error);
            } finally {
                this.isLoading = false;
            }
        },

        // 내 퀴즈 목록 불러오기
        async fetchMyQuizzes() {
            this.isLoading = true;
            this.error = null;

            try {
                const supabase = useSupabaseClient<Database>();
                const {
                    data: { user },
                } = await supabase.auth.getUser();

                if (!user) {
                    throw new Error('로그인이 필요합니다.');
                }

                const { data, error } = await supabase
                    .from('quizzes')
                    .select('*')
                    .eq('created_by', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                this.myQuizzes = (data as Quiz[]) || [];
            } catch (e) {
                console.error('Failed to fetch my quizzes:', e);
                this.error = '내 퀴즈 목록을 불러오는데 실패했습니다.';
                ToastMessage.error(this.error);
            } finally {
                this.isLoading = false;
            }
        },

        // 퀴즈 상세 불러오기
        async fetchQuiz(quizId: string) {
            this.isLoading = true;
            this.error = null;

            try {
                const supabase = useSupabaseClient<Database>();

                // 퀴즈 정보
                const { data: quiz, error: quizError } = await supabase
                    .from('quizzes')
                    .select('*')
                    .eq('id', quizId)
                    .single();

                if (quizError) throw quizError;

                // 문제 목록
                const { data: questions, error: questionsError } = await supabase
                    .from('quiz_questions')
                    .select('*')
                    .eq('quiz_id', quizId)
                    .order('order_index', { ascending: true });

                if (questionsError) throw questionsError;

                this.currentQuiz = quiz as Quiz;
                this.currentQuestions = (questions as Question[]) || [];
            } catch (e) {
                console.error('Failed to fetch quiz:', e);
                this.error = '퀴즈를 불러오는데 실패했습니다.';
                ToastMessage.error(this.error);
            } finally {
                this.isLoading = false;
            }
        },

        // 퀴즈 생성
        async createQuiz(formData: QuizFormData): Promise<string | null> {
            this.isLoading = true;
            this.error = null;

            try {
                const supabase = useSupabaseClient<Database>();
                const {
                    data: { user },
                } = await supabase.auth.getUser();

                if (!user) {
                    throw new Error('로그인이 필요합니다.');
                }

                // 퀴즈 생성
                const { data: quiz, error: quizError } = await supabase
                    .from('quizzes')
                    .insert({
                        created_by: user.id,
                        title: formData.title,
                        description: formData.description,
                        category: formData.category,
                        grade_level: formData.grade_level,
                        difficulty: formData.difficulty,
                        is_public: formData.is_public,
                    })
                    .select()
                    .single();

                if (quizError) throw quizError;

                // 문제 생성
                const questions = formData.questions.map((q, index) => ({
                    quiz_id: quiz.id,
                    question_type: q.question_type,
                    question_text: q.question_text,
                    question_image_url: q.question_image_url,
                    correct_answer: q.correct_answer,
                    options: q.options,
                    hint: q.hint,
                    order_index: index,
                }));

                const { error: questionsError } = await supabase
                    .from('quiz_questions')
                    .insert(questions);

                if (questionsError) throw questionsError;

                // 퀴즈 생성 포인트 지급
                try {
                    await supabase.rpc('award_quiz_create_points', {
                        p_user_id: user.id,
                        p_quiz_id: quiz.id,
                    });
                    const { usePointStore } = await import('@/store/point.store');
                    const pointStore = usePointStore();
                    await pointStore.fetchPointSummary();

                    // 데일리 미션 업데이트
                    const { useDailyMissionStore } = await import('@/store/dailyMission.store');
                    const dailyMissionStore = useDailyMissionStore();
                    await dailyMissionStore.onQuizCreated();

                    ToastMessage.success('퀴즈가 생성되었습니다! +20 포인트 🎉');
                } catch (pointError) {
                    console.error('Failed to award quiz create points:', pointError);
                    ToastMessage.success('퀴즈가 생성되었습니다! 🎉');
                }
                
                return quiz.id;
            } catch (e) {
                console.error('Failed to create quiz:', e);
                this.error = '퀴즈 생성에 실패했습니다.';
                ToastMessage.error(this.error);
                return null;
            } finally {
                this.isLoading = false;
            }
        },

        // 퀴즈 수정
        async updateQuiz(quizId: string, formData: QuizFormData): Promise<boolean> {
            this.isLoading = true;
            this.error = null;

            try {
                const supabase = useSupabaseClient<Database>();

                // 퀴즈 수정
                const { error: quizError } = await supabase
                    .from('quizzes')
                    .update({
                        title: formData.title,
                        description: formData.description,
                        category: formData.category,
                        grade_level: formData.grade_level,
                        difficulty: formData.difficulty,
                        is_public: formData.is_public,
                    })
                    .eq('id', quizId);

                if (quizError) throw quizError;

                // 기존 문제 삭제
                const { error: deleteError } = await supabase
                    .from('quiz_questions')
                    .delete()
                    .eq('quiz_id', quizId);

                if (deleteError) throw deleteError;

                // 새 문제 생성
                const questions = formData.questions.map((q, index) => ({
                    quiz_id: quizId,
                    question_type: q.question_type,
                    question_text: q.question_text,
                    question_image_url: q.question_image_url,
                    correct_answer: q.correct_answer,
                    options: q.options,
                    hint: q.hint,
                    order_index: index,
                }));

                const { error: questionsError } = await supabase
                    .from('quiz_questions')
                    .insert(questions);

                if (questionsError) throw questionsError;

                ToastMessage.success('퀴즈가 수정되었습니다! ✏️');
                return true;
            } catch (e) {
                console.error('Failed to update quiz:', e);
                this.error = '퀴즈 수정에 실패했습니다.';
                ToastMessage.error(this.error);
                return false;
            } finally {
                this.isLoading = false;
            }
        },

        // 퀴즈 삭제
        async deleteQuiz(quizId: string): Promise<boolean> {
            this.isLoading = true;
            this.error = null;

            try {
                const supabase = useSupabaseClient<Database>();
                const { error } = await supabase.from('quizzes').delete().eq('id', quizId);

                if (error) throw error;

                // 로컬 상태에서도 제거
                this.myQuizzes = this.myQuizzes.filter((q) => q.id !== quizId);
                this.quizzes = this.quizzes.filter((q) => q.id !== quizId);

                ToastMessage.success('퀴즈가 삭제되었습니다.');
                return true;
            } catch (e) {
                console.error('Failed to delete quiz:', e);
                this.error = '퀴즈 삭제에 실패했습니다.';
                ToastMessage.error(this.error);
                return false;
            } finally {
                this.isLoading = false;
            }
        },

        // 플레이 시작
        async startPlay(quizId: string) {
            await this.fetchQuiz(quizId);

            if (!this.currentQuiz || this.currentQuestions.length === 0) {
                this.error = '퀴즈를 불러올 수 없습니다.';
                return false;
            }

            this.playState = {
                quiz: this.currentQuiz,
                questions: this.currentQuestions,
                currentIndex: 0,
                answers: {},
                startTime: Date.now(),
                isCompleted: false,
            };

            // 플레이 카운트 증가
            const supabase = useSupabaseClient<Database>();
            await supabase.rpc('increment_quiz_play_count', { quiz_uuid: quizId });

            return true;
        },

        // 답변 제출
        submitAnswer(questionId: string, answer: string) {
            this.playState.answers[questionId] = answer;
        },

        // 다음 문제
        nextQuestion() {
            if (this.playState.currentIndex < this.playState.questions.length - 1) {
                this.playState.currentIndex++;
            }
        },

        // 이전 문제
        prevQuestion() {
            if (this.playState.currentIndex > 0) {
                this.playState.currentIndex--;
            }
        },

        // 퀴즈 완료
        async completeQuiz(): Promise<QuizResultData | null> {
            if (!this.playState.quiz) return null;

            this.playState.isCompleted = true;
            const timeSpent = Math.floor((Date.now() - this.playState.startTime) / 1000);

            // 점수 계산
            let score = 0;
            const correctAnswers: string[] = [];
            let consecutiveCorrect = 0;
            let maxConsecutive = 0;

            this.playState.questions.forEach((question) => {
                const userAnswer = this.playState.answers[question.id];
                if (userAnswer === question.correct_answer) {
                    score++;
                    correctAnswers.push(question.id);
                    consecutiveCorrect++;
                    maxConsecutive = Math.max(maxConsecutive, consecutiveCorrect);
                } else {
                    consecutiveCorrect = 0;
                }
            });

            let earnedPoints = 0;
            let bonusPoints = 0;
            let levelUp = false;

            // 결과 저장 및 포인트 지급
            try {
                const supabase = useSupabaseClient<Database>();
                const {
                    data: { user },
                } = await supabase.auth.getUser();

                if (user) {
                    await supabase.from('quiz_attempts').insert({
                        user_id: user.id,
                        quiz_id: this.playState.quiz.id,
                        score,
                        total_questions: this.playState.questions.length,
                        time_spent: timeSpent,
                        answers: this.playState.answers,
                    });

                    // 포인트 지급
                    if (score > 0) {
                        const { data: pointResult } = await supabase.rpc('award_quiz_points', {
                            p_user_id: user.id,
                            p_quiz_id: this.playState.quiz.id,
                            p_correct_count: score,
                            p_total_questions: this.playState.questions.length,
                            p_consecutive_correct: maxConsecutive,
                        });

                        if (pointResult && pointResult.length > 0) {
                            const result = pointResult[0];
                            earnedPoints = result.base_points || 0;
                            bonusPoints = result.bonus_points || 0;
                        }

                        // point store 업데이트
                        const { usePointStore } = await import('@/store/point.store');
                        const pointStore = usePointStore();
                        const oldLevel = pointStore.level;
                        await pointStore.fetchPointSummary();
                        levelUp = pointStore.level > oldLevel;
                    }

                    // 뱃지 체크 및 업데이트
                    const { useBadgeStore } = await import('@/store/badge.store');
                    const badgeStore = useBadgeStore();
                    await badgeStore.onQuizCompleted(
                        this.playState.quiz!.id,
                        score,
                        this.playState.questions.length,
                        this.playState.quiz!.category,
                    );

                    // 데일리 미션 업데이트
                    const { useDailyMissionStore } = await import('@/store/dailyMission.store');
                    const dailyMissionStore = useDailyMissionStore();
                    await dailyMissionStore.onQuizCompleted(
                        this.playState.quiz!.id,
                        maxConsecutive,
                    );
                }
            } catch (e) {
                console.error('Failed to save attempt or award points:', e);
            }

            return {
                quiz: this.playState.quiz,
                questions: this.playState.questions,
                answers: this.playState.answers,
                score,
                totalQuestions: this.playState.questions.length,
                timeSpent,
                correctAnswers,
                earnedPoints,
                bonusPoints,
                levelUp,
            };
        },

        // 플레이 상태 초기화
        resetPlay() {
            this.playState = { ...initialPlayState };
        },

        // 필터 설정
        setFilter(filter: Partial<QuizListFilter>) {
            this.filter = { ...this.filter, ...filter };
        },

        // 필터 초기화
        resetFilter() {
            this.filter = { ...DEFAULT_QUIZ_FILTER };
        },
    },
});

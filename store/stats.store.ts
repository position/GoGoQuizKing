import { defineStore } from 'pinia';
import type {
    UserStats,
    CategoryStats,
    DifficultyStats,
    DailyActivity,
    WeeklyActivity,
    MonthlyActivity,
    PointTrend,
    QuizPerformance,
    ProfileUpdateData,
} from '@/models/stats';
import type { Database } from '@/models/database.types';
import { ToastMessage } from '@/helper/message';
import dayjs from 'dayjs';

interface StatsState {
    userStats: UserStats | null;
    categoryStats: CategoryStats[];
    difficultyStats: DifficultyStats[];
    dailyActivity: DailyActivity[];
    weeklyActivity: WeeklyActivity[];
    monthlyActivity: MonthlyActivity[];
    pointTrends: PointTrend[];
    recentPerformance: QuizPerformance[];
    isLoading: boolean;
    error: string | null;
}

export const useStatsStore = defineStore('stats', {
    state: (): StatsState => ({
        userStats: null,
        categoryStats: [],
        difficultyStats: [],
        dailyActivity: [],
        weeklyActivity: [],
        monthlyActivity: [],
        pointTrends: [],
        recentPerformance: [],
        isLoading: false,
        error: null,
    }),

    getters: {
        totalAccuracy(state): number {
            if (!state.userStats || state.userStats.totalQuestions === 0) return 0;
            return Math.round(
                (state.userStats.totalCorrectAnswers / state.userStats.totalQuestions) * 100
            );
        },

        categoryLabels(state): string[] {
            return state.categoryStats.map((s) => s.category);
        },

        categoryAccuracies(state): number[] {
            return state.categoryStats.map((s) => s.accuracy);
        },

        last7DaysActivity(state): DailyActivity[] {
            return state.dailyActivity.slice(-7);
        },

        last30DaysPointTrend(state): PointTrend[] {
            return state.pointTrends.slice(-30);
        },
    },

    actions: {
        async fetchAllStats() {
            this.isLoading = true;
            this.error = null;

            try {
                await Promise.all([
                    this.fetchUserStats(),
                    this.fetchCategoryStats(),
                    this.fetchDifficultyStats(),
                    this.fetchDailyActivity(30),
                    this.fetchPointTrends(30),
                    this.fetchRecentPerformance(10),
                ]);
            } catch (e) {
                console.error('Failed to fetch stats:', e);
                this.error = '통계를 불러오는데 실패했습니다.';
            } finally {
                this.isLoading = false;
            }
        },

        async fetchUserStats() {
            const supabase = useSupabaseClient<Database>();
            const user = useSupabaseUser();

            if (!user.value?.id) return;

            try {
                // 퀴즈 시도 통계
                const { data: attempts, error: attemptError } = await supabase
                    .from('quiz_attempts')
                    .select('score, total_questions, time_spent')
                    .eq('user_id', user.value.id);

                if (attemptError) throw attemptError;

                // 생성한 퀴즈 수
                const { count: createdCount, error: createdError } = await supabase
                    .from('quizzes')
                    .select('*', { count: 'exact', head: true })
                    .eq('created_by', user.value.id);

                if (createdError) throw createdError;

                const totalQuizzesTaken = attempts?.length || 0;
                const totalCorrectAnswers = attempts?.reduce((sum, a) => sum + a.score, 0) || 0;
                const totalQuestions = attempts?.reduce((sum, a) => sum + a.total_questions, 0) || 0;
                const totalTimeSpent = attempts?.reduce((sum, a) => sum + (a.time_spent || 0), 0) || 0;

                this.userStats = {
                    totalQuizzesTaken,
                    totalQuizzesCreated: createdCount || 0,
                    totalCorrectAnswers,
                    totalQuestions,
                    averageScore: totalQuizzesTaken > 0
                        ? Math.round((totalCorrectAnswers / totalQuestions) * 100)
                        : 0,
                    totalTimeSpent,
                    averageTimePerQuiz: totalQuizzesTaken > 0
                        ? Math.round(totalTimeSpent / totalQuizzesTaken)
                        : 0,
                };
            } catch (e) {
                console.error('Failed to fetch user stats:', e);
                throw e;
            }
        },

        async fetchCategoryStats() {
            const supabase = useSupabaseClient<Database>();
            const user = useSupabaseUser();

            if (!user.value?.id) return;

            try {
                const { data, error } = await supabase
                    .from('quiz_attempts')
                    .select(`
                        score,
                        total_questions,
                        quizzes!inner(category)
                    `)
                    .eq('user_id', user.value.id);

                if (error) throw error;

                // 카테고리별 집계
                const categoryMap = new Map<string, { correct: number; total: number; count: number }>();

                data?.forEach((attempt: any) => {
                    const category = attempt.quizzes?.category || '기타';
                    const existing = categoryMap.get(category) || { correct: 0, total: 0, count: 0 };
                    categoryMap.set(category, {
                        correct: existing.correct + attempt.score,
                        total: existing.total + attempt.total_questions,
                        count: existing.count + 1,
                    });
                });

                this.categoryStats = Array.from(categoryMap.entries()).map(([category, stats]) => ({
                    category,
                    attemptCount: stats.count,
                    correctCount: stats.correct,
                    totalQuestions: stats.total,
                    accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
                }));
            } catch (e) {
                console.error('Failed to fetch category stats:', e);
                throw e;
            }
        },

        async fetchDifficultyStats() {
            const supabase = useSupabaseClient<Database>();
            const user = useSupabaseUser();

            if (!user.value?.id) return;

            try {
                const { data, error } = await supabase
                    .from('quiz_attempts')
                    .select(`
                        score,
                        total_questions,
                        time_spent,
                        quizzes!inner(difficulty)
                    `)
                    .eq('user_id', user.value.id);

                if (error) throw error;

                // 난이도별 집계
                const difficultyMap = new Map<string, { correct: number; total: number; count: number; time: number }>();

                data?.forEach((attempt: any) => {
                    const difficulty = attempt.quizzes?.difficulty || 'medium';
                    const existing = difficultyMap.get(difficulty) || { correct: 0, total: 0, count: 0, time: 0 };
                    difficultyMap.set(difficulty, {
                        correct: existing.correct + attempt.score,
                        total: existing.total + attempt.total_questions,
                        count: existing.count + 1,
                        time: existing.time + (attempt.time_spent || 0),
                    });
                });

                this.difficultyStats = Array.from(difficultyMap.entries()).map(([difficulty, stats]) => ({
                    difficulty,
                    attemptCount: stats.count,
                    correctCount: stats.correct,
                    totalQuestions: stats.total,
                    accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
                    avgTimeSpent: stats.count > 0 ? Math.round(stats.time / stats.count) : 0,
                }));
            } catch (e) {
                console.error('Failed to fetch difficulty stats:', e);
                throw e;
            }
        },

        async fetchDailyActivity(days: number = 30) {
            const supabase = useSupabaseClient<Database>();
            const user = useSupabaseUser();

            if (!user.value?.id) return;

            try {
                const startDate = dayjs().subtract(days, 'day').format('YYYY-MM-DD');

                const { data: attempts, error: attemptError } = await supabase
                    .from('quiz_attempts')
                    .select('score, total_questions, completed_at')
                    .eq('user_id', user.value.id)
                    .gte('completed_at', startDate)
                    .order('completed_at', { ascending: true });

                if (attemptError) throw attemptError;

                const { data: points, error: pointError } = await supabase
                    .from('point_history')
                    .select('points, created_at')
                    .eq('user_id', user.value.id)
                    .gte('created_at', startDate)
                    .order('created_at', { ascending: true });

                if (pointError) throw pointError;

                // 일별 집계
                const dailyMap = new Map<string, DailyActivity>();

                // 날짜 초기화
                for (let i = 0; i < days; i++) {
                    const date = dayjs().subtract(days - 1 - i, 'day').format('YYYY-MM-DD');
                    dailyMap.set(date, {
                        date,
                        quizCount: 0,
                        correctCount: 0,
                        totalQuestions: 0,
                        pointsEarned: 0,
                    });
                }

                // 퀴즈 시도 집계
                attempts?.forEach((attempt) => {
                    const date = dayjs(attempt.completed_at).format('YYYY-MM-DD');
                    const existing = dailyMap.get(date);
                    if (existing) {
                        existing.quizCount++;
                        existing.correctCount += attempt.score;
                        existing.totalQuestions += attempt.total_questions;
                    }
                });

                // 포인트 집계
                points?.forEach((point) => {
                    const date = dayjs(point.created_at).format('YYYY-MM-DD');
                    const existing = dailyMap.get(date);
                    if (existing) {
                        existing.pointsEarned += point.points;
                    }
                });

                this.dailyActivity = Array.from(dailyMap.values());
            } catch (e) {
                console.error('Failed to fetch daily activity:', e);
                throw e;
            }
        },

        async fetchPointTrends(days: number = 30) {
            const supabase = useSupabaseClient<Database>();
            const user = useSupabaseUser();

            if (!user.value?.id) return;

            try {
                const startDate = dayjs().subtract(days, 'day').format('YYYY-MM-DD');

                const { data, error } = await supabase
                    .from('point_history')
                    .select('points, created_at')
                    .eq('user_id', user.value.id)
                    .gte('created_at', startDate)
                    .order('created_at', { ascending: true });

                if (error) throw error;

                // 일별 포인트 집계
                const dailyMap = new Map<string, number>();

                // 날짜 초기화
                for (let i = 0; i < days; i++) {
                    const date = dayjs().subtract(days - 1 - i, 'day').format('YYYY-MM-DD');
                    dailyMap.set(date, 0);
                }

                data?.forEach((point) => {
                    const date = dayjs(point.created_at).format('YYYY-MM-DD');
                    const existing = dailyMap.get(date) || 0;
                    dailyMap.set(date, existing + point.points);
                });

                let cumulative = 0;
                this.pointTrends = Array.from(dailyMap.entries()).map(([date, points]) => {
                    cumulative += points;
                    return {
                        date,
                        points,
                        cumulativePoints: cumulative,
                    };
                });
            } catch (e) {
                console.error('Failed to fetch point trends:', e);
                throw e;
            }
        },

        async fetchRecentPerformance(limit: number = 10) {
            const supabase = useSupabaseClient<Database>();
            const user = useSupabaseUser();

            if (!user.value?.id) return;

            try {
                const { data, error } = await supabase
                    .from('quiz_attempts')
                    .select(`
                        id,
                        score,
                        total_questions,
                        time_spent,
                        completed_at,
                        quizzes!inner(id, title)
                    `)
                    .eq('user_id', user.value.id)
                    .order('completed_at', { ascending: false })
                    .limit(limit);

                if (error) throw error;

                this.recentPerformance = (data || []).map((item: any) => ({
                    quizId: item.quizzes?.id || '',
                    quizTitle: item.quizzes?.title || '알 수 없음',
                    score: item.score,
                    totalQuestions: item.total_questions,
                    timeSpent: item.time_spent || 0,
                    completedAt: item.completed_at,
                }));
            } catch (e) {
                console.error('Failed to fetch recent performance:', e);
                throw e;
            }
        },

        async updateProfile(data: ProfileUpdateData): Promise<boolean> {
            const supabase = useSupabaseClient<Database>();
            const user = useSupabaseUser();

            if (!user.value?.id) return false;

            try {
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        full_name: data.full_name,
                        preferred_username: data.preferred_username,
                        avatar_url: data.avatar_url,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', user.value.id);

                if (error) throw error;

                ToastMessage.success('프로필이 수정되었습니다.');
                return true;
            } catch (e) {
                console.error('Failed to update profile:', e);
                ToastMessage.error('프로필 수정에 실패했습니다.');
                return false;
            }
        },

        reset() {
            this.userStats = null;
            this.categoryStats = [];
            this.difficultyStats = [];
            this.dailyActivity = [];
            this.weeklyActivity = [];
            this.monthlyActivity = [];
            this.pointTrends = [];
            this.recentPerformance = [];
            this.isLoading = false;
            this.error = null;
        },
    },
});

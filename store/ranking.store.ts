import { defineStore } from 'pinia';
import type {
    RankingEntry,
    MyRankingInfo,
    CategoryRankingEntry,
    QuizAttemptRankingEntry,
    LeaderboardFilter,
    RankingPeriod,
    RankingType,
} from '@/models/ranking';
import { DEFAULT_LEADERBOARD_FILTER, calculatePercentile } from '@/models/ranking';
import type { QuizCategory } from '@/models/quiz';
import type { Database } from '@/models/database.types';

interface RankingState {
    rankings: RankingEntry[];
    categoryRankings: CategoryRankingEntry[];
    quizAttemptRankings: QuizAttemptRankingEntry[];
    myRanking: MyRankingInfo | null;
    filter: LeaderboardFilter;
    isLoading: boolean;
    error: string | null;
}

export const useRankingStore = defineStore('ranking', {
    state: (): RankingState => ({
        rankings: [],
        categoryRankings: [],
        quizAttemptRankings: [],
        myRanking: null,
        filter: { ...DEFAULT_LEADERBOARD_FILTER },
        isLoading: false,
        error: null,
    }),

    getters: {
        /**
         * TOP 3 랭킹 유저
         */
        topThree(): RankingEntry[] {
            return this.rankings.slice(0, 3);
        },

        /**
         * TOP 3 제외한 나머지 랭킹
         */
        restRankings(): RankingEntry[] {
            return this.rankings.slice(3);
        },

        /**
         * 현재 필터된 랭킹 목록
         */
        currentRankings(): RankingEntry[] | CategoryRankingEntry[] | QuizAttemptRankingEntry[] {
            if (this.filter.type === 'category') {
                return this.categoryRankings;
            }
            if (this.filter.type === 'quizzes') {
                return this.quizAttemptRankings;
            }
            return this.rankings;
        },

        /**
         * 랭킹 데이터가 있는지 여부
         */
        hasRankings(): boolean {
            return this.rankings.length > 0;
        },

        /**
         * 내 랭킹 퍼센타일 텍스트
         */
        myPercentileText(): string {
            if (!this.myRanking) return '';
            const percentile = this.myRanking.percentile;
            if (percentile >= 90) return '상위 10%';
            if (percentile >= 75) return '상위 25%';
            if (percentile >= 50) return '상위 50%';
            return `상위 ${100 - percentile}%`;
        },
    },

    actions: {
        /**
         * 기간별 랭킹 조회
         */
        async fetchRankings(period: RankingPeriod = 'all', limit: number = 100) {
            const supabase = useSupabaseClient<Database>();

            this.isLoading = true;
            this.error = null;

            try {
                const { data, error } = await supabase.rpc('get_period_rankings', {
                    p_period: period,
                    p_limit: limit,
                });

                if (error) throw error;

                this.rankings = (data || []) as RankingEntry[];
                this.filter.period = period;
                this.filter.type = 'points';
            } catch (e) {
                console.error('Failed to fetch rankings:', e);
                this.error = '랭킹을 불러오는 데 실패했습니다.';
                this.rankings = [];
            } finally {
                this.isLoading = false;
            }
        },

        /**
         * 내 랭킹 정보 조회
         */
        async fetchMyRanking(period: RankingPeriod = 'all') {
            const supabase = useSupabaseClient<Database>();
            const user = useSupabaseUser();

            if (!user.value?.id) {
                this.myRanking = null;
                return;
            }

            try {
                const { data, error } = await supabase.rpc('get_user_ranking', {
                    p_user_id: user.value.id,
                    p_period: period,
                });

                if (error) throw error;

                if (data && data.length > 0) {
                    const rankData = data[0];
                    this.myRanking = {
                        ...rankData,
                        percentile: calculatePercentile(rankData.rank, rankData.total_users),
                    } as MyRankingInfo;
                } else {
                    this.myRanking = null;
                }
            } catch (e) {
                console.error('Failed to fetch my ranking:', e);
                this.myRanking = null;
            }
        },

        /**
         * 카테고리별 랭킹 조회
         */
        async fetchCategoryRankings(category: QuizCategory, limit: number = 100) {
            const supabase = useSupabaseClient<Database>();

            this.isLoading = true;
            this.error = null;

            try {
                const { data, error } = await supabase.rpc('get_category_rankings', {
                    p_category: category,
                    p_limit: limit,
                });

                if (error) throw error;

                this.categoryRankings = (data || []) as CategoryRankingEntry[];
                this.filter.type = 'category';
                this.filter.category = category;
            } catch (e) {
                console.error('Failed to fetch category rankings:', e);
                this.error = '카테고리별 랭킹을 불러오는 데 실패했습니다.';
                this.categoryRankings = [];
            } finally {
                this.isLoading = false;
            }
        },

        /**
         * 퀴즈 풀이 횟수 랭킹 조회
         */
        async fetchQuizAttemptRankings(limit: number = 100) {
            const supabase = useSupabaseClient<Database>();

            this.isLoading = true;
            this.error = null;

            try {
                const { data, error } = await supabase.rpc('get_quiz_attempt_rankings', {
                    p_limit: limit,
                });

                if (error) throw error;

                this.quizAttemptRankings = (data || []) as QuizAttemptRankingEntry[];
                this.filter.type = 'quizzes';
            } catch (e) {
                console.error('Failed to fetch quiz attempt rankings:', e);
                this.error = '퀴즈 풀이 랭킹을 불러오는 데 실패했습니다.';
                this.quizAttemptRankings = [];
            } finally {
                this.isLoading = false;
            }
        },

        /**
         * 필터 변경 및 데이터 새로고침
         */
        async applyFilter(newFilter: Partial<LeaderboardFilter>) {
            this.filter = { ...this.filter, ...newFilter };

            if (this.filter.type === 'category' && this.filter.category) {
                await this.fetchCategoryRankings(this.filter.category, this.filter.limit);
            } else if (this.filter.type === 'quizzes') {
                await this.fetchQuizAttemptRankings(this.filter.limit);
            } else {
                await Promise.all([
                    this.fetchRankings(this.filter.period, this.filter.limit),
                    this.fetchMyRanking(this.filter.period),
                ]);
            }
        },

        /**
         * 필터 초기화
         */
        resetFilter() {
            this.filter = { ...DEFAULT_LEADERBOARD_FILTER };
        },

        /**
         * 스토어 초기화
         */
        reset() {
            this.rankings = [];
            this.categoryRankings = [];
            this.quizAttemptRankings = [];
            this.myRanking = null;
            this.filter = { ...DEFAULT_LEADERBOARD_FILTER };
            this.isLoading = false;
            this.error = null;
        },
    },
});

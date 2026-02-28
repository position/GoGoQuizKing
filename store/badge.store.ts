import { defineStore } from 'pinia';
import type { BadgeWithStatus, NewlyEarnedBadge, BadgeCategory, UserAchievement } from '@/models/badge';
import { BADGE_CATEGORY_LABELS, calculateBadgeProgress } from '@/models/badge';
import type { Database } from '@/models/database.types';

interface BadgeState {
    badges: BadgeWithStatus[];
    achievements: UserAchievement[];
    newlyEarnedBadges: NewlyEarnedBadge[];
    isLoading: boolean;
    showUnlockDialog: boolean;
}

export const useBadgeStore = defineStore('badge', {
    state: (): BadgeState => ({
        badges: [],
        achievements: [],
        newlyEarnedBadges: [],
        isLoading: false,
        showUnlockDialog: false,
    }),
    getters: {
        /**
         * 획득한 뱃지 목록
         */
        earnedBadges(): BadgeWithStatus[] {
            return this.badges.filter((b) => b.is_earned);
        },

        /**
         * 미획득 뱃지 목록
         */
        unearnedBadges(): BadgeWithStatus[] {
            return this.badges.filter((b) => !b.is_earned);
        },

        /**
         * 카테고리별 뱃지 그룹
         */
        badgesByCategory(): Record<BadgeCategory, BadgeWithStatus[]> {
            const grouped: Record<BadgeCategory, BadgeWithStatus[]> = {
                quiz: [],
                streak: [],
                social: [],
                category: [],
            };
            this.badges.forEach((badge) => {
                if (grouped[badge.category]) {
                    grouped[badge.category].push(badge);
                }
            });
            return grouped;
        },

        /**
         * 총 뱃지 수
         */
        totalBadges(): number {
            return this.badges.length;
        },

        /**
         * 획득한 뱃지 수
         */
        earnedCount(): number {
            return this.earnedBadges.length;
        },

        /**
         * 뱃지 획득률 (퍼센트)
         */
        earnedPercentage(): number {
            if (this.totalBadges === 0) return 0;
            return Math.round((this.earnedCount / this.totalBadges) * 100);
        },

        /**
         * 카테고리 라벨
         */
        categoryLabels(): Record<BadgeCategory, string> {
            return BADGE_CATEGORY_LABELS;
        },
    },
    actions: {
        /**
         * 사용자 뱃지 목록 조회
         */
        async fetchBadges() {
            const supabase = useSupabaseClient<Database>();
            const user = useSupabaseUser();

            if (!user.value?.id) return;

            this.isLoading = true;
            try {
                const { data, error } = await supabase.rpc('get_user_badges_with_status', {
                    p_user_id: user.value.id,
                });

                if (error) throw error;

                this.badges = (data || []) as BadgeWithStatus[];
            } catch (e) {
                console.error('Failed to fetch badges:', e);
            } finally {
                this.isLoading = false;
            }
        },

        /**
         * 업적 진행률 조회
         */
        async fetchAchievements() {
            const supabase = useSupabaseClient<Database>();
            const user = useSupabaseUser();

            if (!user.value?.id) return;

            try {
                const { data, error } = await supabase
                    .from('user_achievements')
                    .select('*')
                    .eq('user_id', user.value.id);

                if (error) throw error;

                this.achievements = (data || []) as UserAchievement[];
            } catch (e) {
                console.error('Failed to fetch achievements:', e);
            }
        },

        /**
         * 퀴즈 완료 시 뱃지 확인
         */
        async onQuizCompleted(
            quizId: string,
            correctCount: number,
            totalQuestions: number,
            category?: string,
        ): Promise<NewlyEarnedBadge[]> {
            const supabase = useSupabaseClient<Database>();
            const user = useSupabaseUser();

            if (!user.value?.id) return [];

            try {
                const { data, error } = await supabase.rpc('on_quiz_completed', {
                    p_user_id: user.value.id,
                    p_quiz_id: quizId,
                    p_correct_count: correctCount,
                    p_total_questions: totalQuestions,
                    p_category: category || null,
                });

                if (error) throw error;

                const newBadges = (data || []) as NewlyEarnedBadge[];
                if (newBadges.length > 0) {
                    this.newlyEarnedBadges = newBadges;
                    this.showUnlockDialog = true;
                    // 뱃지 목록 새로고침
                    await this.fetchBadges();
                }
                return newBadges;
            } catch (e) {
                console.error('Failed to check quiz badges:', e);
                return [];
            }
        },

        /**
         * 퀴즈 생성 시 뱃지 확인
         */
        async onQuizCreated(quizId: string): Promise<NewlyEarnedBadge[]> {
            const supabase = useSupabaseClient<Database>();
            const user = useSupabaseUser();

            if (!user.value?.id) return [];

            try {
                const { data, error } = await supabase.rpc('on_quiz_created', {
                    p_user_id: user.value.id,
                    p_quiz_id: quizId,
                });

                if (error) throw error;

                const newBadges = (data || []) as NewlyEarnedBadge[];
                if (newBadges.length > 0) {
                    this.newlyEarnedBadges = newBadges;
                    this.showUnlockDialog = true;
                    await this.fetchBadges();
                }
                return newBadges;
            } catch (e) {
                console.error('Failed to check quiz create badges:', e);
                return [];
            }
        },

        /**
         * 출석 체크 후 뱃지 확인
         */
        async checkStreakBadges(): Promise<NewlyEarnedBadge[]> {
            const supabase = useSupabaseClient<Database>();
            const user = useSupabaseUser();

            if (!user.value?.id) return [];

            try {
                const { data, error } = await supabase.rpc('check_streak_badges', {
                    p_user_id: user.value.id,
                });

                if (error) throw error;

                const newBadges = (data || []) as NewlyEarnedBadge[];
                if (newBadges.length > 0) {
                    this.newlyEarnedBadges = newBadges;
                    this.showUnlockDialog = true;
                    await this.fetchBadges();
                }
                return newBadges;
            } catch (e) {
                console.error('Failed to check streak badges:', e);
                return [];
            }
        },

        /**
         * 특정 뱃지의 진행률 가져오기
         */
        getBadgeProgress(badgeId: string): number {
            const badge = this.badges.find((b) => b.badge_id === badgeId);
            if (!badge) return 0;
            return calculateBadgeProgress(badge.current_progress, badge.condition_value);
        },

        /**
         * 새로 획득한 뱃지 다이얼로그 닫기
         */
        closeUnlockDialog() {
            this.showUnlockDialog = false;
            this.newlyEarnedBadges = [];
        },

        /**
         * 스토어 초기화
         */
        reset() {
            this.badges = [];
            this.achievements = [];
            this.newlyEarnedBadges = [];
            this.isLoading = false;
            this.showUnlockDialog = false;
        },
    },
});

import { defineStore } from 'pinia';
import type {
    PointHistory,
    UserPointSummary,
    AttendanceResult,
    QuizPointsResult,
    LevelInfo,
} from '@/models/point';
import { LEVEL_CONFIG, calculateLevel, getLevelInfo, calculateLevelProgress } from '@/models/point';
import type { Database } from '@/models/database.types';

interface PointState {
    points: number;
    level: number;
    streakDays: number;
    lastActiveAt: string | null;
    pointHistory: PointHistory[];
    isLoading: boolean;
    lastLevelUp: boolean;
}

export const usePointStore = defineStore('point', {
    state: (): PointState => ({
        points: 0,
        level: 1,
        streakDays: 0,
        lastActiveAt: null,
        pointHistory: [],
        isLoading: false,
        lastLevelUp: false,
    }),
    getters: {
        levelInfo(): LevelInfo {
            return getLevelInfo(this.level);
        },
        levelProgress(): number {
            return calculateLevelProgress(this.points);
        },
        pointsToNextLevel(): number {
            if (this.level >= 7) return 0;
            const nextLevelInfo = LEVEL_CONFIG[this.level];
            return Math.max(0, nextLevelInfo.min_points - this.points);
        },
        allLevels(): LevelInfo[] {
            return LEVEL_CONFIG;
        },
    },
    actions: {
        /**
         * 사용자 포인트 요약 정보 조회
         */
        async fetchPointSummary() {
            const supabase = useSupabaseClient<Database>();
            const user = useSupabaseUser();

            if (!user.value?.id) return;

            this.isLoading = true;
            try {
                // user_point_summary 뷰 대신 profiles 테이블에서 직접 조회
                await this.fetchPointsFromProfile();
            } catch (e) {
                console.error('Failed to fetch point summary:', e);
            } finally {
                this.isLoading = false;
            }
        },

        /**
         * profiles 테이블에서 포인트 정보 직접 조회
         */
        async fetchPointsFromProfile() {
            const supabase = useSupabaseClient<Database>();
            const user = useSupabaseUser();

            if (!user.value?.id) return;

            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('points, level, streak_days, last_active_at')
                    .eq('id', user.value.id)
                    .single();

                if (error) throw error;

                if (data) {
                    this.points = data.points ?? 0;
                    this.level = data.level ?? 1;
                    this.streakDays = data.streak_days ?? 0;
                    this.lastActiveAt = data.last_active_at ?? null;
                }
            } catch (e) {
                console.error('Failed to fetch points from profile:', e);
            }
        },

        /**
         * 포인트 히스토리 조회
         */
        async fetchPointHistory(limit = 20) {
            const supabase = useSupabaseClient<Database>();
            const user = useSupabaseUser();

            if (!user.value?.id) return;

            try {
                const { data, error } = await supabase
                    .from('point_history')
                    .select('*')
                    .eq('user_id', user.value.id)
                    .order('created_at', { ascending: false })
                    .limit(limit);

                if (error) throw error;

                this.pointHistory = (data || []) as PointHistory[];
            } catch (e) {
                console.error('Failed to fetch point history:', e);
            }
        },

        /**
         * 일일 출석 체크
         */
        async checkDailyAttendance(): Promise<AttendanceResult | null> {
            const supabase = useSupabaseClient<Database>();
            const user = useSupabaseUser();

            if (!user.value?.id) return null;

            try {
                const { data, error } = await supabase.rpc('check_daily_attendance', {
                    p_user_id: user.value.id,
                });

                if (error) throw error;

                const results = data as AttendanceResult[] | null;
                if (results && results.length > 0) {
                    const result = results[0];
                    if (!result.already_checked) {
                        this.streakDays = result.new_streak;
                        this.points += result.attendance_points;
                        this.level = calculateLevel(this.points);
                    }
                    return result;
                }
                return null;
            } catch (e) {
                console.error('Failed to check daily attendance:', e);
                return null;
            }
        },

        /**
         * 퀴즈 완료 시 포인트 지급
         */
        async awardQuizPoints(
            quizId: string,
            correctCount: number,
            totalQuestions: number,
            consecutiveCorrect = 0,
        ): Promise<QuizPointsResult | null> {
            const supabase = useSupabaseClient<Database>();
            const user = useSupabaseUser();

            if (!user.value?.id) return null;

            try {
                const { data, error } = await supabase.rpc('award_quiz_points', {
                    p_user_id: user.value.id,
                    p_quiz_id: quizId,
                    p_correct_count: correctCount,
                    p_total_questions: totalQuestions,
                    p_consecutive_correct: consecutiveCorrect,
                });

                if (error) throw error;

                const results = data as QuizPointsResult[] | null;
                if (results && results.length > 0) {
                    const result = results[0];
                    const oldLevel = this.level;
                    this.points += result.total_earned;
                    this.level = calculateLevel(this.points);
                    this.lastLevelUp = this.level > oldLevel;
                    return result;
                }
                return null;
            } catch (e) {
                console.error('Failed to award quiz points:', e);
                return null;
            }
        },

        /**
         * 퀴즈 생성 시 포인트 지급
         */
        async awardQuizCreatePoints(quizId: string): Promise<number> {
            const supabase = useSupabaseClient<Database>();
            const user = useSupabaseUser();

            if (!user.value?.id) return 0;

            try {
                const { data, error } = await supabase.rpc('award_quiz_create_points', {
                    p_user_id: user.value.id,
                    p_quiz_id: quizId,
                });

                if (error) throw error;

                const earnedPoints = (data as number) || 0;
                const oldLevel = this.level;
                this.points += earnedPoints;
                this.level = calculateLevel(this.points);
                this.lastLevelUp = this.level > oldLevel;
                return earnedPoints;
            } catch (e) {
                console.error('Failed to award quiz create points:', e);
                return 0;
            }
        },

        /**
         * 레벨업 알림 확인 (UI에서 표시 후 호출)
         */
        clearLevelUpNotification() {
            this.lastLevelUp = false;
        },

        /**
         * 스토어 초기화
         */
        reset() {
            this.points = 0;
            this.level = 1;
            this.streakDays = 0;
            this.lastActiveAt = null;
            this.pointHistory = [];
            this.isLoading = false;
            this.lastLevelUp = false;
        },
    },
});

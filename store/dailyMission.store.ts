import { defineStore } from 'pinia';
import type {
    TodayQuiz,
    UserDailyMission,
    MissionProgressResult,
    ClaimRewardResult,
    TodayQuizCompleteResult,
} from '@/models/dailyMission';
import { ToastMessage } from '@/helper/message';
import type { Database } from '@/models/database.types';

interface DailyMissionState {
    todayQuiz: TodayQuiz | null;
    missions: UserDailyMission[];
    isLoading: boolean;
    isTodayQuizLoading: boolean;
    error: string | null;
    lastFetched: string | null;
}

export const useDailyMissionStore = defineStore('dailyMission', {
    state: (): DailyMissionState => ({
        todayQuiz: null,
        missions: [],
        isLoading: false,
        isTodayQuizLoading: false,
        error: null,
        lastFetched: null,
    }),

    getters: {
        // 완료된 미션 수
        completedMissionCount(state): number {
            return state.missions.filter((m) => m.is_completed).length;
        },

        // 전체 미션 수
        totalMissionCount(state): number {
            return state.missions.length;
        },

        // 수령 가능한 보상이 있는 미션
        claimableMissions(state): UserDailyMission[] {
            return state.missions.filter((m) => m.is_completed && !m.reward_claimed);
        },

        // 진행 중인 미션
        inProgressMissions(state): UserDailyMission[] {
            return state.missions.filter((m) => !m.is_completed);
        },

        // 오늘의 퀴즈 미션 완료 여부
        isTodayQuizMissionCompleted(state): boolean {
            const todayQuizMission = state.missions.find((m) => m.mission_type === 'today_quiz');
            return todayQuizMission?.is_completed ?? false;
        },

        // 전체 진행률 (퍼센트)
        overallProgress(state): number {
            if (state.missions.length === 0) {
                return 0;
            }
            const completed = state.missions.filter((m) => m.is_completed).length;
            return Math.round((completed / state.missions.length) * 100);
        },
    },

    actions: {
        /**
         * 오늘의 퀴즈 가져오기
         */
        async fetchTodayQuiz() {
            this.isTodayQuizLoading = true;
            this.error = null;

            try {
                const supabase = useSupabaseClient<Database>();
                const { data, error } = await supabase.rpc('get_today_quiz');

                if (error) {
                    throw error;
                }

                if (data && data.length > 0) {
                    this.todayQuiz = data[0] as TodayQuiz;
                } else {
                    this.todayQuiz = null;
                }
            } catch (e) {
                console.error('Failed to fetch today quiz:', e);
                this.error = '오늘의 퀴즈를 불러오는데 실패했습니다.';
            } finally {
                this.isTodayQuizLoading = false;
            }
        },

        /**
         * 사용자 데일리 미션 목록 가져오기
         */
        async fetchMissions() {
            const user = useSupabaseUser();
            if (!user.value?.id) {
                return;
            }

            this.isLoading = true;
            this.error = null;

            try {
                const supabase = useSupabaseClient<Database>();
                const { data, error } = await supabase.rpc('get_user_daily_missions', {
                    p_user_id: user.value.id,
                });

                if (error) {
                    throw error;
                }

                // RPC 반환 컬럼명 매핑 (out_ 접두사 제거)
                const mappedData = (data || []).map((item: any) => ({
                    mission_id: item.out_mission_id ?? item.mission_id,
                    name: item.out_name ?? item.name,
                    description: item.out_description ?? item.description,
                    icon: item.out_icon ?? item.icon,
                    mission_type: item.out_mission_type ?? item.mission_type,
                    target_value: item.out_target_value ?? item.target_value,
                    current_value: item.out_current_value ?? item.current_value,
                    reward_points: item.out_reward_points ?? item.reward_points,
                    is_completed: item.out_is_completed ?? item.is_completed,
                    reward_claimed: item.out_reward_claimed ?? item.reward_claimed,
                    sort_order: item.out_sort_order ?? item.sort_order,
                }));

                this.missions = mappedData as UserDailyMission[];
                this.lastFetched = new Date().toISOString();
            } catch (e) {
                console.error('Failed to fetch daily missions:', e);
                this.error = '데일리 미션을 불러오는데 실패했습니다.';
            } finally {
                this.isLoading = false;
            }
        },

        /**
         * 초기 데이터 로드 (오늘의 퀴즈 + 미션 목록)
         */
        async initialize() {
            await Promise.all([this.fetchTodayQuiz(), this.fetchMissions()]);
        },

        /**
         * 미션 진행 상황 업데이트
         */
        async updateMissionProgress(
            missionType: string,
            increment: number = 1,
        ): Promise<MissionProgressResult[]> {
            const user = useSupabaseUser();
            if (!user.value?.id) {
                return [];
            }

            try {
                const supabase = useSupabaseClient<Database>();
                const { data, error } = await supabase.rpc('update_mission_progress', {
                    p_user_id: user.value.id,
                    p_mission_type: missionType,
                    p_increment: increment,
                });

                if (error) {
                    throw error;
                }

                // RPC 반환 컬럼명 매핑 (out_ 접두사 제거)
                const results = (data || []).map((item: any) => ({
                    mission_id: item.out_mission_id ?? item.mission_id,
                    mission_name: item.out_mission_name ?? item.mission_name,
                    is_newly_completed: item.out_is_newly_completed ?? item.is_newly_completed,
                    reward_points: item.out_reward_points ?? item.reward_points,
                })) as MissionProgressResult[];

                // 새로 완료된 미션이 있으면 알림
                for (const result of results) {
                    if (result.is_newly_completed) {
                        ToastMessage.success(`🎉 ${result.mission_name} 미션 완료!`);
                    }
                }

                // 미션 목록 새로고침
                await this.fetchMissions();

                return results;
            } catch (e) {
                console.error('Failed to update mission progress:', e);
                return [];
            }
        },

        /**
         * 미션 보상 수령
         */
        async claimReward(missionId: string): Promise<ClaimRewardResult | null> {
            const user = useSupabaseUser();
            if (!user.value?.id) {
                return null;
            }

            try {
                const supabase = useSupabaseClient<Database>();
                const { data, error } = await supabase.rpc('claim_mission_reward', {
                    p_user_id: user.value.id,
                    p_mission_id: missionId,
                });

                if (error) {
                    throw error;
                }

                // RPC 반환 컬럼명 매핑 (out_ 접두사 제거)
                const rawResults = data as any[] | null;
                if (rawResults && rawResults.length > 0) {
                    const rawResult = rawResults[0];
                    const result: ClaimRewardResult = {
                        success: rawResult.out_success ?? rawResult.success,
                        points_earned: rawResult.out_points_earned ?? rawResult.points_earned,
                        message: rawResult.out_message ?? rawResult.message,
                    };

                    if (result.success) {
                        ToastMessage.success(`💰 +${result.points_earned}포인트 획득!`);
                        // 미션 목록 새로고침
                        await this.fetchMissions();
                        // 포인트 스토어 업데이트
                        const { usePointStore } = await import('@/store/point.store');
                        const pointStore = usePointStore();
                        await pointStore.fetchPointSummary();
                    } else {
                        ToastMessage.warning(result.message);
                    }
                    return result;
                }
                return null;
            } catch (e) {
                console.error('Failed to claim mission reward:', e);
                ToastMessage.error('보상 수령에 실패했습니다.');
                return null;
            }
        },

        /**
         * 오늘의 퀴즈 완료 처리
         */
        async completeTodayQuiz(quizId: string): Promise<TodayQuizCompleteResult | null> {
            const user = useSupabaseUser();
            if (!user.value?.id) {
                return null;
            }

            try {
                const supabase = useSupabaseClient<Database>();
                const { data, error } = await supabase.rpc('complete_today_quiz', {
                    p_user_id: user.value.id,
                    p_quiz_id: quizId,
                });

                if (error) {
                    throw error;
                }

                const results = data as TodayQuizCompleteResult[] | null;
                if (results && results.length > 0) {
                    const result = results[0];
                    if (result.is_today_quiz && result.bonus_awarded) {
                        ToastMessage.success(
                            `⭐ 오늘의 퀴즈 보너스 +${result.bonus_points}포인트!`,
                        );
                        // 포인트 스토어 업데이트
                        const { usePointStore } = await import('@/store/point.store');
                        const pointStore = usePointStore();
                        await pointStore.fetchPointSummary();
                        // 미션 목록 새로고침
                        await this.fetchMissions();
                    }
                    return result;
                }
                return null;
            } catch (e) {
                console.error('Failed to complete today quiz:', e);
                return null;
            }
        },

        /**
         * 퀴즈 풀기 완료 시 호출 (quiz.store.ts에서 호출)
         */
        async onQuizCompleted(quizId: string, consecutiveCorrect: number) {
            // 퀴즈 풀기 미션 업데이트
            await this.updateMissionProgress('quiz_solve', 1);

            // 연속 정답 미션 업데이트
            if (consecutiveCorrect >= 3) {
                await this.updateMissionProgress('consecutive_correct', 1);
            }

            // 오늘의 퀴즈인지 확인하고 처리
            if (this.todayQuiz && this.todayQuiz.quiz_id === quizId) {
                await this.completeTodayQuiz(quizId);
            }
        },

        /**
         * 퀴즈 생성 시 호출 (quiz.store.ts에서 호출)
         */
        async onQuizCreated() {
            await this.updateMissionProgress('quiz_create', 1);
        },

        /**
         * 스토어 초기화
         */
        reset() {
            this.todayQuiz = null;
            this.missions = [];
            this.isLoading = false;
            this.isTodayQuizLoading = false;
            this.error = null;
            this.lastFetched = null;
        },
    },
});

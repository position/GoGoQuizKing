// ~/store/battle.store.ts
import { defineStore } from 'pinia';
import { useSupabase } from '~/composables/use-supabase';
import type {
    IBattleRoom,
    IBattleRoomWithPlayers,
    IBattleHistory,
    IBattleHistoryWithOpponent,
    IBattleRankingEntry,
    IUserRankingStats,
    IBattlePlayState,
    IBattleResult,
    IMatchmakingState,
    IMatchmakingOptions,
    IBattleAnswer,
    BattleType,
    BattleStatus,
} from '~/models/battle';
import { DEFAULT_MATCHMAKING_OPTIONS, determineBattleResult } from '~/models/battle';
import type { Question } from '~/models/quiz';

interface BattleState {
    // 현재 대결 방
    currentRoom: IBattleRoomWithPlayers | null;

    // 매칭 상태
    matchmaking: IMatchmakingState;

    // 플레이 상태
    playState: IBattlePlayState;

    // 대결 기록
    history: IBattleHistoryWithOpponent[];
    historyLoading: boolean;

    // 대결 랭킹
    rankings: IBattleRankingEntry[];
    rankingsLoading: boolean;

    // 내 랭킹 통계
    myRankingStats: IUserRankingStats | null;

    // 로딩/에러 상태
    loading: boolean;
    error: string | null;
}

export const useBattleStore = defineStore('battle', {
    state: (): BattleState => ({
        currentRoom: null,
        matchmaking: {
            status: 'idle',
            elapsed_time: 0,
            room_id: null,
            error: null,
        },
        playState: {
            room: null,
            isHost: false,
            currentQuestion: null,
            timeRemaining: 15,
            hasAnswered: false,
            myAnswer: null,
            opponentAnswered: false,
            roundResult: null,
        },
        history: [],
        historyLoading: false,
        rankings: [],
        rankingsLoading: false,
        myRankingStats: null,
        loading: false,
        error: null,
    }),

    getters: {
        isInRoom: (state): boolean => state.currentRoom !== null,
        isHost: (state): boolean => {
            const supabase = useSupabase();
            const userId = supabase.auth.getUser();
            return state.currentRoom?.host_id === state.playState.room?.host?.id;
        },
        roomStatus: (state): BattleStatus | null => state.currentRoom?.status ?? null,
        myScore: (state): number => {
            if (!state.currentRoom) {
                return 0;
            }
            return state.playState.isHost ? state.currentRoom.host_score : state.currentRoom.guest_score;
        },
        opponentScore: (state): number => {
            if (!state.currentRoom) {
                return 0;
            }
            return state.playState.isHost ? state.currentRoom.guest_score : state.currentRoom.host_score;
        },
        winRate: (state): number => {
            if (!state.myRankingStats || state.myRankingStats.total_battles === 0) {
                return 0;
            }
            return Math.round(
                (state.myRankingStats.total_wins / state.myRankingStats.total_battles) * 100 * 100
            ) / 100;
        },
    },

    actions: {
        /**
         * 대결 방 생성
         */
        async createRoom(battleType: BattleType = 'quick', quizId?: string): Promise<{ roomId: string; roomCode: string } | null> {
            const supabase = useSupabase();
            this.loading = true;
            this.error = null;

            try {
                const { data: userData } = await supabase.auth.getUser();
                if (!userData.user) {
                    throw new Error('로그인이 필요합니다.');
                }

                const { data, error } = await supabase.rpc('create_battle_room', {
                    p_host_id: userData.user.id,
                    p_battle_type: battleType,
                    p_quiz_id: quizId ?? null,
                });

                if (error) {
                    throw error;
                }

                if (data && data.length > 0) {
                    return {
                        roomId: data[0].room_id,
                        roomCode: data[0].room_code,
                    };
                }

                return null;
            } catch (err) {
                this.error = err instanceof Error ? err.message : '방 생성 실패';
                console.error('createRoom error:', err);
                return null;
            } finally {
                this.loading = false;
            }
        },

        /**
         * 초대 코드로 방 참가
         */
        async joinRoomByCode(roomCode: string): Promise<{ success: boolean; roomId: string | null; message: string }> {
            const supabase = useSupabase();
            this.loading = true;
            this.error = null;

            try {
                const { data: userData } = await supabase.auth.getUser();
                if (!userData.user) {
                    throw new Error('로그인이 필요합니다.');
                }

                const { data, error } = await supabase.rpc('join_battle_room', {
                    p_room_code: roomCode.toUpperCase(),
                    p_user_id: userData.user.id,
                });

                if (error) {
                    throw error;
                }

                if (data && data.length > 0) {
                    return {
                        success: data[0].success,
                        roomId: data[0].room_id,
                        message: data[0].message,
                    };
                }

                return { success: false, roomId: null, message: '알 수 없는 오류' };
            } catch (err) {
                this.error = err instanceof Error ? err.message : '방 참가 실패';
                console.error('joinRoomByCode error:', err);
                return { success: false, roomId: null, message: this.error };
            } finally {
                this.loading = false;
            }
        },

        /**
         * 랜덤 매칭 시작
         */
        async startMatchmaking(options: IMatchmakingOptions = DEFAULT_MATCHMAKING_OPTIONS): Promise<void> {
            const supabase = useSupabase();
            this.matchmaking = {
                status: 'searching',
                elapsed_time: 0,
                room_id: null,
                error: null,
            };

            try {
                const { data: userData } = await supabase.auth.getUser();
                if (!userData.user) {
                    throw new Error('로그인이 필요합니다.');
                }

                const { data, error } = await supabase.rpc('join_matchmaking', {
                    p_user_id: userData.user.id,
                    p_battle_type: options.battle_type,
                    p_same_grade_only: options.same_grade_only ?? false,
                });

                if (error) {
                    throw error;
                }

                if (data && data.length > 0) {
                    if (data[0].success) {
                        this.matchmaking.status = 'found';
                        this.matchmaking.room_id = data[0].matched_room_id;
                    }
                    // 매칭 대기 중이면 status는 'searching' 유지
                }
            } catch (err) {
                this.matchmaking.status = 'error';
                this.matchmaking.error = err instanceof Error ? err.message : '매칭 실패';
                console.error('startMatchmaking error:', err);
            }
        },

        /**
         * 매칭 취소
         */
        async cancelMatchmaking(): Promise<void> {
            const supabase = useSupabase();

            try {
                const { data: userData } = await supabase.auth.getUser();
                if (!userData.user) {
                    return;
                }

                await supabase.rpc('leave_matchmaking', {
                    p_user_id: userData.user.id,
                });
            } catch (err) {
                console.error('cancelMatchmaking error:', err);
            } finally {
                this.matchmaking = {
                    status: 'idle',
                    elapsed_time: 0,
                    room_id: null,
                    error: null,
                };
            }
        },

        /**
         * 방 정보 조회
         */
        async fetchRoom(roomId: string): Promise<IBattleRoomWithPlayers | null> {
            const supabase = useSupabase();
            this.loading = true;

            try {
                // 먼저 방 정보 조회
                const { data: roomData, error: roomError } = await supabase
                    .from('battle_rooms')
                    .select('*')
                    .eq('id', roomId)
                    .single();

                if (roomError) {
                    throw roomError;
                }

                if (!roomData) {
                    return null;
                }

                // 호스트 프로필 조회
                const { data: hostProfile } = await supabase
                    .from('profiles')
                    .select('id, full_name, preferred_username, avatar_url, level')
                    .eq('id', roomData.host_id)
                    .single();

                // 게스트 프로필 조회 (있는 경우)
                let guestProfile = null;
                if (roomData.guest_id) {
                    const { data: guestData } = await supabase
                        .from('profiles')
                        .select('id, full_name, preferred_username, avatar_url, level')
                        .eq('id', roomData.guest_id)
                        .single();
                    guestProfile = guestData;
                }

                const result: IBattleRoomWithPlayers = {
                    ...roomData,
                    host_answers: roomData.host_answers as IBattleAnswer[] ?? [],
                    guest_answers: roomData.guest_answers as IBattleAnswer[] ?? [],
                    host: hostProfile ?? undefined,
                    guest: guestProfile ?? undefined,
                };

                this.currentRoom = result;
                return this.currentRoom;
            } catch (err) {
                this.error = err instanceof Error ? err.message : '방 정보 조회 실패';
                console.error('fetchRoom error:', err);
                return null;
            } finally {
                this.loading = false;
            }
        },

        /**
         * 대결 시작 (호스트만)
         */
        async startBattle(roomId: string): Promise<boolean> {
            const supabase = useSupabase();

            try {
                // 랜덤 퀴즈 선택 (퀴즈가 없는 경우)
                if (!this.currentRoom?.quiz_id) {
                    const questionCount = this.currentRoom?.question_count ?? 5;
                    const { data: quizData } = await supabase.rpc('get_random_quiz_for_battle', {
                        p_question_count: questionCount,
                    });

                    if (quizData) {
                        await supabase
                            .from('battle_rooms')
                            .update({ quiz_id: quizData })
                            .eq('id', roomId);
                    }
                }

                // 대결 시작
                const { error } = await supabase
                    .from('battle_rooms')
                    .update({
                        status: 'playing',
                        started_at: new Date().toISOString(),
                        question_started_at: new Date().toISOString(),
                    })
                    .eq('id', roomId);

                if (error) {
                    throw error;
                }

                return true;
            } catch (err) {
                this.error = err instanceof Error ? err.message : '대결 시작 실패';
                console.error('startBattle error:', err);
                return false;
            }
        },

        /**
         * 답변 제출
         */
        async submitAnswer(roomId: string, questionIndex: number, answer: string, responseTime: number): Promise<{
            success: boolean;
            isCorrect: boolean;
            scoreEarned: number;
        }> {
            const supabase = useSupabase();

            try {
                const { data: userData } = await supabase.auth.getUser();
                if (!userData.user) {
                    ToastMessage.error('로그인이 필요합니다.');
                    return { success: false, isCorrect: false, scoreEarned: 0 };
                }

                const { data, error } = await supabase.rpc('submit_battle_answer', {
                    p_room_id: roomId,
                    p_user_id: userData.user.id,
                    p_question_index: questionIndex,
                    p_answer: answer,
                    p_response_time: responseTime,
                });

                if (error) {
                    console.error('submit_battle_answer error:', error);
                    ToastMessage.error('답변 전송에 실패했습니다. 다시 시도해주세요.');
                    return { success: false, isCorrect: false, scoreEarned: 0 };
                }

                if (data && data.length > 0) {
                    const result = data[0];
                    if (result.success) {
                        this.playState.hasAnswered = true;
                        this.playState.myAnswer = answer;

                        return {
                            success: true,
                            isCorrect: result.is_correct,
                            scoreEarned: result.score_earned,
                        };
                    }
                }

                ToastMessage.error('답변을 제출하지 못했습니다. 다시 시도해주세요.');
                return { success: false, isCorrect: false, scoreEarned: 0 };
            } catch (err) {
                console.error('submitAnswer error:', err);
                ToastMessage.error('답변 전송 중 오류가 발생했습니다. 다시 시도해주세요.');
                return { success: false, isCorrect: false, scoreEarned: 0 };
            }
        },

        /**
         * 다음 문제로 이동 (호스트)
         */
        async nextQuestion(roomId: string): Promise<boolean> {
            const supabase = useSupabase();

            try {
                const nextIndex = (this.currentRoom?.current_question_index ?? 0) + 1;

                const { error } = await supabase
                    .from('battle_rooms')
                    .update({
                        current_question_index: nextIndex,
                        question_started_at: new Date().toISOString(),
                    })
                    .eq('id', roomId);

                if (error) {
                    throw error;
                }

                this.playState.hasAnswered = false;
                this.playState.myAnswer = null;
                this.playState.opponentAnswered = false;
                this.playState.roundResult = null;

                return true;
            } catch (err) {
                console.error('nextQuestion error:', err);
                return false;
            }
        },

        /**
         * 대결 종료
         */
        async finishBattle(roomId: string): Promise<IBattleResult | null> {
            const supabase = useSupabase();

            try {
                const { data: userData } = await supabase.auth.getUser();
                if (!userData.user) {
                    throw new Error('로그인이 필요합니다.');
                }

                const { data, error } = await supabase.rpc('finish_battle', {
                    p_room_id: roomId,
                });

                if (error) {
                    throw error;
                }

                if (data && data.length > 0 && data[0].success) {
                    const result = data[0];
                    const isHost = this.currentRoom?.host_id === userData.user.id;

                    return {
                        room_id: roomId,
                        winner_id: result.winner_id,
                        is_winner: result.winner_id === userData.user.id,
                        is_draw: result.winner_id === null,
                        my_score: isHost ? result.host_final_score : result.guest_final_score,
                        opponent_score: isHost ? result.guest_final_score : result.host_final_score,
                        my_correct_count: 0, // TODO: 계산 필요
                        opponent_correct_count: 0,
                        total_questions: this.currentRoom?.question_count ?? 5,
                        reward: {
                            points_earned: isHost ? result.host_points_earned : result.guest_points_earned,
                            ranking_points_earned: isHost ? result.host_rp_earned : result.guest_rp_earned,
                        },
                        opponent: {
                            id: isHost ? this.currentRoom?.guest?.id ?? '' : this.currentRoom?.host?.id ?? '',
                            name: isHost
                                ? (this.currentRoom?.guest?.preferred_username ?? this.currentRoom?.guest?.full_name ?? 'Unknown')
                                : (this.currentRoom?.host?.preferred_username ?? this.currentRoom?.host?.full_name ?? 'Unknown'),
                            avatar_url: isHost ? this.currentRoom?.guest?.avatar_url ?? null : this.currentRoom?.host?.avatar_url ?? null,
                            level: isHost ? this.currentRoom?.guest?.level ?? 1 : this.currentRoom?.host?.level ?? 1,
                        },
                    };
                }

                return null;
            } catch (err) {
                console.error('finishBattle error:', err);
                return null;
            }
        },

        /**
         * 방 나가기
         */
        async leaveRoom(roomId: string): Promise<void> {
            const supabase = useSupabase();

            try {
                const { data: userData } = await supabase.auth.getUser();
                if (!userData.user) {
                    return;
                }

                // 호스트면 방 취소, 게스트면 나가기
                if (this.currentRoom?.host_id === userData.user.id) {
                    await supabase
                        .from('battle_rooms')
                        .update({ status: 'cancelled' })
                        .eq('id', roomId);
                } else {
                    await supabase
                        .from('battle_rooms')
                        .update({ guest_id: null, status: 'waiting' })
                        .eq('id', roomId);
                }
            } catch (err) {
                console.error('leaveRoom error:', err);
            } finally {
                this.currentRoom = null;
                this.playState = {
                    room: null,
                    isHost: false,
                    currentQuestion: null,
                    timeRemaining: 15,
                    hasAnswered: false,
                    myAnswer: null,
                    opponentAnswered: false,
                    roundResult: null,
                };
            }
        },

        /**
         * 대결 기록 조회
         */
        async fetchHistory(limit: number = 20, offset: number = 0): Promise<void> {
            const supabase = useSupabase();
            this.historyLoading = true;

            try {
                const { data: userData } = await supabase.auth.getUser();
                if (!userData.user) {
                    return;
                }

                const { data, error } = await supabase.rpc('get_battle_history', {
                    p_user_id: userData.user.id,
                    p_limit: limit,
                    p_offset: offset,
                });

                if (error) {
                    throw error;
                }

                if (offset === 0) {
                    this.history = data as IBattleHistoryWithOpponent[];
                } else {
                    this.history = [...this.history, ...(data as IBattleHistoryWithOpponent[])];
                }
            } catch (err) {
                console.error('fetchHistory error:', err);
            } finally {
                this.historyLoading = false;
            }
        },

        /**
         * 대결 랭킹 조회
         */
        async fetchRankings(limit: number = 50): Promise<void> {
            const supabase = useSupabase();
            this.rankingsLoading = true;

            try {
                const { data, error } = await supabase.rpc('get_battle_rankings', {
                    p_limit: limit,
                });

                if (error) {
                    throw error;
                }

                this.rankings = data as IBattleRankingEntry[];
            } catch (err) {
                console.error('fetchRankings error:', err);
            } finally {
                this.rankingsLoading = false;
            }
        },

        /**
         * 내 랭킹 통계 조회
         */
        async fetchMyRankingStats(): Promise<void> {
            const supabase = useSupabase();

            try {
                const { data: userData } = await supabase.auth.getUser();
                if (!userData.user) {
                    return;
                }

                const { data, error } = await supabase
                    .from('user_ranking_stats')
                    .select('*')
                    .eq('id', userData.user.id)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    throw error;
                }

                this.myRankingStats = data as IUserRankingStats;
            } catch (err) {
                console.error('fetchMyRankingStats error:', err);
            }
        },

        /**
         * 문제 목록 조회
         */
        async fetchQuestions(quizId: string): Promise<Question[]> {
            const supabase = useSupabase();

            try {
                const { data, error } = await supabase
                    .from('quiz_questions')
                    .select('*')
                    .eq('quiz_id', quizId)
                    .order('order_index');

                if (error) {
                    throw error;
                }

                return data as Question[];
            } catch (err) {
                console.error('fetchQuestions error:', err);
                return [];
            }
        },

        /**
         * 상태 초기화
         */
        resetState(): void {
            this.currentRoom = null;
            this.matchmaking = {
                status: 'idle',
                elapsed_time: 0,
                room_id: null,
                error: null,
            };
            this.playState = {
                room: null,
                isHost: false,
                currentQuestion: null,
                timeRemaining: 15,
                hasAnswered: false,
                myAnswer: null,
                opponentAnswered: false,
                roundResult: null,
            };
            this.error = null;
        },

        /**
         * 플레이 상태 업데이트
         */
        updatePlayState(updates: Partial<IBattlePlayState>): void {
            this.playState = { ...this.playState, ...updates };
        },

        /**
         * 현재 방 업데이트 (Realtime용)
         */
        updateCurrentRoom(room: IBattleRoomWithPlayers): void {
            this.currentRoom = room;
        },
    },
});

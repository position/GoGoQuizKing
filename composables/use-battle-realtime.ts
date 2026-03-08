// ~/composables/use-battle-realtime.ts
import { ref, onMounted, onUnmounted, watch } from 'vue';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { useSupabase } from '~/composables/use-supabase';
import { useBattleStore } from '~/store/battle.store';
import type { IBattleRoomWithPlayers, BattleStatus } from '~/models/battle';

interface UseBattleRealtimeOptions {
    roomId: string;
    onRoomUpdate?: (room: IBattleRoomWithPlayers) => void;
    onGuestJoined?: (guestId: string) => void;
    onBattleStart?: () => void;
    onQuestionChange?: (questionIndex: number) => void;
    onOpponentAnswer?: () => void;
    onBattleEnd?: (winnerId: string | null) => void;
    onRoomCancelled?: () => void;
}

interface UseBattleRealtimeReturn {
    isConnected: Readonly<Ref<boolean>>;
    connectionError: Readonly<Ref<string | null>>;
    subscribe: () => Promise<void>;
    unsubscribe: () => void;
}

export function useBattleRealtime(options: UseBattleRealtimeOptions): UseBattleRealtimeReturn {
    const supabase = useSupabase();
    const battleStore = useBattleStore();

    const isConnected = ref(false);
    const connectionError = ref<string | null>(null);
    let channel: RealtimeChannel | null = null;

    const handleRoomChange = async (
        payload: RealtimePostgresChangesPayload<IBattleRoomWithPlayers>,
    ) => {
        if (payload.eventType === 'UPDATE') {
            const newRoom = payload.new as IBattleRoomWithPlayers;
            const oldRoom = payload.old as Partial<IBattleRoomWithPlayers>;

            // 방 정보 업데이트
            if (options.onRoomUpdate) {
                options.onRoomUpdate(newRoom);
            }
            battleStore.updateCurrentRoom(newRoom);

            // 게스트 참가 감지
            if (!oldRoom.guest_id && newRoom.guest_id && options.onGuestJoined) {
                options.onGuestJoined(newRoom.guest_id);
            }

            // 대결 시작 감지
            if (
                oldRoom.status !== 'playing' &&
                newRoom.status === 'playing' &&
                options.onBattleStart
            ) {
                options.onBattleStart();
            }

            // 문제 인덱스 변경 감지
            if (
                oldRoom.current_question_index !== newRoom.current_question_index &&
                options.onQuestionChange
            ) {
                options.onQuestionChange(newRoom.current_question_index);
            }

            // 상대방 답변 감지
            const isHost = battleStore.playState.isHost;
            const oldAnswerCount = isHost
                ? (oldRoom.guest_answers?.length ?? 0)
                : (oldRoom.host_answers?.length ?? 0);
            const newAnswerCount = isHost
                ? (newRoom.guest_answers?.length ?? 0)
                : (newRoom.host_answers?.length ?? 0);

            if (newAnswerCount > oldAnswerCount && options.onOpponentAnswer) {
                options.onOpponentAnswer();
                battleStore.updatePlayState({ opponentAnswered: true });
            }

            // 대결 종료 감지
            if (
                oldRoom.status !== 'finished' &&
                newRoom.status === 'finished' &&
                options.onBattleEnd
            ) {
                options.onBattleEnd(newRoom.winner_id ?? null);
            }

            // 방 취소 감지
            if (
                oldRoom.status !== 'cancelled' &&
                newRoom.status === 'cancelled' &&
                options.onRoomCancelled
            ) {
                options.onRoomCancelled();
            }
        }
    };

    const subscribe = async (): Promise<void> => {
        if (channel) {
            await unsubscribe();
        }

        try {
            channel = supabase
                .channel(`battle_room:${options.roomId}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'battle_rooms',
                        filter: `id=eq.${options.roomId}`,
                    },
                    handleRoomChange,
                )
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') {
                        isConnected.value = true;
                        connectionError.value = null;
                    } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
                        isConnected.value = false;
                        connectionError.value = '연결이 끊겼습니다.';
                    }
                });
        } catch (err) {
            connectionError.value = err instanceof Error ? err.message : '연결 실패';
            isConnected.value = false;
        }
    };

    const unsubscribe = (): void => {
        if (channel) {
            supabase.removeChannel(channel);
            channel = null;
        }
        isConnected.value = false;
    };

    onUnmounted(() => {
        unsubscribe();
    });

    return {
        isConnected: readonly(isConnected),
        connectionError: readonly(connectionError),
        subscribe,
        unsubscribe,
    };
}

// 매칭 대기열 실시간 구독
interface UseMatchmakingRealtimeOptions {
    onMatchFound?: (roomId: string) => void;
}

interface UseMatchmakingRealtimeReturn {
    isConnected: Readonly<Ref<boolean>>;
    subscribe: (userId: string) => Promise<void>;
    unsubscribe: () => void;
}

export function useMatchmakingRealtime(
    options: UseMatchmakingRealtimeOptions,
): UseMatchmakingRealtimeReturn {
    const supabase = useSupabase();
    const battleStore = useBattleStore();

    const isConnected = ref(false);
    let channel: RealtimeChannel | null = null;

    const subscribe = async (userId: string): Promise<void> => {
        if (channel) {
            unsubscribe();
        }

        try {
            // 매칭된 방 감지를 위해 battle_rooms 구독
            // 1. INSERT: 게스트로 직접 방이 생성되는 경우 (join_matchmaking 성공)
            // 2. UPDATE: 기존 방에 게스트로 추가되는 경우
            channel = supabase
                .channel(`matchmaking:${userId}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'battle_rooms',
                        filter: `guest_id=eq.${userId}`,
                    },
                    (payload) => {
                        console.log('매칭 INSERT 감지:', payload);
                        const room = payload.new as IBattleRoomWithPlayers;
                        if (room && options.onMatchFound) {
                            options.onMatchFound(room.id);
                            battleStore.matchmaking.status = 'found';
                            battleStore.matchmaking.room_id = room.id;
                        }
                    },
                )
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'battle_rooms',
                        filter: `guest_id=eq.${userId}`,
                    },
                    (payload) => {
                        console.log('매칭 UPDATE 감지:', payload);
                        const room = payload.new as IBattleRoomWithPlayers;
                        // status가 ready이고 guest_id가 현재 사용자인 경우
                        if (room && room.status === 'ready' && options.onMatchFound) {
                            options.onMatchFound(room.id);
                            battleStore.matchmaking.status = 'found';
                            battleStore.matchmaking.room_id = room.id;
                        }
                    },
                )
                )
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'battle_rooms',
                        filter: `host_id=eq.${userId}`,
                    },
                    (payload) => {
                        const room = payload.new as IBattleRoomWithPlayers;
                        // 게스트가 참가하면 매칭 완료
                        if (room.guest_id && room.status === 'ready' && options.onMatchFound) {
                            options.onMatchFound(room.id);
                            battleStore.matchmaking.status = 'found';
                            battleStore.matchmaking.room_id = room.id;
                        }
                    },
                )
                .subscribe((status) => {
                    isConnected.value = status === 'SUBSCRIBED';
                });
        } catch (err) {
            console.error('Matchmaking subscribe error:', err);
            isConnected.value = false;
        }
    };

    const unsubscribe = (): void => {
        if (channel) {
            supabase.removeChannel(channel);
            channel = null;
        }
        isConnected.value = false;
    };

    onUnmounted(() => {
        unsubscribe();
    });

    return {
        isConnected: readonly(isConnected),
        subscribe,
        unsubscribe,
    };
}

// 타이머 composable
interface UseCountdownReturn {
    timeRemaining: Readonly<Ref<number>>;
    isRunning: Readonly<Ref<boolean>>;
    start: (seconds: number) => void;
    stop: () => void;
    reset: () => void;
}

export function useCountdown(onComplete?: () => void): UseCountdownReturn {
    const timeRemaining = ref(0);
    const isRunning = ref(false);
    let intervalId: NodeJS.Timeout | null = null;

    const start = (seconds: number): void => {
        stop();
        timeRemaining.value = seconds;
        isRunning.value = true;

        intervalId = setInterval(() => {
            if (timeRemaining.value > 0) {
                timeRemaining.value -= 1;
            } else {
                stop();
                if (onComplete) {
                    onComplete();
                }
            }
        }, 1000);
    };

    const stop = (): void => {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
        isRunning.value = false;
    };

    const reset = (): void => {
        stop();
        timeRemaining.value = 0;
    };

    onUnmounted(() => {
        stop();
    });

    return {
        timeRemaining: readonly(timeRemaining),
        isRunning: readonly(isRunning),
        start,
        stop,
        reset,
    };
}

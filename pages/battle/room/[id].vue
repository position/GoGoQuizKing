<script setup lang="ts">
// 대결 방 페이지 (실시간 대결)
import type { Question } from '~/models/quiz';
import type { IBattleRoomWithPlayers, IBattleAnswer } from '~/models/battle';
import { BATTLE_SCORING } from '~/models/battle';
import { useBattleStore } from '~/store/battle.store';
import { useSupabase } from '~/composables/use-supabase';
import { useBattleRealtime, useCountdown } from '~/composables/use-battle-realtime';

definePageMeta({
    layout: 'default',
});

const route = useRoute();
const router = useRouter();
const supabase = useSupabase();
const battleStore = useBattleStore();

const roomId = computed(() => route.params.id as string);

// 상태
const isLoading = ref(true);
const room = ref<IBattleRoomWithPlayers | null>(null);
const questions = ref<Question[]>([]);
const isHost = ref(false);
const currentUserId = ref<string | null>(null);

// 현재 문제
const currentQuestion = computed(() => {
    if (!room.value || questions.value.length === 0) {
        return null;
    }
    return questions.value[room.value.current_question_index] || null;
});

// 게임 상태
const gamePhase = ref<'waiting' | 'ready' | 'countdown' | 'playing' | 'roundResult' | 'finished'>(
    'waiting',
);
const selectedAnswer = ref<string | null>(null);
const hasAnswered = ref(false);
const roundStartTime = ref(0);

// 카운트다운
const {
    timeRemaining,
    isRunning,
    start: startCountdown,
    stop: stopCountdown,
    reset: resetCountdown,
} = useCountdown(() => {
    // 시간 초과 시 자동 제출 (빈 답변)
    if (!hasAnswered.value && gamePhase.value === 'playing') {
        submitAnswer('');
    }
});

// Realtime 구독
const { isConnected, subscribe, unsubscribe } = useBattleRealtime({
    roomId: roomId.value,
    onRoomUpdate: (updatedRoom) => {
        room.value = updatedRoom;
    },
    onGuestJoined: () => {
        // 게스트 참가 - 대기 상태에서 준비 상태로
        if (room.value) {
            gamePhase.value = 'ready';
        }
    },
    onBattleStart: () => {
        // 대결 시작
        startGame();
    },
    onQuestionChange: () => {
        // 다음 문제로 이동
        startNewRound();
    },
    onOpponentAnswer: () => {
        // 상대방 답변 완료
        battleStore.updatePlayState({ opponentAnswered: true });
    },
    onBattleEnd: (winnerId) => {
        // 대결 종료
        gamePhase.value = 'finished';
        stopCountdown();

        // 결과 페이지로 이동
        setTimeout(() => {
            router.push(`/battle/result/${roomId.value}`);
        }, 2000);
    },
    onRoomCancelled: () => {
        // 방 취소
        alert('대결이 취소되었습니다.');
        router.push('/battle/lobby');
    },
});

// 방 정보 로드
async function loadRoom() {
    isLoading.value = true;
    try {
        const { data: userData } = await supabase.auth.getUser();
        currentUserId.value = userData.user?.id ?? null;

        const loadedRoom = await battleStore.fetchRoom(roomId.value);
        if (!loadedRoom) {
            alert('방을 찾을 수 없습니다.');
            router.push('/battle/lobby');
            return;
        }

        room.value = loadedRoom;
        isHost.value = loadedRoom.host_id === currentUserId.value;

        // 게임 상태 결정
        if (loadedRoom.status === 'waiting') {
            gamePhase.value = 'waiting';
        } else if (loadedRoom.status === 'ready') {
            gamePhase.value = 'ready';
        } else if (loadedRoom.status === 'playing') {
            // 이미 진행 중인 게임
            await loadQuestions();
            startGame();
        } else if (loadedRoom.status === 'finished') {
            router.push(`/battle/result/${roomId.value}`);
        }

        // Realtime 구독
        await subscribe();
    } catch (err) {
        console.error('loadRoom error:', err);
        alert('방 정보를 불러오는데 실패했습니다.');
        router.push('/battle/lobby');
    } finally {
        isLoading.value = false;
    }
}

// 문제 로드
async function loadQuestions() {
    if (room.value?.quiz_id) {
        questions.value = await battleStore.fetchQuestions(room.value.quiz_id);
    }
}

// 대결 시작 (호스트만)
async function handleStartBattle() {
    if (!isHost.value || !room.value) {
        return;
    }

    const success = await battleStore.startBattle(roomId.value);
    if (!success) {
        alert('대결 시작에 실패했습니다.');
    }
}

// 게임 시작
async function startGame() {
    if (questions.value.length === 0) {
        await loadQuestions();
    }

    // 카운트다운 시작
    gamePhase.value = 'countdown';

    // 3초 카운트다운 후 게임 시작
    setTimeout(() => {
        startNewRound();
    }, 3000);
}

// 새 라운드 시작
function startNewRound() {
    gamePhase.value = 'playing';
    selectedAnswer.value = null;
    hasAnswered.value = false;
    roundStartTime.value = Date.now();
    battleStore.updatePlayState({
        hasAnswered: false,
        myAnswer: null,
        opponentAnswered: false,
        roundResult: null,
    });

    // 타이머 시작
    startCountdown(BATTLE_SCORING.TIME_LIMIT);
}

// 답변 제출
async function submitAnswer(answer: string) {
    if (hasAnswered.value || !room.value) {
        return;
    }

    selectedAnswer.value = answer;
    hasAnswered.value = true;
    stopCountdown();

    const responseTime = (Date.now() - roundStartTime.value) / 1000;

    const result = await battleStore.submitAnswer(
        roomId.value,
        room.value.current_question_index,
        answer,
        responseTime,
    );

    battleStore.updatePlayState({
        hasAnswered: true,
        myAnswer: answer,
    });

    // 양쪽 다 응답 완료 체크
    checkRoundComplete();
}

// 라운드 완료 체크
function checkRoundComplete() {
    // 양쪽 다 응답했으면 결과 표시 후 다음 문제로
    if (battleStore.playState.hasAnswered && battleStore.playState.opponentAnswered) {
        gamePhase.value = 'roundResult';

        setTimeout(() => {
            if (room.value) {
                const isLastQuestion =
                    room.value.current_question_index >= room.value.question_count - 1;

                if (isLastQuestion) {
                    // 마지막 문제 - 대결 종료
                    if (isHost.value) {
                        battleStore.finishBattle(roomId.value);
                    }
                } else {
                    // 다음 문제로
                    if (isHost.value) {
                        battleStore.nextQuestion(roomId.value);
                    }
                }
            }
        }, 2000);
    }
}

// 방 나가기
async function leaveRoom() {
    if (confirm('정말 대결을 나가시겠어요?')) {
        await battleStore.leaveRoom(roomId.value);
        router.push('/battle/lobby');
    }
}

// 초대 코드 복사
async function copyRoomCode() {
    if (room.value?.room_code) {
        await navigator.clipboard.writeText(room.value.room_code);
        alert('초대 코드가 복사되었습니다!');
    }
}

// 내 답변 목록
const myAnswers = computed((): IBattleAnswer[] => {
    if (!room.value) {
        return [];
    }
    return isHost.value ? room.value.host_answers : room.value.guest_answers;
});

// 상대 답변 목록
const opponentAnswers = computed((): IBattleAnswer[] => {
    if (!room.value) {
        return [];
    }
    return isHost.value ? room.value.guest_answers : room.value.host_answers;
});

// 내 점수
const myScore = computed(() => {
    if (!room.value) {
        return 0;
    }
    return isHost.value ? room.value.host_score : room.value.guest_score;
});

// 상대 점수
const opponentScore = computed(() => {
    if (!room.value) {
        return 0;
    }
    return isHost.value ? room.value.guest_score : room.value.host_score;
});

// 마운트 시 방 로드
onMounted(() => {
    loadRoom();
});

// 언마운트 시 정리
onUnmounted(() => {
    unsubscribe();
    stopCountdown();
});
</script>

<template>
    <q-page class="battle-room-page">
        <!-- 로딩 -->
        <div v-if="isLoading" class="flex flex-center" style="min-height: 400px">
            <q-spinner-gears size="60px" color="primary" />
        </div>

        <!-- 대기 중 (게스트 기다리는 중) -->
        <div v-else-if="gamePhase === 'waiting'" class="waiting-phase q-pa-lg">
            <div class="text-center">
                <div class="text-h4 q-mb-md">🎮 대결 방</div>
                <div class="text-subtitle1 text-grey-7 q-mb-xl">
                    친구를 초대해서 대결을 시작하세요!
                </div>

                <!-- 초대 코드 -->
                <q-card flat class="code-card q-mb-xl">
                    <q-card-section>
                        <div class="text-caption text-grey-7 q-mb-sm">초대 코드</div>
                        <div class="room-code text-h3 text-weight-bold text-primary">
                            {{ room?.room_code }}
                        </div>
                        <q-btn
                            label="코드 복사"
                            icon="content_copy"
                            flat
                            color="primary"
                            class="q-mt-md"
                            @click="copyRoomCode"
                        />
                    </q-card-section>
                </q-card>

                <!-- 호스트 정보 -->
                <BattlePlayerCard
                    v-if="room?.host"
                    :user-id="room.host.id"
                    :name="room.host.preferred_username || room.host.full_name || ''"
                    :avatar-url="room.host.avatar_url"
                    :level="room.host.level"
                    :is-current-user="isHost"
                    :show-score="false"
                    class="q-mx-auto q-mb-lg"
                    style="max-width: 200px"
                />

                <div class="text-subtitle1 text-grey-6 q-mb-lg">
                    <q-spinner-dots size="20px" class="q-mr-sm" />
                    상대방을 기다리는 중...
                </div>

                <q-btn label="나가기" color="grey-6" outline @click="leaveRoom" />
            </div>
        </div>

        <!-- 준비 완료 (양측 참가) -->
        <div v-else-if="gamePhase === 'ready'" class="ready-phase q-pa-lg">
            <div class="text-center">
                <div class="text-h4 q-mb-lg">⚔️ 대결 준비 완료!</div>

                <!-- 플레이어 정보 -->
                <div class="row q-gutter-xl justify-center q-mb-xl">
                    <BattlePlayerCard
                        v-if="room?.host"
                        :user-id="room.host.id"
                        :name="room.host.preferred_username || room.host.full_name || ''"
                        :avatar-url="room.host.avatar_url"
                        :level="room.host.level"
                        :is-current-user="isHost"
                        :show-score="false"
                    />

                    <div class="vs-text text-h4 text-weight-bold self-center">VS</div>

                    <BattlePlayerCard
                        v-if="room?.guest"
                        :user-id="room.guest.id"
                        :name="room.guest.preferred_username || room.guest.full_name || ''"
                        :avatar-url="room.guest.avatar_url"
                        :level="room.guest.level"
                        :is-current-user="!isHost"
                        :show-score="false"
                    />
                </div>

                <!-- 시작 버튼 (호스트만) -->
                <q-btn
                    v-if="isHost"
                    label="대결 시작!"
                    color="primary"
                    size="xl"
                    @click="handleStartBattle"
                />
                <div v-else class="text-subtitle1 text-grey-6">
                    호스트가 대결을 시작하면 시작됩니다...
                </div>
            </div>
        </div>

        <!-- 카운트다운 -->
        <div v-else-if="gamePhase === 'countdown'" class="countdown-phase flex flex-center">
            <div class="text-center">
                <div class="countdown-number text-h1 text-weight-bold text-primary">3</div>
                <div class="text-h5 q-mt-md">대결 시작!</div>
            </div>
        </div>

        <!-- 게임 진행 중 -->
        <div
            v-else-if="gamePhase === 'playing' || gamePhase === 'roundResult'"
            class="playing-phase q-pa-md"
        >
            <!-- 상단: 플레이어 점수 -->
            <div class="row q-gutter-md justify-between q-mb-lg">
                <BattlePlayerCard
                    v-if="room?.host"
                    :user-id="room.host.id"
                    :name="
                        isHost ? '나' : room.host.preferred_username || room.host.full_name || ''
                    "
                    :avatar-url="room.host.avatar_url"
                    :level="room.host.level"
                    :score="room.host_score"
                    :answers="room.host_answers"
                    :is-current-user="isHost"
                    class="col"
                />

                <BattlePlayerCard
                    v-if="room?.guest"
                    :user-id="room.guest.id"
                    :name="
                        !isHost ? '나' : room.guest.preferred_username || room.guest.full_name || ''
                    "
                    :avatar-url="room.guest.avatar_url"
                    :level="room.guest.level"
                    :score="room.guest_score"
                    :answers="room.guest_answers"
                    :is-current-user="!isHost"
                    class="col"
                />
            </div>

            <!-- 문제 -->
            <BattleQuestion
                v-if="currentQuestion"
                :question-index="room?.current_question_index ?? 0"
                :total-questions="room?.question_count ?? 5"
                :question-text="currentQuestion.question_text"
                :question-type="currentQuestion.question_type as any"
                :question-image-url="currentQuestion.question_image_url"
                :options="currentQuestion.options as string[] | null"
                :time-remaining="timeRemaining"
                :has-answered="hasAnswered"
                :selected-answer="selectedAnswer"
                :disabled="gamePhase === 'roundResult'"
                @answer="submitAnswer"
            />

            <!-- 라운드 결과 -->
            <div v-if="gamePhase === 'roundResult'" class="round-result-overlay">
                <div class="text-center">
                    <div class="text-h5 q-mb-sm">정답: {{ currentQuestion?.correct_answer }}</div>
                    <div class="text-subtitle1">다음 문제로 넘어갑니다...</div>
                </div>
            </div>
        </div>
    </q-page>
</template>

<style scoped lang="scss">
.battle-room-page {
    min-height: calc(100vh - 100px);
}

.waiting-phase,
.ready-phase {
    max-width: 600px;
    margin: 0 auto;
}

.code-card {
    background: linear-gradient(135deg, #fff9f0 0%, #fff 100%);
    border-radius: 16px;
}

.room-code {
    letter-spacing: 8px;
}

.vs-text {
    background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.countdown-phase {
    min-height: calc(100vh - 200px);
}

.countdown-number {
    font-size: 120px;
    animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
    0%,
    100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.1);
    }
}

.playing-phase {
    max-width: 700px;
    margin: 0 auto;
}

.round-result-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    z-index: 100;
}
</style>

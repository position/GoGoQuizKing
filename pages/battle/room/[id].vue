<script setup lang="ts">
// 대결 방 페이지 (실시간 대결)
import type { Question } from '~/models/quiz';
import type { IBattleRoomWithPlayers } from '~/models/battle';
import { BATTLE_SCORING } from '~/models/battle';
import { useBattleStore } from '~/store/battle.store';
import { useSupabase } from '~/composables/use-supabase';
import { useBattleRealtime, useCountdown } from '~/composables/use-battle-realtime';
import { useQuasar } from 'quasar';

definePageMeta({
    layout: 'default',
});

const route = useRoute();
const router = useRouter();
const supabase = useSupabase();
const battleStore = useBattleStore();
const $q = useQuasar();

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
const countdownNumber = ref(3);

// 카운트다운
const {
    timeRemaining,
    start: startCountdown,
    stop: stopCountdown,
} = useCountdown(() => {
    // 시간 초과 시 자동 제출 (빈 답변)
    if (!hasAnswered.value && gamePhase.value === 'playing') {
        submitAnswer('');
    }
});

// Realtime 구독
const { subscribe, unsubscribe } = useBattleRealtime({
    roomId: roomId.value,
    onRoomUpdate: async (updatedRoom) => {
        // Realtime payload는 관계 데이터(host, guest 프로필)를 포함하지 않으므로
        // 필요 시 전체 방 정보를 다시 fetch
        if (updatedRoom.guest_id && !updatedRoom.guest) {
            const fullRoom = await battleStore.fetchRoom(roomId.value);
            if (fullRoom) {
                room.value = fullRoom;
            }
        } else {
            room.value = updatedRoom;
        }
    },
    onGuestJoined: async () => {
        // 게스트 참가 - 방 정보를 다시 fetch하여 guest 프로필 포함
        const fullRoom = await battleStore.fetchRoom(roomId.value);
        if (fullRoom) {
            room.value = fullRoom;
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
    onBattleEnd: () => {
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
        $q.notify({
            type: 'warning',
            message: '대결이 취소되었습니다.',
        });
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
            $q.notify({
                type: 'negative',
                message: '방을 찾을 수 없습니다.',
            });
            router.push('/battle/lobby');
            return;
        }

        room.value = loadedRoom;
        isHost.value = loadedRoom.host_id === currentUserId.value;

        // battleStore에도 isHost 설정 (realtime 콜백에서 사용)
        battleStore.updatePlayState({ isHost: isHost.value });

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
        $q.notify({
            type: 'negative',
            message: '방 정보를 불러오는데 실패했습니다.',
        });
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
        $q.notify({
            type: 'negative',
            message: '대결 시작에 실패했습니다.',
        });
    }
}

// 게임 시작
async function startGame() {
    // 방 정보 다시 fetch (quiz_id 포함)
    const updatedRoom = await battleStore.fetchRoom(roomId.value);
    if (updatedRoom) {
        room.value = updatedRoom;
    }

    // 문제 로드
    if (room.value?.quiz_id && questions.value.length === 0) {
        await loadQuestions();
    }

    // 문제가 없으면 에러 처리
    if (questions.value.length === 0) {
        $q.notify({
            type: 'negative',
            message: '문제를 불러오지 못했습니다.',
        });
        return;
    }

    // 카운트다운 시작
    gamePhase.value = 'countdown';
    countdownNumber.value = 3;

    // 3, 2, 1 카운트다운
    const countdownInterval = setInterval(() => {
        countdownNumber.value -= 1;
        if (countdownNumber.value <= 0) {
            clearInterval(countdownInterval);
            startNewRound();
        }
    }, 1000);
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

    await battleStore.submitAnswer(
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
    $q.dialog({
        title: '대결 나가기',
        message: '정말 대결을 나가시겠어요?',
        cancel: {
            label: '취소',
            flat: true,
        },
        ok: {
            label: '나가기',
            color: 'negative',
        },
    }).onOk(async () => {
        await battleStore.leaveRoom(roomId.value);
        router.push('/battle/lobby');
    });
}

// 초대 코드 복사
async function copyRoomCode() {
    if (room.value?.room_code) {
        await navigator.clipboard.writeText(room.value.room_code);
        $q.notify({
            type: 'positive',
            message: '초대 코드가 복사되었습니다!',
        });
    }
}

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
    <q-page class="battle-room">
        <!-- 로딩 -->
        <div v-if="isLoading" class="battle-room__loading">
            <q-spinner-gears size="60px" color="primary" />
        </div>

        <!-- 대기 중 (게스트 기다리는 중) -->
        <div v-else-if="gamePhase === 'waiting'" class="battle-room__waiting">
            <h1 class="battle-room__title">🎮 대결 방</h1>
            <p class="battle-room__subtitle">친구를 초대해서 대결을 시작하세요!</p>

            <!-- 초대 코드 -->
            <div class="battle-room__code-card">
                <span class="battle-room__code-label">초대 코드</span>
                <span class="battle-room__code">{{ room?.room_code }}</span>
                <q-btn
                    label="코드 복사"
                    icon="content_copy"
                    flat
                    color="primary"
                    @click="copyRoomCode"
                />
            </div>

            <!-- 호스트 정보 -->
            <BattlePlayerCard
                v-if="room?.host"
                :user-id="room.host.id"
                :name="room.host.preferred_username || room.host.full_name || ''"
                :avatar-url="room.host.avatar_url"
                :level="room.host.level"
                :is-current-user="isHost"
                :show-score="false"
                class="battle-room__player-card"
            />

            <div class="battle-room__waiting-text">
                <q-spinner-dots size="20px" />
                <span>상대방을 기다리는 중...</span>
            </div>

            <q-btn label="나가기" color="grey-6" size="large" outline @click="leaveRoom" />
        </div>

        <!-- 준비 완료 (양측 참가) -->
        <div v-else-if="gamePhase === 'ready'" class="battle-room__ready">
            <h2 class="battle-room__ready-title">⚔️ 대결 준비 완료!</h2>

            <!-- 플레이어 정보 -->
            <div class="battle-room__players">
                <BattlePlayerCard
                    v-if="room?.host"
                    :user-id="room.host.id"
                    :name="room.host.preferred_username || room.host.full_name || ''"
                    :avatar-url="room.host.avatar_url"
                    :level="room.host.level"
                    :is-current-user="isHost"
                    :show-score="false"
                />

                <span class="battle-room__vs">VS</span>

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
            <p v-else class="battle-room__waiting-host">호스트가 대결을 시작하면 시작됩니다...</p>
        </div>

        <!-- 카운트다운 -->
        <div v-else-if="gamePhase === 'countdown'" class="battle-room__countdown">
            <span class="battle-room__countdown-number">{{ countdownNumber }}</span>
            <span class="battle-room__countdown-text">대결 시작!</span>
        </div>

        <!-- 게임 진행 중 -->
        <div
            v-else-if="gamePhase === 'playing' || gamePhase === 'roundResult'"
            class="battle-room__playing"
        >
            <!-- 상단: 플레이어 점수 -->
            <div class="battle-room__scoreboard">
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
                />
            </div>

            <!-- 문제 -->
            <BattleQuestion
                v-if="currentQuestion"
                :question-index="room?.current_question_index ?? 0"
                :total-questions="room?.question_count ?? 5"
                :question-text="currentQuestion.question_text"
                :question-type="(currentQuestion.question_type as any)"
                :question-image-url="currentQuestion.question_image_url"
                :options="(currentQuestion.options as string[] | null)"
                :time-remaining="timeRemaining"
                :has-answered="hasAnswered"
                :selected-answer="selectedAnswer"
                :disabled="gamePhase === 'roundResult'"
                @answer="submitAnswer"
            />

            <!-- 라운드 결과 -->
            <div v-if="gamePhase === 'roundResult'" class="battle-room__round-result">
                <h3 class="battle-room__round-result-title">
                    정답: {{ currentQuestion?.correct_answer }}
                </h3>
                <p class="battle-room__round-result-text">다음 문제로 넘어갑니다...</p>
            </div>
        </div>
    </q-page>
</template>

<style scoped lang="scss">
.battle-room {
    min-height: calc(100vh - 100px);

    // 로딩
    &__loading {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 400px;
    }

    // 대기 화면
    &__waiting {
        max-width: 600px;
        margin: 0 auto;
        padding: $spacing-lg;
        text-align: center;
    }

    &__title {
        font-size: $font-size-3xl;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 $spacing-sm;
    }

    &__subtitle {
        font-size: $font-size-base;
        color: var(--text-secondary);
        margin: 0 0 $spacing-xxl;
    }

    // 초대 코드 카드
    &__code-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: $spacing-sm;
        padding: $spacing-lg;
        border-radius: $radius-lg;
        margin-bottom: $spacing-xxl;

        .body--light & {
            background: linear-gradient(135deg, #fff9f0 0%, #fff 100%);
        }

        .body--dark & {
            background: linear-gradient(135deg, rgba($warning, 0.15) 0%, $dark-bg-card 100%);
        }
    }

    &__code-label {
        font-size: $font-size-sm;
        color: var(--text-light);
    }

    &__code {
        font-size: $font-size-4xl;
        font-weight: 700;
        color: $primary;
        letter-spacing: 8px;
    }

    &__player-card {
        max-width: 200px;
        margin: 0 auto $spacing-lg;
    }

    &__waiting-text {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: $spacing-sm;
        font-size: $font-size-base;
        color: var(--text-light);
        margin-bottom: $spacing-lg;
    }

    // 준비 화면
    &__ready {
        max-width: 600px;
        margin: 0 auto;
        padding: $spacing-lg;
        text-align: center;
    }

    &__ready-title {
        font-size: $font-size-2xl;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 $spacing-xl;
    }

    &__players {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: $spacing-xl;
        margin-bottom: $spacing-xl;
        flex-wrap: wrap;
    }

    &__vs {
        font-size: $font-size-2xl;
        font-weight: 700;
        background: linear-gradient(135deg, $negative, #ff8e8e);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    &__waiting-host {
        font-size: $font-size-base;
        color: var(--text-light);
        margin: 0;
    }

    // 카운트다운
    &__countdown {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: calc(100vh - 200px);
    }

    &__countdown-number {
        font-size: 120px;
        font-weight: 700;
        color: $primary;
        animation: pulse 1s ease-in-out infinite;
    }

    &__countdown-text {
        font-size: $font-size-xl;
        color: var(--text-primary);
        margin-top: $spacing-md;
    }

    // 플레이 화면
    &__playing {
        max-width: 700px;
        margin: 0 auto;
        padding: $spacing-md;
    }

    &__scoreboard {
        display: flex;
        justify-content: space-between;
        gap: $spacing-md;
        margin-bottom: $spacing-lg;
    }

    // 라운드 결과 오버레이
    &__round-result {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #fff;
        z-index: 100;
    }

    &__round-result-title {
        font-size: $font-size-xl;
        font-weight: 600;
        margin: 0 0 $spacing-sm;
    }

    &__round-result-text {
        font-size: $font-size-base;
        margin: 0;
    }
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
</style>

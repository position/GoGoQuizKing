<script setup lang="ts">
// 매칭 대기 페이지
import type { BattleType } from '~/models/battle';
import { BATTLE_TYPES, MATCHMAKING_CONFIG } from '~/models/battle';
import { useBattleStore } from '~/store/battle.store';
import { useMatchmakingRealtime } from '~/composables/use-battle-realtime';
import { useSupabase } from '~/composables/use-supabase';
import { useQuasar } from 'quasar';

definePageMeta({
    layout: 'default',
});

// SEO 설정
useSeoMeta({
    title: '대결 매칭 중 - 고고퀴즈킹(GoGo QuizKing)',
    description: '실시간 퀴즈 대결 상대를 찾고 있습니다. 잠시만 기다려주세요!',
    robots: 'noindex, nofollow',
});

const route = useRoute();
const router = useRouter();
const supabase = useSupabase();
const battleStore = useBattleStore();
const $q = useQuasar();

const battleType = computed(() => (route.query.type as BattleType) || 'quick');
const battleTypeInfo = computed(() => BATTLE_TYPES[battleType.value]);

const elapsedTime = ref(0);
const isSearching = ref(false);
let timerInterval: NodeJS.Timeout | null = null;

// Realtime 매칭 구독
const { isConnected, subscribe, unsubscribe } = useMatchmakingRealtime({
    onMatchFound: (roomId) => {
        // 매칭 성공! 방으로 이동
        stopSearching();
        router.push(`/battle/room/${roomId}`);
    },
});

// 매칭 시작
async function startSearching() {
    isSearching.value = true;
    elapsedTime.value = 0;

    console.log('매칭 시작:', battleType.value);

    // 타이머 시작
    timerInterval = setInterval(() => {
        elapsedTime.value += 1;

        // 타임아웃 체크
        if (elapsedTime.value >= MATCHMAKING_CONFIG.TIMEOUT_SECONDS) {
            handleTimeout();
        }
    }, 1000);

    // Realtime 구독 먼저 시작 (매칭 결과를 놓치지 않기 위해)
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
        console.log('Realtime 구독 시작:', userData.user.id);
        await subscribe(userData.user.id);
    }

    // 매칭 대기열 등록
    console.log('매칭 대기열 등록 요청...');
    await battleStore.startMatchmaking({
        battle_type: battleType.value,
        same_grade_only: false,
    });

    console.log('매칭 상태:', battleStore.matchmaking.status, battleStore.matchmaking.room_id);

    // 매칭 성공 시 즉시 이동
    if (battleStore.matchmaking.status === 'found' && battleStore.matchmaking.room_id) {
        console.log('즉시 매칭 성공! 방 이동:', battleStore.matchmaking.room_id);
        stopSearching();
        await router.push(`/battle/room/${battleStore.matchmaking.room_id}`);
        return;
    }

    console.log('매칭 대기 중...');
}

// 매칭 중지
function stopSearching() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    isSearching.value = false;
    unsubscribe();
}

// 매칭 취소
async function cancelMatchmaking() {
    stopSearching();
    await battleStore.cancelMatchmaking();
    await router.push('/battle/lobby');
}

// 타임아웃 처리
async function handleTimeout() {
    stopSearching();

    // Quasar Dialog로 확인
    $q.dialog({
        title: '😢 매칭 실패',
        message: '매칭 상대를 찾지 못했어요. 계속 찾으시겠어요?',
        cancel: {
            label: '로비로 돌아가기',
            color: 'grey',
            flat: true,
        },
        ok: {
            label: '계속 찾기',
            color: 'primary',
            unelevated: true,
        },
        persistent: true,
    })
        .onOk(async () => {
            // 다시 검색
            await startSearching();
        })
        .onCancel(async () => {
            await battleStore.cancelMatchmaking();
            await router.push('/battle/lobby');
        });
}

// 페이지 마운트 시 매칭 시작
onMounted(() => {
    startSearching();
});

// 페이지 언마운트 시 정리
onUnmounted(() => {
    stopSearching();
    battleStore.cancelMatchmaking();
});
</script>

<template>
    <q-page padding class="matchmaking-page">
        <div class="container">
            <MatchmakingWaiting
                :elapsed-time="elapsedTime"
                :max-time="MATCHMAKING_CONFIG.TIMEOUT_SECONDS"
                :battle-type="battleTypeInfo.label"
                @cancel="cancelMatchmaking"
            />
        </div>
    </q-page>
</template>

<style scoped lang="scss">
.matchmaking-page {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 100px);

    .container {
        width: 100%;
        max-width: 500px;
    }
}
</style>

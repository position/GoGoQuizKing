<script setup lang="ts">
// 대결 결과 페이지
import type { IBattleResult } from '~/models/battle';
import { useBattleStore } from '~/store/battle.store';
import { useSupabase } from '~/composables/use-supabase';

definePageMeta({
    layout: 'default',
});

// SEO 설정
useSeoMeta({
    title: '대결 결과 - 고고퀴즈킹(GoGo QuizKing) | 퀴즈 배틀 결과',
    description: '퀴즈 대결 결과를 확인하세요! 점수, 정답률, 획득 보상을 한눈에 볼 수 있습니다.',
    robots: 'noindex, nofollow',
});

const route = useRoute();
const router = useRouter();
const supabase = useSupabase();
const battleStore = useBattleStore();

const roomId = computed(() => route.params.id as string);

const isLoading = ref(true);
const result = ref<IBattleResult | null>(null);

// 결과 데이터 로드
async function loadResult() {
    isLoading.value = true;
    try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
            router.push('/login');
            return;
        }

        // 방 정보 조회
        const room = await battleStore.fetchRoom(roomId.value);
        if (!room) {
            alert('대결 정보를 찾을 수 없습니다.');
            router.push('/battle/lobby');
            return;
        }

        const isHost = room.host_id === userData.user.id;

        // 정답 수 계산
        const hostCorrect = room.host_answers.filter((a) => a.is_correct).length;
        const guestCorrect = room.guest_answers.filter((a) => a.is_correct).length;

        // 결과 데이터 구성
        result.value = {
            room_id: roomId.value,
            winner_id: room.winner_id,
            is_winner: room.winner_id === userData.user.id,
            is_draw: room.winner_id === null && room.status === 'finished',
            my_score: isHost ? room.host_score : room.guest_score,
            opponent_score: isHost ? room.guest_score : room.host_score,
            my_correct_count: isHost ? hostCorrect : guestCorrect,
            opponent_correct_count: isHost ? guestCorrect : hostCorrect,
            total_questions: room.question_count,
            reward: {
                points_earned: result.value?.reward.points_earned ?? 0,
                ranking_points_earned: result.value?.reward.ranking_points_earned ?? 0,
            },
            opponent: {
                id: isHost ? (room.guest?.id ?? '') : (room.host?.id ?? ''),
                name: isHost
                    ? (room.guest?.preferred_username ?? room.guest?.full_name ?? 'Unknown')
                    : (room.host?.preferred_username ?? room.host?.full_name ?? 'Unknown'),
                avatar_url: isHost
                    ? (room.guest?.avatar_url ?? null)
                    : (room.host?.avatar_url ?? null),
                level: isHost ? (room.guest?.level ?? 1) : (room.host?.level ?? 1),
            },
        };

        // 히스토리에서 보상 정보 조회
        await loadRewardInfo(userData.user.id);
    } catch (err) {
        console.error('loadResult error:', err);
        alert('결과를 불러오는데 실패했습니다.');
        router.push('/battle/lobby');
    } finally {
        isLoading.value = false;
    }
}

// 보상 정보 로드
async function loadRewardInfo(userId: string) {
    const { data } = await supabase
        .from('battle_history')
        .select('points_earned, ranking_points_earned')
        .eq('room_id', roomId.value)
        .eq('user_id', userId)
        .single();

    if (data && result.value) {
        result.value.reward = {
            points_earned: data.points_earned,
            ranking_points_earned: data.ranking_points_earned,
        };
    }
}

// 재대결
async function handleRematch() {
    // 새 방 생성 후 초대
    const newRoom = await battleStore.createRoom('quick');
    if (newRoom) {
        router.push(`/battle/room/${newRoom.roomId}`);
    }
}

// 홈으로
function goHome() {
    router.push('/battle/lobby');
}

onMounted(() => {
    loadResult();
});
</script>

<template>
    <q-page class="battle-result-page">
        <!-- 로딩 -->
        <div v-if="isLoading" class="battle-result-page__loading">
            <q-spinner-gears size="60px" color="primary" />
        </div>

        <!-- 결과 -->
        <BattleResult
            v-else-if="result"
            :result="result"
            @rematch="handleRematch"
            @go-home="goHome"
        />
    </q-page>
</template>

<style scoped lang="scss">
.battle-result-page {
    .body--light & {
        background: $bg-secondary;
    }

    .body--dark & {
        background: $dark-bg-primary;
    }

    &__loading {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 400px;
    }
}
</style>

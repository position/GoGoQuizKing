<script setup lang="ts">
// 대결 로비 페이지
import type { BattleType } from '~/models/battle';
import { BATTLE_TYPES, DEFAULT_MATCHMAKING_OPTIONS } from '~/models/battle';
import { useBattleStore } from '~/store/battle.store';
import { useAuthStore } from '~/store/auth.store';

definePageMeta({
    layout: 'default',
    middleware: ['auth-guard'],
});

const router = useRouter();
const battleStore = useBattleStore();
const authStore = useAuthStore();

const selectedBattleType = ref<BattleType>('quick');
const showJoinDialog = ref(false);
const roomCode = ref('');
const isCreating = ref(false);
const isJoining = ref(false);

const battleTypes = Object.entries(BATTLE_TYPES).map(([key, value]) => ({
    type: key as BattleType,
    ...value,
}));

// 방 생성
async function createRoom() {
    isCreating.value = true;
    try {
        const result = await battleStore.createRoom(selectedBattleType.value);
        if (result) {
            await router.push(`/battle/room/${result.roomId}`);
        }
    } finally {
        isCreating.value = false;
    }
}

// 초대 코드로 참가
async function joinByCode() {
    if (!roomCode.value.trim()) {
        return;
    }

    isJoining.value = true;
    try {
        const result = await battleStore.joinRoomByCode(roomCode.value.trim());
        if (result.success && result.roomId) {
            showJoinDialog.value = false;
            await router.push(`/battle/room/${result.roomId}`);
        } else {
            // 에러 메시지 표시
            alert(result.message);
        }
    } finally {
        isJoining.value = false;
    }
}

// 랜덤 매칭 시작
function startMatchmaking() {
    router.push({
        path: '/battle/matchmaking',
        query: { type: selectedBattleType.value },
    });
}

// 대결 기록으로 이동
function goToHistory() {
    router.push('/battle/history');
}
</script>

<template>
    <q-page padding class="battle-lobby">
        <!-- 헤더 -->
        <div class="text-center q-mb-xl">
            <div class="text-h4 text-weight-bold q-mb-sm">
                ⚔️ 퀴즈 대결
            </div>
            <div class="text-subtitle1 text-grey-7">
                다른 친구와 실시간으로 대결해보세요!
            </div>
        </div>

        <!-- 대결 유형 선택 -->
        <div class="q-mb-xl">
            <div class="text-subtitle1 text-weight-bold q-mb-md">
                대결 유형 선택
            </div>
            <div class="row q-gutter-md justify-center">
                <BattleTypeCard
                    v-for="bt in battleTypes"
                    :key="bt.type"
                    :type="bt.type"
                    :selected="selectedBattleType === bt.type"
                    @select="selectedBattleType = $event"
                />
            </div>
        </div>

        <!-- 대결 방식 선택 -->
        <div class="q-mb-xl">
            <q-card flat class="action-card">
                <q-card-section>
                    <div class="row q-gutter-md">
                        <!-- 랜덤 매칭 -->
                        <div class="col-12 col-sm-4">
                            <q-btn
                                label="🎲 랜덤 매칭"
                                color="primary"
                                class="full-width"
                                size="lg"
                                :loading="isCreating"
                                @click="startMatchmaking"
                            >
                                <q-tooltip>
                                    비슷한 레벨의 상대와 자동 매칭
                                </q-tooltip>
                            </q-btn>
                            <div class="text-caption text-grey-7 text-center q-mt-sm">
                                비슷한 레벨 상대와 자동 매칭
                            </div>
                        </div>

                        <!-- 친구 초대 -->
                        <div class="col-12 col-sm-4">
                            <q-btn
                                label="🔗 방 만들기"
                                color="secondary"
                                class="full-width"
                                size="lg"
                                :loading="isCreating"
                                @click="createRoom"
                            >
                                <q-tooltip>
                                    초대 링크로 친구 초대
                                </q-tooltip>
                            </q-btn>
                            <div class="text-caption text-grey-7 text-center q-mt-sm">
                                초대 코드를 친구에게 공유
                            </div>
                        </div>

                        <!-- 코드로 참가 -->
                        <div class="col-12 col-sm-4">
                            <q-btn
                                label="👥 코드 입력"
                                color="accent"
                                class="full-width"
                                size="lg"
                                @click="showJoinDialog = true"
                            >
                                <q-tooltip>
                                    초대 코드 입력하여 참가
                                </q-tooltip>
                            </q-btn>
                            <div class="text-caption text-grey-7 text-center q-mt-sm">
                                친구의 초대 코드로 참가
                            </div>
                        </div>
                    </div>
                </q-card-section>
            </q-card>
        </div>

        <!-- 대결 기록 버튼 -->
        <div class="text-center">
            <q-btn
                label="📜 대결 기록"
                flat
                color="grey-7"
                @click="goToHistory"
            />
        </div>

        <!-- 초대 코드 입력 다이얼로그 -->
        <q-dialog v-model="showJoinDialog">
            <q-card style="min-width: 300px">
                <q-card-section>
                    <div class="text-h6">초대 코드 입력</div>
                </q-card-section>

                <q-card-section>
                    <q-input
                        v-model="roomCode"
                        label="초대 코드"
                        placeholder="예: ABC123"
                        outlined
                        autofocus
                        maxlength="6"
                        class="room-code-input"
                        @keyup.enter="joinByCode"
                    >
                        <template #prepend>
                            <q-icon name="vpn_key" />
                        </template>
                    </q-input>
                </q-card-section>

                <q-card-actions align="right">
                    <q-btn
                        flat
                        label="취소"
                        color="grey-7"
                        v-close-popup
                    />
                    <q-btn
                        label="참가하기"
                        color="primary"
                        :loading="isJoining"
                        :disable="!roomCode.trim()"
                        @click="joinByCode"
                    />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<style scoped lang="scss">
.battle-lobby {
    max-width: 800px;
    margin: 0 auto;
}

.action-card {
    background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%);
    border-radius: 16px;
}

.room-code-input :deep(input) {
    text-transform: uppercase;
    font-size: 20px;
    letter-spacing: 4px;
    text-align: center;
}
</style>

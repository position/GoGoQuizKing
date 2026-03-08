<script setup lang="ts">
// 대결 로비 페이지
import type { BattleType } from '~/models/battle';
import { BATTLE_TYPES } from '~/models/battle';
import { useBattleStore } from '~/store/battle.store';
import { ToastMessage } from '~/helper/message';

definePageMeta({
    layout: 'default',
});

const router = useRouter();
const battleStore = useBattleStore();

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
            ToastMessage.error(result.message || '방 참가에 실패했습니다.');
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
            <h1 class="text-weight-bold q-mb-sm">⚔️ 퀴즈 대결</h1>
            <div class="text-subtitle1 text-grey-7">다른 친구와 실시간으로 대결해보세요!</div>
        </div>

        <!-- 대결 유형 선택 -->
        <div class="q-mb-xl">
            <h2 class="text-weight-bold q-mb-md">대결 유형 선택</h2>
            <div class="row justify-around">
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
                    <div class="row justify-around">
                        <!-- 랜덤 매칭 -->
                        <div class="col-12 col-sm-3">
                            <q-btn
                                label="🎲 랜덤 매칭"
                                color="primary"
                                class="full-width"
                                size="lg"
                                :loading="isCreating"
                                @click="startMatchmaking"
                            >
                                <q-tooltip> 비슷한 레벨의 상대와 자동 매칭 </q-tooltip>
                            </q-btn>
                            <div class="text-caption text-grey-7 text-center q-mt-sm">
                                비슷한 레벨 상대와 자동 매칭
                            </div>
                        </div>

                        <!-- 친구 초대 -->
                        <div class="col-12 col-sm-3">
                            <q-btn
                                label="🔗 방 만들기"
                                color="secondary"
                                class="full-width"
                                size="lg"
                                :loading="isCreating"
                                @click="createRoom"
                            >
                                <q-tooltip> 초대 링크로 친구 초대 </q-tooltip>
                            </q-btn>
                            <div class="text-caption text-grey-7 text-center q-mt-sm">
                                초대 코드를 친구에게 공유
                            </div>
                        </div>

                        <!-- 코드로 참가 -->
                        <div class="col-12 col-sm-3">
                            <q-btn
                                label="👥 코드 입력"
                                color="black"
                                class="full-width"
                                size="lg"
                                @click="showJoinDialog = true"
                            >
                                <q-tooltip> 초대 코드 입력하여 참가 </q-tooltip>
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
        <div class="row justify-center">
            <q-btn label="📜 대결 기록" flat color="grey-7" @click="goToHistory" size="large" />
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
                    <q-btn flat label="취소" color="grey-7" v-close-popup />
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

    h1 {
        font-size: 2rem;
        color: var(--text-primary);
    }

    .text-subtitle1 {
        color: var(--text-secondary);
    }

    .action-card {
        background: var(--bg-card);
        border-radius: 16px;
        box-shadow: 0 2px 12px var(--shadow-color);

        .q-btn {
            border-radius: 12px;
            font-weight: 600;
        }

        .text-caption {
            color: var(--text-light);
        }
    }

    .room-code-input {
        :deep(input) {
            text-transform: uppercase;
            font-size: 20px;
            letter-spacing: 4px;
            text-align: center;
            color: var(--text-primary);
        }

        :deep(.q-field__control) {
            background: var(--bg-input);
            border-radius: 8px;
        }
    }
}

// 다크모드 대응
.body--dark {
    .battle-lobby {
        .action-card {
            background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-card) 100%);
        }
    }
}

// 라이트모드
.body--light {
    .battle-lobby {
        .action-card {
            background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%);
        }
    }
}
</style>

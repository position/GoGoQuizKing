<script setup lang="ts">
// 대결 로비 페이지
import type { BattleType } from '~/models/battle';
import { BATTLE_TYPES } from '~/models/battle';
import { useBattleStore } from '~/store/battle.store';
import { ToastMessage } from '~/helper/message';

definePageMeta({
    layout: 'default',
});

// SEO 설정
useSeoMeta({
    title: '실시간 퀴즈 대결 - 고고퀴즈킹(GoGo QuizKing) | 1:1 퀴즈 배틀',
    description:
        '실시간 1:1 퀴즈 대결에 도전하세요! 랜덤 매칭 또는 친구 초대로 퀴즈 배틀을 시작하세요. 빠른 대결, 일반 대결 모드 선택 가능!',
    ogTitle: '실시간 퀴즈 대결 - 고고퀴즈킹(GoGo QuizKing)',
    ogDescription:
        '친구와 1:1 실시간 퀴즈 대결! 누가 더 빠르고 정확할까? 지금 바로 도전하세요!',
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
    <q-page class="battle-lobby">
        <!-- 헤더 -->
        <header class="battle-lobby__header">
            <h1 class="battle-lobby__title page-title">
                <q-icon name="sports_esports" class="battle-lobby__title-icon" />
                퀴즈 대결
            </h1>
            <p class="battle-lobby__subtitle">다른 친구와 실시간으로 대결해보세요!</p>
        </header>

        <!-- 대결 유형 선택 -->
        <section class="battle-lobby__section">
            <h2 class="battle-lobby__section-title">대결 유형 선택</h2>
            <div class="battle-lobby__types">
                <BattleTypeCard
                    v-for="bt in battleTypes"
                    :key="bt.type"
                    :type="bt.type"
                    :selected="selectedBattleType === bt.type"
                    @select="selectedBattleType = $event"
                />
            </div>
        </section>

        <!-- 대결 방식 선택 -->
        <section class="battle-lobby__section">
            <div class="battle-lobby__actions">
                <!-- 랜덤 매칭 -->
                <div class="battle-lobby__action">
                    <q-btn
                        color="primary"
                        class="battle-lobby__btn"
                        size="lg"
                        :loading="isCreating"
                        @click="startMatchmaking"
                    >
                        <q-icon name="casino" class="q-mr-sm" />
                        <span>랜덤 매칭</span>
                        <q-tooltip>비슷한 레벨의 상대와 자동 매칭</q-tooltip>
                    </q-btn>
                    <span class="battle-lobby__action-desc">비슷한 레벨 상대와 자동 매칭</span>
                </div>

                <!-- 친구 초대 -->
                <div class="battle-lobby__action">
                    <q-btn
                        color="secondary"
                        class="battle-lobby__btn"
                        size="lg"
                        :loading="isCreating"
                        @click="createRoom"
                    >
                        <q-icon name="link" class="q-mr-sm" />
                        <span>방 만들기</span>
                        <q-tooltip>초대 링크로 친구 초대</q-tooltip>
                    </q-btn>
                    <span class="battle-lobby__action-desc">초대 코드를 친구에게 공유</span>
                </div>

                <!-- 코드로 참가 -->
                <div class="battle-lobby__action">
                    <q-btn
                        color="dark"
                        class="battle-lobby__btn"
                        size="lg"
                        @click="showJoinDialog = true"
                    >
                        <q-icon name="group" class="q-mr-sm" />
                        <span>코드 입력</span>
                        <q-tooltip>초대 코드 입력하여 참가</q-tooltip>
                    </q-btn>
                    <span class="battle-lobby__action-desc">친구의 초대 코드로 참가</span>
                </div>
            </div>
        </section>

        <!-- 대결 기록 버튼 -->
        <div class="battle-lobby__history">
            <q-btn flat outline unelevated color="grey-7" size="large" @click="goToHistory">
                <q-icon name="history" class="q-mr-sm" />
                <span>대결 기록</span>
            </q-btn>
        </div>

        <!-- 초대 코드 입력 다이얼로그 -->
        <q-dialog v-model="showJoinDialog">
            <q-card class="battle-lobby__dialog">
                <q-card-section>
                    <h3 class="battle-lobby__dialog-title">초대 코드 입력</h3>
                </q-card-section>

                <q-card-section>
                    <q-input
                        v-model="roomCode"
                        label="초대 코드"
                        placeholder="예: ABC123"
                        outlined
                        autofocus
                        maxlength="6"
                        class="battle-lobby__code-input"
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

    // 헤더
    &__header {
        text-align: center;
        margin-bottom: $spacing-xxl;
    }

    &__title {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: $spacing-sm;
        font-size: $font-size-3xl;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 $spacing-sm;
    }

    &__title-icon {
        font-size: 1.6em;
    }

    &__subtitle {
        font-size: $font-size-base;
        color: var(--text-secondary);
        margin: 0;
    }

    // 섹션
    &__section {
        margin-bottom: $spacing-xxl;
    }

    &__section-title {
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 $spacing-md;
        text-align: center;
    }

    // 대결 유형 그리드
    &__types {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: $spacing-md;
    }

    // 액션 카드
    &__actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: $spacing-lg;
        padding: $spacing-lg;
        border-radius: $radius-lg;

        .body--light & {
            background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%);
            box-shadow: $shadow-md;
        }

        .body--dark & {
            background: linear-gradient(135deg, $dark-bg-secondary 0%, $dark-bg-card 100%);
        }
    }

    &__action {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: $spacing-sm;
        min-width: 150px;
    }

    &__btn {
        width: 100%;
        border-radius: $radius-md;
        font-weight: 600;
    }

    &__action-desc {
        font-size: $font-size-xs;
        color: var(--text-light);
        text-align: center;
    }

    // 대결 기록
    &__history {
        text-align: center;
    }

    // 다이얼로그
    &__dialog {
        min-width: 300px;
        background: var(--bg-card);
    }

    &__dialog-title {
        font-size: $font-size-lg;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0;
    }

    &__code-input {
        :deep(input) {
            text-transform: uppercase;
            font-size: $font-size-xl;
            letter-spacing: 4px;
            text-align: center;
            color: var(--text-primary);
        }

        :deep(.q-field__control) {
            border-radius: $radius-sm;
        }
    }
}

// 반응형
@media (max-width: 600px) {
    .battle-lobby {
        &__actions {
            flex-direction: column;
        }

        &__action {
            width: 100%;
        }
    }
}
</style>

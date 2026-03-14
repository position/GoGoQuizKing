<script setup lang="ts">
// 매칭 대기 화면 컴포넌트
interface Props {
    elapsedTime: number;
    maxTime?: number;
    battleType?: string;
}

const props = withDefaults(defineProps<Props>(), {
    maxTime: 30,
    battleType: '빠른 대결',
});

const emit = defineEmits<{
    (e: 'cancel'): void;
}>();

const progress = computed(() => Math.min((props.elapsedTime / props.maxTime) * 100, 100));

const statusText = computed(() => {
    if (props.elapsedTime < 10) {
        return '같은 레벨 상대 검색 중...';
    }
    if (props.elapsedTime < 20) {
        return '매칭 범위 확장 중...';
    }
    return '조금만 더 기다려주세요...';
});

const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};
</script>

<template>
    <div class="matchmaking">
        <!-- 애니메이션 아이콘 -->
        <div class="matchmaking__animation">
            <div class="matchmaking__pulse-ring"></div>
            <div class="matchmaking__pulse-ring matchmaking__pulse-ring--delay-1"></div>
            <div class="matchmaking__pulse-ring matchmaking__pulse-ring--delay-2"></div>
            <q-avatar size="100px" class="matchmaking__avatar">
                <q-icon name="person_search" size="50px" color="primary" />
            </q-avatar>
        </div>

        <!-- 상태 텍스트 -->
        <h2 class="matchmaking__title">상대를 찾고 있어요</h2>
        <p class="matchmaking__status">{{ statusText }}</p>

        <!-- 대결 유형 -->
        <q-chip color="primary" text-color="white" class="matchmaking__type">
            {{ battleType }}
        </q-chip>

        <!-- 경과 시간 -->
        <div class="matchmaking__time">
            <q-icon name="timer" />
            {{ formatTime(elapsedTime) }}
        </div>

        <!-- 프로그레스 바 -->
        <q-linear-progress
            :value="progress / 100"
            color="primary"
            size="10px"
            rounded
            stripe
            animation-speed="500"
            class="matchmaking__progress"
        />

        <!-- 취소 버튼 -->
        <q-btn
            label="매칭 취소"
            color="grey-6"
            outline
            size="large"
            class="matchmaking__cancel"
            @click="emit('cancel')"
        />

        <!-- 팁 -->
        <div class="matchmaking__tip">
            <q-icon name="lightbulb" color="warning" />
            <span>Tip: 매칭 중에도 다른 사람들이 당신을 찾고 있어요!</span>
        </div>
    </div>
</template>

<style scoped lang="scss">
.matchmaking {
    padding: $spacing-xxl $spacing-lg;
    max-width: 400px;
    margin: 0 auto;
    text-align: center;

    // 펄스 애니메이션 컨테이너
    &__animation {
        position: relative;
        width: 150px;
        height: 150px;
        margin: 0 auto $spacing-lg;
    }

    // 펄스 링
    &__pulse-ring {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100px;
        height: 100px;
        border: 3px solid $primary;
        border-radius: 50%;
        animation: pulse 2s ease-out infinite;
        opacity: 0;

        &--delay-1 {
            animation-delay: 0.5s;
        }

        &--delay-2 {
            animation-delay: 1s;
        }
    }

    // 중앙 아바타
    &__avatar {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        box-shadow: $shadow-lg;

        .body--light & {
            background: var(--bg-card);
        }

        .body--dark & {
            background: $dark-bg-surface;
        }
    }

    // 제목
    &__title {
        font-size: $font-size-xl;
        font-weight: 600;
        color: var(--text-primary);
        margin: $spacing-md 0 $spacing-sm;
    }

    // 상태 텍스트
    &__status {
        font-size: $font-size-base;
        color: var(--text-secondary);
        margin: 0 0 $spacing-lg;
    }

    // 대결 유형 칩
    &__type {
        margin-bottom: $spacing-md;
    }

    // 경과 시간
    &__time {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: $spacing-xs;
        font-size: $font-size-xl;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: $spacing-md;
    }

    // 프로그레스 바
    &__progress {
        max-width: 300px;
        margin: 0 auto $spacing-lg;
    }

    // 취소 버튼
    &__cancel {
        margin-top: $spacing-xl;
    }

    // 팁
    &__tip {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: $spacing-sm;
        margin-top: $spacing-xl;
        font-size: $font-size-xs;
        color: var(--text-light);
    }
}

@keyframes pulse {
    0% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 0.8;
    }

    100% {
        transform: translate(-50%, -50%) scale(2);
        opacity: 0;
    }
}
</style>

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
    <div class="matchmaking-waiting text-center">
        <!-- 애니메이션 아이콘 -->
        <div class="search-animation q-mb-lg">
            <div class="pulse-ring"></div>
            <div class="pulse-ring delay-1"></div>
            <div class="pulse-ring delay-2"></div>
            <q-avatar size="100px" class="avatar-center">
                <q-icon name="person_search" size="50px" color="primary" />
            </q-avatar>
        </div>

        <!-- 상태 텍스트 -->
        <div class="text-h5 q-mb-sm q-mt-md">상대를 찾고 있어요</div>
        <div class="text-subtitle1 text-grey-7 q-mb-lg">
            {{ statusText }}
        </div>

        <!-- 대결 유형 -->
        <q-chip color="primary" text-color="white" class="q-mb-md">
            {{ battleType }}
        </q-chip>

        <!-- 경과 시간 -->
        <div class="text-h6 q-mb-md">
            <q-icon name="timer" class="q-mr-xs" />
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
            class="q-mb-lg progress-bar"
        />

        <!-- 취소 버튼 -->
        <q-btn
            label="매칭 취소"
            color="grey-6"
            outline
            @click="emit('cancel')"
            size="large"
            class="q-mt-xl"
        />

        <!-- 팁 -->
        <div class="tips q-mt-xl">
            <q-icon name="lightbulb" color="warning" class="q-mr-sm" />
            <span class="text-caption text-grey-7">
                Tip: 매칭 중에도 다른 사람들이 당신을 찾고 있어요!
            </span>
        </div>
    </div>
</template>

<style scoped lang="scss">
.matchmaking-waiting {
    padding: 40px 20px;
    max-width: 400px;
    margin: 0 auto;

    .search-animation {
        position: relative;
        width: 150px;
        height: 150px;
        margin: 0 auto;

        .pulse-ring {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 100px;
            height: 100px;
            border: 3px solid var(--q-primary);
            border-radius: 50%;
            animation: pulse 2s ease-out infinite;
            opacity: 0;

            &.delay-1 {
                animation-delay: 0.5s;
            }

            &.delay-2 {
                animation-delay: 1s;
            }
        }

        .avatar-center {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--bg-card);
            box-shadow: 0 4px 20px var(--shadow-color);
        }
    }

    .progress-bar {
        max-width: 300px;
        margin: 0 auto;
    }

    .tips {
        display: flex;
        align-items: center;
        justify-content: center;
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

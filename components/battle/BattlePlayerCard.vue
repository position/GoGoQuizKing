<script setup lang="ts">
// 플레이어 프로필 카드 (대결용)
interface Props {
    userId: string;
    name: string;
    avatarUrl: string | null;
    level: number;
    score?: number;
    answers?: { is_correct: boolean }[];
    isCurrentUser?: boolean;
    isWinner?: boolean;
    showScore?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    score: 0,
    answers: () => [],
    isCurrentUser: false,
    isWinner: false,
    showScore: true,
});

const displayName = computed(() => props.name || 'Unknown');

const correctCount = computed(() => 
    props.answers.filter(a => a.is_correct).length
);
</script>

<template>
    <q-card
        :class="[
            'player-card',
            { 'player-card--current': isCurrentUser },
            { 'player-card--winner': isWinner },
        ]"
        flat
    >
        <q-card-section class="text-center q-py-md">
            <!-- 승자 왕관 -->
            <div v-if="isWinner" class="winner-crown text-h4 q-mb-xs">👑</div>

            <!-- 아바타 -->
            <q-avatar size="64px" class="q-mb-sm">
                <q-img
                    v-if="avatarUrl"
                    :src="avatarUrl"
                    spinner-color="primary"
                />
                <q-icon v-else name="person" size="32px" color="grey-5" />
            </q-avatar>

            <!-- 이름 -->
            <div class="text-subtitle1 text-weight-bold ellipsis">
                {{ isCurrentUser ? '나' : displayName }}
            </div>

            <!-- 레벨 -->
            <q-badge
                :color="isCurrentUser ? 'primary' : 'grey-6'"
                class="q-mt-xs"
            >
                Lv.{{ level }}
            </q-badge>

            <!-- 점수 -->
            <div v-if="showScore" class="text-h5 text-weight-bold q-mt-md" :class="isWinner ? 'text-positive' : ''">
                {{ score }}점
            </div>

            <!-- 정답 표시 -->
            <div v-if="answers.length > 0" class="answer-indicators q-mt-sm">
                <span
                    v-for="(answer, index) in answers"
                    :key="index"
                    :class="answer.is_correct ? 'text-positive' : 'text-negative'"
                    class="q-mx-xs"
                >
                    {{ answer.is_correct ? '⭕' : '❌' }}
                </span>
            </div>
        </q-card-section>
    </q-card>
</template>

<style scoped lang="scss">
.player-card {
    background: white;
    border-radius: 12px;
    min-width: 140px;
    transition: all 0.3s ease;

    &--current {
        background: linear-gradient(135deg, #e8f4f8 0%, #fff 100%);
        border: 2px solid var(--q-primary);
    }

    &--winner {
        background: linear-gradient(135deg, #fff9e6 0%, #fff 100%);
        border: 2px solid #f7b32b;
    }
}

.winner-crown {
    animation: bounce 0.5s ease infinite alternate;
}

@keyframes bounce {
    from {
        transform: translateY(0);
    }
    to {
        transform: translateY(-4px);
    }
}

.answer-indicators {
    font-size: 16px;
    letter-spacing: 2px;
}
</style>

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
        <q-card-section class="player-card__content">
            <!-- 승자 왕관 -->
            <div v-if="isWinner" class="player-card__crown">👑</div>

            <!-- 아바타 -->
            <q-avatar size="64px" class="player-card__avatar">
                <q-img v-if="avatarUrl" :src="avatarUrl" spinner-color="primary" />
                <q-icon v-else name="person" size="32px" color="grey-5" />
            </q-avatar>

            <!-- 이름 -->
            <div class="player-card__name">
                {{ isCurrentUser ? '나' : displayName }}
            </div>

            <!-- 레벨 -->
            <q-badge :color="isCurrentUser ? 'primary' : 'grey-6'" class="player-card__level">
                Lv.{{ level }}
            </q-badge>

            <!-- 점수 -->
            <div
                v-if="showScore"
                :class="['player-card__score', { 'player-card__score--winner': isWinner }]"
            >
                {{ score }}점
            </div>

            <!-- 정답 표시 -->
            <div v-if="answers.length > 0" class="player-card__answers">
                <span
                    v-for="(answer, index) in answers"
                    :key="index"
                    :class="[
                        'player-card__answer-icon',
                        answer.is_correct ? 'player-card__answer-icon--correct' : 'player-card__answer-icon--wrong',
                    ]"
                >
                    {{ answer.is_correct ? '⭕' : '❌' }}
                </span>
            </div>
        </q-card-section>
    </q-card>
</template>

<style scoped lang="scss">
.player-card {
    border-radius: $radius-md;
    min-width: 140px;
    transition: all $transition-normal;
    background: var(--bg-card);
    border: 1px solid var(--border-color);

    // 현재 사용자 카드
    &--current {
        border: 2px solid $primary;

        .body--light & {
            background: linear-gradient(135deg, rgba($primary, 0.08) 0%, var(--bg-card) 100%);
        }

        .body--dark & {
            background: linear-gradient(135deg, rgba($primary, 0.15) 0%, var(--bg-card) 100%);
        }
    }

    // 승자 카드
    &--winner {
        border: 2px solid $warning;

        .body--light & {
            background: linear-gradient(135deg, rgba($warning, 0.1) 0%, var(--bg-card) 100%);
        }

        .body--dark & {
            background: linear-gradient(135deg, rgba($warning, 0.15) 0%, var(--bg-card) 100%);
        }
    }

    // 내부 컨텐츠
    &__content {
        text-align: center;
        padding: $spacing-md;
    }

    // 승자 왕관
    &__crown {
        font-size: $font-size-3xl;
        margin-bottom: $spacing-xs;
        animation: bounce 0.5s ease infinite alternate;
    }

    // 아바타
    &__avatar {
        margin-bottom: $spacing-sm;

        .body--dark & {
            background: $dark-bg-surface;
        }
    }

    // 이름
    &__name {
        font-size: $font-size-base;
        font-weight: 600;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    // 레벨 배지
    &__level {
        margin-top: $spacing-xs;
    }

    // 점수
    &__score {
        font-size: $font-size-xl;
        font-weight: 700;
        margin-top: $spacing-md;
        color: var(--text-primary);

        &--winner {
            color: $success;
        }
    }

    // 정답 표시
    &__answers {
        margin-top: $spacing-sm;
        display: flex;
        justify-content: center;
        gap: $spacing-xs;
    }

    &__answer-icon {
        font-size: $font-size-base;

        &--correct {
            color: $success;
        }

        &--wrong {
            color: $negative;
        }
    }
}

@keyframes bounce {
    from {
        transform: translateY(0);
    }
    to {
        transform: translateY(-4px);
    }
}
</style>

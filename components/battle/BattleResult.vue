<script setup lang="ts">
// 대결 결과 표시 컴포넌트
import type { IBattleResult } from '~/models/battle';

interface Props {
    result: IBattleResult;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    (e: 'rematch'): void;
    (e: 'goHome'): void;
}>();

const resultType = computed(() => {
    if (props.result.is_draw) {
        return 'draw';
    }
    return props.result.is_winner ? 'win' : 'lose';
});

const resultTitle = computed(() => {
    if (props.result.is_draw) {
        return '🤝 무승부!';
    }
    return props.result.is_winner ? '🏆 승리!' : '😢 패배';
});

const accuracy = computed(() => {
    if (props.result.total_questions === 0) {
        return 0;
    }
    return Math.round((props.result.my_correct_count / props.result.total_questions) * 100);
});
</script>

<template>
    <div class="battle-result">
        <!-- 결과 헤더 -->
        <div :class="['battle-result__header', `battle-result__header--${resultType}`]">
            <h1 class="battle-result__title">{{ resultTitle }}</h1>
            <p class="battle-result__subtitle">대결이 종료되었습니다</p>
        </div>

        <!-- 점수 비교 -->
        <div class="battle-result__comparison">
            <div class="battle-result__player">
                <q-avatar size="60px" class="battle-result__avatar">
                    <q-icon name="person" size="30px" />
                </q-avatar>
                <span class="battle-result__player-name">나</span>
                <span class="battle-result__player-score battle-result__player-score--me">
                    {{ result.my_score }}점
                </span>
                <span class="battle-result__player-correct">
                    {{ result.my_correct_count }}/{{ result.total_questions }} 정답
                </span>
            </div>

            <div class="battle-result__vs">VS</div>

            <div class="battle-result__player">
                <q-avatar size="60px" class="battle-result__avatar">
                    <q-img v-if="result.opponent.avatar_url" :src="result.opponent.avatar_url" />
                    <q-icon v-else name="person" size="30px" />
                </q-avatar>
                <span class="battle-result__player-name">{{ result.opponent.name }}</span>
                <span class="battle-result__player-score">
                    {{ result.opponent_score }}점
                </span>
                <span class="battle-result__player-correct">
                    {{ result.opponent_correct_count }}/{{ result.total_questions }} 정답
                </span>
            </div>
        </div>

        <!-- 상세 결과 -->
        <div class="battle-result__details">
            <h2 class="battle-result__section-title">📊 상세 결과</h2>
            <div class="battle-result__stat">
                <q-icon name="check_circle" color="positive" size="24px" />
                <span class="battle-result__stat-label">정답률</span>
                <span class="battle-result__stat-value">{{ accuracy }}%</span>
            </div>
        </div>

        <!-- 획득 보상 -->
        <div class="battle-result__rewards">
            <h2 class="battle-result__section-title">🎁 획득 보상</h2>
            <div class="battle-result__rewards-grid">
                <div class="battle-result__reward">
                    <span class="battle-result__reward-icon">💰</span>
                    <span class="battle-result__reward-value battle-result__reward-value--positive">
                        +{{ result.reward.points_earned }}
                    </span>
                    <span class="battle-result__reward-label">포인트</span>
                </div>
                <div v-if="result.reward.ranking_points_earned !== 0" class="battle-result__reward">
                    <span class="battle-result__reward-icon">📈</span>
                    <span
                        :class="[
                            'battle-result__reward-value',
                            result.reward.ranking_points_earned > 0
                                ? 'battle-result__reward-value--positive'
                                : 'battle-result__reward-value--negative',
                        ]"
                    >
                        {{ result.reward.ranking_points_earned > 0 ? '+' : ''
                        }}{{ result.reward.ranking_points_earned }}
                    </span>
                    <span class="battle-result__reward-label">랭킹 포인트</span>
                </div>
            </div>
        </div>

        <!-- 획득 뱃지 -->
        <div
            v-if="result.reward.badges_earned && result.reward.badges_earned.length > 0"
            class="battle-result__badges"
        >
            <h2 class="battle-result__section-title">🏅 새 뱃지 획득!</h2>
            <div class="battle-result__badges-list">
                <q-chip
                    v-for="badge in result.reward.badges_earned"
                    :key="badge.badge_id"
                    color="amber"
                    text-color="white"
                    size="lg"
                >
                    {{ badge.badge_icon }} {{ badge.badge_name }}
                </q-chip>
            </div>
        </div>

        <!-- 버튼 -->
        <div class="battle-result__actions">
            <q-btn
                label="재대결"
                color="primary"
                size="lg"
                class="battle-result__btn"
                @click="emit('rematch')"
            />
            <q-btn
                label="홈으로"
                color="grey-6"
                outline
                size="lg"
                class="battle-result__btn"
                @click="emit('goHome')"
            />
        </div>
    </div>
</template>

<style scoped lang="scss">
.battle-result {
    min-height: 100vh;

    .body--light & {
        background: $bg-secondary;
    }

    .body--dark & {
        background: $dark-bg-primary;
    }

    // 결과 헤더
    &__header {
        padding: 60px $spacing-lg 80px;
        text-align: center;
        color: #fff;

        &--win {
            background: linear-gradient(135deg, $success 0%, #4ecdc4 100%);
        }

        &--lose {
            background: linear-gradient(135deg, $negative 0%, #ff8e8e 100%);
        }

        &--draw {
            background: linear-gradient(135deg, $info 0%, #74d4e8 100%);
        }
    }

    &__title {
        font-size: $font-size-4xl;
        font-weight: 700;
        margin: 0 0 $spacing-sm;
    }

    &__subtitle {
        font-size: $font-size-lg;
        opacity: 0.9;
        margin: 0;
    }

    // 점수 비교 카드
    &__comparison {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: $spacing-lg;
        margin: -40px $spacing-md 0;
        border-radius: $radius-lg;
        background: var(--bg-card);
        box-shadow: $shadow-lg;
    }

    &__player {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    &__avatar {
        margin-bottom: $spacing-sm;

        .body--dark & {
            background: $dark-bg-surface;
        }
    }

    &__player-name {
        font-size: $font-size-sm;
        color: var(--text-secondary);
        margin-bottom: $spacing-xs;
    }

    &__player-score {
        font-size: $font-size-2xl;
        font-weight: 700;
        color: var(--text-secondary);

        &--me {
            color: $primary;
        }
    }

    &__player-correct {
        font-size: $font-size-xs;
        color: var(--text-light);
    }

    &__vs {
        padding: $spacing-sm $spacing-md;
        border-radius: $radius-full;
        background: linear-gradient(135deg, $negative, #ff8e8e);
        color: #fff;
        font-weight: 700;
        font-size: $font-size-sm;
    }

    // 섹션 제목
    &__section-title {
        font-size: $font-size-base;
        font-weight: 600;
        margin: 0 0 $spacing-md;
        color: var(--text-primary);
    }

    // 상세 결과
    &__details {
        margin: $spacing-md;
        padding: $spacing-md;
        border-radius: $radius-md;
        background: var(--bg-card);
    }

    &__stat {
        display: flex;
        align-items: center;
        gap: $spacing-md;
    }

    &__stat-label {
        flex: 1;
        color: var(--text-secondary);
    }

    &__stat-value {
        font-weight: 700;
        color: var(--text-primary);
    }

    // 보상
    &__rewards {
        margin: $spacing-md;
        padding: $spacing-md;
        border-radius: $radius-md;

        .body--light & {
            background: linear-gradient(135deg, #fff9e6 0%, #fff 100%);
        }

        .body--dark & {
            background: linear-gradient(135deg, rgba($warning, 0.15) 0%, $dark-bg-card 100%);
        }
    }

    &__rewards-grid {
        display: flex;
        gap: $spacing-lg;
    }

    &__reward {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    &__reward-icon {
        font-size: $font-size-3xl;
        margin-bottom: $spacing-sm;
    }

    &__reward-value {
        font-size: $font-size-xl;
        font-weight: 700;

        &--positive {
            color: $success;
        }

        &--negative {
            color: $negative;
        }
    }

    &__reward-label {
        font-size: $font-size-xs;
        color: var(--text-light);
    }

    // 뱃지
    &__badges {
        margin: $spacing-md;
        padding: $spacing-md;
        border-radius: $radius-md;
        background: var(--bg-card);
    }

    &__badges-list {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: $spacing-sm;
    }

    // 액션 버튼
    &__actions {
        display: flex;
        gap: $spacing-md;
        padding: $spacing-lg;
    }

    &__btn {
        flex: 1;
    }
}
</style>

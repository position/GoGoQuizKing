<script setup lang="ts">
// 대결 기록 아이템 컴포넌트
import type { IBattleHistoryWithOpponent } from '~/models/battle';
import { BATTLE_RESULTS } from '~/models/battle';

interface Props {
    history: IBattleHistoryWithOpponent;
}

const props = defineProps<Props>();

const dayjs = useDayjs();

const resultInfo = computed(() => BATTLE_RESULTS[props.history.result]);

const timeAgo = computed(() => dayjs(props.history.created_at).fromNow());

const accuracy = computed(() => {
    if (props.history.total_questions === 0) {
        return 0;
    }
    return Math.round((props.history.correct_count / props.history.total_questions) * 100);
});
</script>

<template>
    <div class="history-item">
        <!-- 결과 아이콘 -->
        <div :class="['badge', `is-${history.result}`]">
            {{ resultInfo.icon }}
        </div>

        <!-- 상대 정보 -->
        <div class="info">
            <span class="opponent">vs {{ history.opponent_name }}</span>
            <span class="score">
                {{ history.my_score }}점 : {{ history.opponent_score }}점
                <span class="correct">
                    ({{ history.correct_count }}/{{ history.total_questions }} 정답)
                </span>
            </span>
        </div>

        <!-- 보상 정보 -->
        <div class="reward">
            <span class="points">+{{ history.points_earned }}P</span>
            <span class="time">{{ timeAgo }}</span>
        </div>
    </div>
</template>

<style scoped lang="scss">
.history-item {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-md;
    border-radius: $radius-md;
    margin-bottom: $spacing-sm;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    transition: all $transition-fast;

    &:hover {
        transform: translateX(4px);
    }

    // 결과 배지
    .badge {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: $font-size-2xl;
        flex-shrink: 0;

        &.is-win {
            background: linear-gradient(135deg, $success 0%, #4ecdc4 100%);
        }

        &.is-lose {
            background: linear-gradient(135deg, $negative 0%, #ff8e8e 100%);
        }

        &.is-draw {
            background: linear-gradient(135deg, $info 0%, #74d4e8 100%);
        }
    }

    // 정보 영역
    .info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: $spacing-xs;
        min-width: 0;

        .opponent {
            font-weight: 600;
            color: var(--text-primary);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .score {
            font-size: $font-size-sm;
            color: var(--text-secondary);
        }

        .correct {
            color: var(--text-light);
            margin-left: $spacing-sm;
        }
    }

    // 보상 영역
    .reward {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: $spacing-xs;
        flex-shrink: 0;

        .points {
            font-weight: 700;
            color: $success;
        }

        .time {
            font-size: $font-size-xs;
            color: var(--text-light);
        }
    }
}
</style>

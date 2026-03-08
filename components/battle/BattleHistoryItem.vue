<script setup lang="ts">
// 대결 기록 아이템 컴포넌트
import type { IBattleHistoryWithOpponent } from '~/models/battle';
import { BATTLE_RESULTS } from '~/models/battle';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';

dayjs.extend(relativeTime);
dayjs.locale('ko');

interface Props {
    history: IBattleHistoryWithOpponent;
}

const props = defineProps<Props>();

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
    <q-item class="history-item">
        <!-- 결과 아이콘 -->
        <q-item-section avatar>
            <div
                :class="['result-badge', `result-badge--${history.result}`]"
            >
                {{ resultInfo.icon }}
            </div>
        </q-item-section>

        <!-- 상대 정보 -->
        <q-item-section>
            <q-item-label class="text-weight-bold">
                vs {{ history.opponent_name }}
            </q-item-label>
            <q-item-label caption>
                {{ history.my_score }}점 : {{ history.opponent_score }}점
                <span class="text-grey-6 q-ml-sm">
                    ({{ history.correct_count }}/{{ history.total_questions }} 정답)
                </span>
            </q-item-label>
        </q-item-section>

        <!-- 보상 정보 -->
        <q-item-section side>
            <q-item-label class="text-right">
                <span class="text-positive text-weight-bold">
                    +{{ history.points_earned }}P
                </span>
            </q-item-label>
            <q-item-label caption>
                {{ timeAgo }}
            </q-item-label>
        </q-item-section>
    </q-item>
</template>

<style scoped lang="scss">
.history-item {
    background: white;
    border-radius: 12px;
    margin-bottom: 8px;
}

.result-badge {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;

    &--win {
        background: linear-gradient(135deg, #95e77e 0%, #4ecdc4 100%);
    }

    &--lose {
        background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
    }

    &--draw {
        background: linear-gradient(135deg, #45b7d1 0%, #74d4e8 100%);
    }
}
</style>

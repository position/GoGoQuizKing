<script setup lang="ts">
// 대결 결과 표시 컴포넌트
import type { IBattleResult } from '~/models/battle';
import { BATTLE_RESULTS } from '~/models/battle';

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

const resultInfo = computed(() => BATTLE_RESULTS[resultType.value]);

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
        <div
            :class="['result-header', `result-header--${resultType}`]"
            class="text-center q-py-xl"
        >
            <div class="text-h3 q-mb-sm">{{ resultTitle }}</div>
            <div class="text-h6 text-white-7">대결이 종료되었습니다</div>
        </div>

        <!-- 점수 비교 -->
        <q-card flat class="score-comparison q-mx-md q-mt-n5">
            <q-card-section>
                <div class="row items-center justify-between">
                    <!-- 나 -->
                    <div class="col text-center">
                        <q-avatar size="60px" class="q-mb-sm">
                            <q-icon name="person" size="30px" />
                        </q-avatar>
                        <div class="text-subtitle2">나</div>
                        <div class="text-h4 text-weight-bold text-primary">
                            {{ result.my_score }}점
                        </div>
                        <div class="text-caption text-grey-7">
                            {{ result.my_correct_count }}/{{ result.total_questions }} 정답
                        </div>
                    </div>

                    <!-- VS -->
                    <div class="col-auto">
                        <div class="vs-badge">VS</div>
                    </div>

                    <!-- 상대 -->
                    <div class="col text-center">
                        <q-avatar size="60px" class="q-mb-sm">
                            <q-img
                                v-if="result.opponent.avatar_url"
                                :src="result.opponent.avatar_url"
                            />
                            <q-icon v-else name="person" size="30px" />
                        </q-avatar>
                        <div class="text-subtitle2">{{ result.opponent.name }}</div>
                        <div class="text-h4 text-weight-bold text-grey-7">
                            {{ result.opponent_score }}점
                        </div>
                        <div class="text-caption text-grey-7">
                            {{ result.opponent_correct_count }}/{{ result.total_questions }} 정답
                        </div>
                    </div>
                </div>
            </q-card-section>
        </q-card>

        <!-- 상세 결과 -->
        <q-card flat class="q-mx-md q-mt-md">
            <q-card-section>
                <div class="text-subtitle1 text-weight-bold q-mb-md">
                    📊 상세 결과
                </div>
                <q-list>
                    <q-item>
                        <q-item-section avatar>
                            <q-icon name="check_circle" color="positive" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>정답률</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                            <q-item-label class="text-weight-bold">
                                {{ accuracy }}%
                            </q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>
            </q-card-section>
        </q-card>

        <!-- 획득 보상 -->
        <q-card flat class="q-mx-md q-mt-md reward-card">
            <q-card-section>
                <div class="text-subtitle1 text-weight-bold q-mb-md">
                    🎁 획득 보상
                </div>
                <div class="row q-gutter-md">
                    <div class="col text-center">
                        <div class="reward-icon">💰</div>
                        <div class="text-h6 text-weight-bold text-positive">
                            +{{ result.reward.points_earned }}
                        </div>
                        <div class="text-caption">포인트</div>
                    </div>
                    <div v-if="result.reward.ranking_points_earned !== 0" class="col text-center">
                        <div class="reward-icon">📈</div>
                        <div
                            class="text-h6 text-weight-bold"
                            :class="result.reward.ranking_points_earned > 0 ? 'text-positive' : 'text-negative'"
                        >
                            {{ result.reward.ranking_points_earned > 0 ? '+' : '' }}{{ result.reward.ranking_points_earned }}
                        </div>
                        <div class="text-caption">랭킹 포인트</div>
                    </div>
                </div>
            </q-card-section>
        </q-card>

        <!-- 획득 뱃지 -->
        <q-card v-if="result.reward.badges_earned && result.reward.badges_earned.length > 0" flat class="q-mx-md q-mt-md">
            <q-card-section>
                <div class="text-subtitle1 text-weight-bold q-mb-md">
                    🏅 새 뱃지 획득!
                </div>
                <div class="row q-gutter-sm justify-center">
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
            </q-card-section>
        </q-card>

        <!-- 버튼 -->
        <div class="q-pa-md q-mt-md">
            <div class="row q-gutter-md">
                <q-btn
                    label="재대결"
                    color="primary"
                    class="col"
                    size="lg"
                    @click="emit('rematch')"
                />
                <q-btn
                    label="홈으로"
                    color="grey-6"
                    outline
                    class="col"
                    size="lg"
                    @click="emit('goHome')"
                />
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.battle-result {
    min-height: 100vh;
    background: #f5f5f5;
}

.result-header {
    padding-top: 60px;
    padding-bottom: 80px;

    &--win {
        background: linear-gradient(135deg, #95e77e 0%, #4ecdc4 100%);
        color: white;
    }

    &--lose {
        background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
        color: white;
    }

    &--draw {
        background: linear-gradient(135deg, #45b7d1 0%, #74d4e8 100%);
        color: white;
    }
}

.score-comparison {
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.vs-badge {
    background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-weight: bold;
    font-size: 14px;
}

.reward-card {
    background: linear-gradient(135deg, #fff9e6 0%, #fff 100%);
}

.reward-icon {
    font-size: 32px;
    margin-bottom: 8px;
}
</style>

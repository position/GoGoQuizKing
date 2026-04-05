<script setup lang="ts">
// 대결 결과 표시 컴포넌트
import type { IBattleResult } from '~/models/battle';
import { useQuizShare } from '~/composables/use-quiz-share';

interface Props {
    result: IBattleResult;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    (e: 'rematch'): void;
    (e: 'goHome'): void;
}>();

const { isNativeShareSupported } = useQuizShare();
const showShareDialog = ref(false);

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

async function handleShare() {
    const { shareResult } = useQuizShare();

    if (isNativeShareSupported.value) {
        await shareResult({
            title: `퀴즈 대결 ${resultType.value === 'win' ? '승리' : resultType.value === 'draw' ? '무승부' : '결과'}`,
            score: props.result.my_correct_count,
            totalQuestions: props.result.total_questions,
            quizId: props.result.room_id || '',
        });
    } else {
        showShareDialog.value = true;
    }
}
</script>

<template>
    <div class="battle-result">
        <!-- 결과 헤더 -->
        <div :class="['header', `is-${resultType}`]">
            <h1 class="title">{{ resultTitle }}</h1>
            <p class="subtitle">대결이 종료되었습니다</p>
        </div>

        <!-- 점수 비교 -->
        <div class="comparison">
            <div class="player">
                <q-avatar size="60px" class="avatar">
                    <q-icon name="person" size="30px" />
                </q-avatar>
                <span class="player-name">나</span>
                <span class="player-score is-me">
                    {{ result.my_score }}점
                </span>
                <span class="player-correct">
                    {{ result.my_correct_count }}/{{ result.total_questions }} 정답
                </span>
            </div>

            <div class="vs">VS</div>

            <div class="player">
                <q-avatar size="60px" class="avatar">
                    <q-img v-if="result.opponent.avatar_url" :src="result.opponent.avatar_url" />
                    <q-icon v-else name="person" size="30px" />
                </q-avatar>
                <span class="player-name">{{ result.opponent.name }}</span>
                <span class="player-score"> {{ result.opponent_score }}점 </span>
                <span class="player-correct">
                    {{ result.opponent_correct_count }}/{{ result.total_questions }} 정답
                </span>
            </div>
        </div>

        <!-- 상세 결과 -->
        <div class="details">
            <h2 class="section-title">📊 상세 결과</h2>
            <div class="stat">
                <q-icon name="check_circle" color="positive" size="24px" />
                <span class="stat-label">정답률</span>
                <span class="stat-value">{{ accuracy }}%</span>
            </div>
        </div>

        <!-- 획득 보상 -->
        <div class="rewards">
            <h2 class="section-title">🎁 획득 보상</h2>
            <div class="rewards-grid">
                <div class="reward">
                    <span class="reward-icon">💰</span>
                    <span class="reward-value is-positive">
                        +{{ result.reward.points_earned }}
                    </span>
                    <span class="reward-label">포인트</span>
                </div>
                <div v-if="result.reward.ranking_points_earned !== 0" class="reward">
                    <span class="reward-icon">📈</span>
                    <span
                        :class="[
                            'reward-value',
                            result.reward.ranking_points_earned > 0 ? 'is-positive' : 'is-negative',
                        ]"
                    >
                        {{ result.reward.ranking_points_earned > 0 ? '+' : ''
                        }}{{ result.reward.ranking_points_earned }}
                    </span>
                    <span class="reward-label">랭킹 포인트</span>
                </div>
            </div>
        </div>

        <!-- 획득 뱃지 -->
        <div
            v-if="result.reward.badges_earned && result.reward.badges_earned.length > 0"
            class="badges"
        >
            <h2 class="section-title">🏅 새 뱃지 획득!</h2>
            <div class="badges-list">
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
        <div class="actions">
            <q-btn
                label="재대결"
                color="primary"
                size="lg"
                class="btn"
                @click="emit('rematch')"
            />
            <q-btn
                label="결과 공유"
                icon="share"
                color="secondary"
                outline
                size="lg"
                class="btn"
                @click="handleShare"
            />
            <q-btn
                label="홈으로"
                color="grey-6"
                outline
                size="lg"
                class="btn"
                @click="emit('goHome')"
            />
        </div>

        <!-- 공유 다이얼로그 (데스크탑 폴백) -->
        <QuizShareDialog
            v-model="showShareDialog"
            :quiz-id="result.room_id || ''"
            :title="`퀴즈 대결 결과 - ${result.my_score}점`"
        />
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
    .header {
        padding: 60px $spacing-lg 80px;
        text-align: center;
        color: #fff;

        &.is-win {
            background: linear-gradient(135deg, $success 0%, #4ecdc4 100%);
        }

        &.is-lose {
            background: linear-gradient(135deg, $negative 0%, #ff8e8e 100%);
        }

        &.is-draw {
            background: linear-gradient(135deg, $info 0%, #74d4e8 100%);
        }

        .title {
            font-size: $font-size-4xl;
            font-weight: 700;
            margin: 0 0 $spacing-sm;
        }

        .subtitle {
            font-size: $font-size-lg;
            opacity: 0.9;
            margin: 0;
        }
    }

    // 점수 비교 카드
    .comparison {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: $spacing-lg;
        margin: -40px $spacing-md 0;
        border-radius: $radius-lg;
        background: var(--bg-card);
        box-shadow: $shadow-lg;

        .player {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;

            .avatar {
                margin-bottom: $spacing-sm;

                .body--dark & {
                    background: $dark-bg-surface;
                }
            }

            .player-name {
                font-size: $font-size-sm;
                color: var(--text-secondary);
                margin-bottom: $spacing-xs;
            }

            .player-score {
                font-size: $font-size-2xl;
                font-weight: 700;
                color: var(--text-secondary);

                &.is-me {
                    color: $primary;
                }
            }

            .player-correct {
                font-size: $font-size-xs;
                color: var(--text-light);
            }
        }

        .vs {
            padding: $spacing-sm $spacing-md;
            border-radius: $radius-full;
            background: linear-gradient(135deg, $negative, #ff8e8e);
            color: #fff;
            font-weight: 700;
            font-size: $font-size-sm;
        }
    }

    // 섹션 제목
    .section-title {
        font-size: $font-size-base;
        font-weight: 600;
        margin: 0 0 $spacing-md;
        color: var(--text-primary);
    }

    // 상세 결과
    .details {
        margin: $spacing-md;
        padding: $spacing-md;
        border-radius: $radius-md;
        background: var(--bg-card);

        .stat {
            display: flex;
            align-items: center;
            gap: $spacing-md;

            .stat-label {
                flex: 1;
                color: var(--text-secondary);
            }

            .stat-value {
                font-weight: 700;
                color: var(--text-primary);
            }
        }
    }

    // 보상
    .rewards {
        margin: $spacing-md;
        padding: $spacing-md;
        border-radius: $radius-md;

        .body--light & {
            background: linear-gradient(135deg, #fff9e6 0%, #fff 100%);
        }

        .body--dark & {
            background: linear-gradient(135deg, rgba($warning, 0.15) 0%, $dark-bg-card 100%);
        }

        .rewards-grid {
            display: flex;
            gap: $spacing-lg;
        }

        .reward {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;

            .reward-icon {
                font-size: $font-size-3xl;
                margin-bottom: $spacing-sm;
            }

            .reward-value {
                font-size: $font-size-xl;
                font-weight: 700;

                &.is-positive {
                    color: $success;
                }

                &.is-negative {
                    color: $negative;
                }
            }

            .reward-label {
                font-size: $font-size-xs;
                color: var(--text-light);
            }
        }
    }

    // 뱃지
    .badges {
        margin: $spacing-md;
        padding: $spacing-md;
        border-radius: $radius-md;
        background: var(--bg-card);

        .badges-list {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: $spacing-sm;
        }
    }

    // 액션 버튼
    .actions {
        display: flex;
        gap: $spacing-md;
        padding: $spacing-lg;

        .btn {
            flex: 1;
            padding: 5px 10px;
        }
    }
}
</style>

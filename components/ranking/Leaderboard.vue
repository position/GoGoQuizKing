<template>
    <div class="leaderboard">
        <!-- TOP 3 섹션 -->
        <div v-if="showTopThree && topThree.length > 0" class="top-three-section">
            <h3 class="section-title">🏆 TOP 3</h3>
            <div class="top-three-grid">
                <!-- 2등 (왼쪽) -->
                <div v-if="topThree[1]" class="top-card rank-2">
                    <div class="medal">🥈</div>
                    <q-avatar size="56px" class="user-avatar">
                        <img v-if="topThree[1].avatar_url" :src="topThree[1].avatar_url" alt="avatar" />
                        <span v-else class="avatar-placeholder">{{
                            getInitial(topThree[1])
                        }}</span>
                    </q-avatar>
                    <span class="user-name">{{ getDisplayName(topThree[1]) }}</span>
                    <LevelBadge :level="topThree[1].level" />
                    <span class="points">{{ formatPoints(topThree[1]) }}</span>
                </div>

                <!-- 1등 (가운데, 강조) -->
                <div v-if="topThree[0]" class="top-card rank-1">
                    <div class="crown">👑</div>
                    <div class="medal">🥇</div>
                    <q-avatar size="72px" class="user-avatar">
                        <img v-if="topThree[0].avatar_url" :src="topThree[0].avatar_url" alt="avatar" />
                        <span v-else class="avatar-placeholder">{{
                            getInitial(topThree[0])
                        }}</span>
                    </q-avatar>
                    <span class="user-name">{{ getDisplayName(topThree[0]) }}</span>
                    <LevelBadge :level="topThree[0].level" />
                    <span class="points">{{ formatPoints(topThree[0]) }}</span>
                </div>

                <!-- 3등 (오른쪽) -->
                <div v-if="topThree[2]" class="top-card rank-3">
                    <div class="medal">🥉</div>
                    <q-avatar size="56px" class="user-avatar">
                        <img v-if="topThree[2].avatar_url" :src="topThree[2].avatar_url" alt="avatar" />
                        <span v-else class="avatar-placeholder">{{
                            getInitial(topThree[2])
                        }}</span>
                    </q-avatar>
                    <span class="user-name">{{ getDisplayName(topThree[2]) }}</span>
                    <LevelBadge :level="topThree[2].level" />
                    <span class="points">{{ formatPoints(topThree[2]) }}</span>
                </div>
            </div>
        </div>

        <!-- 나머지 랭킹 리스트 -->
        <div class="ranking-list-section">
            <h3 v-if="showTopThree && restRankings.length > 0" class="section-title">📋 전체 순위</h3>

            <div v-if="loading" class="loading-state">
                <q-spinner-dots color="primary" size="40px" />
                <span>랭킹을 불러오는 중...</span>
            </div>

            <div v-else-if="displayRankings.length === 0" class="empty-state">
                <span class="empty-icon">📊</span>
                <span class="empty-title">아직 랭킹 데이터가 없어요</span>
                <span class="empty-description">퀴즈를 풀어서 첫 번째 랭커가 되어보세요!</span>
            </div>

            <div v-else class="ranking-list">
                <RankingCard
                    v-for="entry in displayRankings"
                    :key="entry.user_id"
                    :entry="entry"
                    :current-user-id="currentUserId"
                    :type="type"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { RankingEntry, CategoryRankingEntry, QuizAttemptRankingEntry, RankingType } from '@/models/ranking';
import { getDisplayName as getDisplayNameUtil } from '@/models/ranking';
import { LevelBadge } from '@/components/point';
import RankingCard from './RankingCard.vue';

type AnyRankingEntry = RankingEntry | CategoryRankingEntry | QuizAttemptRankingEntry;

interface Props {
    rankings: AnyRankingEntry[];
    currentUserId?: string;
    type?: RankingType;
    loading?: boolean;
    showTopThree?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    currentUserId: undefined,
    type: 'points',
    loading: false,
    showTopThree: true,
});

const topThree = computed(() => {
    if (!props.showTopThree) return [];
    return props.rankings.slice(0, 3);
});

const restRankings = computed(() => {
    if (!props.showTopThree) return props.rankings;
    return props.rankings.slice(3);
});

const displayRankings = computed(() => {
    return props.showTopThree ? restRankings.value : props.rankings;
});

function getDisplayName(entry: AnyRankingEntry): string {
    return getDisplayNameUtil(entry);
}

function getInitial(entry: AnyRankingEntry): string {
    return getDisplayName(entry).charAt(0).toUpperCase();
}

function formatPoints(entry: AnyRankingEntry): string {
    if (props.type === 'quizzes') {
        return `${(entry as QuizAttemptRankingEntry).attempt_count?.toLocaleString() || '0'}문제`;
    }
    if (props.type === 'category') {
        return `${(entry as CategoryRankingEntry).category_points?.toLocaleString() || '0'}P`;
    }
    return `${(entry as RankingEntry).period_points?.toLocaleString() || '0'}P`;
}
</script>

<style scoped lang="scss">
.leaderboard {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.section-title {
    font-size: 18px;
    font-weight: 700;
    color: #212121;
    margin: 0 0 16px 0;
}

// TOP 3 섹션
.top-three-section {
    padding: 20px;
    background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
    border-radius: 20px;
}

.top-three-grid {
    display: grid;
    grid-template-columns: 1fr 1.2fr 1fr;
    gap: 12px;
    align-items: flex-end;
}

.top-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px 12px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    position: relative;

    .medal {
        font-size: 28px;
    }

    .crown {
        position: absolute;
        top: -24px;
        font-size: 32px;
        animation: float 2s ease-in-out infinite;
    }

    .user-avatar {
        border: 3px solid #e0e0e0;

        .avatar-placeholder {
            font-size: 20px;
            font-weight: 600;
            color: #9e9e9e;
            background: #f5f5f5;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }

    .user-name {
        font-size: 14px;
        font-weight: 600;
        color: #212121;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
    }

    .points {
        font-size: 16px;
        font-weight: 700;
        color: #ff6b6b;
    }

    &.rank-1 {
        padding: 24px 16px;
        background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
        border: 2px solid #ffd700;

        .medal {
            font-size: 36px;
        }

        .user-avatar {
            border-color: #ffd700;
        }

        .points {
            font-size: 20px;
        }
    }

    &.rank-2 {
        .user-avatar {
            border-color: #c0c0c0;
        }
    }

    &.rank-3 {
        .user-avatar {
            border-color: #cd7f32;
        }
    }
}

// 랭킹 리스트 섹션
.ranking-list-section {
    padding: 20px;
    background: #fff;
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.ranking-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.loading-state,
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 20px;
    gap: 12px;
}

.loading-state {
    color: #757575;
}

.empty-state {
    .empty-icon {
        font-size: 48px;
    }

    .empty-title {
        font-size: 16px;
        font-weight: 600;
        color: #424242;
    }

    .empty-description {
        font-size: 14px;
        color: #9e9e9e;
    }
}

@keyframes float {
    0%,
    100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-6px);
    }
}

// 모바일 반응형
@media (max-width: 600px) {
    .top-three-grid {
        grid-template-columns: 1fr;
        gap: 16px;

        .top-card {
            flex-direction: row;
            justify-content: flex-start;
            padding: 12px 16px;

            &.rank-1 {
                padding: 16px;

                .crown {
                    position: static;
                    font-size: 24px;
                    animation: none;
                }
            }

            .medal {
                font-size: 24px;
            }

            .user-avatar {
                width: 48px !important;
                height: 48px !important;
            }

            .user-name {
                flex: 1;
                text-align: left;
            }
        }
    }
}
</style>

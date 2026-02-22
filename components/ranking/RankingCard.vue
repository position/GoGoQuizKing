<template>
    <div class="ranking-card" :class="{ 'is-top-three': isTopThree, 'is-me': isCurrentUser }">
        <div class="rank-section">
            <div v-if="rankBadge" class="rank-badge" :style="{ backgroundColor: rankBadge.bgColor }">
                <span class="rank-emoji">{{ rankBadge.emoji }}</span>
            </div>
            <div v-else class="rank-number">
                {{ entry.rank }}
            </div>
        </div>

        <div class="user-section">
            <q-avatar size="40px" class="user-avatar">
                <img v-if="entry.avatar_url" :src="entry.avatar_url" alt="avatar" />
                <span v-else class="avatar-placeholder">{{ avatarInitial }}</span>
            </q-avatar>
            <div class="user-info">
                <span class="user-name">{{ displayName }}</span>
                <LevelBadge :level="entry.level" class="user-level" />
            </div>
        </div>

        <div class="points-section">
            <span class="points-value">{{ formattedPoints }}</span>
            <span class="points-label">{{ pointsLabel }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { RankingEntry, CategoryRankingEntry, QuizAttemptRankingEntry } from '@/models/ranking';
import { getRankBadge, getDisplayName } from '@/models/ranking';
import { LevelBadge } from '@/components/point';

type AnyRankingEntry = RankingEntry | CategoryRankingEntry | QuizAttemptRankingEntry;

interface Props {
    entry: AnyRankingEntry;
    currentUserId?: string;
    type?: 'points' | 'category' | 'quizzes';
}

const props = withDefaults(defineProps<Props>(), {
    currentUserId: undefined,
    type: 'points',
});

const isTopThree = computed(() => props.entry.rank <= 3);

const isCurrentUser = computed(() => props.currentUserId === props.entry.user_id);

const rankBadge = computed(() => getRankBadge(props.entry.rank));

const displayName = computed(() => getDisplayName(props.entry));

const avatarInitial = computed(() => {
    return displayName.value.charAt(0).toUpperCase();
});

const formattedPoints = computed(() => {
    if (props.type === 'quizzes') {
        return (props.entry as QuizAttemptRankingEntry).attempt_count?.toLocaleString() || '0';
    }
    if (props.type === 'category') {
        return (props.entry as CategoryRankingEntry).category_points?.toLocaleString() || '0';
    }
    return (props.entry as RankingEntry).period_points?.toLocaleString() || '0';
});

const pointsLabel = computed(() => {
    if (props.type === 'quizzes') return '문제';
    return 'P';
});
</script>

<style scoped lang="scss">
.ranking-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: #fff;
    border-radius: 12px;
    border: 1px solid #e0e0e0;
    transition: all 0.2s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    &.is-top-three {
        background: linear-gradient(135deg, #fffde7 0%, #fff8e1 100%);
        border-color: #ffca28;
    }

    &.is-me {
        background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
        border-color: #2196f3;
        border-width: 2px;
    }
}

.rank-section {
    min-width: 48px;
    text-align: center;
}

.rank-badge {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    .rank-emoji {
        font-size: 24px;
    }
}

.rank-number {
    font-size: 18px;
    font-weight: 700;
    color: #616161;
}

.user-section {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12px;
}

.user-avatar {
    border: 2px solid #e0e0e0;
    flex-shrink: 0;

    .avatar-placeholder {
        font-size: 16px;
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

.user-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
}

.user-name {
    font-size: 14px;
    font-weight: 600;
    color: #212121;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.user-level {
    transform: scale(0.85);
    transform-origin: left center;
}

.points-section {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    min-width: 60px;
}

.points-value {
    font-size: 18px;
    font-weight: 700;
    color: #ff6b6b;
}

.points-label {
    font-size: 11px;
    color: #9e9e9e;
}
</style>

<script setup lang="ts">
// 대결 랭킹 아이템 컴포넌트
import type { IBattleRankingEntry } from '~/models/battle';

interface Props {
    entry: IBattleRankingEntry;
    isCurrentUser?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    isCurrentUser: false,
});

const rankIcon = computed(() => {
    switch (props.entry.rank) {
        case 1:
            return '🥇';
        case 2:
            return '🥈';
        case 3:
            return '🥉';
        default:
            return null;
    }
});

const displayName = computed(
    () => props.entry.preferred_username || props.entry.full_name || 'Unknown',
);
</script>

<template>
    <div :class="['ranking-item', { 'is-current': isCurrentUser }]">
        <!-- 순위 -->
        <div class="rank">
            <span v-if="rankIcon" class="medal">{{ rankIcon }}</span>
            <span v-else class="number">{{ entry.rank }}</span>
        </div>

        <!-- 아바타 -->
        <q-avatar size="40px" class="avatar">
            <q-img v-if="entry.avatar_url" :src="entry.avatar_url" />
            <q-icon v-else name="person" size="20px" color="grey-5" />
        </q-avatar>

        <!-- 유저 정보 -->
        <div class="info">
            <span class="name">
                {{ displayName }}
                <q-badge v-if="isCurrentUser" color="primary" class="me-badge">
                    나
                </q-badge>
            </span>
            <span class="record">
                {{ entry.total_wins }}승 {{ entry.total_battles - entry.total_wins }}패
                <span class="winrate">({{ entry.win_rate }}%)</span>
            </span>
        </div>

        <!-- 랭킹 포인트 -->
        <div class="points">{{ entry.ranking_points }} RP</div>
    </div>
</template>

<style scoped lang="scss">
.ranking-item {
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

    // 현재 사용자 강조
    &.is-current {
        border: 2px solid $primary;

        .body--light & {
            background: linear-gradient(135deg, rgba($primary, 0.08) 0%, var(--bg-card) 100%);
        }

        .body--dark & {
            background: linear-gradient(135deg, rgba($primary, 0.15) 0%, var(--bg-card) 100%);
        }
    }

    // 순위
    .rank {
        min-width: 48px;
        display: flex;
        justify-content: center;

        .medal {
            font-size: $font-size-3xl;
        }

        .number {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: $font-size-lg;
            font-weight: 700;
            border-radius: 50%;
            color: var(--text-secondary);

            .body--light & {
                background: #f0f0f0;
            }

            .body--dark & {
                background: $dark-bg-surface;
            }
        }
    }

    // 아바타
    .avatar {
        flex-shrink: 0;

        .body--dark & {
            background: $dark-bg-surface;
        }
    }

    // 정보
    .info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: $spacing-xs;
        min-width: 0;

        .name {
            display: flex;
            align-items: center;
            gap: $spacing-xs;
            font-weight: 600;
            color: var(--text-primary);
        }

        .me-badge {
            font-size: $font-size-xs;
        }

        .record {
            font-size: $font-size-sm;
            color: var(--text-secondary);
        }

        .winrate {
            color: var(--text-light);
        }
    }

    // 포인트
    .points {
        font-weight: 700;
        color: $primary;
        flex-shrink: 0;
    }
}
</style>

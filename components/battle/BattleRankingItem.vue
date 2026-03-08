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

const displayName = computed(() => 
    props.entry.preferred_username || props.entry.full_name || 'Unknown'
);
</script>

<template>
    <q-item :class="['ranking-item', { 'ranking-item--current': isCurrentUser }]">
        <!-- 순위 -->
        <q-item-section avatar class="rank-section">
            <div v-if="rankIcon" class="rank-medal">
                {{ rankIcon }}
            </div>
            <div v-else class="rank-number">
                {{ entry.rank }}
            </div>
        </q-item-section>

        <!-- 아바타 -->
        <q-item-section avatar>
            <q-avatar size="40px">
                <q-img
                    v-if="entry.avatar_url"
                    :src="entry.avatar_url"
                />
                <q-icon v-else name="person" size="20px" color="grey-5" />
            </q-avatar>
        </q-item-section>

        <!-- 유저 정보 -->
        <q-item-section>
            <q-item-label class="text-weight-bold">
                {{ displayName }}
                <q-badge v-if="isCurrentUser" color="primary" class="q-ml-xs">
                    나
                </q-badge>
            </q-item-label>
            <q-item-label caption>
                {{ entry.total_wins }}승 {{ entry.total_battles - entry.total_wins }}패
                <span class="text-grey-6">
                    ({{ entry.win_rate }}%)
                </span>
            </q-item-label>
        </q-item-section>

        <!-- 랭킹 포인트 -->
        <q-item-section side>
            <q-item-label class="text-weight-bold text-primary">
                {{ entry.ranking_points }} RP
            </q-item-label>
        </q-item-section>
    </q-item>
</template>

<style scoped lang="scss">
.ranking-item {
    background: white;
    border-radius: 12px;
    margin-bottom: 8px;
    transition: all 0.2s ease;

    &:hover {
        transform: translateX(4px);
    }

    &--current {
        background: linear-gradient(135deg, #e8f4f8 0%, #fff 100%);
        border: 2px solid var(--q-primary);
    }
}

.rank-section {
    min-width: 48px;
    justify-content: center;
}

.rank-medal {
    font-size: 28px;
}

.rank-number {
    font-size: 18px;
    font-weight: bold;
    color: #666;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f0f0f0;
    border-radius: 50%;
}
</style>

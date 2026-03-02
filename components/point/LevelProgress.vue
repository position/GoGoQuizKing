<template>
    <div class="level-progress">
        <div class="progress-header">
            <div class="level-point-container">
                <LevelBadge :level="currentLevel" />
                <PointDisplay />
            </div>
            <div class="progress-text">
                <span v-if="isMaxLevel">최고 레벨 달성! 👑</span>
                <span v-else class="next-level-info">
                    다음 레벨까지 <strong>{{ pointsToNext.toLocaleString() }}</strong
                    >점
                </span>
            </div>
        </div>
        <q-linear-progress
            :value="progressPercent / 100"
            color="primary"
            track-color="grey-3"
            rounded
            size="12px"
            class="progress-bar"
        />
        <div class="progress-footer">
            <span>{{ currentPoints.toLocaleString() }}점</span>
            <span v-if="!isMaxLevel">{{ targetPoints.toLocaleString() }}점</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePointStore } from '@/store/point.store';
import LevelBadge from './LevelBadge.vue';
import PointDisplay from '~/components/point/PointDisplay.vue';

const pointStore = usePointStore();

const currentLevel = computed(() => pointStore.level);
const currentPoints = computed(() => pointStore.points);
const progressPercent = computed(() => pointStore.levelProgress);
const pointsToNext = computed(() => pointStore.pointsToNextLevel);
const isMaxLevel = computed(() => currentLevel.value >= 7);

const targetPoints = computed(() => {
    if (isMaxLevel.value) return currentPoints.value;
    return pointStore.allLevels[currentLevel.value]?.min_points || 0;
});
</script>

<style scoped lang="scss">
.level-progress {
    padding: 16px;
    border-radius: 16px;

    .progress-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;

        .level-point-container {
            display: flex;
            gap: 5px;
        }
        .progress-text {
            padding-left: 10px;
            font-size: 14px;
            color: var(--color-text);

            strong {
                color: #ff6b6b;
                font-weight: 700;
            }
        }
    }

    .progress-bar {
        margin-bottom: 8px;
    }

    .progress-footer {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: #999;
    }
    @media (max-width: 600px) {
        padding: 0;
    }
}
</style>

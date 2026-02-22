<template>
    <div class="level-badge" :class="`level-${level}`">
        <span class="level-icon">{{ levelInfo.icon }}</span>
        <div class="level-info">
            <span class="level-number">Lv.{{ level }}</span>
            <span class="level-name">{{ levelInfo.name }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePointStore } from '@/store/point.store';

interface Props {
    level?: number;
    showName?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    level: undefined,
    showName: true,
});

const pointStore = usePointStore();

const level = computed(() => props.level ?? pointStore.level);

const levelInfo = computed(() => {
    return pointStore.allLevels[level.value - 1] || pointStore.allLevels[0];
});
</script>

<style scoped lang="scss">
.level-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0 12px;
    border-radius: 24px;
    background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
    border: 1px solid #4caf50;

    .level-icon {
        font-size: 20px;
    }

    .level-info {
        display: flex;
        flex-direction: column;
        line-height: 1.2;

        .level-number {
            font-size: 12px;
            font-weight: 600;
            color: #2e7d32;
        }

        .level-name {
            font-size: 11px;
            color: #388e3c;
        }
    }

    // 레벨별 색상
    &.level-1 {
        background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
        border-color: #4caf50;
        .level-number,
        .level-name {
            color: #2e7d32;
        }
    }

    &.level-2 {
        background: linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%);
        border-color: #26a69a;
        .level-number,
        .level-name {
            color: #00796b;
        }
    }

    &.level-3 {
        background: linear-gradient(135deg, #e8f5e9 0%, #a5d6a7 100%);
        border-color: #66bb6a;
        .level-number,
        .level-name {
            color: #2e7d32;
        }
    }

    &.level-4 {
        background: linear-gradient(135deg, #c8e6c9 0%, #81c784 100%);
        border-color: #43a047;
        .level-number,
        .level-name {
            color: #1b5e20;
        }
    }

    &.level-5 {
        background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
        border-color: #ffc107;
        .level-number,
        .level-name {
            color: #f57f17;
        }
    }

    &.level-6 {
        background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
        border-color: #ff9800;
        .level-number,
        .level-name {
            color: #e65100;
        }
    }

    &.level-7 {
        background: linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%);
        border-color: #e91e63;
        .level-number,
        .level-name {
            color: #ad1457;
        }
    }
}
</style>

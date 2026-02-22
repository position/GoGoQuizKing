<template>
    <div class="point-display">
        <q-icon name="stars" color="warning" size="20px" />
        <span class="point-value">{{ formattedPoints }}</span>
        <span class="point-label">포인트</span>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePointStore } from '@/store/point.store';

const pointStore = usePointStore();

const formattedPoints = computed(() => {
    return pointStore.points.toLocaleString();
});
</script>

<style scoped lang="scss">
.point-display {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px;
    background: linear-gradient(135deg, #fff9e6 0%, #fff3cd 100%);
    border-radius: 20px;
    border: 1px solid #ffc107;

    .point-value {
        font-size: 16px;
        font-weight: 700;
        color: #f57c00;
    }

    .point-label {
        font-size: 12px;
        color: #795548;
    }
}
</style>

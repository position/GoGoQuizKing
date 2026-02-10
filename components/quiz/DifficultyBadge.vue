<template>
    <span
        class="difficulty-badge"
        :style="{
            backgroundColor: difficultyInfo.color + '20',
            color: difficultyInfo.color,
            borderColor: difficultyInfo.color,
        }"
    >
        <span class="icon">{{ difficultyIcon }}</span>
        <span class="label">{{ difficultyInfo.label }}</span>
        <span v-if="showGrade" class="grade">({{ difficultyInfo.gradeRange }})</span>
    </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { DIFFICULTIES, type DifficultyLevel } from '@/models/quiz';

const props = withDefaults(
    defineProps<{
        difficulty: DifficultyLevel;
        showGrade?: boolean;
    }>(),
    {
        showGrade: false,
    }
);

const difficultyInfo = computed(() => DIFFICULTIES[props.difficulty] || DIFFICULTIES.leaf);

const difficultyIcon = computed(() => {
    const icons: Record<DifficultyLevel, string> = {
        seedling: '🌱',
        leaf: '🌿',
        tree: '🌳',
        king: '👑',
    };
    return icons[props.difficulty] || '🌿';
});
</script>

<style scoped lang="scss">
.difficulty-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    border: 1px solid;

    .icon {
        font-size: 14px;
    }

    .grade {
        font-size: 11px;
        font-weight: 400;
        opacity: 0.8;
    }
}
</style>

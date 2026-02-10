<template>
    <span
        class="category-chip"
        :style="{
            backgroundColor: categoryInfo.color + '20',
            color: categoryInfo.color,
        }"
    >
        <span class="icon">{{ categoryInfo.icon }}</span>
        <span class="label">{{ categoryInfo.label }}</span>
    </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { CATEGORIES, type QuizCategory } from '@/models/quiz';

const props = defineProps<{
    category: QuizCategory;
}>();

const categoryInfo = computed(() => CATEGORIES[props.category] || CATEGORIES.general);
</script>

<style scoped lang="scss">
.category-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;

    .icon {
        font-size: 14px;
    }
}
</style>

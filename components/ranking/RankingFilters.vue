<template>
    <div class="ranking-filters">
        <div class="filter-group period-filter">
            <q-btn-toggle
                v-model="selectedPeriod"
                toggle-color="primary"
                :options="periodOptions"
                rounded
                unelevated
                class="period-toggle"
                @update:model-value="onPeriodChange"
            />
        </div>

        <div class="filter-group type-filter">
            <q-select
                v-model="selectedType"
                :options="typeOptions"
                outlined
                dense
                emit-value
                map-options
                class="type-select"
                @update:model-value="onTypeChange"
            >
                <template #prepend>
                    <span>{{ selectedTypeIcon }}</span>
                </template>
            </q-select>
        </div>

        <div v-if="showCategoryFilter" class="filter-group category-filter">
            <q-select
                v-model="selectedCategory"
                :options="categoryOptions"
                outlined
                dense
                emit-value
                map-options
                class="category-select"
                placeholder="카테고리 선택"
                @update:model-value="onCategoryChange"
            >
                <template #prepend>
                    <span>📚</span>
                </template>
            </q-select>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { RankingPeriod, RankingType } from '@/models/ranking';
import { PERIOD_LABELS, RANKING_TYPE_LABELS } from '@/models/ranking';
import type { QuizCategory } from '@/models/quiz';
import { CATEGORIES } from '@/models/quiz';

interface Props {
    period?: RankingPeriod;
    type?: RankingType;
    category?: QuizCategory;
}

const props = withDefaults(defineProps<Props>(), {
    period: 'all',
    type: 'points',
    category: undefined,
});

const emit = defineEmits<{
    (e: 'update:period', value: RankingPeriod): void;
    (e: 'update:type', value: RankingType): void;
    (e: 'update:category', value: QuizCategory): void;
    (e: 'change', value: { period: RankingPeriod; type: RankingType; category?: QuizCategory }): void;
}>();

const selectedPeriod = ref<RankingPeriod>(props.period);
const selectedType = ref<RankingType>(props.type);
const selectedCategory = ref<QuizCategory | undefined>(props.category);

// 기간 옵션
const periodOptions = computed(() =>
    Object.entries(PERIOD_LABELS).map(([value, { label, icon }]) => ({
        value,
        label: `${icon} ${label}`,
    })),
);

// 랭킹 타입 옵션
const typeOptions = computed(() =>
    Object.entries(RANKING_TYPE_LABELS).map(([value, { label, icon }]) => ({
        value,
        label: `${icon} ${label}`,
    })),
);

// 카테고리 옵션
const categoryOptions = computed(() =>
    Object.entries(CATEGORIES).map(([value, { label, icon }]) => ({
        value,
        label: `${icon} ${label}`,
    })),
);

const selectedTypeIcon = computed(() => RANKING_TYPE_LABELS[selectedType.value]?.icon || '⭐');

const showCategoryFilter = computed(() => selectedType.value === 'category');

// Props 변경 감지
watch(
    () => props.period,
    (val) => {
        selectedPeriod.value = val;
    },
);

watch(
    () => props.type,
    (val) => {
        selectedType.value = val;
    },
);

watch(
    () => props.category,
    (val) => {
        selectedCategory.value = val;
    },
);

function onPeriodChange(value: RankingPeriod) {
    emit('update:period', value);
    emitChange();
}

function onTypeChange(value: RankingType) {
    emit('update:type', value);
    if (value === 'category' && !selectedCategory.value) {
        selectedCategory.value = 'general';
    }
    emitChange();
}

function onCategoryChange(value: QuizCategory) {
    emit('update:category', value);
    emitChange();
}

function emitChange() {
    emit('change', {
        period: selectedPeriod.value,
        type: selectedType.value,
        category: selectedCategory.value,
    });
}
</script>

<style scoped lang="scss">
.ranking-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    padding: 16px;
    background: #f5f5f5;
    border-radius: 12px;
}

.filter-group {
    display: flex;
    align-items: center;
}

.period-toggle {
    :deep(.q-btn) {
        padding: 8px 16px;
        font-size: 13px;
    }
}

.type-select,
.category-select {
    min-width: 140px;

    :deep(.q-field__prepend) {
        padding-right: 8px;
    }
}

@media (max-width: 600px) {
    .ranking-filters {
        flex-direction: column;
    }

    .period-toggle {
        width: 100%;
        justify-content: center;
    }

    .type-select,
    .category-select {
        width: 100%;
    }
}
</style>

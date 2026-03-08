<script setup lang="ts">
// 대결 유형 선택 카드
import type { BattleType } from '~/models/battle';
import { BATTLE_TYPES } from '~/models/battle';

interface Props {
    type: BattleType;
    selected?: boolean;
    disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    selected: false,
    disabled: false,
});

const emit = defineEmits<{
    (e: 'select', type: BattleType): void;
}>();

const typeInfo = computed(() => BATTLE_TYPES[props.type]);

function handleClick() {
    if (!props.disabled) {
        emit('select', props.type);
    }
}
</script>

<template>
    <q-card
        :class="[
            'battle-type-card cursor-pointer',
            { 'battle-type-card--selected': selected },
            { 'battle-type-card--disabled': disabled },
        ]"
        flat
        bordered
        @click="handleClick"
    >
        <q-card-section class="battle-type-area text-center">
            <div class="text-h3 q-mb-sm">{{ typeInfo.icon }}</div>
            <div class="text-h4 text-weight-bold">{{ typeInfo.label }}</div>
            <div class="text-caption">{{ typeInfo.questionCount }}문제</div>
            <q-badge v-if="type === 'ranked'" color="red" class="q-mt-sm">
                랭킹 포인트 획득
            </q-badge>
        </q-card-section>

        <q-icon
            v-if="selected"
            name="check_circle"
            color="primary"
            size="24px"
            class="selected-icon"
        />
    </q-card>
</template>

<style scoped lang="scss">
.battle-type-card {
    position: relative;
    transition: all 0.2s ease;
    min-width: 170px;
    background: var(--bg-card);
    border-color: var(--border-color);

    &:hover:not(&--disabled) {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px var(--shadow-color);
    }

    &--selected {
        border-color: var(--q-primary);
        border-width: 2px;
        background: rgba(var(--color-primary-rgb), 0.1);
    }

    &--disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .selected-icon {
        position: absolute;
        top: 8px;
        right: 8px;
    }
}

// 다크모드 대응
.body--dark {
    .battle-type-card {
        &--selected {
            background: rgba(78, 205, 196, 0.15);
        }

        &:hover:not(.battle-type-card--disabled) {
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
        }
    }
}
</style>

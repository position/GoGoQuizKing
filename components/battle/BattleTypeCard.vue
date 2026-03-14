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
    <button
        :class="[
            'battle-type-card',
            { 'battle-type-card--selected': selected },
            { 'battle-type-card--disabled': disabled },
        ]"
        :disabled="disabled"
        @click="handleClick"
    >
        <span class="battle-type-card__icon">{{ typeInfo.icon }}</span>
        <span class="battle-type-card__label">{{ typeInfo.label }}</span>
        <span class="battle-type-card__count">{{ typeInfo.questionCount }}문제</span>
        <q-badge v-if="type === 'ranked'" color="red" class="battle-type-card__badge">
            랭킹 포인트 획득
        </q-badge>

        <q-icon
            v-if="selected"
            name="check_circle"
            color="primary"
            size="24px"
            class="battle-type-card__check"
        />
    </button>
</template>

<style scoped lang="scss">
.battle-type-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 170px;
    padding: $spacing-lg;
    border-radius: $radius-md;
    border: 2px solid var(--border-color);
    background: var(--bg-card);
    cursor: pointer;
    transition: all $transition-fast;
    text-align: center;

    &:hover:not(&--disabled) {
        transform: translateY(-4px);
        box-shadow: $shadow-md;
    }

    // 선택 상태
    &--selected {
        border-color: $primary;

        .body--light & {
            background: rgba($primary, 0.08);
        }

        .body--dark & {
            background: rgba($primary, 0.15);
        }
    }

    // 비활성화
    &--disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    // 아이콘
    &__icon {
        font-size: $font-size-4xl;
        margin-bottom: $spacing-sm;
    }

    // 라벨
    &__label {
        font-size: $font-size-lg;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: $spacing-xs;
    }

    // 문제 수
    &__count {
        font-size: $font-size-xs;
        color: var(--text-light);
    }

    // 뱃지
    &__badge {
        margin-top: $spacing-sm;
    }

    // 체크 아이콘
    &__check {
        position: absolute;
        top: $spacing-sm;
        right: $spacing-sm;
    }
}
</style>

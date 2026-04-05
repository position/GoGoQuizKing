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
            { 'is-selected': selected },
            { 'is-disabled': disabled },
        ]"
        :disabled="disabled"
        @click="handleClick"
    >
        <span class="icon">{{ typeInfo.icon }}</span>
        <span class="label">{{ typeInfo.label }}</span>
        <span class="count">{{ typeInfo.questionCount }}문제</span>
        <q-badge v-if="type === 'ranked'" color="red" class="badge">
            랭킹 포인트 획득
        </q-badge>

        <q-icon
            v-if="selected"
            name="check_circle"
            color="primary"
            size="24px"
            class="check"
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

    &:hover:not(.is-disabled) {
        transform: translateY(-4px);
        box-shadow: $shadow-md;
    }

    // 선택 상태
    &.is-selected {
        border-color: $primary;

        .body--light & {
            background: rgba($primary, 0.08);
        }

        .body--dark & {
            background: rgba($primary, 0.15);
        }
    }

    // 비활성화
    &.is-disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    // 아이콘
    .icon {
        font-size: $font-size-4xl;
        margin-bottom: $spacing-sm;
    }

    // 라벨
    .label {
        font-size: $font-size-lg;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: $spacing-xs;
    }

    // 문제 수
    .count {
        font-size: $font-size-xs;
        color: var(--text-light);
    }

    // 뱃지
    .badge {
        margin-top: $spacing-sm;
    }

    // 체크 아이콘
    .check {
        position: absolute;
        top: $spacing-sm;
        right: $spacing-sm;
    }
}
</style>

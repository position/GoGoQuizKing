# Input 컴포넌트 생성 가이드

커스텀 입력 컴포넌트 (특수 포맷, 검증 등).

## 위치

```
components/input/Input{Type}.vue
```

예시:
- `components/input/InputSearch.vue`
- `components/input/InputNumber.vue`

## 기본 템플릿

```vue
<template>
    <q-input
        v-model="inputValue"
        :error="props.error"
        :error-message="props.errorMessage"
        :readonly="props.readonly"
        :placeholder="props.placeholder"
        outlined
        dense
        @update:model-value="handleChange"
    >
        <template v-slot:prepend v-if="$slots.prepend">
            <slot name="prepend" />
        </template>
        <template v-slot:append v-if="$slots.append">
            <slot name="append" />
        </template>
    </q-input>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = withDefaults(defineProps<{
    modelValue: string;
    error?: boolean;
    errorMessage?: string;
    readonly?: boolean;
    placeholder?: string;
}>(), {
    modelValue: '',
});

const emit = defineEmits<{
    (e: 'update:model-value', value: string): void;
}>();

const inputValue = ref(props.modelValue);

watch(() => props.modelValue, (newVal) => {
    inputValue.value = newVal;
});

function handleChange(value: string) {
    emit('update:model-value', value);
}
</script>
```

## q-field 기반 (커스텀 컨트롤)

숫자 포맷팅, 통화 입력 등 복잡한 경우:

```vue
<template>
    <q-field
        :model-value="props.modelValue"
        @update:model-value="onChange"
        :error="props.error"
        :error-message="props.errorMessage"
        :prefix="props.prefix"
        :readonly="props.readonly"
        outlined
        dense
        hide-bottom-space
    >
        <template v-slot:control="{ id, modelValue, emitValue }">
            <input
                :id="id"
                :value="modelValue"
                @input="(e) => emitValue(e.target.value)"
                class="q-field__input"
                :disabled="props.readonly"
            />
        </template>
        <template v-slot:append>
            <slot name="append" />
        </template>
    </q-field>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
    modelValue: number;
    prefix?: string;
    error?: boolean;
    errorMessage?: string;
    readonly?: boolean;
}>(), {
    modelValue: 0,
});

const emit = defineEmits<{
    (e: 'update:model-value', value: number): void;
}>();

function onChange(val: string) {
    emit('update:model-value', Number(val) || 0);
}
</script>
```

## 실제 예시 (프로젝트 기준)

### InputWsopId

WSOP ID 전용 입력 (특수 포맷):

```vue
<template>
    <q-input
        v-model="wsopId"
        :placeholder="placeholder"
        outlined
        dense
        @keyup.enter="emit('enter')"
    />
</template>

<script setup lang="ts">
const props = defineProps<{
    placeholder?: string;
}>();

const wsopId = defineModel<string>('wsopId');
const emit = defineEmits<{
    (e: 'enter'): void;
}>();
</script>
```

### InputCurrency (통화 입력)

```vue
<template>
    <q-field
        :model-value="props.modelValue"
        @update:model-value="onChange"
        :error="props.error"
        :error-message="props.errorMessage"
        :prefix="currencySymbol"
        :readonly="props.readonly"
        v-digit-only.decimal="Number(props.decimal)"
        outlined
        dense
        hide-bottom-space
    >
        <template v-slot:control="{ id, modelValue, emitValue }">
            <VueNumber
                :id="id"
                :disabled="props.readonly"
                class="q-field__input"
                :model-value="modelValue"
                @input:model-value="emitValue"
                v-bind="{
                    precision: Number(props.decimal) || 0,
                }"
            />
        </template>
    </q-field>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useSeriesStore } from '@/store/series.store';

const props = withDefaults(defineProps<{
    modelValue: number;
    hasSymbol?: boolean;
    prefix?: string;
    decimal?: string;
    readonly?: boolean;
    error?: boolean;
    errorMessage?: string;
}>(), {
    modelValue: 0,
});

const emit = defineEmits(['update:model-value']);
const seriesStore = useSeriesStore();

const currencySymbol = computed(() => {
    if (props.hasSymbol) {
        return seriesStore.currencySymbol || '';
    }
    return props.prefix || '';
});

function onChange(val) {
    if (val !== '') {
        emit('update:model-value', Number(val));
    }
}
</script>
```

## 커스텀 Directive 활용

```vue
<template>
    <q-input
        v-model="value"
        v-digit-only           <!-- 숫자만 허용 -->
        v-text-only            <!-- 텍스트만 허용 -->
        outlined
        dense
    />
</template>
```

## 네이밍 규칙

| 패턴 | 예시 |
|------|------|
| 기본 | `Input{Type}.vue` |

예시:
- `InputCurrency.vue`
- `InputTel.vue`
- `InputWsopId.vue`
- `InputSixDigit.vue`

## 체크리스트

- [ ] `Input` 접두사 사용
- [ ] v-model 지원 (`defineModel` 또는 emit)
- [ ] error/errorMessage props 지원
- [ ] readonly props 지원
- [ ] 적절한 directive 활용 (v-digit-only 등)


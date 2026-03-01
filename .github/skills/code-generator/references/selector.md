# Selector 컴포넌트 생성 가이드

q-select 기반 드롭다운 셀렉터 컴포넌트.

## 위치

```
components/input/{Domain}Selector.vue
```

예시:
- `components/input/CategorySelector.vue`
- `components/input/DifficultySelector.vue`

## 기본 템플릿 (enum 기반)

대부분의 셀렉터는 enum에서 옵션을 생성한다.

```vue
<template>
    <q-select
        v-model="selected"
        :options="options"
        :outlined="props.outlined"
        :label="props.label"
        emit-value
        map-options
        dense
    >
        <template v-slot:no-option>
            <q-item>
                <q-item-section class="text-grey">No results</q-item-section>
            </q-item>
        </template>
    </q-select>
</template>

<script setup lang="ts">
import { DTO } from '@/models';
import { enumToArray } from '@/helper/list';

const props = withDefaults(defineProps<{
    outlined?: boolean;
    label?: string;
    isAll?: boolean;
}>(), {
    outlined: true,
    label: 'Select',
});

const selected = defineModel<DTO.Enums.SomeEnum | null>('selected');

const options: DTO.Common.DropDownListItem[] = [
    ...enumToArray(DTO.Enums.SomeEnum).map((item) => ({
        label: item,
        value: DTO.Enums.SomeEnum[item],
    })),
];

if (props.isAll) {
    options.unshift({ label: 'All', value: null });
}
</script>
```

### enumToArray / enumToArrayNotSort

| 헬퍼 | 동작 | 용도 |
|------|------|------|
| `enumToArray` | enum의 문자열 키 배열 반환 (정렬됨) | 일반적인 셀렉터 |
| `enumToArrayNotSort` | enum의 문자열 키 배열 반환 (원래 순서 유지) | 순서가 중요한 경우 |

위치: `@/helper/list`

### 옵션 타입

옵션 배열은 `DTO.Common.DropDownListItem[]` 타입을 사용.

```typescript
// { label: string, value: any }
const options: DTO.Common.DropDownListItem[] = [
    ...enumToArray(DTO.Enums.SomeEnum).map((item) => ({
        label: item,
        value: DTO.Enums.SomeEnum[item],
    })),
];
```

### 커스텀 라벨이 필요한 경우

별도 라벨 함수가 있으면 활용:

```typescript
import { getBlindTypeLabel } from '@/helper/label';

const options: DTO.Common.DropDownListItem[] = [
    ...enumToArray(DTO.Enums.BlindType).map((blindType) => ({
        label: getBlindTypeLabel(DTO.Enums.BlindType[blindType]),
        value: DTO.Enums.BlindType[blindType],
    })),
];
```

---

## 검색 기능 포함

```vue
<template>
    <q-select
        v-model="selected"
        use-input
        hide-selected
        fill-input
        :options="filteredOptions"
        :outlined="props.outlined"
        @filter="filterFn"
        emit-value
        map-options
        label="Select"
    >
        <template v-slot:no-option>
            <q-item>
                <q-item-section class="text-grey">No results</q-item-section>
            </q-item>
        </template>
    </q-select>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { DTO } from '@/models';
import { enumToArray } from '@/helper/list';

const props = defineProps<{
    outlined?: boolean;
}>();

const selected = defineModel<string>('selected');

const originalOptions: DTO.Common.DropDownListItem[] = [
    ...enumToArray(DTO.Enums.SomeEnum).map((item) => ({
        label: item,
        value: DTO.Enums.SomeEnum[item],
    })),
];

const filteredOptions = ref(originalOptions);

function filterFn(val: string, update: (fn: () => void) => void) {
    update(() => {
        if (val === '') {
            filteredOptions.value = originalOptions;
            return;
        }
        const needle = val.toLowerCase();
        filteredOptions.value = originalOptions.filter(
            (v) => v.label.toLowerCase().includes(needle)
        );
    });
}
</script>
```

---

## Multi-Select

체크박스 기반 다중 선택. 선택 상태에 따라 요약 라벨 표시.

```vue
<template>
    <q-select
        v-model="selected"
        :options="filteredOptions"
        use-input
        input-debounce="0"
        multiple
        :outlined="props.outlined"
        @filter="filterFn"
        emit-value
        map-options
        style="min-width: 250px"
    >
        <template v-slot:option="item">
            <div>
                <q-checkbox
                    v-model="item.selected"
                    :label="item.opt.label"
                    color="primary"
                    @update:model-value="handleCheck(item)"
                />
            </div>
        </template>
        <template v-slot:selected-item>
            <div v-if="selected.length === allOptions.length" class="item">
                All {Domain}
            </div>
            <div v-else class="item">
                {{ selectedFirstLabel }}
                <span v-if="selected.length > 1">& {{ selected.length - 1 }} More</span>
            </div>
        </template>
        <template v-slot:no-option>
            <q-item>
                <q-item-section class="text-grey">No results</q-item-section>
            </q-item>
        </template>
    </q-select>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { DTO } from '@/models';
import { enumToArrayNotSort } from '@/helper/list';

const props = defineProps<{
    outlined?: boolean;
}>();

const selected = defineModel<number[]>('selected', { default: () => [] });

const allOptions: DTO.Common.DropDownListItem[] = [
    ...enumToArrayNotSort(DTO.Enums.SomeEnum).map((item) => ({
        label: item,
        value: DTO.Enums.SomeEnum[item],
    })),
];

const filteredOptions = ref<DTO.Common.DropDownListItem[]>([...allOptions]);

const selectedFirstLabel = computed(() => {
    return allOptions.find((opt) => opt.value === selected.value[0])?.label;
});

function filterFn(val: string, update: (fn: () => void) => void) {
    if (val === '') {
        update(() => { filteredOptions.value = allOptions; });
        return;
    }
    update(() => {
        const needle = val.toLowerCase();
        filteredOptions.value = allOptions.filter(
            (v) => v.label.toLowerCase().includes(needle),
        );
    });
}

function handleCheck(item: { selected: boolean; opt: DTO.Common.DropDownListItem }) {
    if (item.selected) {
        selected.value.push(item.opt.value);
    } else {
        const index = selected.value.indexOf(item.opt.value);
        if (index > -1) {
            selected.value.splice(index, 1);
        }
    }
}
</script>

<style scoped lang="scss">
.item {
    display: none;
    &:first-child {
        display: flex;
        gap: 4px;
    }
    span {
        color: $gray-4;
    }
}
</style>
```

### 선택 라벨 표시 규칙

| 선택 상태 | 표시 |
|-----------|------|
| 전체 선택 | `"All {Domain}"` (예: "All Action Type") |
| 1개 선택 | `"{선택된 라벨}"` |
| 2개 이상 선택 | `"{첫번째 라벨} & N More"` |

### 커스텀 라벨 함수 활용

라벨 함수가 있으면 옵션 생성 시 적용:

```typescript
import { getMysteryBountyActionType } from '@/helper/label';

const allOptions: DTO.Common.DropDownListItem[] = [
    ...enumToArrayNotSort(DTO.Enums.MysteryBountyActionType).map((status) => ({
        label: getMysteryBountyActionType(DTO.Enums.MysteryBountyActionType[status]),
        value: DTO.Enums.MysteryBountyActionType[status],
    })),
];
```

---

## 네이밍 규칙

| 패턴 | 예시 |
|------|------|
| 단일 선택 | `{Domain}Selector.vue` |
| 다중 선택 | `{Domain}MultiSelector.vue` |

예시:
- `CurrencySelector.vue`
- `BlindTypeSelector.vue`
- `EventStatusMultiSelector.vue`
- `ChipRequestTypeMultiSelector.vue`

## 체크리스트

- [ ] `Selector` 또는 `MultiSelector` 접미사 사용
- [ ] `enumToArray` 또는 `enumToArrayNotSort`로 옵션 생성
- [ ] `DTO.Common.DropDownListItem[]` 타입 사용
- [ ] `emit-value`, `map-options` 속성 포함
- [ ] `v-slot:no-option` 템플릿 제공
- [ ] `isAll` prop으로 "All" 옵션 지원 (필요시)
- [ ] 검색 기능 필요시 `use-input`, `@filter` 추가


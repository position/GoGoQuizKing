# 패턴 리팩토링 상세 가이드

코드 패턴을 프로젝트 컨벤션에 맞게 변환하는 구체적 방법.

## 1. Options API → Composition API

### Before

```vue
<script>
export default {
    props: {
        title: { type: String, required: true },
        count: { type: Number, default: 0 },
    },
    emits: ['update', 'close'],
    data() {
        return {
            isActive: false,
            items: [],
        };
    },
    computed: {
        displayTitle() {
            return this.title.toUpperCase();
        },
    },
    watch: {
        count(newVal) {
            console.log('changed:', newVal);
        },
    },
    methods: {
        handleClick() {
            this.$emit('update', this.title);
        },
    },
    mounted() {
        this.fetchData();
    },
};
</script>
```

### After

```vue
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';

const props = withDefaults(defineProps<{
    title: string;
    count?: number;
}>(), {
    count: 0,
});

const emit = defineEmits<{
    (e: 'update', value: string): void;
    (e: 'close'): void;
}>();

const isActive = ref(false);
const items = ref<unknown[]>([]);

const displayTitle = computed(() => props.title.toUpperCase());

watch(() => props.count, (newVal) => {
    // count 변경 처리
});

function handleClick() {
    emit('update', props.title);
}

onMounted(() => {
    fetchData();
});
</script>
```

### 변환 매핑

| Options API | Composition API |
|------------|-----------------|
| `props: {}` | `defineProps<{}>()` |
| `emits: []` | `defineEmits<{}>()` |
| `data()` | `ref()` / `reactive()` |
| `computed: {}` | `computed(() => ...)` |
| `watch: {}` | `watch(() => ...)` |
| `methods: {}` | 일반 함수 선언 |
| `mounted()` | `onMounted(() => ...)` |
| `this.$emit` | `emit()` |
| `this.$router` | `useRouter()` |
| `this.$route` | `useRoute()` |

## 2. Props 직접 변경 → Emit 패턴

### Before (금지)

```vue
<script setup lang="ts">
const props = defineProps<{ value: string }>();

function updateValue() {
    props.value = 'new'; // ❌ Props 직접 변경
}
</script>
```

### After (v-model 패턴)

```vue
<script setup lang="ts">
const modelValue = defineModel<string>();

function updateValue() {
    modelValue.value = 'new'; // ✅ defineModel 사용
}
</script>
```

### After (emit 패턴)

```vue
<script setup lang="ts">
const props = defineProps<{ value: string }>();
const emit = defineEmits<{
    (e: 'update:value', value: string): void;
}>();

function updateValue() {
    emit('update:value', 'new'); // ✅ emit 사용
}
</script>
```

## 3. 모달 패턴 교정

→ [code-generator/references/modal.md](../../code-generator/references/modal.md)

### 3-1. 버튼+모달 → DialogWithButton 전환 ⚠️ 필수

버튼 클릭으로 모달을 여는 패턴은 **반드시 `DialogWithButton`으로 전환**한다.

#### Before (비권장)

```vue
<template>
    <q-btn @click="isShowModal = true" label="Bulk Upload" color="primary" />
    
    <!-- 모달이 버튼과 분리되어 있음 -->
    <MyUploadModal
        v-model:isShowModal="isShowModal"
        @uploaded="handleUploaded"
    />
</template>

<script setup lang="ts">
const isShowModal = ref(false);  // 불필요한 상태 관리
</script>
```

#### After (권장)

```vue
<template>
    <DialogWithButton
        label="Bulk Upload"
        color="primary"
        icon="sym_o_upload_file"
        unelevated
        no-caps
    >
        <template #dialog="{ model }">
            <MyUploadModal
                v-if="model.visible"
                v-model:isShowModal="model.visible"
                @uploaded="handleUploaded"
            />
        </template>
    </DialogWithButton>
</template>

<script setup lang="ts">
import DialogWithButton from '@fatima/shared/components/button/DialogWithButton.vue';
// isShowModal ref 제거됨 - DialogWithButton이 내부적으로 관리
</script>
```

#### 변환 단계

1. `q-btn @click="isShowModal = true"` → `DialogWithButton`으로 교체
2. 버튼 속성(`label`, `color`, `icon` 등) 그대로 `DialogWithButton`에 전달
3. 분리된 Dialog 컴포넌트를 `#dialog` 슬롯 안으로 이동
4. `v-model:isShowModal` → `v-model:isShowModal="model.visible"`
5. `v-if="model.visible"` 추가 (lazy rendering)
6. `isShowModal = ref(false)` 상태 변수 제거
7. `DialogWithButton` import 추가

#### DialogWithButton 장점

- 버튼과 Dialog 상태 관리가 **캡슐화**됨
- `ref` 없이 `model.visible`로 상태 제어
- 일관된 패턴으로 **코드 가독성 향상**
- 컴포넌트 간 **결합도 감소**

### 3-2. 비표준 모달 → q-dialog 전환

#### Before (비표준)

```vue
<template>
    <div v-if="show" class="modal-overlay">
        <div class="modal-content">
            <!-- 커스텀 모달 구현 -->
        </div>
    </div>
</template>
```

### After (v-model 방식, 패턴 A)

```vue
<template>
    <q-dialog v-model="isShowModal" class="custom-modal no-bg" persistent>
        <q-card style="min-width: 400px">
            <q-bar class="header">
                <div class="title">{{ title }}</div>
                <q-space />
                <q-btn icon="close" flat round dense v-close-popup />
            </q-bar>
            <q-card-section class="custom-modal-body">
                <!-- 내용 -->
            </q-card-section>
            <q-card-actions align="right">
                <q-btn label="Cancel" color="grey" unelevated no-caps v-close-popup />
                <q-btn label="Confirm" color="primary" unelevated no-caps @click="handleConfirm" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>
```

## 4. 인라인 로직 → Composable 추출

### 추출 기준

- 동일 로직이 **2개 이상 컴포넌트**에서 사용
- 컴포넌트 내 **독립적인 관심사** (API 호출, 폼 검증 등)
- 테스트가 필요한 **복잡한 로직**

### Before

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { playerService } from '@/services/playerService';
import type { DTO } from '@/models';

const players = ref<DTO.Players.IPlayer[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

async function fetchPlayers() {
    isLoading.value = true;
    error.value = null;
    try {
        const { data } = await playerService.getAll();
        players.value = data.result;
    } catch (e) {
        error.value = e instanceof Error ? e.message : 'Unknown error';
    } finally {
        isLoading.value = false;
    }
}

onMounted(fetchPlayers);
</script>
```

### After (Composable 추출)

```typescript
// composables/use-player-list.ts
import { ref, readonly, onMounted } from 'vue';
import { playerService } from '@/services/playerService';
import type { DTO } from '@/models';

export default function usePlayerList() {
    const players = ref<DTO.Players.IPlayer[]>([]);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    async function fetch() {
        isLoading.value = true;
        error.value = null;
        try {
            const { data } = await playerService.getAll();
            players.value = data.result;
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Unknown error';
        } finally {
            isLoading.value = false;
        }
    }

    onMounted(fetch);

    return {
        players: readonly(players),
        isLoading: readonly(isLoading),
        error: readonly(error),
        refetch: fetch,
    };
}
```

```vue
<script setup lang="ts">
import usePlayerList from '@/composables/use-player-list';

const { players, isLoading, error, refetch } = usePlayerList();
</script>
```

## 5. any 제거 패턴

### 패턴 A: 구체적 타입으로 교체

```typescript
// Before
function processData(data: any) { ... }

// After
function processData(data: DTO.Players.IPlayer) { ... }
```

### 패턴 B: unknown + 타입 가드

```typescript
// Before
function handleError(error: any) {
    console.error(error.message);
}

// After
function handleError(error: unknown) {
    if (error instanceof Error) {
        console.error(error.message);
    } else {
        console.error('Unknown error:', String(error));
    }
}
```

### 패턴 C: 제네릭

```typescript
// Before
function getFirst(arr: any[]): any {
    return arr[0];
}

// After
function getFirst<T>(arr: T[]): T | undefined {
    return arr[0];
}
```

## 6. 셀렉터 패턴 교정

→ [code-generator/references/selector.md](../../code-generator/references/selector.md)

### Before (인라인 enum 변환)

```vue
<q-select
    v-model="selected"
    :options="Object.keys(SomeEnum).filter(k => isNaN(Number(k))).map(k => ({ label: k, value: SomeEnum[k] }))"
/>
```

### After (enumToArray 헬퍼 활용)

```vue
<script setup lang="ts">
import { DTO } from '@/models';
import { enumToArray } from '@/helper/list';

const options: DTO.Common.DropDownListItem[] = [
    ...enumToArray(DTO.Enums.SomeEnum).map((item) => ({
        label: item,
        value: DTO.Enums.SomeEnum[item],
    })),
];
</script>

<q-select v-model="selected" :options="options" emit-value map-options dense />
```

## 7. 인라인 스타일 → Scoped CSS

### Before

```vue
<div style="margin-top: 10px; padding: 16px; background: #f5f5f5;">
    <span style="color: red; font-weight: bold;">Error</span>
</div>
```

### After

```vue
<template>
    <div class="container">
        <span class="error-text">Error</span>
    </div>
</template>

<style scoped lang="scss">
.container {
    margin-top: 10px;
    padding: 16px;
    background: $gray-1;  // SCSS 변수 활용
}

.error-text {
    color: $negative;
    font-weight: bold;
}
</style>
```

Quasar 유틸리티 클래스가 있으면 우선 사용:

```vue
<!-- Quasar 클래스 활용 -->
<div class="q-mt-sm q-pa-md bg-grey-2">
    <span class="text-negative text-bold">Error</span>
</div>
```


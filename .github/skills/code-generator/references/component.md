# Component 생성 가이드

기본 Vue 컴포넌트 생성 패턴 (Nuxt 3).

## 위치

```
components/{domain}/ComponentName.vue
```

예시:
- `components/quiz/QuizCard.vue`
- `components/ranking/RankingCard.vue`
- `components/badge/BadgeCard.vue`

## 기본 템플릿

```vue
<template>
    <div class="component-name">
        <!-- content -->
    </div>
</template>

<script setup lang="ts">
// 1. Type imports (필요시)
import type { IQuiz } from '@/models/quiz';

// 2. props/emits
const props = withDefaults(defineProps<{
    title: string;
    disabled?: boolean;
}>(), {
    disabled: false
});

const emit = defineEmits<{
    (e: 'click', value: string): void;
}>();

// 3. reactive state (ref, computed 등은 자동 import)
const isActive = ref(false);

// 4. computed
const displayTitle = computed(() => props.title.toUpperCase());

// 5. methods
function handleClick() {
    emit('click', props.title);
}
</script>

<style scoped lang="scss">
.component-name {
    // styles
}
</style>
```

## Props 패턴

### 기본 Props

```typescript
const props = defineProps<{
    required: string;          // 필수
    optional?: number;         // 선택
}>();
```

### 기본값 포함

```typescript
const props = withDefaults(defineProps<{
    title: string;
    count?: number;
    items?: string[];
}>(), {
    count: 0,
    items: () => []  // 배열/객체는 팩토리 함수
});
```

### 복잡한 타입

```typescript
import type { IUser } from '@/models/user';

const props = defineProps<{
    user: IUser;
    status: 'active' | 'inactive';
}>();
```

## Emits 패턴

### 기본 Emits

```typescript
const emit = defineEmits<{
    (e: 'update', value: string): void;
    (e: 'close'): void;
    (e: 'select', item: IUser, index: number): void;
}>();

// 사용
emit('update', 'new value');
emit('close');
emit('select', user, 0);
```

### v-model 지원

```typescript
// 단일 v-model
const modelValue = defineModel<string>();

// 사용
modelValue.value = 'new value';
```

```typescript
// 명명된 v-model
const selected = defineModel<number>('selected');
const items = defineModel<string[]>('items');
```

## 실제 예시 (프로젝트 기준)

### Loading 컴포넌트

```vue
<template>
    <q-inner-loading :showing="true" transition-duration="0">
        <q-spinner-ios size="50px" />
    </q-inner-loading>
</template>

<style lang="scss">
.q-inner-loading {
    background: rgba($white, 0.3);
    z-index: 1000;
    &.viewport-center {
        position: fixed;
    }
}
</style>
```

## 체크리스트

- [ ] PascalCase 파일명
- [ ] `<script setup lang="ts">` 사용
- [ ] Props에 타입 명시
- [ ] 필요시 scoped style 사용
- [ ] Quasar 컴포넌트 활용 (q-btn, q-input 등)


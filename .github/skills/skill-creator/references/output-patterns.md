# 출력 패턴

스킬이 생성하는 출력물의 패턴입니다.

## 1. 파일 생성 패턴

### 단일 파일 생성

```markdown
## 생성할 파일

`src/components/UserCard.vue`:
- Props: userId, showAvatar
- Emits: click, delete
```

### 다중 파일 생성

```markdown
## 생성할 파일들

1. `src/components/User/UserCard.vue` - 카드 컴포넌트
2. `src/components/User/UserList.vue` - 리스트 컴포넌트
3. `src/components/User/index.ts` - 배럴 export
```

## 2. 코드 템플릿 패턴

### Vue 컴포넌트 템플릿

```vue
<script setup lang="ts">
// 1. imports
import { ref, computed } from 'vue';
import type { I{{Name}} } from '@/models/{{name}}';

// 2. props/emits
const props = defineProps<{
  // props here
}>();

const emit = defineEmits<{
  // emits here
}>();

// 3. state
// 4. computed
// 5. methods
// 6. lifecycle
</script>

<template>
  <div class="{{kebab-name}}">
    <!-- template here -->
  </div>
</template>

<style scoped lang="scss">
.{{kebab-name}} {
  // styles here
}
</style>
```

### Composable 템플릿

```typescript
import { ref, computed, readonly } from 'vue';
import type { Ref, ComputedRef } from 'vue';

interface Use{{Name}}Options {
  // options
}

interface Use{{Name}}Return {
  // return type
}

export function use{{Name}}(options?: Use{{Name}}Options): Use{{Name}}Return {
  // state
  const state = ref();
  
  // computed
  const derived = computed(() => state.value);
  
  // methods
  function doSomething() {
    // implementation
  }
  
  return {
    state: readonly(state),
    derived,
    doSomething,
  };
}
```

### Pinia Store 템플릿

```typescript
import { defineStore } from 'pinia';
import type { I{{Name}} } from '@/models/{{name}}';

interface {{Name}}State {
  items: I{{Name}}[];
  current: I{{Name}} | null;
  loading: boolean;
  error: string | null;
}

export const use{{Name}}Store = defineStore('{{name}}', {
  state: (): {{Name}}State => ({
    items: [],
    current: null,
    loading: false,
    error: null,
  }),
  
  getters: {
    // getters
  },
  
  actions: {
    // actions
  },
});
```

## 3. 응답 포맷 패턴

### 성공 응답

```markdown
✅ **완료**: UserCard 컴포넌트 생성

**생성된 파일**:
- `src/components/User/UserCard.vue`

**다음 단계**:
1. Props 타입 정의 확인
2. 스타일 커스터마이징
```

### 확인 요청

```markdown
⚠️ **확인 필요**

다음 파일이 이미 존재합니다:
- `src/components/UserCard.vue`

**선택**:
1. 덮어쓰기
2. 다른 이름으로 생성
3. 취소
```

### 오류 응답

```markdown
❌ **오류**: 컴포넌트 생성 실패

**원인**: 컴포넌트명이 PascalCase가 아닙니다.
- 입력: `userCard`
- 권장: `UserCard`

**해결**: PascalCase로 이름을 변경해주세요.
```

## 4. 진행 상황 패턴

### 단계별 진행

```markdown
## 진행 상황

- [x] Step 1: 타입 정의 확인
- [x] Step 2: 컴포넌트 구조 생성
- [ ] Step 3: API 연동
- [ ] Step 4: 테스트 추가
```

### 요약 리포트

```markdown
## 작업 요약

| 항목 | 상태 | 비고 |
|------|------|------|
| 컴포넌트 생성 | ✅ | UserCard.vue |
| 타입 정의 | ✅ | IUser interface |
| Store 연동 | ⏳ | 진행 중 |
| 테스트 | ❌ | TODO |
```

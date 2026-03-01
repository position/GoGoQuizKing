---
applyTo: "**/*"
---

# Vue/TypeScript 코딩 표준 (Coding Standards)

## TL;DR (핵심 5가지)

**반드시 지켜야 할 원칙**:

1. **SOLID 원칙**: 불변성, 합성 > 상속, 단일 책임
2. **네이밍**: PascalCase(컴포넌트), camelCase(변수/함수), UPPER_SNAKE_CASE(상수)
3. **함수 길이**: 20줄 이내, 단일 목적
4. **빌드 방법**: 작은 컴포넌트 합성, 적극적인 타입 활용
5. **Type Safety**: 엄격한 타입 정의, `any` 사용 금지

---

## 상호작용 지침 (Interaction Guidelines)

* **사용자 페르소나**: 사용자가 Vue 3 Composition API에 익숙하다고 가정하십시오.
* **설명**: 코드를 생성할 때 TypeScript 제네릭, Composable 패턴 등에 대한 설명을 제공하십시오.
* **명확화**: 요청이 모호한 경우 의도한 기능과 대상 컴포넌트에 대해 명확히 질문하십시오.
* **의존성**: npm 패키지를 제안할 때 그 이점과 이유를 설명하십시오.
* **포맷팅**: 일관된 코드 포맷팅을 위해 Prettier를 사용하십시오.
* **린팅**: ESLint를 사용하여 일반적인 문제를 잡으십시오.

---

## Vue 스타일 가이드 (Vue Style Guide)

* **SOLID 원칙**: 코드베이스 전반에 SOLID 원칙을 적용하십시오.
* **간결하고 선언적인 코드**: 간결하고 현대적인 TypeScript 코드를 작성하십시오. 함수형 및 선언적 패턴을 선호합니다.
* **상속보다 합성**: 복잡한 컴포넌트와 로직을 구축할 때 상속보다 합성을 선호하십시오.
* **불변성 (Immutability)**: 불변 데이터 구조를 선호하십시오. Props는 읽기 전용입니다.
* **상태 관리**: 로컬 상태와 전역 상태를 분리하십시오. 전역 상태에는 Pinia를 사용하십시오.
* **컴포넌트는 UI를 위한 것**: Vue의 UI는 모두 컴포넌트입니다. 작고 재사용 가능한 컴포넌트들로 복잡한 UI를 구성하십시오.
* **라우팅**: Vue Router를 사용하고, 동적 import로 코드 분할하십시오.

---

## 코드 품질 (Code Quality)

* **코드 구조**: 유지보수 가능한 코드 구조와 관심사 분리(예: UI 로직과 비즈니스 로직 분리)를 준수하십시오.
* **명명 규칙**: 약어를 피하고 변수, 함수, 클래스에 의미 있고 일관되며 설명적인 이름을 사용하십시오.
* **간결성**: 명확성을 유지하면서 가능한 짧게 코드를 작성하십시오.
* **단순성**: 명쾌한 코드를 작성하십시오. 지나치게 기발하거나 이해하기 어려운 코드는 피하십시오.
* **오류 처리**: 잠재적인 오류를 예측하고 처리하십시오. 코드가 소리 없이 실패하게 두지 마십시오.
* **스타일링**:
    * 줄 길이: 한 줄은 100자 이하로 유지하십시오.
    * 컴포넌트 파일은 `PascalCase`, 변수/함수는 `camelCase`를 사용하십시오.
    * `if`/`else`/`for`/`while` 등 제어문은 **항상 중괄호 블록**을 사용하십시오. 한 줄 본문도 블록으로 감쌉니다.
* **함수**:
    * 함수는 짧고 단일 목적을 가져야 합니다 (가급적 20줄 이내).

```typescript
// 나쁜 예: 한 줄 if 문
if (!val) return val;
if (condition) doSomething();

// 좋은 예: 블록으로 감싸기
if (!val) {
    return val;
}
if (condition) {
    doSomething();
}
```

---

## TypeScript 베스트 프랙티스

* **Strict Mode**: `tsconfig.json`의 strict 옵션을 활성화하십시오.
* **명시적 타입**: 함수 매개변수와 반환값에 타입을 명시하십시오.
* **any 금지**: `any` 타입 사용을 금지합니다. `unknown`을 사용하고 타입 가드로 좁히십시오.
* **타입 추론 활용**: 명확한 경우 타입 추론을 활용하여 코드 중복을 줄이십시오.
* **인터페이스 vs 타입**: 객체 형태는 `interface`, 유니온/인터섹션은 `type`을 사용하십시오.
* **제네릭**: 재사용 가능한 컴포넌트/함수에 제네릭을 활용하십시오.
* **Discriminated Union**: 복잡한 상태 표현에 Discriminated Union을 사용하십시오.

```typescript
// 좋은 예: Discriminated Union
type LoadingState = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: User[] }
  | { status: 'error'; error: string };
```

---

## Vue 베스트 프랙티스 (Vue Best Practices)

* **합성**: 기존 컴포넌트를 확장하기보다 작은 컴포넌트들을 합성하는 것을 선호하십시오.
* **Composables**: 로직 재사용을 위해 Composable 패턴을 사용하십시오.
* **Template 분리**: 거대한 template을 재사용 가능한 작은 컴포넌트로 분할하십시오.
* **v-for 최적화**: 긴 리스트에는 `key`를 반드시 제공하고, 가상 스크롤을 고려하십시오.
* **비동기 컴포넌트**: 무거운 컴포넌트는 `defineAsyncComponent`로 지연 로딩하십시오.
* **computed 활용**: 파생 상태는 computed로 처리하여 캐싱 이점을 활용하십시오.

---

## Vue 컴포넌트 구조

```vue
<script setup lang="ts">
// 1. imports (외부 → 내부 순서)
import { ref, computed, onMounted } from 'vue';
import type { IUser } from '@/models/user';
import UserCard from '@/components/UserCard.vue';

// 2. props/emits 정의
const props = withDefaults(defineProps<{
  title: string;
  count?: number;
}>(), {
  count: 0
});

const emit = defineEmits<{
  (e: 'update', value: string): void;
  (e: 'close'): void;
}>();

// 3. composables 사용
const { user, isLoading } = useAuth();

// 4. reactive state
const searchQuery = ref('');
const selectedItems = ref<IUser[]>([]);

// 5. computed
const filteredItems = computed(() => 
  selectedItems.value.filter(item => 
    item.name.includes(searchQuery.value)
  )
);

// 6. watch
watch(searchQuery, (newVal) => {
  console.log('Search changed:', newVal);
});

// 7. methods
function handleSubmit() {
  emit('update', searchQuery.value);
}

// 8. lifecycle hooks
onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="user-list">
    <h2>{{ title }}</h2>
    <UserCard 
      v-for="user in filteredItems" 
      :key="user.id" 
      :user="user" 
    />
  </div>
</template>

<style scoped lang="scss">
.user-list {
  // BEM 네이밍 또는 scoped 활용
}
</style>
```

---

## 네이밍 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 파일 | PascalCase | `UserProfile.vue` |
| Composable 파일 | camelCase, `use` 접두사 | `useAuth.ts` |
| Pinia Store | camelCase, `use` 접두사 | `useUserStore.ts` |
| 인터페이스 | PascalCase, `I` 접두사 | `IUserData` |
| 타입 | PascalCase | `UserType`, `LoadingState` |
| 상수 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 변수/함수 | camelCase | `getUserData()` |
| 이벤트 핸들러 | camelCase, `handle`/`on` 접두사 | `handleClick`, `onSubmit` |

---

## 파일/디렉토리 네이밍

### 디렉토리별 파일 네이밍

| 디렉토리 | 네이밍 규칙 | 예시 |
|----------|-------------|------|
| `components/` | PascalCase | `UserCard.vue`, `DataGrid.vue` |
| `composables/` | camelCase, `use` 접두사 | `useAuth.ts`, `useWebSocket.ts` |
| `pages/` | PascalCase | `LoginPage.vue`, `Dashboard.vue` |
| `store/` | camelCase, `use` 접두사 | `useUserStore.ts` |
| `services/` | camelCase | `userService.ts`, `authService.ts` |
| `models/` | camelCase | `user.ts`, `tournament.ts` |
| `helpers/` | camelCase | `formatDate.ts`, `validation.ts` |

### 컴포넌트 파일 분류

```
components/
├── auth/                    # 인증 관련
│   ├── LoginForm.vue
│   └── RegisterForm.vue
├── layout/                  # 레이아웃
│   ├── AppHeader.vue
│   └── AppSidebar.vue
├── player/                  # 플레이어 도메인
│   ├── PlayerCard.vue
│   └── PlayerList.vue
└── input/                   # 공통 입력 컴포넌트
    ├── TextInput.vue
    └── SelectInput.vue
```

---

## Composable 작성 규칙

```typescript
// composables/useExample.ts
import { ref, computed, readonly } from 'vue';
import type { Ref, ComputedRef } from 'vue';

interface UseExampleOptions {
  initialValue?: string;
}

interface UseExampleReturn {
  state: Readonly<Ref<string>>;
  derived: ComputedRef<number>;
  doSomething: () => void;
  reset: () => void;
}

export function useExample(options?: UseExampleOptions): UseExampleReturn {
  // reactive state
  const state = ref(options?.initialValue ?? '');
  
  // computed
  const derived = computed(() => state.value.length);
  
  // methods
  function doSomething() {
    // 로직 구현
  }
  
  function reset() {
    state.value = '';
  }
  
  // return - 명시적 반환, readonly로 상태 보호
  return {
    state: readonly(state),
    derived,
    doSomething,
    reset
  };
}
```

---

## API 설계 원칙 (API Design Principles)

* **사용자 고려**: API를 사용하는 사람의 관점에서 직관적이고 사용하기 쉽게 설계하십시오.
* **문서는 필수**: 좋은 문서는 좋은 API 설계의 일부입니다. JSDoc으로 명확하게 작성하십시오.
* **일관성**: 비슷한 기능은 비슷한 패턴으로 구현하십시오.

---

## API 서비스 패턴

```typescript
// services/userService.ts
import { api } from '@/services/api';
import type { IUser, IUserCreateRequest, IApiResponse } from '@/models';

export const userService = {
  /**
   * 모든 사용자 조회
   */
  getAll: () => api.get<IApiResponse<IUser[]>>('/users'),
  
  /**
   * ID로 사용자 조회
   * @param id 사용자 ID
   */
  getById: (id: number) => api.get<IApiResponse<IUser>>(`/users/${id}`),
  
  /**
   * 사용자 생성
   * @param data 사용자 생성 요청 데이터
   */
  create: (data: IUserCreateRequest) => 
    api.post<IApiResponse<IUser>>('/users', data),
  
  /**
   * 사용자 정보 수정
   * @param id 사용자 ID
   * @param data 수정할 데이터
   */
  update: (id: number, data: Partial<IUser>) => 
    api.put<IApiResponse<IUser>>(`/users/${id}`, data),
  
  /**
   * 사용자 삭제
   * @param id 사용자 ID
   */
  delete: (id: number) => api.delete(`/users/${id}`)
};
```

---

## Pinia Store 패턴

```typescript
// store/useUserStore.ts
import { defineStore } from 'pinia';
import { userService } from '@/services/userService';
import type { IUser } from '@/models/user';

interface UserState {
  users: IUser[];
  currentUser: IUser | null;
  loading: boolean;
  error: string | null;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    users: [],
    currentUser: null,
    loading: false,
    error: null
  }),
  
  getters: {
    activeUsers: (state) => state.users.filter(u => u.isActive),
    userCount: (state) => state.users.length
  },
  
  actions: {
    async fetchUsers() {
      this.loading = true;
      this.error = null;
      
      try {
        const { data } = await userService.getAll();
        this.users = data.result;
      } catch (e) {
        this.error = e instanceof Error ? e.message : 'Unknown error';
        throw e; // 호출자가 처리할 수 있도록
      } finally {
        this.loading = false;
      }
    },
    
    async fetchUserById(id: number) {
      this.loading = true;
      try {
        const { data } = await userService.getById(id);
        this.currentUser = data.result;
        return this.currentUser;
      } catch (e) {
        this.error = e instanceof Error ? e.message : 'Unknown error';
        throw e;
      } finally {
        this.loading = false;
      }
    },
    
    clearError() {
      this.error = null;
    }
  }
});
```

---

## 금지 사항

| 항목 | 설명 | 대안 |
|------|------|------|
| `any` 타입 | 타입 안전성 파괴 | `unknown` + 타입 가드 |
| 인라인 스타일 | 유지보수 어려움 | scoped CSS, Quasar 클래스 |
| 하드코딩 문자열 | 변경 시 검색 필요 | 상수, i18n |
| console.log 커밋 | 프로덕션 오염 | 커밋 전 제거 |
| 미사용 import | 번들 크기 증가 | ESLint 자동 정리 |
| 비동기 에러 미처리 | 조용한 실패 | try-catch 필수 |
| props 직접 변경 | Vue 반응성 파괴 | emit 사용 |
| v-for에 index를 key로 | 렌더링 버그 | 고유 ID 사용 |
| 한 줄 제어문 | 가독성/디버깅 어려움 | 항상 중괄호 블록 사용 |
| POST/PUT 버튼 권한 미체크 | 권한 없는 사용자 접근 | `canWrite` 체크 필수 |
| DELETE 버튼 권한 미체크 | 권한 없는 사용자 접근 | `canDelete` 체크 필수 |
| `v-html` 미sanitize | XSS 공격 취약 | `xssKeeper()` 적용 |
| 민감 정보 하드코딩 | 보안 위험 | `.env` 환경 변수 |

---

## 권장 사항

| 항목 | 설명 |
|------|------|
| Composition API | Options API 대신 `<script setup>` 사용 |
| 타입 추론 활용 | 불필요한 타입 주석 최소화 |
| 코드 분할 | 동적 import로 라우트 레벨 분할 |
| 에러 바운더리 | 전역 에러 핸들링 구현 |
| 접근성(a11y) | ARIA 속성, 키보드 네비게이션 지원 |
| 반응형 디자인 | Quasar breakpoint 활용 |
| computed 캐싱 | 반복 계산 대신 computed 사용 |
| shallowRef | 대용량 객체에 shallowRef 사용 |
| length 체크 | `list.length === 0` 대신 `!list.length` 사용 |


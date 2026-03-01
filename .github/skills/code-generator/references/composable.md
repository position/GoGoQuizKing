# Composable 생성 가이드

재사용 가능한 로직 추출 (Nuxt 3).

## 위치

```
composables/use-{name}.ts
```

예시:
- `composables/use-quiz-form.ts`
- `composables/use-supabase.ts`

## Nuxt 3 자동 Import

`composables/` 폴더의 composable은 자동으로 import됩니다.

```typescript
// composables/useAuth.ts → useAuth() 자동 사용 가능
// composables/use-quiz-form.ts → useQuizForm() 자동 사용 가능
```

## 기본 템플릿

```typescript
// Nuxt 3: ref, computed 등은 자동 import
import type { Ref, ComputedRef } from 'vue';

interface UseExampleOptions {
    initialValue?: string;
}

interface UseExampleReturn {
    // State (readonly로 외부 변경 방지)
    state: Readonly<Ref<string>>;
    // Computed
    derived: ComputedRef<number>;
    // Methods
    doSomething: () => void;
    reset: () => void;
}

export function useExample(options?: UseExampleOptions): UseExampleReturn {
    // 1. Reactive State (ref, computed 등 자동 import)
    const state = ref(options?.initialValue ?? '');
    
    // 2. Computed
    const derived = computed(() => state.value.length);
    
    // 3. Methods
    function doSomething() {
        state.value = 'updated';
    }
    
    function reset() {
        state.value = options?.initialValue ?? '';
    }
    
    // 4. Return
    return {
        state: readonly(state),
        derived,
        doSomething,
        reset,
    };
}
```

## 실제 예시 (프로젝트 기준)

### useValidateSearchPlayer

검색 파라미터 유효성 검증:

```typescript
import { DTO } from '@/models';
import { AlertMessage } from '@/helper/message';
import { computed, ref, type ToRefs } from 'vue';

export default function useValidateSearchPlayer(
    playerSearchForm: ToRefs<DTO.Players.GetPlayerListRequest>,
) {
    const isNoParameters = computed(() => {
        return (
            !playerSearchForm?.playerId?.value &&
            !playerSearchForm?.wsopId?.value?.trim() &&
            !playerSearchForm?.cmsAccountId?.value &&
            !playerSearchForm?.playerName?.value?.trim() &&
            !playerSearchForm?.email?.value?.trim()
        );
    });

    async function checkSearchParamsValidation() {
        const isInvalid = ref(false);
        let title = '';
        let message = '';

        if (isNoParameters.value) {
            title = 'Please enter a search filter';
            message = `To view results, please enter at least one value.`;
            isInvalid.value = true;
        } else if (
            playerSearchForm?.playerName?.value &&
            playerSearchForm?.playerName?.value.trim().length < 2
        ) {
            title = 'Invalid Name';
            message = `Please enter at least 2 characters.`;
            isInvalid.value = true;
        }

        if (isInvalid.value) {
            await AlertMessage({ title, message });
            return false;
        }

        return true;
    }

    return {
        isNoParameters,
        checkSearchParamsValidation,
    };
}
```

## 패턴별 가이드

### API 데이터 패칭

```typescript
import { ref, onMounted } from 'vue';
import { someService } from '@/services/someService';
import type { ISomeData } from '@/models';

export default function useSomeData() {
    const data = ref<ISomeData | null>(null);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    async function fetch() {
        isLoading.value = true;
        error.value = null;
        
        try {
            const response = await someService.get();
            data.value = response.data.result;
        } catch (e) {
            error.value = e instanceof Error ? e.message : 'Unknown error';
        } finally {
            isLoading.value = false;
        }
    }

    onMounted(fetch);

    return {
        data: readonly(data),
        isLoading: readonly(isLoading),
        error: readonly(error),
        refetch: fetch,
    };
}
```

### 폼 상태 관리

```typescript
import { ref, computed } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, email } from '@vuelidate/validators';

export default function useFormExample() {
    const form = ref({
        name: '',
        email: '',
    });

    const rules = {
        name: { required },
        email: { required, email },
    };

    const v$ = useVuelidate(rules, form);

    const isValid = computed(() => !v$.value.$invalid);

    function reset() {
        form.value = { name: '', email: '' };
        v$.value.$reset();
    }

    async function validate() {
        const result = await v$.value.$validate();
        return result;
    }

    return {
        form,
        v$,
        isValid,
        reset,
        validate,
    };
}
```

### 이벤트/구독

```typescript
import { onMounted, onUnmounted } from 'vue';

export default function useEventListener(
    target: EventTarget,
    event: string,
    callback: EventListener
) {
    onMounted(() => {
        target.addEventListener(event, callback);
    });

    onUnmounted(() => {
        target.removeEventListener(event, callback);
    });
}
```

## 사용법

```vue
<script setup lang="ts">
import useValidateSearchPlayer from '@/composables/use-validate-search-player';
import { toRefs, reactive } from 'vue';

const searchForm = reactive({
    playerId: null,
    playerName: '',
    email: '',
});

const { isNoParameters, checkSearchParamsValidation } = useValidateSearchPlayer(
    toRefs(searchForm)
);

async function handleSearch() {
    const isValid = await checkSearchParamsValidation();
    if (!isValid) return;
    // 검색 로직
}
</script>
```

## 네이밍 규칙

| 규칙 | 예시 |
|------|------|
| 파일명 | `use-{기능명}.ts` (kebab-case) |
| 함수명 | `use{FunctionName}` (camelCase) |
| export | `export default function` |

예시:
- `use-auth.ts` → `useAuth()`
- `use-validate-search-player.ts` → `useValidateSearchPlayer()`
- `use-complete-event.ts` → `useCompleteEvent()`

## 체크리스트

- [ ] `use-` 접두사 파일명 (kebab-case)
- [ ] `export default function use{Name}()` 형태
- [ ] 반환 타입 interface 정의
- [ ] state는 `readonly()`로 외부 변경 방지
- [ ] 명확한 메서드명 (동사로 시작)


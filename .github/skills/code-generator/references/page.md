# Page 생성 가이드

Nuxt 3 페이지 컴포넌트 (파일 기반 라우팅).

## 위치

```
pages/index.vue              # / (홈)
pages/quiz/index.vue         # /quiz
pages/quiz/[id].vue          # /quiz/:id (동적 라우트)
pages/quiz/quiz-list.vue     # /quiz/quiz-list
pages/profile/index.vue      # /profile
```

## 파일 기반 라우팅

Nuxt 3는 `pages/` 디렉토리 구조에 따라 자동으로 라우트를 생성합니다.

| 파일 경로 | URL |
|----------|-----|
| `pages/index.vue` | `/` |
| `pages/quiz/index.vue` | `/quiz` |
| `pages/quiz/[id].vue` | `/quiz/:id` |
| `pages/quiz/play/[id].vue` | `/quiz/play/:id` |
| `pages/profile/stats.vue` | `/profile/stats` |

## 기본 템플릿

```vue
<template>
    <div class="page-container">
        <!-- 페이지 헤더 -->
        <header class="page-header">
            <h1 class="page-title">📝 페이지 제목</h1>
            <p class="page-description">페이지 설명</p>
        </header>

        <!-- 로딩 상태 -->
        <div v-if="isLoading" class="loading-container">
            <q-spinner-dots color="primary" size="60px" />
        </div>

        <!-- 메인 컨텐츠 -->
        <section v-else class="main-content">
            <!-- 컨텐츠 -->
        </section>
    </div>
</template>

<script setup lang="ts">
import { useQuizStore } from '@/store/quiz.store';
import type { IQuiz } from '@/models/quiz';

// 페이지 메타 설정
definePageMeta({
    layout: 'default',
    middleware: ['auth-guard'],
});

// Route & Store
const route = useRoute();
const router = useRouter();
const quizStore = useQuizStore();

// State
const isLoading = ref(false);
const items = ref<IQuiz[]>([]);

// Methods
async function fetchData() {
    isLoading.value = true;
    try {
        // 데이터 로딩 로직
    } finally {
        isLoading.value = false;
    }
}

// Lifecycle
onMounted(() => {
    fetchData();
});
</script>

<style scoped lang="scss">
.page-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px 16px 100px;
}

.page-header {
    text-align: center;
    margin-bottom: 24px;

    .page-title {
        font-size: 28px;
        font-weight: 800;
        color: var(--text-primary);
        margin: 0 0 8px 0;
    }

    .page-description {
        font-size: 14px;
        color: var(--text-secondary);
        margin: 0;
    }
}

.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
}
</style>
```

## 동적 라우트 페이지

```vue
<template>
    <div class="quiz-detail-page">
        <h1>Quiz {{ quizId }}</h1>
        <!-- 상세 내용 -->
    </div>
</template>

<script setup lang="ts">
import type { IQuiz } from '@/models/quiz';

definePageMeta({
    layout: 'default',
});

const route = useRoute();
const quizId = computed(() => route.params.id as string);

// useFetch로 데이터 로딩
const { data: quiz, pending } = await useFetch<IQuiz>(`/api/quiz/${quizId.value}`);
</script>
```

## definePageMeta 옵션

```typescript
definePageMeta({
    // 레이아웃 지정
    layout: 'default',
    
    // 미들웨어 적용
    middleware: ['auth-guard'],
    
    // 페이지 제목 (useHead와 함께 사용)
    title: '퀴즈 목록',
    
    // 커스텀 메타 데이터
    pageTransition: { name: 'page', mode: 'out-in' },
});
```

## useHead 활용

```vue
<script setup lang="ts">
useHead({
    title: '퀴즈 목록 | GoGoQuizKing',
    meta: [
        { name: 'description', content: '재미있는 퀴즈를 풀어보세요!' }
    ]
});
</script>
```

## 데이터 페칭 패턴

### useFetch (SSR 지원)

```vue
<script setup lang="ts">
const { data, pending, error, refresh } = await useFetch('/api/quiz');
</script>
```

### useAsyncData (커스텀 로직)

```vue
<script setup lang="ts">
const { data, pending } = await useAsyncData('quiz-list', () => {
    return quizStore.fetchQuizList();
});
</script>
```

### 클라이언트 사이드만

```vue
<script setup lang="ts">
const isLoading = ref(false);
const items = ref([]);

onMounted(async () => {
    isLoading.value = true;
    try {
        items.value = await fetchData();
    } finally {
        isLoading.value = false;
    }
});
</script>
```

## 네이밍 규칙

| 파일명 | URL | 설명 |
|--------|-----|------|
| `index.vue` | `/` | 인덱스 페이지 |
| `quiz-list.vue` | `/quiz-list` | kebab-case |
| `[id].vue` | `/:id` | 동적 파라미터 |
| `[...slug].vue` | `/*` | Catch-all |

## 레이아웃

```
layouts/
├── default.vue      # 기본 레이아웃 (헤더, 네비게이션 포함)
└── empty.vue        # 빈 레이아웃 (로그인 페이지 등)
```

```vue
<script setup lang="ts">
definePageMeta({
    layout: 'empty',  // 또는 'default'
});
</script>
```

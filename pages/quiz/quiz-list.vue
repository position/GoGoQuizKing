<template>
    <div class="quiz-list-page">
        <!-- 페이지 헤더 -->
        <div class="page-header">
            <div class="header-content">
                <h1 class="page-title">🎯 신나는 퀴즈 탐험!</h1>
                <p class="page-subtitle">재미있는 퀴즈를 풀어볼까요? 고고! 🚀</p>
            </div>
            <q-btn
                :to="{ path: '/quiz/quiz-create' }"
                label="퀴즈 만들기 ✨"
                icon="add"
                color="secondary"
                unelevated
                class="create-btn"
                size="large"
            />
        </div>

        <!-- 필터 섹션 -->
        <div class="filter-section">
            <div class="filter-row">
                <!-- 검색 -->
                <q-input
                    v-model="searchQuery"
                    placeholder="어떤 퀴즈를 찾고 있나요?"
                    outlined
                    dense
                    clearable
                    class="search-input"
                    @update:model-value="handleFilterChange"
                >
                    <template #prepend>
                        <q-icon name="search" />
                    </template>
                </q-input>

                <!-- 카테고리 필터 -->
                <q-select
                    v-model="selectedCategory"
                    :options="categoryOptions"
                    label="카테고리"
                    outlined
                    dense
                    emit-value
                    map-options
                    clearable
                    class="filter-select"
                    @update:model-value="handleFilterChange"
                />

                <!-- 난이도 필터 -->
                <q-select
                    v-model="selectedDifficulty"
                    :options="difficultyOptions"
                    label="난이도"
                    outlined
                    dense
                    emit-value
                    map-options
                    clearable
                    class="filter-select"
                    @update:model-value="handleFilterChange"
                />

                <!-- 학년 필터 -->
                <q-select
                    v-model="selectedGrade"
                    :options="gradeOptions"
                    label="학년"
                    outlined
                    dense
                    emit-value
                    map-options
                    clearable
                    class="filter-select"
                    @update:model-value="handleFilterChange"
                />
            </div>

            <!-- 정렬 -->
            <div class="sort-row">
                <q-btn-toggle
                    v-model="sortBy"
                    :options="sortOptions"
                    no-caps
                    unelevated
                    toggle-color="primary"
                    class="sort-toggle"
                    @update:model-value="handleFilterChange"
                />

                <!-- 필터 초기화 버튼 -->
                <q-btn
                    v-if="hasActiveFilter"
                    label="필터 초기화"
                    icon="refresh"
                    flat
                    dense
                    color="grey-7"
                    class="reset-btn"
                    @click="handleResetFilter"
                />
            </div>
        </div>

        <!-- 초기 로딩 -->
        <div v-if="quizStore.isLoading && filteredQuizzes.length === 0" class="loading-state">
            <q-spinner-dots color="primary" size="50px" />
            <p>퀴즈를 불러오고 있어요~ 🎵</p>
        </div>

        <!-- 빈 상태 -->
        <div v-else-if="!quizStore.isLoading && filteredQuizzes.length === 0" class="empty-state">
            <q-icon name="quiz" size="80px" color="grey-4" />
            <h3>아직 퀴즈가 없어요~ 🙈</h3>
            <p>첫 번째 퀴즈를 만들어볼까요?</p>
            <q-btn
                :to="{ path: '/quiz/quiz-create' }"
                label="퀴즈 만들기 🎨"
                icon="add"
                color="primary"
                unelevated
                size="large"
            />
        </div>

        <!-- 퀴즈 그리드 (무한 스크롤) -->
        <q-infinite-scroll v-else ref="infiniteScrollRef" :offset="300" @load="onLoadMore">
            <div class="quiz-grid">
                <QuizCard
                    v-for="quiz in filteredQuizzes"
                    :key="quiz.id"
                    :quiz="quiz"
                    @play="handlePlay"
                    @click="handlePlay"
                />
            </div>

            <template #loading>
                <div class="row justify-center q-my-md">
                    <q-spinner-dots color="primary" size="40px" />
                </div>
            </template>
        </q-infinite-scroll>

        <!-- 더 이상 데이터 없음 표시 -->
        <div
            v-if="!quizStore.pagination.hasMore && filteredQuizzes.length > 0"
            class="no-more-data"
        >
            <p>🎉 모든 퀴즈를 불러왔어요!</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import type { QInfiniteScroll } from 'quasar';
import { useQuizStore } from '@/store/quiz.store';
import { CATEGORIES, DIFFICULTIES } from '@/models/quiz';
import type { QuizCategory, DifficultyLevel } from '@/models/quiz';
import QuizCard from '@/components/quiz/QuizCard.vue';

definePageMeta({
    title: '퀴즈 목록',
});

// SEO 설정
useSeoMeta({
    title: '퀴즈 탐험 - 고고퀴즈킹(GoGo QuizKing) | 다양한 퀴즈를 풀어보세요',
    description:
        '수학, 과학, 국어, 영어, 상식, 넌센스 등 다양한 카테고리의 재미있는 퀴즈를 탐험해보세요! 난이도별, 학년별 퀴즈 검색과 인기 퀴즈 추천까지.',
    ogTitle: '퀴즈 탐험 - 고고퀴즈킹(GoGo QuizKing)',
    ogDescription:
        '수학, 과학, 국어, 영어 등 다양한 분야의 퀴즈가 준비되어 있습니다. 지금 도전해보세요!',
});

const router = useRouter();
const route = useRoute();
const quizStore = useQuizStore();

// Infinite Scroll ref
const infiniteScrollRef = ref<QInfiniteScroll | null>(null);

// URL 쿼리에서 필터 값 파싱
function parseQuerySearchQuery(): string | null {
    const q = route.query.q;
    return typeof q === 'string' && q ? q : null;
}

function parseQueryCategory(): QuizCategory | null {
    const category = route.query.category;
    if (typeof category === 'string' && category in CATEGORIES) {
        return category as QuizCategory;
    }
    return null;
}

function parseQueryDifficulty(): DifficultyLevel | null {
    const difficulty = route.query.difficulty;
    if (typeof difficulty === 'string' && difficulty in DIFFICULTIES) {
        return difficulty as DifficultyLevel;
    }
    return null;
}

function parseQueryGrade(): number | null {
    const grade = route.query.grade;
    if (typeof grade === 'string') {
        const parsed = parseInt(grade, 10);
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 6) {
            return parsed;
        }
    }
    return null;
}

function parseQuerySortBy(): 'created_at' | 'play_count' | null {
    const sort = route.query.sort;
    if (sort === 'play_count') {
        return 'play_count';
    }
    if (sort === 'created_at') {
        return 'created_at';
    }
    return null;
}

// URL 쿼리스트링이 있는지 확인
function hasQueryParams(): boolean {
    return !!(
        route.query.q ||
        route.query.category ||
        route.query.difficulty ||
        route.query.grade ||
        route.query.sort
    );
}

// 초기값 결정: URL 쿼리 우선, 없으면 store 값 사용
function getInitialValue<T>(queryValue: T | null, storeValue: T | null | undefined): T | null {
    if (hasQueryParams()) {
        return queryValue;
    }
    return storeValue ?? null;
}

// 필터 상태 (URL 쿼리 우선 → store 값 fallback)
const searchQuery = ref(
    getInitialValue(parseQuerySearchQuery(), quizStore.filter.searchQuery) || '',
);
const selectedCategory = ref<QuizCategory | null>(
    getInitialValue(parseQueryCategory(), quizStore.filter.category),
);
const selectedDifficulty = ref<DifficultyLevel | null>(
    getInitialValue(parseQueryDifficulty(), quizStore.filter.difficulty),
);
const selectedGrade = ref<number | null>(
    getInitialValue(parseQueryGrade(), quizStore.filter.gradeLevel),
);
const sortBy = ref<'created_at' | 'play_count'>(
    getInitialValue(parseQuerySortBy(), quizStore.filter.sortBy) || 'created_at',
);

// URL 쿼리 파라미터 업데이트 함수
function updateQueryParams() {
    const query: Record<string, string> = {};

    if (searchQuery.value) {
        query.q = searchQuery.value;
    }
    if (selectedCategory.value) {
        query.category = selectedCategory.value;
    }
    if (selectedDifficulty.value) {
        query.difficulty = selectedDifficulty.value;
    }
    if (selectedGrade.value) {
        query.grade = String(selectedGrade.value);
    }
    if (sortBy.value !== 'created_at') {
        query.sort = sortBy.value;
    }

    // URL 업데이트 (히스토리에 추가하지 않고 replace)
    router.replace({ query });
}

// 카테고리 옵션
const categoryOptions = computed(() => [
    { label: '전체', value: null },
    ...Object.entries(CATEGORIES).map(([value, info]) => ({
        label: `${info.icon} ${info.label}`,
        value,
    })),
]);

// 난이도 옵션
const difficultyOptions = computed(() => [
    { label: '전체', value: null },
    ...Object.entries(DIFFICULTIES).map(([value, info]) => ({
        label: `${getDifficultyIcon(value)} ${info.label}`,
        value,
    })),
]);

function getDifficultyIcon(difficulty: string): string {
    const icons: Record<string, string> = {
        seedling: '🌱',
        leaf: '🌿',
        tree: '🌳',
        king: '👑',
    };
    return icons[difficulty] || '🌿';
}

// 학년 옵션
const gradeOptions = [
    { label: '전체', value: null },
    { label: '1학년', value: 1 },
    { label: '2학년', value: 2 },
    { label: '3학년', value: 3 },
    { label: '4학년', value: 4 },
    { label: '5학년', value: 5 },
    { label: '6학년', value: 6 },
];

// 정렬 옵션
const sortOptions = [
    { label: '최신순', value: 'created_at' },
    { label: '인기순', value: 'play_count' },
];

// 필터링된 퀴즈 (서버에서 필터링 되므로 quizStore.quizzes 직접 사용)
const filteredQuizzes = computed(() => quizStore.quizzes);

// 활성화된 필터가 있는지 확인
const hasActiveFilter = computed(() => {
    return !!(
        searchQuery.value ||
        selectedCategory.value ||
        selectedDifficulty.value ||
        selectedGrade.value ||
        sortBy.value !== 'created_at'
    );
});

// 무한 스크롤 로드 핸들러
async function onLoadMore(index: number, done: (stop?: boolean) => void) {
    await quizStore.fetchQuizzesPaginated();
    done(!quizStore.pagination.hasMore);
}

// 필터 변경 핸들러 (debounce 적용)
let filterTimeout: ReturnType<typeof setTimeout> | null = null;
function handleFilterChange() {
    if (filterTimeout) {
        clearTimeout(filterTimeout);
    }
    filterTimeout = setTimeout(() => {
        // URL 쿼리 파라미터 업데이트
        updateQueryParams();

        // Store에 필터 저장 (persist로 sessionStorage에 자동 저장됨)
        quizStore.setFilter({
            category: selectedCategory.value,
            difficulty: selectedDifficulty.value,
            gradeLevel: selectedGrade.value,
            searchQuery: searchQuery.value,
            sortBy: sortBy.value,
            sortOrder: 'desc',
        });
        // 필터 변경 시 리스트 리셋 후 다시 로드
        quizStore.resetQuizzes();
        infiniteScrollRef.value?.reset();
        infiniteScrollRef.value?.resume();
        quizStore.fetchQuizzesPaginated();
    }, 300);
}

// 필터 전체 초기화 핸들러
function handleResetFilter() {
    // 로컬 상태 초기화
    searchQuery.value = '';
    selectedCategory.value = null;
    selectedDifficulty.value = null;
    selectedGrade.value = null;
    sortBy.value = 'created_at';

    // Store 필터 초기화
    quizStore.resetFilter();

    // URL 쿼리 파라미터 초기화
    router.replace({ query: {} });

    // 퀴즈 목록 다시 로드
    quizStore.resetQuizzes();
    infiniteScrollRef.value?.reset();
    infiniteScrollRef.value?.resume();
    quizStore.fetchQuizzesPaginated();
}

// 초기 데이터 로드
onMounted(() => {
    // Store에 현재 필터 값 적용
    quizStore.setFilter({
        category: selectedCategory.value,
        difficulty: selectedDifficulty.value,
        gradeLevel: selectedGrade.value,
        searchQuery: searchQuery.value,
        sortBy: sortBy.value,
        sortOrder: 'desc',
    });

    // URL 쿼리 파라미터 동기화 (store에서 복원된 경우 URL에도 반영)
    updateQueryParams();

    quizStore.resetQuizzes();
    quizStore.fetchQuizzesPaginated();
});

// URL 쿼리 변경 감지 (브라우저 뒤로가기/앞으로가기 대응)
watch(
    () => route.query,
    (newQuery, oldQuery) => {
        // 쿼리가 실제로 변경된 경우에만 처리
        if (JSON.stringify(newQuery) === JSON.stringify(oldQuery)) {
            return;
        }

        const newSearchQuery = parseQuerySearchQuery() || '';
        const newCategory = parseQueryCategory();
        const newDifficulty = parseQueryDifficulty();
        const newGrade = parseQueryGrade();
        const newSortBy = parseQuerySortBy() || 'created_at';

        // 값이 변경된 경우에만 업데이트
        const hasChanged =
            searchQuery.value !== newSearchQuery ||
            selectedCategory.value !== newCategory ||
            selectedDifficulty.value !== newDifficulty ||
            selectedGrade.value !== newGrade ||
            sortBy.value !== newSortBy;

        if (hasChanged) {
            searchQuery.value = newSearchQuery;
            selectedCategory.value = newCategory;
            selectedDifficulty.value = newDifficulty;
            selectedGrade.value = newGrade;
            sortBy.value = newSortBy;

            quizStore.setFilter({
                category: newCategory,
                difficulty: newDifficulty,
                gradeLevel: newGrade,
                searchQuery: newSearchQuery,
                sortBy: newSortBy,
                sortOrder: 'desc',
            });

            quizStore.resetQuizzes();
            infiniteScrollRef.value?.reset();
            infiniteScrollRef.value?.resume();
            quizStore.fetchQuizzesPaginated();
        }
    },
);

function handlePlay(quizId: string) {
    router.push({ path: `/quiz/${quizId}` });
}
</script>

<style scoped lang="scss">
.quiz-list-page {
    max-width: 1200px;
    margin: 0 auto;

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        flex-wrap: wrap;
        gap: 16px;

        .header-content {
            .page-title {
                font-size: 28px;
                font-weight: 700;
                color: var(--text-primary);
                margin: 0 0 4px;
            }

            .page-subtitle {
                font-size: 16px;
                color: var(--text-secondary);
                margin: 0;
            }
        }

        .create-btn {
            border-radius: 12px;
            font-weight: 600;
        }
    }

    .filter-section {
        background: var(--bg-card);
        border-radius: 16px;
        padding: 20px;
        margin-bottom: 24px;
        box-shadow: 0 2px 8px var(--shadow-color);
        transition: background-color 0.3s ease;

        .filter-row {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            margin-bottom: 16px;

            .search-input {
                flex: 1;
                min-width: 200px;
            }

            .filter-select {
                min-width: 140px;
            }
        }

        .sort-row {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 12px;

            .sort-toggle {
                border-radius: 8px;
            }

            .reset-btn {
                font-size: 13px;
            }
        }
    }

    .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        gap: 16px;

        p {
            font-size: 16px;
            color: var(--text-secondary);
        }
    }

    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        text-align: center;

        h3 {
            font-size: 20px;
            font-weight: 600;
            color: var(--text-secondary);
            margin: 16px 0 8px;
        }

        p {
            font-size: 14px;
            color: var(--text-light);
            margin: 0 0 20px;
        }
    }

    .quiz-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
    }

    .no-more-data {
        text-align: center;
        padding: 24px;
        color: var(--text-secondary);

        p {
            margin: 0;
            font-size: 14px;
        }
    }
}

@media (max-width: 768px) {
    .quiz-list-page {
        .page-header {
            .page-title {
                font-size: 24px;
            }
        }

        .filter-section {
            .filter-row {
                flex-direction: column;

                .search-input,
                .filter-select {
                    width: 100%;
                }
            }
        }

        .quiz-grid {
            grid-template-columns: 1fr;
        }
    }
}
</style>

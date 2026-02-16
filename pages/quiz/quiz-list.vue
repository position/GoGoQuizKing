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
                    placeholder="어떤 퀴즈를 찾고 있나요? 🔍"
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
import { ref, computed, onMounted } from 'vue';
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
    title: '퀴즈 탐험 - GoGoQuizKing',
    description:
        '다양한 카테고리의 재미있는 퀴즈를 탐험해보세요! 수학, 과학, 국어, 영어 등 다양한 분야의 퀴즈가 준비되어 있습니다.',
    ogTitle: '퀴즈 탐험 - GoGoQuizKing',
    ogDescription:
        '다양한 카테고리의 재미있는 퀴즈를 탐험해보세요! 수학, 과학, 국어, 영어 등 다양한 분야의 퀴즈가 준비되어 있습니다.',
});

const router = useRouter();
const quizStore = useQuizStore();

// Infinite Scroll ref
const infiniteScrollRef = ref<QInfiniteScroll | null>(null);

// 필터 상태
const searchQuery = ref('');
const selectedCategory = ref<QuizCategory | null>(null);
const selectedDifficulty = ref<DifficultyLevel | null>(null);
const selectedGrade = ref<number | null>(null);
const sortBy = ref<'created_at' | 'play_count'>('created_at');

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

// 필터링된 퀴즈 (클라이언트 사이드 필터링)
const filteredQuizzes = computed(() => {
    let result = [...quizStore.quizzes];

    // 카테고리 필터
    if (selectedCategory.value) {
        result = result.filter((q) => q.category === selectedCategory.value);
    }

    // 난이도 필터
    if (selectedDifficulty.value) {
        result = result.filter((q) => q.difficulty === selectedDifficulty.value);
    }

    // 학년 필터
    if (selectedGrade.value) {
        result = result.filter((q) => q.grade_level === selectedGrade.value);
    }

    // 검색 필터
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(
            (q) =>
                q.title.toLowerCase().includes(query) ||
                q.description?.toLowerCase().includes(query),
        );
    }

    // 정렬
    result.sort((a, b) => {
        if (sortBy.value === 'play_count') {
            return b.play_count - a.play_count;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return result;
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

// 초기 데이터 로드
onMounted(() => {
    quizStore.resetQuizzes();
    quizStore.fetchQuizzesPaginated();
});

function handlePlay(quizId: string) {
    router.push({ path: `/quiz/play/${quizId}` });
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

            .sort-toggle {
                border-radius: 8px;
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

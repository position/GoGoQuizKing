<template>
    <div class="quiz-list-page">
        <!-- 페이지 헤더 -->
        <div class="page-header">
            <div class="header-content">
                <h1 class="page-title">🎯 퀴즈 탐험</h1>
                <p class="page-subtitle">재미있는 퀴즈를 풀어보세요!</p>
            </div>
            <q-btn
                :to="{ path: '/quiz/quiz-create' }"
                label="퀴즈 만들기"
                icon="add"
                color="primary"
                unelevated
                class="create-btn"
            />
        </div>

        <!-- 필터 섹션 -->
        <div class="filter-section">
            <div class="filter-row">
                <!-- 검색 -->
                <q-input
                    v-model="searchQuery"
                    placeholder="퀴즈 검색..."
                    outlined
                    dense
                    clearable
                    class="search-input"
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
                />
            </div>
        </div>

        <!-- 로딩 -->
        <div v-if="quizStore.isLoading" class="loading-state">
            <q-spinner-dots color="primary" size="50px" />
            <p>퀴즈를 불러오는 중...</p>
        </div>

        <!-- 빈 상태 -->
        <div v-else-if="filteredQuizzes.length === 0" class="empty-state">
            <q-icon name="quiz" size="80px" color="grey-4" />
            <h3>퀴즈가 없습니다</h3>
            <p>첫 번째 퀴즈를 만들어보세요!</p>
            <q-btn
                :to="{ path: '/quiz/quiz-create' }"
                label="퀴즈 만들기"
                icon="add"
                color="primary"
                unelevated
            />
        </div>

        <!-- 퀴즈 그리드 -->
        <div v-else class="quiz-grid">
            <QuizCard
                v-for="quiz in filteredQuizzes"
                :key="quiz.id"
                :quiz="quiz"
                @play="handlePlay"
                @click="handlePlay"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useQuizStore } from '@/store/quiz.store';
import { CATEGORIES, DIFFICULTIES } from '@/models/quiz';
import type { QuizCategory, DifficultyLevel } from '@/models/quiz';
import QuizCard from '@/components/quiz/QuizCard.vue';

definePageMeta({
    title: '퀴즈 목록',
});

const router = useRouter();
const quizStore = useQuizStore();

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

// 필터링된 퀴즈
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
                q.description?.toLowerCase().includes(query)
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

// 데이터 로드
onMounted(() => {
    quizStore.fetchQuizzes();
});

// 필터 변경 시 스토어 업데이트
watch([selectedCategory, selectedDifficulty, selectedGrade, searchQuery, sortBy], () => {
    quizStore.setFilter({
        category: selectedCategory.value,
        difficulty: selectedDifficulty.value,
        gradeLevel: selectedGrade.value,
        searchQuery: searchQuery.value,
        sortBy: sortBy.value,
        sortOrder: 'desc',
    });
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
                color: #2d3436;
                margin: 0 0 4px;
            }

            .page-subtitle {
                font-size: 16px;
                color: #636e72;
                margin: 0;
            }
        }

        .create-btn {
            border-radius: 12px;
            font-weight: 600;
        }
    }

    .filter-section {
        background: white;
        border-radius: 16px;
        padding: 20px;
        margin-bottom: 24px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

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
            color: #636e72;
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
            color: #636e72;
            margin: 16px 0 8px;
        }

        p {
            font-size: 14px;
            color: #b2bec3;
            margin: 0 0 20px;
        }
    }

    .quiz-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
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

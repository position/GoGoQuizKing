<template>
    <q-page padding>
        <div class="quiz-automation-admin">
            <q-card class="q-mb-md">
                <q-card-section>
                    <div class="text-h5 q-mb-md">🤖 퀴즈 자동 생성 관리</div>
                    <p class="text-body2 text-grey-7">
                        매일 자정에 자동으로 새로운 퀴즈가 생성됩니다. 수동으로 생성할 수도
                        있습니다.
                    </p>
                </q-card-section>

                <q-card-section>
                    <div class="row q-col-gutter-md items-end">
                        <!-- 모드 선택 -->
                        <div class="col-12 col-sm-4">
                            <q-select
                                v-model="selectedMode"
                                :options="modeOptions"
                                label="생성 모드"
                                outlined
                                dense
                                emit-value
                                map-options
                            >
                                <template #prepend>
                                    <q-icon name="settings" />
                                </template>
                            </q-select>
                        </div>

                        <!-- single 모드: 템플릿 인덱스 선택 -->
                        <div v-if="selectedMode === 'single'" class="col-12 col-sm-3">
                            <q-select
                                v-model="templateIndex"
                                :options="templateOptions"
                                label="템플릿 선택"
                                outlined
                                dense
                                emit-value
                                map-options
                            />
                        </div>

                        <!-- batch 모드: 생성 개수 선택 -->
                        <div v-if="selectedMode === 'batch'" class="col-12 col-sm-3">
                            <q-input
                                v-model.number="batchCount"
                                type="number"
                                label="생성 개수"
                                outlined
                                dense
                                :min="1"
                                :max="10"
                            />
                        </div>

                        <!-- 생성 버튼 -->
                        <div class="col-12 col-sm-auto">
                            <q-btn
                                color="primary"
                                icon="add_circle"
                                :label="generateButtonLabel"
                                :loading="generating"
                                @click="generateQuiz"
                            />
                        </div>
                    </div>

                    <!-- 모드 설명 -->
                    <q-banner class="bg-blue-1 q-mt-md" rounded>
                        <template #avatar>
                            <q-icon name="info" color="primary" />
                        </template>
                        <span class="text-body2">{{ modeDescription }}</span>
                    </q-banner>
                </q-card-section>
            </q-card>

            <q-card>
                <q-card-section>
                    <div class="text-h6 q-mb-md">📊 생성 이력</div>

                    <q-table
                        v-model:pagination="pagination"
                        @request="onRequest"
                        :rows="history"
                        :columns="columns"
                        row-key="id"
                        :loading="loading"
                        flat
                        bordered
                    >
                        <template #body-cell-quiz_title="props">
                            <q-td :props="props">
                                <router-link
                                    v-if="props.row.quizzes"
                                    :to="`../quiz/play/${props.row.quizzes.id}`"
                                    class="text-primary"
                                >
                                    {{ props.row.quizzes.title }}
                                </router-link>
                                <span v-else class="text-grey-6">삭제된 퀴즈</span>
                            </q-td>
                        </template>

                        <template #body-cell-category="props">
                            <q-td :props="props">
                                <q-badge
                                    v-if="props.row.quizzes"
                                    :color="getCategoryColor(props.row.quizzes.category)"
                                >
                                    {{ getCategoryLabel(props.row.quizzes.category) }}
                                </q-badge>
                            </q-td>
                        </template>

                        <template #body-cell-difficulty="props">
                            <q-td :props="props">
                                <q-badge
                                    v-if="props.row.quizzes"
                                    :color="getDifficultyColor(props.row.quizzes.difficulty)"
                                >
                                    {{ getDifficultyLabel(props.row.quizzes.difficulty) }}
                                </q-badge>
                            </q-td>
                        </template>

                        <template #body-cell-status="props">
                            <q-td :props="props">
                                <q-badge
                                    :color="
                                        props.row.status === 'success' ? 'positive' : 'negative'
                                    "
                                >
                                    {{ props.row.status === 'success' ? '성공' : '실패' }}
                                </q-badge>
                            </q-td>
                        </template>

                        <template #body-cell-generated_at="props">
                            <q-td :props="props">
                                {{ formatDate(props.row.generated_at) }}
                            </q-td>
                        </template>

                        <!-- Pagination Slot -->
                        <template #pagination="scope">
                            <div class="row items-center justify-center q-gutter-sm">
                                <span class="text-caption text-grey-7 q-mr-md">
                                    총 {{ scope.pagination.rowsNumber }}개
                                </span>

                                <q-btn
                                    icon="first_page"
                                    color="grey-8"
                                    round
                                    dense
                                    flat
                                    :disable="scope.isFirstPage"
                                    @click="scope.firstPage"
                                />
                                <q-btn
                                    icon="chevron_left"
                                    color="grey-8"
                                    round
                                    dense
                                    flat
                                    :disable="scope.isFirstPage"
                                    @click="scope.prevPage"
                                />

                                <span class="text-body1">
                                    {{ scope.pagination.page }} / {{ scope.pagesNumber || 1 }}
                                </span>

                                <q-btn
                                    icon="chevron_right"
                                    color="grey-8"
                                    round
                                    dense
                                    flat
                                    :disable="scope.isLastPage"
                                    @click="scope.nextPage"
                                />
                                <q-btn
                                    icon="last_page"
                                    color="grey-8"
                                    round
                                    dense
                                    flat
                                    :disable="scope.isLastPage"
                                    @click="scope.lastPage"
                                />
                            </div>
                        </template>
                    </q-table>
                </q-card-section>
            </q-card>
        </div>
    </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';

type GenerateMode = 'daily' | 'all' | 'single' | 'batch';

// SEO 설정 - 관리자 전용 페이지는 검색 엔진에서 제외
useSeoMeta({
    title: '퀴즈 자동 생성 관리 - 고고퀴즈킹(GoGo QuizKing)',
    robots: 'noindex, nofollow',
});

const $q = useQuasar();

const generating = ref(false);
const loading = ref(false);
const history = ref<any[]>([]);

// Pagination 설정
const pagination = ref({
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 0,
    sortBy: 'generated_at',
    descending: true,
});

// 모드 관련 상태
const selectedMode = ref<GenerateMode>('daily');
const templateIndex = ref(0);
const batchCount = ref(3);

// 모드 옵션
const modeOptions = [
    { label: '📅 오늘의 퀴즈 (Daily)', value: 'daily' },
    { label: '📦 전체 생성 (All)', value: 'all' },
    { label: '🎯 단일 템플릿 (Single)', value: 'single' },
    { label: '🔢 일괄 생성 (Batch)', value: 'batch' },
];

// 템플릿 옵션 (0-9 인덱스)
const templateOptions = [
    { label: '0: 수학 - 덧셈과 뺄셈', value: 0 },
    { label: '1: 과학 - 동물의 세계', value: 1 },
    { label: '2: 사회 - 우리 동네', value: 2 },
    { label: '3: 국어 - 받아쓰기', value: 3 },
    { label: '4: 영어 - 기초 단어', value: 4 },
    { label: '5: 수학 - 곱셈 구구단', value: 5 },
    { label: '6: 과학 - 식물의 성장', value: 6 },
    { label: '7: 사회 - 세계 여러 나라', value: 7 },
    { label: '8: 음악 - 악기 알아보기', value: 8 },
    { label: '9: 미술 - 색의 이해', value: 9 },
];

// 모드별 설명
const modeDescription = computed(() => {
    switch (selectedMode.value) {
        case 'daily':
            return '오늘 날짜를 기준으로 순환하여 1개의 퀴즈를 생성합니다. (매일 자동 생성과 동일)';
        case 'all':
            return '모든 템플릿(10개)으로 퀴즈를 한 번에 생성합니다.';
        case 'single':
            return '선택한 템플릿으로 1개의 퀴즈만 생성합니다.';
        case 'batch':
            return `지정한 개수(${batchCount.value}개)만큼 순차적으로 퀴즈를 생성합니다.`;
        default:
            return '';
    }
});

// 버튼 라벨
const generateButtonLabel = computed(() => {
    switch (selectedMode.value) {
        case 'daily':
            return '오늘의 퀴즈 생성';
        case 'all':
            return '전체 퀴즈 생성 (10개)';
        case 'single':
            return '선택 퀴즈 생성';
        case 'batch':
            return `${batchCount.value}개 퀴즈 생성`;
        default:
            return '퀴즈 생성';
    }
});

const columns: {
    name: string;
    label: string;
    field: string;
    align: 'left' | 'center' | 'right';
    sortable: boolean;
}[] = [
    {
        name: 'quiz_title',
        label: '퀴즈 제목',
        field: 'template_name',
        align: 'left',
        sortable: true,
    },
    {
        name: 'category',
        label: '카테고리',
        field: 'category',
        align: 'center',
        sortable: true,
    },
    {
        name: 'difficulty',
        label: '난이도',
        field: 'difficulty',
        align: 'center',
        sortable: true,
    },
    {
        name: 'status',
        label: '상태',
        field: 'status',
        align: 'center',
        sortable: true,
    },
    {
        name: 'generated_at',
        label: '생성 일시',
        field: 'generated_at',
        align: 'center',
        sortable: true,
    },
];

const generateQuiz = async () => {
    generating.value = true;
    try {
        // 모드별 요청 본문 구성
        const requestBody: { mode: GenerateMode; index?: number; count?: number } = {
            mode: selectedMode.value,
        };

        if (selectedMode.value === 'single') {
            requestBody.index = templateIndex.value;
        } else if (selectedMode.value === 'batch') {
            requestBody.count = batchCount.value;
        }

        const response = await $fetch<{
            success: boolean;
            total_created?: number;
            error?: string;
        }>('/api/quiz/generate', {
            method: 'POST',
            body: requestBody,
        });

        if (response.success) {
            const totalCreated = response.total_created || 1;
            $q.notify({
                type: 'positive',
                message:
                    totalCreated > 1
                        ? `${totalCreated}개의 퀴즈가 성공적으로 생성되었습니다!`
                        : '퀴즈가 성공적으로 생성되었습니다!',
                position: 'top',
            });
            await loadHistory();
        } else {
            throw new Error(response.error || '퀴즈 생성에 실패했습니다.');
        }
    } catch (error: any) {
        $q.notify({
            type: 'negative',
            message: error.message || '퀴즈 생성에 실패했습니다.',
            position: 'top',
        });
    } finally {
        generating.value = false;
    }
};

// QTable 서버 사이드 페이지네이션 핸들러
const onRequest = async (props: {
    pagination: { page: number; rowsPerPage: number; rowsNumber?: number };
}) => {
    const { page, rowsPerPage } = props.pagination;

    loading.value = true;
    try {
        const response = (await $fetch('/api/quiz/generation-history', {
            params: {
                page,
                limit: rowsPerPage,
            },
        })) as {
            success: boolean;
            data?: any[];
            pagination?: { total: number; totalPages: number };
            error?: string;
        };

        if (response.success && response.data && response.pagination) {
            history.value = response.data;

            // 페이지네이션 상태 업데이트
            pagination.value.page = page;
            pagination.value.rowsPerPage = rowsPerPage;
            pagination.value.rowsNumber = response.pagination.total;
        }
    } catch (error) {
        console.error('히스토리 로드 실패:', error);
    } finally {
        loading.value = false;
    }
};

const loadHistory = async () => {
    await onRequest({ pagination: pagination.value });
};

const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
        math: 'blue',
        science: 'green',
        social: 'orange',
        korean: 'purple',
        english: 'pink',
        art: 'teal',
        music: 'indigo',
        physical: 'red',
    };
    return colors[category] || 'grey';
};

const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
        math: '수학',
        science: '과학',
        social: '사회',
        korean: '국어',
        english: '영어',
        art: '미술',
        music: '음악',
        physical: '체육',
    };
    return labels[category] || category;
};

const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
        seedling: 'light-green',
        leaf: 'green',
        tree: 'orange',
        king: 'red',
    };
    return colors[difficulty] || 'grey';
};

const getDifficultyLabel = (difficulty: string) => {
    const labels: Record<string, string> = {
        seedling: '🌱 새싹',
        leaf: '🌿 풀잎',
        tree: '🌳 나무',
        king: '👑 킹왕짱',
    };
    return labels[difficulty] || difficulty;
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
};

onMounted(() => {
    loadHistory();
});
</script>

<style scoped lang="scss">
.quiz-automation-admin {
    max-width: 1200px;
    margin: 0 auto;
    .text-h5 {
        font-weight: 700;
    }
}
.q-table {
    th {
        font-size: 16px !important;
    }
}
</style>

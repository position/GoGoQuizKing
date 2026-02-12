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
                    <q-btn
                        color="primary"
                        icon="add_circle"
                        label="지금 퀴즈 생성하기"
                        :loading="generating"
                        @click="generateQuiz"
                    />
                </q-card-section>
            </q-card>

            <q-card>
                <q-card-section>
                    <div class="text-h6 q-mb-md">📊 생성 이력</div>

                    <q-table
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
                                    :to="`/quiz/${props.row.quizzes.id}`"
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
                    </q-table>

                    <div class="q-mt-md flex justify-center">
                        <q-pagination
                            v-model="currentPage"
                            :max="totalPages"
                            :max-pages="7"
                            direction-links
                            @update:model-value="loadHistory"
                        />
                    </div>
                </q-card-section>
            </q-card>
        </div>
    </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';

// SEO 설정 - 관리자 전용 페이지는 검색 엔진에서 제외
useSeoMeta({
    title: '퀴즈 자동 생성 관리 - GoGoQuizKing',
    robots: 'noindex, nofollow',
});

const $q = useQuasar();

const generating = ref(false);
const loading = ref(false);
const history = ref<any[]>([]);
const currentPage = ref(1);
const totalPages = ref(1);

const columns = [
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
        const response = await $fetch('/api/quiz/generate', {
            method: 'POST',
        });

        if (response.success) {
            $q.notify({
                type: 'positive',
                message: '퀴즈가 성공적으로 생성되었습니다!',
                position: 'top',
            });
            await loadHistory();
        } else {
            throw new Error(response.error);
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

const loadHistory = async () => {
    loading.value = true;
    try {
        const response = await $fetch('/api/quiz/generation-history', {
            params: {
                page: currentPage.value,
                limit: 10,
            },
        });

        if (response.success) {
            history.value = response.data;
            totalPages.value = response.pagination.totalPages;
        }
    } catch (error) {
        console.error('히스토리 로드 실패:', error);
    } finally {
        loading.value = false;
    }
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
        sprout: 'green',
        tree: 'orange',
        king: 'red',
    };
    return colors[difficulty] || 'grey';
};

const getDifficultyLabel = (difficulty: string) => {
    const labels: Record<string, string> = {
        seedling: '🌱 새싹',
        sprout: '🌿 새순',
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
}
</style>

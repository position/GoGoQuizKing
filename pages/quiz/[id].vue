<script setup lang="ts">
import { useQuizStore } from '@/store/quiz.store';
import { CATEGORIES, DIFFICULTIES } from '@/models/quiz';
import type { QuizWithAuthor } from '@/models/quiz';
import type { Database } from '@/models/database.types';

definePageMeta({
    title: '퀴즈 상세',
});

const route = useRoute();
const router = useRouter();
const quizStore = useQuizStore();
const supabase = useSupabaseClient<Database>();

const quizId = computed(() => route.params.id as string);
const quiz = ref<QuizWithAuthor | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

// SEO
useSeoMeta({
    title: () => (quiz.value ? `${quiz.value.title} - GoGoQuizKing` : '퀴즈 상세'),
    description: () => quiz.value?.description || '재미있는 퀴즈를 풀어보세요!',
});

onMounted(async () => {
    await fetchQuiz();
});

async function fetchQuiz() {
    loading.value = true;
    error.value = null;

    try {
        const { data, error: fetchError } = await supabase
            .from('quizzes')
            .select(
                `
                *,
                profiles:created_by (
                    full_name,
                    avatar_url
                )
            `,
            )
            .eq('id', quizId.value)
            .eq('is_public', true)
            .single();

        if (fetchError) {
            throw fetchError;
        }

        quiz.value = data as QuizWithAuthor;
    } catch (e) {
        error.value = '퀴즈를 불러오는데 실패했습니다.';
        console.error(e);
    } finally {
        loading.value = false;
    }
}

function handlePlay() {
    router.push({ path: `/quiz/play/${quizId.value}` });
}

function goBack() {
    router.push({ path: '/quiz/quiz-list' });
}

const categoryInfo = computed(() => {
    if (!quiz.value) {
        return null;
    }
    return CATEGORIES[quiz.value.category];
});

const difficultyInfo = computed(() => {
    if (!quiz.value) {
        return null;
    }
    return DIFFICULTIES[quiz.value.difficulty];
});

const difficultyIcon = computed(() => {
    if (!quiz.value) {
        return '';
    }
    const icons: Record<string, string> = {
        seedling: '🌱',
        leaf: '🌿',
        tree: '🌳',
        king: '👑',
    };
    return icons[quiz.value.difficulty] || '🌿';
});

const authorName = computed(() => {
    return quiz.value?.profiles?.full_name || '익명';
});

const formattedDate = computed(() => {
    if (!quiz.value) {
        return '';
    }
    return new Date(quiz.value.created_at).toLocaleDateString('ko-KR');
});
</script>

<template>
    <div class="quiz-detail-page">
        <!-- 뒤로가기 -->
        <q-btn flat icon="arrow_back" label="목록으로" class="back-btn" @click="goBack" />

        <!-- 로딩 상태 -->
        <div v-if="loading" class="loading-state">
            <q-spinner-dots color="primary" size="50px" />
            <p>퀴즈를 불러오고 있어요~</p>
        </div>

        <!-- 에러 상태 -->
        <q-banner v-else-if="error" class="bg-negative text-white" rounded>
            {{ error }}
            <template #action>
                <q-btn flat label="다시 시도" @click="fetchQuiz" />
            </template>
        </q-banner>

        <!-- 퀴즈 상세 -->
        <div v-else-if="quiz" class="quiz-content">
            <!-- 메인 카드 -->
            <q-card class="quiz-main-card">
                <q-card-section>
                    <!-- 카테고리 & 난이도 배지 -->
                    <div class="badges-row">
                        <q-chip
                            v-if="categoryInfo"
                            :style="{ backgroundColor: categoryInfo.color, color: 'white' }"
                            size="md"
                        >
                            {{ categoryInfo.icon }} {{ categoryInfo.label }}
                        </q-chip>
                        <q-chip
                            v-if="difficultyInfo"
                            :style="{ backgroundColor: difficultyInfo.color, color: 'white' }"
                            size="md"
                        >
                            {{ difficultyIcon }} {{ difficultyInfo.label }}
                        </q-chip>
                        <q-chip class="grade-level" outline size="md">
                            {{ quiz.grade_level }}학년
                        </q-chip>
                    </div>

                    <!-- 제목 -->
                    <h1 class="quiz-title">{{ quiz.title }}</h1>

                    <!-- 설명 -->
                    <p v-if="quiz.description" class="quiz-description">
                        {{ quiz.description }}
                    </p>

                    <!-- 메타 정보 -->
                    <div class="quiz-meta">
                        <div class="meta-item">
                            <q-icon name="person" size="18px" />
                            <span>{{ authorName }}</span>
                        </div>
                        <div class="meta-item">
                            <q-icon name="calendar_today" size="18px" />
                            <span>{{ formattedDate }}</span>
                        </div>
                        <div class="meta-item">
                            <q-icon name="play_circle" size="18px" />
                            <span>{{ quiz.play_count }}회 플레이</span>
                        </div>
                    </div>

                    <!-- 좋아요 버튼 & 플레이 버튼 -->
                    <div class="action-row">
                        <QuizLikeButton :quiz-id="quizId" size="lg" />

                        <q-btn
                            unelevated
                            color="primary"
                            size="lg"
                            icon="play_arrow"
                            label="퀴즈 풀기 🎮"
                            class="play-btn"
                            @click="handlePlay"
                        />
                    </div>
                </q-card-section>
            </q-card>

            <!-- 댓글 섹션 -->
            <q-card class="comments-card">
                <q-card-section>
                    <QuizCommentList :quiz-id="quizId" />
                </q-card-section>
            </q-card>
        </div>
    </div>
</template>

<style scoped lang="scss">
.quiz-detail-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 16px;

    .back-btn {
        margin-bottom: 16px;
        color: var(--text-secondary);
    }

    .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        gap: 16px;

        p {
            color: var(--text-secondary);
        }
    }

    .quiz-content {
        display: flex;
        flex-direction: column;
        gap: 24px;
    }

    .quiz-main-card {
        border-radius: 16px;
        box-shadow: 0 4px 12px var(--shadow-color);
        background: var(--bg-card);

        .badges-row {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 16px;

            .grade-level {
                color: var(--text-primary);
            }
        }

        .quiz-title {
            font-size: 28px;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0 0 12px;
            line-height: 1.3;
        }

        .quiz-description {
            font-size: 16px;
            color: var(--text-secondary);
            line-height: 1.6;
            margin: 0 0 20px;
        }

        .quiz-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            margin-bottom: 24px;
            padding-bottom: 20px;
            border-bottom: 1px solid var(--border-color);

            .meta-item {
                display: flex;
                align-items: center;
                gap: 6px;
                color: var(--text-light);
                font-size: 14px;
            }
        }

        .action-row {
            display: flex;
            align-items: center;
            gap: 16px;

            .play-btn {
                flex: 1;
                max-width: 300px;
                border-radius: 12px;
                font-weight: 600;
            }
        }
    }

    .comments-card {
        border-radius: 16px;
        box-shadow: 0 4px 12px var(--shadow-color);
        background: var(--bg-card);
    }

    @media (max-width: 600px) {
        .quiz-main-card {
            .quiz-title {
                font-size: 24px;
            }

            .action-row {
                flex-direction: column;
                align-items: stretch;

                .play-btn {
                    max-width: none;
                }
            }
        }
    }
}
</style>

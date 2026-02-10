<template>
    <div class="home-page">
        <!-- 환영 섹션 -->
        <section class="welcome-section">
            <div class="welcome-content">
                <div class="mascot">👑</div>
                <h1 class="welcome-title">GOGO! QuizKing</h1>
                <p class="welcome-subtitle">재미있는 퀴즈 세계로 떠나볼까요?</p>
            </div>
        </section>

        <!-- 통계 카드 -->
        <section v-if="isLogin" class="stats-section">
            <div class="stat-card">
                <div class="stat-icon">📊</div>
                <div class="stat-value">{{ userStats.totalPlayed }}</div>
                <div class="stat-label">풀은 퀴즈</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">✏️</div>
                <div class="stat-value">{{ userStats.totalCreated }}</div>
                <div class="stat-label">만든 퀴즈</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🎯</div>
                <div class="stat-value">{{ userStats.accuracy }}%</div>
                <div class="stat-label">정답률</div>
            </div>
        </section>

        <!-- 퀵 액션 -->
        <section class="quick-actions">
            <q-btn
                :to="{ path: '/quiz/quiz-create' }"
                class="action-btn create-btn"
                unelevated
                size="lg"
            >
                <div class="action-content">
                    <q-icon name="add_circle" size="40px" />
                    <span class="action-title">퀴즈 만들기</span>
                    <span class="action-desc">나만의 퀴즈를 만들어요</span>
                </div>
            </q-btn>

            <q-btn
                :to="{ path: '/quiz/quiz-list' }"
                class="action-btn play-btn"
                unelevated
                size="lg"
            >
                <div class="action-content">
                    <q-icon name="play_circle" size="40px" />
                    <span class="action-title">퀴즈 풀기</span>
                    <span class="action-desc">다양한 퀴즈에 도전해요</span>
                </div>
            </q-btn>
        </section>

        <!-- 인기 퀴즈 -->
        <section class="popular-section">
            <div class="section-header">
                <h2 class="section-title">🔥 인기 퀴즈</h2>
                <q-btn
                    :to="{ path: '/quiz/quiz-list' }"
                    label="더보기"
                    flat
                    color="primary"
                    size="sm"
                />
            </div>

            <div v-if="isLoading" class="loading-state">
                <q-spinner-dots color="primary" size="40px" />
            </div>

            <div v-else-if="popularQuizzes.length > 0" class="quiz-list">
                <div
                    v-for="(quiz, index) in popularQuizzes"
                    :key="quiz.id"
                    @click="goToQuiz(quiz.id)"
                    class="quiz-item"
                >
                    <span class="rank" :class="`rank-${index + 1}`">{{ index + 1 }}</span>
                    <div class="quiz-info">
                        <span class="quiz-title">{{ quiz.title }}</span>
                        <span class="quiz-meta"
                            >{{ getCategoryLabel(quiz.category) }} · {{ quiz.play_count }}회
                            플레이</span
                        >
                    </div>
                    <q-icon name="chevron_right" class="arrow-icon" />
                </div>
            </div>

            <div v-else class="empty-state">
                <q-icon name="quiz" size="48px" class="empty-icon" />
                <p>아직 퀴즈가 없어요. 첫 번째 퀴즈를 만들어보세요!</p>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '~/store/auth.store';
import { useQuizStore } from '~/store/quiz.store';
import { DTO } from '@/models';
import { CATEGORIES, type QuizCategory } from '@/models/quiz';

const router = useRouter();
const authStore = useAuthStore();
const quizStore = useQuizStore();
const supabase = useSupabaseClient();

const isLoading = ref(true);
const isLogin = computed(() => authStore.isLogin);

// 사용자 통계 (Phase 2에서 실제 데이터 연동)
const userStats = ref({
    totalPlayed: 0,
    totalCreated: 0,
    accuracy: 0,
});

// 인기 퀴즈 (상위 5개)
const popularQuizzes = computed(() => {
    return [...quizStore.quizzes].sort((a, b) => b.play_count - a.play_count).slice(0, 5);
});

onMounted(async () => {
    await getUserInfo();
    await quizStore.fetchQuizzes();
    if (isLogin.value) {
        await fetchUserStats();
    }
    isLoading.value = false;
});

async function getUserInfo() {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        await authStore.signOut();
        return;
    }

    const userInfo = { ...user.user_metadata } as DTO.Auth.LoginResponse;
    authStore.registerInfo(userInfo, user?.app_metadata.provider);
}

async function fetchUserStats() {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        // 풀은 퀴즈 수
        const { count: playedCount } = await supabase
            .from('quiz_attempts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        // 만든 퀴즈 수
        const { count: createdCount } = await supabase
            .from('quizzes')
            .select('*', { count: 'exact', head: true })
            .eq('created_by', user.id);

        // 정답률 계산
        const { data: attempts } = await supabase
            .from('quiz_attempts')
            .select('score, total_questions')
            .eq('user_id', user.id);

        let totalScore = 0;
        let totalQuestions = 0;
        if (attempts) {
            attempts.forEach((a) => {
                totalScore += a.score;
                totalQuestions += a.total_questions;
            });
        }

        userStats.value = {
            totalPlayed: playedCount || 0,
            totalCreated: createdCount || 0,
            accuracy: totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0,
        };
    } catch (e) {
        console.error('Failed to fetch user stats:', e);
    }
}

function getCategoryLabel(category: QuizCategory): string {
    return CATEGORIES[category]?.label || '기타';
}

function goToQuiz(quizId: string) {
    router.push({ path: `/quiz/play/${quizId}` });
}
</script>

<style scoped lang="scss">
.home-page {
    max-width: 800px;
    margin: 0 auto;

    .welcome-section {
        text-align: center;
        padding: 40px 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 24px;
        margin-bottom: 24px;
        color: white;
        box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);

        .mascot {
            font-size: 64px;
            margin-bottom: 16px;
            animation: bounce 2s ease-in-out infinite;
        }

        .welcome-title {
            font-size: 32px;
            font-weight: 800;
            margin: 0 0 8px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .welcome-subtitle {
            font-size: 16px;
            opacity: 0.9;
            margin: 0;
        }
    }

    .stats-section {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        margin-bottom: 24px;

        .stat-card {
            background: var(--bg-card);
            border-radius: 16px;
            padding: 20px 16px;
            text-align: center;
            box-shadow: 0 4px 12px var(--shadow-color);
            transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.3s ease;

            &:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px var(--shadow-color);
            }

            .stat-icon {
                font-size: 28px;
                margin-bottom: 8px;
            }

            .stat-value {
                font-size: 24px;
                font-weight: 700;
                color: var(--text-primary);
            }

            .stat-label {
                font-size: 12px;
                color: var(--text-light);
                margin-top: 4px;
            }
        }
    }

    .quick-actions {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
        margin-bottom: 32px;

        .action-btn {
            height: auto;
            padding: 24px;
            border-radius: 20px;
            color: white;
            transition: transform 0.2s ease, box-shadow 0.2s ease;

            &:hover {
                transform: translateY(-4px);
            }

            &.create-btn {
                background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
                box-shadow: 0 8px 24px rgba(78, 205, 196, 0.3);

                &:hover {
                    box-shadow: 0 12px 32px rgba(78, 205, 196, 0.4);
                }
            }

            &.play-btn {
                background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
                box-shadow: 0 8px 24px rgba(255, 107, 107, 0.3);

                &:hover {
                    box-shadow: 0 12px 32px rgba(255, 107, 107, 0.4);
                }
            }

            .action-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                text-align: center;

                .action-title {
                    font-size: 18px;
                    font-weight: 700;
                }

                .action-desc {
                    font-size: 13px;
                    opacity: 0.9;
                }
            }
        }
    }

    .popular-section {
        background: var(--bg-card);
        border-radius: 20px;
        padding: 20px;
        box-shadow: 0 4px 12px var(--shadow-color);
        transition: background-color 0.3s ease;

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;

            .section-title {
                font-size: 18px;
                font-weight: 700;
                color: var(--text-primary);
                margin: 0;
            }
        }

        .loading-state {
            display: flex;
            justify-content: center;
            padding: 40px;
        }

        .quiz-list {
            .quiz-item {
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 14px 0;
                border-bottom: 1px solid var(--border-color);
                cursor: pointer;
                transition: all 0.2s ease;

                &:last-child {
                    border-bottom: none;
                }

                &:hover {
                    background: var(--hover-overlay);
                    margin: 0 -16px;
                    padding-left: 16px;
                    padding-right: 16px;
                    border-radius: 12px;
                }

                .rank {
                    width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #667eea;
                    color: white;
                    border-radius: 50%;
                    font-size: 14px;
                    font-weight: 700;

                    &.rank-1 {
                        background: linear-gradient(135deg, #ffd700 0%, #ffb347 100%);
                    }

                    &.rank-2 {
                        background: linear-gradient(135deg, #c0c0c0 0%, #a0a0a0 100%);
                    }

                    &.rank-3 {
                        background: linear-gradient(135deg, #cd7f32 0%, #b87333 100%);
                    }
                }

                .quiz-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;

                    .quiz-title {
                        font-size: 15px;
                        font-weight: 600;
                        color: var(--text-primary);
                    }

                    .quiz-meta {
                        font-size: 12px;
                        color: var(--text-light);
                    }
                }

                .arrow-icon {
                    color: var(--text-light);
                }
            }
        }

        .empty-state {
            text-align: center;
            padding: 40px 20px;

            .empty-icon {
                color: var(--text-light);
                margin-bottom: 12px;
            }

            p {
                font-size: 14px;
                color: var(--text-light);
                margin: 0;
            }
        }
    }
}

@keyframes bounce {
    0%,
    100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-10px);
    }
}

@media (max-width: 600px) {
    .home-page {
        .stats-section {
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;

            .stat-card {
                padding: 16px 12px;

                .stat-value {
                    font-size: 20px;
                }
            }
        }

        .quick-actions {
            grid-template-columns: 1fr;
        }
    }
}
</style>

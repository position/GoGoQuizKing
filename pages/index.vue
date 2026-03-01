<template>
    <div class="home-page">
        <!-- 환영 섹션 -->
        <section class="welcome-section">
            <!-- 어드민 배지 -->
            <section v-if="isLogin && hasAdminAccess" class="admin-badge-section">
                <div
                    class="admin-badge"
                    :class="{ 'is-admin': isAdmin, 'is-moderator': !isAdmin }"
                    :to="{ path: '/admin/quiz-automation' }"
                >
                    <q-icon
                        :name="isAdmin ? 'admin_panel_settings' : 'verified_user'"
                        size="20px"
                    />
                    <span>{{ isAdmin ? '관리자' : '모더레이터' }}</span>
                </div>
            </section>

            <div class="welcome-content">
                <div class="mascot">
                    <NuxtImg
                        :src="`${$imgHost}/img/quizking-character.png`"
                        alt="GoGo! Quiz King"
                        loading="lazy"
                        width="320"
                        height="320"
                        format="webp"
                        quality="80"
                    />
                </div>
                <h1 class="welcome-title">GOGO! QuizKing</h1>
                <p class="welcome-subtitle">반짝반짝 퀴즈 세상으로 함께 떠나요~ ✨</p>
            </div>
        </section>

        <!-- 포인트/레벨 섹션 (로그인 시) -->
        <section v-if="isLogin" class="point-level-section">
            <div class="user-status-card">
                <LevelProgress />
                <div v-if="streakDays > 0" class="streak-info">
                    <q-icon name="local_fire_department" color="orange" size="20px" />
                    <span>{{ streakDays }}일 연속 출석 중! 🔥</span>
                </div>
            </div>
        </section>

        <!-- 통계 카드 -->
        <section v-if="isLogin" class="stats-section">
            <div class="stat-card">
                <div class="stat-icon">📊</div>
                <div class="stat-value">{{ userStats.totalPlayed }}</div>
                <div class="stat-label">풀었어요!</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">✏️</div>
                <div class="stat-value">{{ userStats.totalCreated }}</div>
                <div class="stat-label">만들었어요!</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🎯</div>
                <div class="stat-value">{{ userStats.accuracy }}%</div>
                <div class="stat-label">정답률</div>
            </div>
        </section>

        <!-- 오늘의 퀴즈 -->
        <section class="today-quiz-section">
            <TodayQuiz :quiz="todayQuiz" :is-loading="isTodayQuizLoading" />
        </section>

        <!-- 데일리 미션 (로그인 시) -->
        <section v-if="isLogin" class="daily-mission-section">
            <DailyMissionList :missions="dailyMissions" :is-loading="isMissionsLoading" />
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
                    <span class="action-title">퀴즈 뚝딱! 🛠️</span>
                    <span class="action-desc">나만의 퀴즈를 만들어볼까요?</span>
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
                    <span class="action-title">도전! 퀴즈왕 🏆</span>
                    <span class="action-desc">신나는 퀴즈에 도전해봐요!</span>
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
                <p>아직 퀴즈가 없어요~ 첫 번째 퀴즈를 만들어볼까요? 🎨</p>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '~/store/auth.store';
import { useQuizStore } from '~/store/quiz.store';
import { usePointStore } from '~/store/point.store';
import { useDailyMissionStore } from '~/store/dailyMission.store';
import { DTO } from '@/models';
import { CATEGORIES, type QuizCategory } from '@/models/quiz';
import LevelBadge from '@/components/point/LevelBadge.vue';
import LevelProgress from '@/components/point/LevelProgress.vue';
import PointDisplay from '@/components/point/PointDisplay.vue';
import TodayQuiz from '@/components/daily/TodayQuiz.vue';
import DailyMissionList from '@/components/daily/DailyMissionList.vue';

const router = useRouter();
const authStore = useAuthStore();
const quizStore = useQuizStore();
const pointStore = usePointStore();
const dailyMissionStore = useDailyMissionStore();
const supabase = useSupabaseClient();

const isLoading = ref(true);
const isLogin = computed(() => authStore.isLogin);
const isAdmin = computed(() => authStore.isAdmin);
const hasAdminAccess = computed(() => authStore.hasAdminAccess);
const streakDays = computed(() => pointStore.streakDays);

// 오늘의 퀴즈 & 미션
const todayQuiz = computed(() => dailyMissionStore.todayQuiz);
const dailyMissions = computed(() => dailyMissionStore.missions);
const isTodayQuizLoading = computed(() => dailyMissionStore.isTodayQuizLoading);
const isMissionsLoading = computed(() => dailyMissionStore.isLoading);

// 사용자 통계 (Phase 2에서 실제 데이터 연동)
const userStats = ref({
    totalPlayed: 0,
    totalCreated: 0,
    accuracy: 0,
});

// 인기 퀴즈 (상위 5개) - 메모이제이션 적용
const popularQuizzes = computed(() => {
    if (quizStore.quizzes.length === 0) {
        return [];
    }
    return [...quizStore.quizzes].sort((a, b) => b.play_count - a.play_count).slice(0, 5);
});

// 병렬 로딩으로 성능 개선
onMounted(async () => {
    const promises: Promise<void>[] = [getUserInfo(), quizStore.fetchQuizzes()];

    // 오늘의 퀴즈는 항상 로드 (비로그인도 볼 수 있음)
    dailyMissionStore.fetchTodayQuiz();

    await Promise.all(promises);

    // 로그인된 경우에만 통계 로드 (로그인 체크 이후 별도 실행)
    if (isLogin.value) {
        // 포인트 정보 및 일일 출석 체크
        pointStore.fetchPointSummary();
        pointStore.checkDailyAttendance();
        // 데일리 미션 로드
        dailyMissionStore.fetchMissions();
        // 통계는 비동기로 로드하여 UI 블로킹 방지
        fetchUserStats();
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

    // role 정보 가져오기
    await authStore.fetchUserRole(user.id);
}

async function fetchUserStats() {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        // 병렬로 통계 조회 (성능 개선)
        const [playedResult, createdResult, attemptsResult] = await Promise.all([
            // 풀은 퀴즈 수
            supabase
                .from('quiz_attempts')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id),
            // 만든 퀴즈 수
            supabase
                .from('quizzes')
                .select('*', { count: 'exact', head: true })
                .eq('created_by', user.id),
            // 정답률 계산용 데이터
            supabase.from('quiz_attempts').select('score, total_questions').eq('user_id', user.id),
        ]);

        const playedCount = playedResult.count || 0;
        const createdCount = createdResult.count || 0;
        const attempts = attemptsResult.data;

        let totalScore = 0;
        let totalQuestions = 0;
        if (attempts) {
            for (const a of attempts) {
                totalScore += a.score;
                totalQuestions += a.total_questions;
            }
        }

        userStats.value = {
            totalPlayed: playedCount,
            totalCreated: createdCount,
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
        position: relative;
        text-align: center;
        padding: 40px 20px;
        background: linear-gradient(135deg, #ff8200 0%, #f7b32b 100%);
        border-radius: 24px;
        margin-bottom: 24px;
        color: white;
        box-shadow: 0 8px 32px rgba(255, 130, 0, 0.3);

        .admin-badge-section {
            position: absolute;
            display: flex;
            justify-content: center;
            right: 20px;
            top: 20px;

            .admin-badge {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 10px 20px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 600;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

                &.is-admin {
                    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%);
                    color: white;
                }

                &.is-moderator {
                    background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
                    color: white;
                }
            }
        }

        .mascot {
            line-height: 0;
            animation: bounce 2s ease-in-out infinite;
            will-change: transform;
            img {
                max-width: 320px;
                height: auto;
            }
        }

        .welcome-title {
            font-family: 'Fredoka', sans-serif;
            font-size: 42px;
            font-weight: 800;
            line-height: 100%;
            margin: 0 0 8px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .welcome-subtitle {
            font-size: 18px;
            font-weight: 800;
            opacity: 0.9;
            margin: 0;
        }
    }

    .point-level-section {
        margin-bottom: 24px;

        .user-status-card {
            background: var(--bg-card);
            border-radius: 20px;
            padding: 20px;
            box-shadow: 0 4px 16px var(--shadow-color);

            .status-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
            }

            .streak-info {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                margin-top: 12px;
                padding-top: 12px;
                border-top: 1px solid var(--border-color);
                font-size: 14px;
                color: #f57c00;
                font-weight: 600;
            }
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
            transition:
                transform 0.2s ease,
                box-shadow 0.2s ease,
                background-color 0.3s ease;

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

    .today-quiz-section {
        margin-bottom: 24px;
    }

    .daily-mission-section {
        margin-bottom: 24px;
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
            transition:
                transform 0.2s ease,
                box-shadow 0.2s ease;

            &:hover {
                transform: translateY(-4px);
            }

            &.create-btn {
                background: linear-gradient(135deg, #9acd32 0%, #8bb82a 100%);
                box-shadow: 0 8px 24px rgba(154, 205, 50, 0.3);

                &:hover {
                    box-shadow: 0 12px 32px rgba(154, 205, 50, 0.4);
                }
            }

            &.play-btn {
                background: linear-gradient(135deg, #ff8200 0%, #f7b32b 100%);
                box-shadow: 0 8px 24px rgba(255, 130, 0, 0.3);

                &:hover {
                    box-shadow: 0 12px 32px rgba(255, 130, 0, 0.4);
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
                    background: #ff8200;
                    color: white;
                    border-radius: 50%;
                    font-size: 14px;
                    font-weight: 700;

                    &.rank-1 {
                        background: linear-gradient(135deg, #fdee00 0%, #f7b32b 100%);
                        color: #333;
                    }

                    &.rank-2 {
                        background: linear-gradient(135deg, #c0c0c0 0%, #a0a0a0 100%);
                    }

                    &.rank-3 {
                        background: linear-gradient(135deg, #ff8200 0%, #f7b32b 100%);
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

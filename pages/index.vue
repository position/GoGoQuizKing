<template>
    <div class="home-page">
        <!-- 환영 섹션 -->
        <section class="welcome-section">
            <!-- 어드민 배지 (클라이언트 전용) -->
            <ClientOnly>
                <section v-if="isLogin && hasAdminAccess" class="admin-badge-section">
                    <NuxtLink
                        :to="{ path: '/admin/quiz-automation' }"
                        class="admin-badge"
                        :class="{ 'is-admin': isAdmin, 'is-moderator': !isAdmin }"
                    >
                        <q-icon
                            :name="isAdmin ? 'admin_panel_settings' : 'verified_user'"
                            size="20px"
                        />
                        <span>{{ isAdmin ? '관리자' : '모더레이터' }}</span>
                    </NuxtLink>
                </section>
            </ClientOnly>

            <div class="welcome-content">
                <div class="mascot">
                    <NuxtImg
                        :src="`${imgHost}/img/quizking-character.png`"
                        alt="GoGo! Quiz King"
                        width="320"
                        height="320"
                        format="webp"
                        quality="80"
                        loading="eager"
                        fetchpriority="high"
                        :placeholder="[32, 32, 10]"
                        decoding="async"
                    />
                </div>
                <h1 class="welcome-title">GOGO! QuizKing</h1>
                <p class="welcome-subtitle">반짝반짝 퀴즈 세상으로 함께 떠나요~ ✨</p>
            </div>
        </section>

        <!-- 로그인 사용자 전용 섹션 (클라이언트 전용 - 하이드레이션 미스매치 방지) -->
        <ClientOnly>
            <template #fallback>
                <!-- 로그인 섹션 스켈레톤 -->
                <div class="login-section-skeleton">
                    <div class="skeleton-status-card">
                        <q-skeleton type="rect" height="202px" animation="wave" />
                    </div>
                    <div class="skeleton-stats">
                        <q-skeleton
                            v-for="i in 3"
                            :key="i"
                            type="rect"
                            height="148px"
                            animation="wave"
                        />
                    </div>
                </div>
            </template>

            <!-- 포인트/레벨 섹션 -->
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

            <!-- 오늘의 퀴즈 & 데일리 미션 -->
            <section v-if="isLogin" class="today-section">
                <div class="today-quiz-wrapper">
                    <TodayQuiz :quiz="todayQuiz" :is-loading="isTodayQuizLoading" />
                </div>
                <div class="daily-mission-wrapper">
                    <DailyMissionList :missions="dailyMissions" :is-loading="isMissionsLoading" />
                </div>
            </section>
        </ClientOnly>

        <!-- 비로그인 시 오늘의 퀴즈 (SSR 가능) -->
        <section v-if="!isLogin" class="today-quiz-section">
            <TodayQuiz :quiz="todayQuiz" :is-loading="isTodayQuizLoading" />
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

            <!-- 스켈레톤 로딩 UI -->
            <div v-if="isLoading" class="skeleton-quiz-list">
                <div v-for="i in 5" :key="i" class="skeleton-quiz-item">
                    <q-skeleton type="circle" size="28px" animation="wave" />
                    <div class="skeleton-quiz-info">
                        <q-skeleton type="text" width="60%" height="15px" animation="wave" />
                        <q-skeleton type="text" width="40%" height="12px" animation="wave" />
                    </div>
                    <q-skeleton type="circle" size="20px" animation="wave" />
                </div>
            </div>

            <div v-else-if="popularQuizzes.length > 0" class="quiz-list">
                <div
                    v-for="(quiz, index) in popularQuizzes"
                    :key="quiz.id"
                    class="quiz-item"
                    @click="goToQuiz(quiz.id)"
                >
                    <span class="rank" :class="`rank-${index + 1}`">{{ index + 1 }}</span>
                    <div class="quiz-info">
                        <span class="quiz-title">{{ quiz.title }}</span>
                        <span class="quiz-meta">
                            {{ getCategoryLabel(quiz.category) }} · {{ quiz.play_count }}회 플레이
                        </span>
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
import { CATEGORIES, type QuizCategory } from '@/models/quiz';
import type { Database } from '@/models/database.types';
import { DTO } from '@/models';
import { useAuthStore } from '@/store/auth.store';
import { useQuizStore } from '@/store/quiz.store';
import { usePointStore } from '@/store/point.store';
import { useDailyMissionStore } from '@/store/dailyMission.store';

// ============================================
// Composables & Stores
// ============================================
const router = useRouter();
const runtimeConfig = useRuntimeConfig();
const supabase = useSupabaseClient<Database>();

const authStore = useAuthStore();
const quizStore = useQuizStore();
const pointStore = usePointStore();
const dailyMissionStore = useDailyMissionStore();

// ============================================
// Constants
// ============================================
const imgHost = runtimeConfig.public.supabaseStorage as string;

// ============================================
// State
// ============================================
const isLoading = ref(true);

const userStats = ref({
    totalPlayed: 0,
    totalCreated: 0,
    accuracy: 0,
});

// ============================================
// Computed (Store 기반)
// ============================================
const isLogin = computed(() => authStore.isLogin);
const isAdmin = computed(() => authStore.isAdmin);
const hasAdminAccess = computed(() => authStore.hasAdminAccess);
const streakDays = computed(() => pointStore.streakDays);

const todayQuiz = computed(() => dailyMissionStore.todayQuiz);
const dailyMissions = computed(() => dailyMissionStore.missions);
const isTodayQuizLoading = computed(() => dailyMissionStore.isTodayQuizLoading);
const isMissionsLoading = computed(() => dailyMissionStore.isLoading);

const popularQuizzes = computed(() => {
    if (!quizStore.quizzes.length) {
        return [];
    }
    return [...quizStore.quizzes].sort((a, b) => b.play_count - a.play_count).slice(0, 5);
});

// ============================================
// Lifecycle
// ============================================
onMounted(async () => {
    await initializePage();
});

// ============================================
// Methods
// ============================================

/**
 * 페이지 초기화 - 병렬 로딩으로 성능 최적화
 */
async function initializePage() {
    try {
        // 1. 기본 데이터 병렬 로드
        await Promise.all([initUserSession(), quizStore.fetchQuizzes()]);

        // 2. 오늘의 퀴즈는 별도 로드 (비로그인도 볼 수 있음)
        dailyMissionStore.fetchTodayQuiz();

        // 3. 로그인 사용자 전용 데이터 로드
        if (isLogin.value) {
            loadUserData();
        }
    } finally {
        isLoading.value = false;
    }
}

/**
 * 사용자 세션 초기화
 */
async function initUserSession() {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        await authStore.signOut();
        return;
    }

    const userInfo = { ...user.user_metadata } as DTO.Auth.LoginResponse;
    authStore.registerInfo(userInfo, user.app_metadata.provider);
    await authStore.fetchUserRole(user.id);
}

/**
 * 로그인 사용자 데이터 로드 (비동기, UI 블로킹 방지)
 */
function loadUserData() {
    // 포인트 정보 및 출석 체크
    pointStore.fetchPointSummary();
    pointStore.checkDailyAttendance();

    // 데일리 미션 로드
    dailyMissionStore.fetchMissions();

    // 통계 로드 (별도 비동기)
    fetchUserStats();
}

/**
 * 사용자 통계 조회
 */
async function fetchUserStats() {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
            return;
        }

        const [playedResult, createdResult, attemptsResult] = await Promise.all([
            supabase
                .from('quiz_attempts')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id),
            supabase
                .from('quizzes')
                .select('*', { count: 'exact', head: true })
                .eq('created_by', user.id),
            supabase.from('quiz_attempts').select('score, total_questions').eq('user_id', user.id),
        ]);

        const playedCount = playedResult.count ?? 0;
        const createdCount = createdResult.count ?? 0;
        const attempts = attemptsResult.data ?? [];

        let totalScore = 0;
        let totalQuestions = 0;

        for (const attempt of attempts) {
            totalScore += attempt.score ?? 0;
            totalQuestions += attempt.total_questions ?? 0;
        }

        userStats.value = {
            totalPlayed: playedCount,
            totalCreated: createdCount,
            accuracy: totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0,
        };
    } catch (error) {
        console.error('Failed to fetch user stats:', error);
    }
}

/**
 * 카테고리 라벨 조회
 */
function getCategoryLabel(category: QuizCategory): string {
    return CATEGORIES[category]?.label ?? '기타';
}

/**
 * 퀴즈 상세 페이지로 이동
 */
function goToQuiz(quizId: string) {
    router.push({ path: `/quiz/play/${quizId}` });
}
</script>

<style scoped lang="scss">
.home-page {
    max-width: 800px;
    margin: 0 auto;

    // 로그인 섹션 스켈레톤 (ClientOnly fallback)
    .login-section-skeleton {
        margin-bottom: 24px;

        .skeleton-status-card {
            margin-bottom: 24px;
        }

        .skeleton-stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
        }
    }

    // 환영 섹션
    .welcome-section {
        position: relative;
        text-align: center;
        padding: 40px 20px;
        background: linear-gradient(135deg, #ff8200 0%, #f7b32b 100%);
        border-radius: 24px;
        margin-bottom: 24px;
        color: white;
        box-shadow: 0 8px 32px rgba(255, 130, 0, 0.3);
        min-height: 450px; // CLS 방지 - 마스코트 + 텍스트 높이 예약
        contain: layout; // 레이아웃 격리

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
            width: 320px;
            height: 320px;
            aspect-ratio: 1 / 1;
            margin: 0 auto;

            img {
                width: 100%;
                height: 100%;
                object-fit: contain;
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

    // 포인트/레벨 섹션
    .point-level-section {
        margin-bottom: 24px;

        .user-status-card {
            height: 202px;
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

    // 통계 섹션
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
            min-height: 100px; // CLS 방지
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

    // 오늘의 퀴즈 & 데일리 미션 (세로 레이아웃)
    .today-section {
        display: flex;
        flex-direction: column;
        gap: 20px;
        margin-bottom: 24px;

        .today-quiz-wrapper {
            width: 100%;
            min-height: 200px; // CLS 방지
        }

        .daily-mission-wrapper {
            width: 100%;
            min-height: 300px; // CLS 방지
        }
    }

    // 비로그인 시 오늘의 퀴즈만
    .today-quiz-section {
        margin-bottom: 24px;
    }

    // 퀵 액션 버튼
    .quick-actions {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
        margin-bottom: 32px;
        min-height: 140px; // CLS 방지

        .action-btn {
            height: auto;
            min-height: 120px; // CLS 방지
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

    // 인기 퀴즈 섹션
    .popular-section {
        background: var(--bg-card);
        border-radius: 20px;
        padding: 20px;
        box-shadow: 0 4px 12px var(--shadow-color);
        transition: background-color 0.3s ease;
        min-height: 300px; // CLS 방지
        contain: layout; // 레이아웃 격리

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

        // 스켈레톤 로딩 UI
        .skeleton-quiz-list {
            display: flex;
            flex-direction: column;

            .skeleton-quiz-item {
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 14px 0;
                border-bottom: 1px solid var(--border-color);

                &:last-child {
                    border-bottom: none;
                }

                .skeleton-quiz-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
            }
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

    // 반응형

    @media (max-width: 600px) {
        .point-level-section {
            .user-status-card {
                height: auto;
            }
        }
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

@keyframes bounce {
    0%,
    100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-10px);
    }
}
</style>

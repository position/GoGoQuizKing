<template>
    <div class="profile-page">
        <!-- 로딩 상태 -->
        <div v-if="isLoading" class="loading-container">
            <q-spinner-dots color="primary" size="60px" />
        </div>

        <template v-else>
            <!-- 프로필 헤더 -->
            <section class="profile-header">
                <div class="profile-card">
                    <div class="avatar-section">
                        <q-avatar size="100px" class="profile-avatar">
                            <img
                                v-if="authStore.userInfo.avatar_url"
                                :src="authStore.userInfo.avatar_url"
                                alt="프로필"
                            />
                            <q-icon v-else name="person" size="50px" color="grey-5" />
                        </q-avatar>
                        <q-btn
                            round
                            flat
                            size="sm"
                            icon="edit"
                            class="edit-btn"
                            @click="showEditDialog = true"
                        />
                    </div>

                    <div class="info-section">
                        <h1 class="user-name">
                            {{ authStore.userInfo.full_name || authStore.userInfo.preferred_username || '사용자' }}
                        </h1>
                        <p class="user-email">{{ authStore.userInfo.email }}</p>

                        <div class="level-badge">
                            <span class="level-icon">{{ pointStore.levelInfo.icon }}</span>
                            <span class="level-name">{{ pointStore.levelInfo.name }}</span>
                            <span class="level-number">Lv.{{ pointStore.level }}</span>
                        </div>
                    </div>
                </div>
            </section>

            <!-- 포인트 & 스트릭 정보 -->
            <section class="status-section">
                <div class="status-grid">
                    <div class="status-item points">
                        <q-icon name="star" size="24px" />
                        <div class="status-content">
                            <span class="status-value">{{ pointStore.points.toLocaleString() }}</span>
                            <span class="status-label">포인트</span>
                        </div>
                    </div>

                    <div class="status-item streak">
                        <q-icon name="local_fire_department" size="24px" />
                        <div class="status-content">
                            <span class="status-value">{{ pointStore.streakDays }}</span>
                            <span class="status-label">연속 출석일</span>
                        </div>
                    </div>

                    <div class="status-item badges">
                        <q-icon name="military_tech" size="24px" />
                        <div class="status-content">
                            <span class="status-value">{{ earnedBadgesCount }}</span>
                            <span class="status-label">획득 뱃지</span>
                        </div>
                    </div>
                </div>

                <!-- 레벨 진행 바 -->
                <div class="level-progress-section">
                    <div class="progress-header">
                        <span>다음 레벨까지</span>
                        <span class="progress-text">{{ pointStore.pointsToNextLevel }}P 남음</span>
                    </div>
                    <q-linear-progress
                        :value="pointStore.levelProgress / 100"
                        size="10px"
                        color="primary"
                        track-color="grey-3"
                        rounded
                        class="level-bar"
                    />
                </div>
            </section>

            <!-- 통계 요약 -->
            <section class="stats-summary-section">
                <div class="section-header">
                    <h2 class="section-title">📊 퀴즈 활동</h2>
                    <q-btn
                        flat
                        dense
                        color="primary"
                        label="상세 통계"
                        icon-right="arrow_forward"
                        @click="$router.push('/profile/stats')"
                    />
                </div>
                <StatsSummaryCards :stats="statsStore.userStats" />
            </section>

            <!-- 뱃지 미리보기 -->
            <section class="badges-preview-section">
                <div class="section-header">
                    <h2 class="section-title">🏅 최근 획득 뱃지</h2>
                    <q-btn
                        flat
                        dense
                        color="primary"
                        label="전체 보기"
                        icon-right="arrow_forward"
                        @click="$router.push('/profile/badges')"
                    />
                </div>
                <div v-if="recentBadges.length > 0" class="badges-preview">
                    <div
                        v-for="badge in recentBadges"
                        :key="badge.badge_id"
                        class="badge-item"
                    >
                        <span class="badge-icon">{{ badge.badge_icon }}</span>
                        <span class="badge-name">{{ badge.badge_name }}</span>
                    </div>
                </div>
                <div v-else class="no-badges">
                    <p>아직 획득한 뱃지가 없습니다. 퀴즈를 풀어 뱃지를 모아보세요!</p>
                </div>
            </section>

            <!-- 최근 퀴즈 기록 -->
            <section class="recent-activity-section">
                <div class="section-header">
                    <h2 class="section-title">📝 최근 퀴즈 기록</h2>
                </div>
                <RecentPerformanceList :data="statsStore.recentPerformance" />
            </section>

            <!-- 메뉴 링크 -->
            <section class="menu-section">
                <q-list class="menu-list">
                    <q-item clickable v-ripple @click="$router.push('/profile/stats')">
                        <q-item-section avatar>
                            <q-icon name="analytics" color="primary" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>상세 통계 보기</q-item-label>
                            <q-item-label caption>카테고리별, 난이도별 분석</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                            <q-icon name="chevron_right" color="grey" />
                        </q-item-section>
                    </q-item>

                    <q-item clickable v-ripple @click="$router.push('/profile/badges')">
                        <q-item-section avatar>
                            <q-icon name="workspace_premium" color="amber" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>내 뱃지</q-item-label>
                            <q-item-label caption>획득 뱃지 및 진행 상황</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                            <q-icon name="chevron_right" color="grey" />
                        </q-item-section>
                    </q-item>

                    <q-item clickable v-ripple @click="$router.push('/quiz/my')">
                        <q-item-section avatar>
                            <q-icon name="edit_note" color="secondary" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>내가 만든 퀴즈</q-item-label>
                            <q-item-label caption>퀴즈 관리 및 수정</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                            <q-icon name="chevron_right" color="grey" />
                        </q-item-section>
                    </q-item>
                </q-list>
            </section>

            <!-- 로그아웃 버튼 -->
            <section class="logout-section">
                <q-btn
                    outline
                    color="negative"
                    label="로그아웃"
                    icon="logout"
                    class="logout-btn"
                    @click="handleLogout"
                />
            </section>
        </template>

        <!-- 프로필 수정 다이얼로그 -->
        <ProfileEditDialog
            v-model="showEditDialog"
            @updated="handleProfileUpdated"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/store/auth.store';
import { usePointStore } from '@/store/point.store';
import { useStatsStore } from '@/store/stats.store';
import { useBadgeStore } from '@/store/badge.store';
import { StatsSummaryCards, RecentPerformanceList } from '@/components/stats';
import ProfileEditDialog from '@/components/profile/ProfileEditDialog.vue';

definePageMeta({
    layout: 'default',
});

const authStore = useAuthStore();
const pointStore = usePointStore();
const statsStore = useStatsStore();
const badgeStore = useBadgeStore();

const isLoading = ref(true);
const showEditDialog = ref(false);

const earnedBadgesCount = computed(() => {
    return badgeStore.earnedBadges.length;
});

const recentBadges = computed(() => {
    return badgeStore.earnedBadges
        .slice()
        .sort((a, b) => new Date(b.earned_at || '').getTime() - new Date(a.earned_at || '').getTime())
        .slice(0, 5);
});

async function loadData() {
    isLoading.value = true;
    try {
        await Promise.all([
            pointStore.fetchPointSummary(),
            statsStore.fetchUserStats(),
            statsStore.fetchRecentPerformance(5),
            badgeStore.fetchBadges(),
        ]);
    } catch (e) {
        console.error('Failed to load profile data:', e);
    } finally {
        isLoading.value = false;
    }
}

function handleProfileUpdated() {
    loadData();
}

async function handleLogout() {
    await authStore.signOut();
}

onMounted(() => {
    loadData();
});
</script>

<style scoped lang="scss">
.profile-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px 16px 100px;
}

.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
}

// Profile Header
.profile-header {
    margin-bottom: 24px;

    .profile-card {
        display: flex;
        align-items: center;
        gap: 20px;
        padding: 24px;
        background: linear-gradient(135deg, #5c6bc0, #7986cb);
        border-radius: 20px;
        color: white;
    }

    .avatar-section {
        position: relative;

        .profile-avatar {
            border: 3px solid rgba(255, 255, 255, 0.3);
            background: white;
        }

        .edit-btn {
            position: absolute;
            bottom: 0;
            right: 0;
            background: white;
            color: #5c6bc0;
        }
    }

    .info-section {
        flex: 1;

        .user-name {
            font-size: 24px;
            font-weight: 700;
            margin: 0;
        }

        .user-email {
            font-size: 14px;
            opacity: 0.9;
            margin: 4px 0 12px;
        }

        .level-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(255, 255, 255, 0.2);
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 13px;

            .level-icon {
                font-size: 18px;
            }

            .level-name {
                font-weight: 600;
            }

            .level-number {
                opacity: 0.9;
            }
        }
    }
}

// Status Section
.status-section {
    background: white;
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    .status-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        margin-bottom: 20px;
    }

    .status-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: #f5f5f5;
        border-radius: 12px;

        &.points {
            .q-icon {
                color: #ffa726;
            }
        }

        &.streak {
            .q-icon {
                color: #ef5350;
            }
        }

        &.badges {
            .q-icon {
                color: #ab47bc;
            }
        }

        .status-content {
            display: flex;
            flex-direction: column;

            .status-value {
                font-size: 20px;
                font-weight: 700;
                color: #212121;
            }

            .status-label {
                font-size: 12px;
                color: #757575;
            }
        }
    }

    .level-progress-section {
        .progress-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 13px;
            color: #757575;

            .progress-text {
                font-weight: 600;
                color: #5c6bc0;
            }
        }

        .level-bar {
            border-radius: 5px;
        }
    }
}

// Sections
.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .section-title {
        font-size: 18px;
        font-weight: 700;
        color: #212121;
        margin: 0;
    }
}

.stats-summary-section,
.badges-preview-section,
.recent-activity-section {
    margin-bottom: 24px;
}

// Badges Preview
.badges-preview {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;

    .badge-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        background: #f5f5f5;
        border-radius: 12px;

        .badge-icon {
            font-size: 24px;
        }

        .badge-name {
            font-size: 13px;
            font-weight: 500;
            color: #424242;
        }
    }
}

.no-badges {
    text-align: center;
    padding: 20px;
    background: #f5f5f5;
    border-radius: 12px;
    color: #757575;
    font-size: 14px;
}

// Menu Section
.menu-section {
    margin-bottom: 24px;

    .menu-list {
        background: white;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

        .q-item {
            padding: 16px;
        }
    }
}

// Logout Section
.logout-section {
    text-align: center;

    .logout-btn {
        width: 100%;
        max-width: 300px;
        padding: 12px;
        border-radius: 12px;
    }
}

@media (max-width: 600px) {
    .profile-header {
        .profile-card {
            flex-direction: column;
            text-align: center;
        }
    }

    .status-section {
        .status-grid {
            grid-template-columns: 1fr;
        }
    }
}
</style>

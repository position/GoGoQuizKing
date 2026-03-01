<template>
    <div class="daily-mission-list">
        <div class="section-header">
            <div class="title-area">
                <h2 class="section-title">🎯 오늘의 미션</h2>
                <div class="progress-badge">
                    {{ completedCount }} / {{ totalCount }}
                </div>
            </div>
            <div v-if="hasClaimableRewards" class="claim-all-area">
                <q-btn
                    class="claim-all-btn"
                    unelevated
                    color="positive"
                    size="sm"
                    label="모두 받기"
                    :loading="isClaimingAll"
                    @click="handleClaimAll"
                />
            </div>
        </div>

        <div v-if="isLoading" class="loading-state">
            <q-spinner-dots color="primary" size="40px" />
        </div>

        <div v-else-if="missions.length > 0" class="mission-list">
            <DailyMissionCard
                v-for="mission in missions"
                :key="mission.mission_id"
                :mission="mission"
                @claim="handleClaim"
            />
        </div>

        <div v-else class="empty-state">
            <q-icon name="task_alt" size="48px" />
            <p>오늘의 미션이 없어요~</p>
        </div>

        <!-- 전체 진행률 -->
        <div v-if="missions.length > 0" class="overall-progress">
            <q-linear-progress
                :value="overallProgress / 100"
                color="amber"
                class="progress-bar"
                rounded
            />
            <span class="progress-label">오늘의 미션 {{ overallProgress }}% 완료</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { UserDailyMission } from '@/models/dailyMission';
import { useDailyMissionStore } from '@/store/dailyMission.store';
import DailyMissionCard from './DailyMissionCard.vue';

interface Props {
    missions: UserDailyMission[];
    isLoading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    isLoading: false,
});

const dailyMissionStore = useDailyMissionStore();
const isClaimingAll = ref(false);

const completedCount = computed(() => {
    return props.missions.filter((m) => m.is_completed).length;
});

const totalCount = computed(() => {
    return props.missions.length;
});

const overallProgress = computed(() => {
    if (props.missions.length === 0) {
        return 0;
    }
    return Math.round((completedCount.value / totalCount.value) * 100);
});

const hasClaimableRewards = computed(() => {
    return props.missions.some((m) => m.is_completed && !m.reward_claimed);
});

const claimableMissions = computed(() => {
    return props.missions.filter((m) => m.is_completed && !m.reward_claimed);
});

async function handleClaim(missionId: string) {
    await dailyMissionStore.claimReward(missionId);
}

async function handleClaimAll() {
    isClaimingAll.value = true;
    try {
        for (const mission of claimableMissions.value) {
            await dailyMissionStore.claimReward(mission.mission_id);
        }
    } finally {
        isClaimingAll.value = false;
    }
}
</script>

<style scoped lang="scss">
.daily-mission-list {
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

        .title-area {
            display: flex;
            align-items: center;
            gap: 12px;

            .section-title {
                font-size: 18px;
                font-weight: 700;
                color: var(--text-primary);
                margin: 0;
            }

            .progress-badge {
                background: linear-gradient(135deg, #ff8200 0%, #f7b32b 100%);
                color: white;
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 700;
            }
        }

        .claim-all-area {
            .claim-all-btn {
                font-weight: 700;
            }
        }
    }

    .loading-state {
        display: flex;
        justify-content: center;
        padding: 40px;
    }

    .mission-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 40px;
        color: var(--text-light);

        p {
            margin: 12px 0 0;
            font-size: 14px;
        }
    }

    .overall-progress {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid var(--border-color);

        .progress-bar {
            height: 10px;
            margin-bottom: 8px;
        }

        .progress-label {
            display: block;
            text-align: center;
            font-size: 13px;
            font-weight: 600;
            color: var(--text-light);
        }
    }
}
</style>

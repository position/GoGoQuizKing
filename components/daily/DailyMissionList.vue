<template>
    <div class="daily-mission-card">
        <div class="card-header">
            <div class="badge">
                <q-icon name="task_alt" size="16px" color="teal" />
                <span>오늘의 미션</span>
            </div>
            <div class="progress-badge">{{ completedCount }} / {{ totalCount }}</div>
        </div>

        <div v-if="isLoading" class="loading-state">
            <q-spinner-dots color="primary" size="40px" />
            <p>미션을 불러오는 중...</p>
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

        <!-- 전체 진행률 & 모두 받기 -->
        <div v-if="missions.length > 0" class="action-area">
            <div class="overall-progress">
                <q-linear-progress
                    :value="overallProgress / 100"
                    color="teal"
                    class="progress-bar"
                    rounded
                />
                <span class="progress-label">{{ overallProgress }}% 완료</span>
            </div>
            <q-btn
                v-if="hasClaimableRewards"
                class="claim-btn"
                unelevated
                color="teal"
                text-color="white"
                label="모두 받기 🎁"
                :loading="isClaimingAll"
                @click="handleClaimAll"
            />
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
.daily-mission-card {
    background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 8px 24px rgba(78, 205, 196, 0.3);
    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 32px rgba(78, 205, 196, 0.4);
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(255, 255, 255, 0.9);
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 700;
            color: #00897b;
        }

        .progress-badge {
            background: rgba(255, 255, 255, 0.9);
            color: #00897b;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 700;
        }
    }

    .loading-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 40px 0;
        color: rgba(255, 255, 255, 0.9);

        p {
            margin: 12px 0 0;
            font-size: 14px;
        }
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
        padding: 40px 0;
        color: rgba(255, 255, 255, 0.8);

        p {
            margin: 12px 0 0;
            font-size: 14px;
        }
    }

    .action-area {
        margin-top: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;

        .overall-progress {
            display: flex;
            align-items: center;
            gap: 12px;

            .progress-bar {
                flex: 1;
                height: 8px;
                background: rgba(255, 255, 255, 0.3);

                :deep(.q-linear-progress__track) {
                    background: rgba(255, 255, 255, 0.3);
                }

                :deep(.q-linear-progress__model) {
                    background: white;
                }
            }

            .progress-label {
                font-size: 13px;
                font-weight: 700;
                color: white;
                white-space: nowrap;
            }
        }

        .claim-btn {
            width: 100%;
            font-weight: 700;
            font-size: 16px;
            padding: 12px;
            border-radius: 12px;
            background: white;
            color: #00897b;
        }
    }
}
</style>

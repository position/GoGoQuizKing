<template>
    <div
        class="mission-card"
        :class="{
            completed: mission.is_completed,
            claimable: mission.is_completed && !mission.reward_claimed,
        }"
    >
        <div class="mission-icon">
            {{ mission.icon }}
        </div>

        <div class="mission-content">
            <h4 class="mission-name">{{ mission.name }}</h4>
            <p class="mission-description">{{ mission.description }}</p>

            <div v-if="!mission.is_completed" class="progress-section">
                <q-linear-progress
                    :value="progress"
                    color="primary"
                    class="progress-bar"
                    rounded
                />
                <span class="progress-text">
                    {{ mission.current_value }} / {{ mission.target_value }}
                </span>
            </div>

            <div v-else class="completed-badge">
                <q-icon name="check_circle" color="positive" size="16px" />
                <span>완료!</span>
            </div>
        </div>

        <div class="mission-reward">
            <div class="reward-amount">+{{ mission.reward_points }}</div>
            <div class="reward-label">포인트</div>

            <q-btn
                v-if="mission.is_completed && !mission.reward_claimed"
                class="claim-btn"
                unelevated
                color="positive"
                size="sm"
                label="받기"
                :loading="isClaiming"
                @click="handleClaim"
            />

            <q-icon
                v-else-if="mission.reward_claimed"
                name="verified"
                color="grey"
                size="24px"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { UserDailyMission } from '@/models/dailyMission';

interface Props {
    mission: UserDailyMission;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    (e: 'claim', missionId: string): void;
}>();

const isClaiming = ref(false);

const progress = computed(() => {
    if (props.mission.target_value === 0) {
        return 0;
    }
    return props.mission.current_value / props.mission.target_value;
});

async function handleClaim() {
    isClaiming.value = true;
    emit('claim', props.mission.mission_id);
    // 부모 컴포넌트에서 처리 후 isClaiming을 false로 설정
    setTimeout(() => {
        isClaiming.value = false;
    }, 1000);
}
</script>

<style scoped lang="scss">
.mission-card {
    display: flex;
    align-items: center;
    gap: 16px;
    background: var(--bg-card);
    border-radius: 16px;
    padding: 16px;
    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease,
        background-color 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px var(--shadow-color);
    }

    &.completed {
        background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);

        .body--dark & {
            background: linear-gradient(135deg, #1b5e20 0%, #2e7d32 100%);
        }
    }

    &.claimable {
        animation: glow 2s infinite;
    }

    .mission-icon {
        font-size: 32px;
        flex-shrink: 0;
    }

    .mission-content {
        flex: 1;
        min-width: 0;

        .mission-name {
            margin: 0 0 4px;
            font-size: 16px;
            font-weight: 700;
            color: var(--text-primary);
        }

        .mission-description {
            margin: 0 0 8px;
            font-size: 13px;
            color: var(--text-light);
        }

        .progress-section {
            display: flex;
            align-items: center;
            gap: 8px;

            .progress-bar {
                flex: 1;
                height: 8px;
            }

            .progress-text {
                font-size: 12px;
                font-weight: 600;
                color: var(--text-light);
                white-space: nowrap;
            }
        }

        .completed-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            color: #4caf50;
            font-size: 13px;
            font-weight: 600;
        }
    }

    .mission-reward {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        flex-shrink: 0;

        .reward-amount {
            font-size: 18px;
            font-weight: 700;
            color: #f57c00;
        }

        .reward-label {
            font-size: 11px;
            color: var(--text-light);
        }

        .claim-btn {
            margin-top: 4px;
            font-weight: 700;
        }
    }
}

@keyframes glow {
    0%,
    100% {
        box-shadow: 0 4px 12px var(--shadow-color);
    }
    50% {
        box-shadow:
            0 4px 20px rgba(76, 175, 80, 0.4),
            0 0 0 3px rgba(76, 175, 80, 0.2);
    }
}
</style>

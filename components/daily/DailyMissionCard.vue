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
                <q-linear-progress :value="progress" color="primary" class="progress-bar" rounded />
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

            <q-icon v-else-if="mission.reward_claimed" name="verified" color="grey" size="24px" />
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
    gap: 12px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    padding: 14px;
    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;

    &:hover {
        transform: translateX(4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    &.completed {
        background: rgba(255, 255, 255, 0.98);

        .mission-icon {
            opacity: 0.7;
        }
    }

    &.claimable {
        animation: pulse-card 2s infinite;
    }

    .mission-icon {
        font-size: 28px;
        flex-shrink: 0;
    }

    .mission-content {
        flex: 1;
        min-width: 0;

        .mission-name {
            margin: 0 0 4px;
            font-size: 15px;
            font-weight: 700;
            color: var(--text-primary);

            .dark-mode & {
                color: #333;
            }
        }

        .mission-description {
            margin: 0 0 8px;
            font-size: 12px;
            color: var(--text-secondary);
            line-height: 1.3;

            .dark-mode & {
                color: #666;
            }
        }

        .progress-section {
            display: flex;
            align-items: center;
            gap: 8px;

            .progress-bar {
                flex: 1;
                height: 6px;
            }

            .progress-text {
                font-size: 12px;
                font-weight: 600;
                color: var(--text-secondary);
                white-space: nowrap;

                .dark-mode & {
                    color: #555;
                }
            }
        }

        .completed-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            color: #00897b;
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
        min-width: 60px;

        .reward-amount {
            font-size: 16px;
            font-weight: 700;
            color: var(--color-primary);
        }

        .reward-label {
            font-size: 11px;
            color: var(--text-light);

            .dark-mode & {
                color: #888;
            }
        }

        .claim-btn {
            margin-top: 4px;
            font-weight: 700;
            font-size: 12px;
            padding: 4px 12px;
        }
    }

    @keyframes pulse-card {
        0%,
        100% {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        50% {
            box-shadow:
                0 2px 12px rgba(0, 137, 123, 0.3),
                0 0 0 2px rgba(0, 137, 123, 0.2);
        }
    }
}
</style>

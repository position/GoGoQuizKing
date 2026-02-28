<template>
    <div class="achievement-progress">
        <div class="achievement-header">
            <span class="achievement-icon">{{ icon }}</span>
            <div class="achievement-info">
                <h4 class="achievement-name">{{ name }}</h4>
                <p class="achievement-description">{{ description }}</p>
            </div>
        </div>
        <div class="progress-section">
            <q-linear-progress
                :value="progressPercent / 100"
                :color="isCompleted ? 'positive' : 'primary'"
                track-color="grey-3"
                rounded
                size="12px"
            />
            <div class="progress-info">
                <span class="progress-text">{{ currentValue }} / {{ targetValue }}</span>
                <span class="progress-percent">{{ progressPercent }}%</span>
            </div>
        </div>
        <div v-if="isCompleted" class="completed-badge">
            <q-icon name="check_circle" color="positive" size="16px" />
            <span>완료!</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { calculateBadgeProgress } from '@/models/badge';

interface Props {
    name: string;
    description?: string;
    icon?: string;
    currentValue: number;
    targetValue: number;
}

const props = withDefaults(defineProps<Props>(), {
    description: '',
    icon: '🎯',
});

const progressPercent = computed(() =>
    calculateBadgeProgress(props.currentValue, props.targetValue),
);

const isCompleted = computed(() => props.currentValue >= props.targetValue);
</script>

<style scoped lang="scss">
.achievement-progress {
    padding: 16px;
    background: var(--bg-card);
    border-radius: 16px;
    border: 1px solid var(--border-color);

    .achievement-header {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 12px;

        .achievement-icon {
            font-size: 32px;
            flex-shrink: 0;
        }

        .achievement-info {
            flex: 1;

            .achievement-name {
                margin: 0;
                font-size: 15px;
                font-weight: 600;
                color: var(--text-primary);
            }

            .achievement-description {
                margin: 4px 0 0;
                font-size: 13px;
                color: var(--text-secondary);
            }
        }
    }

    .progress-section {
        .progress-info {
            display: flex;
            justify-content: space-between;
            margin-top: 6px;

            .progress-text {
                font-size: 12px;
                color: var(--text-light);
            }

            .progress-percent {
                font-size: 12px;
                font-weight: 600;
                color: #5c6bc0;

                .dark-mode & {
                    color: #9fa8da;
                }
            }
        }
    }

    .completed-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        margin-top: 12px;
        padding: 4px 12px;
        background: rgba(76, 175, 80, 0.15);
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        color: #4caf50;

        .dark-mode & {
            background: rgba(129, 199, 132, 0.2);
            color: #81c784;
        }
    }
}
</style>

<template>
    <div class="badge-card" :class="{ earned: isEarned, locked: !isEarned }">
        <div class="badge-icon-wrapper">
            <span class="badge-icon">{{ badge.badge_icon }}</span>
            <div v-if="!isEarned" class="lock-overlay">
                <q-icon name="lock" size="16px" />
            </div>
        </div>
        <div class="badge-info">
            <h4 class="badge-name">{{ badge.badge_name }}</h4>
            <p class="badge-description">{{ badge.badge_description }}</p>
            <div v-if="!isEarned && showProgress" class="progress-wrapper">
                <q-linear-progress
                    :value="progressPercent / 100"
                    color="primary"
                    track-color="grey-3"
                    rounded
                    size="8px"
                />
                <span class="progress-text">
                    {{ badge.current_progress }} / {{ badge.condition_value }}
                </span>
            </div>
            <div v-if="isEarned && badge.earned_at" class="earned-date">
                <q-icon name="check_circle" color="positive" size="14px" />
                <span>{{ formatDate(badge.earned_at) }} 획득</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { BadgeWithStatus } from '@/models/badge';
import { calculateBadgeProgress } from '@/models/badge';

interface Props {
    badge: BadgeWithStatus;
    showProgress?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    showProgress: true,
});

const isEarned = computed(() => props.badge.is_earned);

const progressPercent = computed(() =>
    calculateBadgeProgress(props.badge.current_progress, props.badge.condition_value),
);

const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};
</script>

<style scoped lang="scss">
.badge-card {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    border-radius: 16px;
    background: var(--bg-card);
    border: 2px solid var(--border-color);
    transition: all 0.3s ease;

    &.earned {
        border-color: #4caf50;
        background: linear-gradient(
            135deg,
            rgba(241, 248, 233, 0.8) 0%,
            rgba(232, 245, 233, 0.8) 100%
        );

        .dark-mode & {
            background: linear-gradient(
                135deg,
                rgba(76, 175, 80, 0.15) 0%,
                rgba(129, 199, 132, 0.15) 100%
            );
            border-color: #66bb6a;
        }

        .badge-icon-wrapper {
            background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
            border-color: #ffc107;

            .dark-mode & {
                background: linear-gradient(
                    135deg,
                    rgba(255, 193, 7, 0.2) 0%,
                    rgba(255, 236, 179, 0.2) 100%
                );
            }
        }
    }

    &.locked {
        opacity: 0.85;

        .badge-icon-wrapper {
            background: var(--bg-surface);
            border-color: var(--border-color);
        }

        .badge-icon {
            filter: grayscale(0.5);
            opacity: 0.7;
        }
    }

    .badge-icon-wrapper {
        position: relative;
        width: 56px;
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        border: 2px solid;
        flex-shrink: 0;

        .badge-icon {
            font-size: 28px;
        }

        .lock-overlay {
            position: absolute;
            bottom: -4px;
            right: -4px;
            width: 22px;
            height: 22px;
            background: #757575;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            border: 2px solid var(--bg-card);
        }
    }

    .badge-info {
        flex: 1;
        min-width: 0;

        .badge-name {
            margin: 0 0 4px;
            font-size: 15px;
            font-weight: 600;
            color: var(--text-primary);
        }

        .badge-description {
            margin: 0 0 8px;
            font-size: 13px;
            color: var(--text-secondary);
            line-height: 1.4;
        }

        .progress-wrapper {
            .progress-text {
                display: block;
                margin-top: 4px;
                font-size: 12px;
                color: var(--text-light);
                text-align: right;
            }
        }

        .earned-date {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 12px;
            color: #4caf50;

            .dark-mode & {
                color: #81c784;
            }
        }
    }
}
</style>

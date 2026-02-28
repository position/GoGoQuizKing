<template>
    <q-dialog v-model="isOpen" persistent>
        <q-card class="badge-unlock-dialog">
            <q-card-section class="celebration">
                <div class="confetti-left">🎉</div>
                <div class="confetti-right">🎊</div>
                <h2>뱃지 획득!</h2>
                <p v-if="badges.length > 1" class="badge-count">
                    {{ badges.length }}개의 뱃지를 획득했어요!
                </p>
            </q-card-section>

            <q-card-section class="badges-showcase">
                <div
                    v-for="(badge, index) in badges"
                    :key="badge.badge_id"
                    class="badge-item"
                    :style="{ animationDelay: `${index * 0.15}s` }"
                >
                    <div class="badge-icon-wrapper">
                        <span class="badge-icon">{{ badge.badge_icon }}</span>
                    </div>
                    <span class="badge-name">{{ badge.badge_name }}</span>
                </div>
            </q-card-section>

            <q-card-section class="message">
                <p>{{ congratsMessage }}</p>
            </q-card-section>

            <q-card-actions align="center">
                <q-btn
                    label="확인"
                    color="primary"
                    rounded
                    size="lg"
                    @click="close"
                    class="close-btn"
                />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useBadgeStore } from '@/store/badge.store';
import type { NewlyEarnedBadge } from '@/models/badge';

interface Props {
    modelValue: boolean;
    badges?: NewlyEarnedBadge[];
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    badges: () => [],
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
}>();

const badgeStore = useBadgeStore();

const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
});

const badges = computed(() =>
    props.badges.length > 0 ? props.badges : badgeStore.newlyEarnedBadges,
);

const congratsMessage = computed(() => {
    const messages = [
        '대단해요! 계속 도전해서 더 많은 뱃지를 모아보세요! 🌟',
        '멋져요! 앞으로도 화이팅! 💪',
        '최고예요! 뱃지 컬렉션이 점점 늘어나고 있어요! 🏆',
        '와우! 정말 잘하고 있어요! ⭐',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
});

const close = () => {
    isOpen.value = false;
    badgeStore.closeUnlockDialog();
};
</script>

<style scoped lang="scss">
.badge-unlock-dialog {
    min-width: 300px;
    max-width: 380px;
    border-radius: 24px;
    overflow: hidden;
    text-align: center;

    .celebration {
        background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
        color: white;
        padding: 24px;
        position: relative;

        .confetti-left,
        .confetti-right {
            font-size: 28px;
            position: absolute;
            top: 16px;
            animation: bounce 0.5s ease infinite alternate;
        }

        .confetti-left {
            left: 20px;
        }

        .confetti-right {
            right: 20px;
            animation-delay: 0.25s;
        }

        h2 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .badge-count {
            margin: 8px 0 0;
            font-size: 14px;
            opacity: 0.9;
        }
    }

    .badges-showcase {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 16px;
        padding: 24px;
        background: #fffde7;

        .badge-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            animation: pop 0.5s ease forwards;
            opacity: 0;
            transform: scale(0);

            .badge-icon-wrapper {
                width: 64px;
                height: 64px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
                border: 3px solid #ffc107;
                border-radius: 50%;
                box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);

                .badge-icon {
                    font-size: 32px;
                }
            }

            .badge-name {
                font-size: 13px;
                font-weight: 600;
                color: #333;
                max-width: 80px;
                text-align: center;
            }
        }
    }

    .message {
        padding: 16px 24px 8px;

        p {
            margin: 0;
            font-size: 14px;
            color: #666;
        }
    }

    .close-btn {
        min-width: 120px;
        margin-bottom: 16px;
    }
}

@keyframes bounce {
    from {
        transform: translateY(0) rotate(-5deg);
    }
    to {
        transform: translateY(-8px) rotate(5deg);
    }
}

@keyframes pop {
    0% {
        opacity: 0;
        transform: scale(0);
    }
    50% {
        transform: scale(1.2);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
}
</style>

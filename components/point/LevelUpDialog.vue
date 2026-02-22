<template>
    <q-dialog v-model="isOpen" persistent>
        <q-card class="level-up-dialog">
            <q-card-section class="celebration">
                <div class="confetti">🎉</div>
                <div class="level-icon">{{ levelInfo.icon }}</div>
                <h2>레벨업!</h2>
                <p class="level-text">
                    <span class="old-level">Lv.{{ oldLevel }}</span>
                    <q-icon name="arrow_forward" size="24px" />
                    <span class="new-level">Lv.{{ newLevel }}</span>
                </p>
                <p class="level-name">{{ levelInfo.name }}</p>
            </q-card-section>

            <q-card-section class="message">
                <p>축하해요! 🎊</p>
                <p>{{ congratsMessage }}</p>
            </q-card-section>

            <q-card-actions align="center">
                <q-btn label="확인" color="primary" rounded size="lg" @click="close" class="close-btn" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { usePointStore } from '@/store/point.store';
import { getLevelInfo } from '@/models/point';

interface Props {
    modelValue: boolean;
    oldLevel?: number;
    newLevel?: number;
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    oldLevel: 1,
    newLevel: 2,
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
}>();

const pointStore = usePointStore();

const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
});

const levelInfo = computed(() => getLevelInfo(props.newLevel));

const congratsMessage = computed(() => {
    const messages = [
        '계속 이렇게 열심히 하면 퀴즈 킹이 될 수 있어요!',
        '정말 대단해요! 다음 레벨도 도전해봐요!',
        '멋져요! 퀴즈 실력이 점점 늘고 있어요!',
        '와우! 실력이 일취월장하고 있네요!',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
});

const close = () => {
    isOpen.value = false;
    pointStore.clearLevelUpNotification();
};
</script>

<style scoped lang="scss">
.level-up-dialog {
    min-width: 300px;
    max-width: 360px;
    border-radius: 24px;
    overflow: hidden;
    text-align: center;

    .celebration {
        background: linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%);
        color: white;
        padding: 32px 24px;
        position: relative;

        .confetti {
            font-size: 32px;
            position: absolute;
            top: 16px;
            left: 24px;
            animation: bounce 0.5s ease infinite alternate;
        }

        .level-icon {
            font-size: 64px;
            margin-bottom: 8px;
            animation: pop 0.5s ease;
        }

        h2 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .level-text {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin: 12px 0 8px;
            font-size: 18px;

            .old-level {
                opacity: 0.7;
            }

            .new-level {
                font-weight: 700;
                font-size: 22px;
            }
        }

        .level-name {
            margin: 0;
            font-size: 16px;
            opacity: 0.9;
        }
    }

    .message {
        padding: 20px 24px;

        p {
            margin: 4px 0;
            font-size: 14px;
            color: #666;

            &:first-child {
                font-size: 18px;
                color: #333;
                font-weight: 600;
            }
        }
    }

    .close-btn {
        min-width: 120px;
        margin-bottom: 16px;
    }
}

@keyframes bounce {
    from {
        transform: translateY(0);
    }
    to {
        transform: translateY(-8px);
    }
}

@keyframes pop {
    0% {
        transform: scale(0);
    }
    50% {
        transform: scale(1.2);
    }
    100% {
        transform: scale(1);
    }
}
</style>

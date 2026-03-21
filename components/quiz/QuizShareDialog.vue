<script setup lang="ts">
import { useQuizShare } from '~/composables/use-quiz-share';

interface Props {
    quizId: string;
    title: string;
    description?: string;
}

const props = withDefaults(defineProps<Props>(), {
    description: '',
});

const modelValue = defineModel<boolean>({ default: false });

const { copyToClipboard, getKakaoShareUrl, getTwitterShareUrl, claimShareReward } = useQuizShare();

async function handleCopy() {
    const success = await copyToClipboard(props.quizId);
    if (success) {
        modelValue.value = false;
    }
}

async function handleKakao() {
    const url = getKakaoShareUrl(props.quizId, props.title);
    window.open(url, '_blank', 'noopener,noreferrer');
    await claimShareReward(props.quizId);
    modelValue.value = false;
}

async function handleTwitter() {
    const url = getTwitterShareUrl(props.quizId, props.title);
    window.open(url, '_blank', 'noopener,noreferrer');
    await claimShareReward(props.quizId);
    modelValue.value = false;
}
</script>

<template>
    <q-dialog v-model="modelValue">
        <q-card class="share-dialog">
            <q-card-section class="dialog-header">
                <div class="header-title">
                    <q-icon name="share" size="24px" color="primary" />
                    <span>퀴즈 공유하기</span>
                </div>
                <q-btn v-close-popup flat round dense icon="close" color="grey-6" />
            </q-card-section>

            <q-separator />

            <q-card-section class="dialog-body">
                <p class="share-description">친구에게 이 퀴즈를 공유해보세요! 🎯</p>

                <div class="share-options">
                    <!-- URL 복사 -->
                    <button class="share-option" @click="handleCopy">
                        <span class="option-icon copy-icon">
                            <q-icon name="content_copy" size="28px" />
                        </span>
                        <span class="option-label">링크 복사</span>
                    </button>

                    <!-- 카카오톡 -->
                    <button class="share-option" @click="handleKakao">
                        <span class="option-icon kakao-icon">
                            <q-icon name="chat" size="28px" />
                        </span>
                        <span class="option-label">카카오톡</span>
                    </button>

                    <!-- X (Twitter) -->
                    <button class="share-option" @click="handleTwitter">
                        <span class="option-icon twitter-icon">
                            <q-icon name="fa-brands fa-x-twitter" size="24px" />
                        </span>
                        <span class="option-label">X</span>
                    </button>
                </div>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<style scoped lang="scss">
.share-dialog {
    min-width: 320px;
    max-width: 400px;
    border-radius: 16px;
    background: var(--bg-card);

    .dialog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 16px 12px;

        .header-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 18px;
            font-weight: 700;
            color: var(--text-primary);
        }
    }

    .dialog-body {
        padding: 20px 16px 24px;

        .share-description {
            margin: 0 0 20px;
            text-align: center;
            font-size: 14px;
            color: var(--text-secondary);
        }

        .share-options {
            display: flex;
            justify-content: center;
            gap: 24px;

            .share-option {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                padding: 0;
                border: none;
                background: none;
                cursor: pointer;
                transition: transform 0.2s ease;

                &:hover {
                    transform: translateY(-2px);
                }

                &:active {
                    transform: scale(0.95);
                }

                .option-icon {
                    display: flex;
                    width: 56px;
                    height: 56px;
                    border-radius: 16px;
                    align-items: center;
                    justify-content: center;
                    transition: box-shadow 0.2s ease;

                    &:hover {
                        box-shadow: 0 4px 12px var(--shadow-color);
                    }
                }

                .copy-icon {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                }

                .kakao-icon {
                    background: #fee500;
                    color: #3c1e1e;
                }

                .twitter-icon {
                    background: #000;
                    color: white;

                    .dark-mode & {
                        background: #333;
                    }
                }

                .option-label {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text-secondary);
                }
            }
        }
    }
}
</style>




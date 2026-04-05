<script setup lang="ts">
import { ToastMessage } from '@/helper/message';
const supabase = useSupabaseClient();

const isLoading = ref<'google' | 'kakao' | null>(null);

async function loginWithGoogle() {
    if (isLoading.value) {
        return;
    }
    isLoading.value = 'google';

    try {
        const redirectTo = `${window.location.origin}/confirm`;

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        });

        if (error) {
            throw error;
        }
    } catch (e) {
        console.error(e);
        ToastMessage.error('Google 로그인에 실패했어요. 다시 시도해주세요!');
        isLoading.value = null;
    }
}

async function loginWithKakao() {
    if (isLoading.value) {
        return;
    }
    isLoading.value = 'kakao';

    try {
        const redirectTo = `${window.location.origin}/confirm`;

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'kakao',
            options: {
                redirectTo,
            },
        });

        if (error) {
            throw error;
        }
    } catch (e) {
        console.error(e);
        ToastMessage.error('카카오 로그인에 실패했어요. 다시 시도해주세요!');
        isLoading.value = null;
    }
}
</script>

<template>
    <div class="login-container">
        <div class="login-card">
            <div class="login-header">
                <div class="mascot">
                    <NuxtImg
                        :src="`${$imgHost}/img/quizking-character.png`"
                        alt="GoGo! Quiz King"
                        loading="lazy"
                        width="200"
                        height="200"
                        format="webp"
                        quality="80"
                    />
                </div>
                <h1 class="login-title">GOGO! QuizKing</h1>
                <p class="login-subtitle">어서와요! 로그인하고 퀴즈 모험을 시작해볼까요? 🚀</p>
            </div>

            <div class="login-actions">
                <!-- Google 로그인 -->
                <q-btn
                    @click="loginWithGoogle"
                    class="google-login-btn"
                    unelevated
                    size="lg"
                    :loading="isLoading === 'google'"
                    :disable="!!isLoading"
                >
                    <q-icon name="fab fa-google" class="login-icon google-icon" />
                    Google로 시작하기
                </q-btn>

                <div class="divider">
                    <span>또는</span>
                </div>

                <!-- 카카오 로그인 -->
                <q-btn
                    @click="loginWithKakao"
                    class="kakao-login-btn"
                    unelevated
                    size="lg"
                    :loading="isLoading === 'kakao'"
                    :disable="!!isLoading"
                >
                    <NuxtImg
                        :src="`${$imgHost}/img/kakaotalk_sharing_btn_small.png`"
                        alt="카카오 아이콘"
                        class="kakao-img"
                        width="24"
                        height="24"
                    />
                    카카오로 시작하기
                </q-btn>
            </div>

            <div class="login-footer">
                <p>3초만에 간편 로그인! 🎉</p>
                <p class="terms">
                    로그인하면
                    <a href="/terms" target="_blank">이용약관</a> 및
                    <a href="/privacy" target="_blank">개인정보 처리방침</a>에 동의하게 됩니다.
                </p>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 60vh;
    padding: 10px;
}

.login-card {
    max-width: 400px;
    width: 100%;
    background: var(--bg-card);
    border-radius: 24px;
    padding: 25px;
    box-shadow: 0 8px 32px var(--shadow-color);
    text-align: center;
    transition: background-color 0.3s ease;

    .login-header {
        margin-bottom: 32px;

        .mascot {
            font-size: 56px;
            animation: bounce 2s ease-in-out infinite;
        }

        .login-title {
            padding-bottom: 15px;
            font-size: 28px;
            font-weight: 800;
            color: var(--text-primary);
            line-height: 100%;
        }

        .login-subtitle {
            font-size: 15px;
            color: var(--text-secondary);
            margin: 0;
        }
    }

    .login-actions {
        margin-bottom: 24px;
        display: flex;
        flex-direction: column;
        gap: 12px;

        .login-icon {
            font-size: 20px;
            margin-right: 12px;
        }

        .google-login-btn {
            width: 100%;
            height: 48px;
            background: #ffffff;
            border: 1px solid #dadce0;
            border-radius: 12px;
            color: #3c4043;
            font-weight: 500;
            font-size: 15px;
            text-transform: capitalize;
            transition: all 0.2s ease;

            &:hover:not(:disabled) {
                background: #f8f9fa;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }

            .google-icon {
                color: #4285f4;
            }
        }

        .divider {
            display: flex;
            align-items: center;
            margin: 4px 0;

            &::before,
            &::after {
                content: '';
                flex: 1;
                height: 1px;
                background: var(--border-color, #e0e0e0);
            }

            span {
                padding: 0 12px;
                font-size: 13px;
                color: var(--text-light);
            }
        }

        .kakao-login-btn {
            width: 100%;
            height: 48px;
            background: #fee500;
            border-radius: 12px;
            color: #0f0f1a;
            font-weight: 500;
            font-size: 15px;
            transition: all 0.2s ease;

            &:hover:not(:disabled) {
                background: #fdd800;
            }

            .kakao-img {
                width: 24px;
                height: 24px;
                margin-right: 12px;
                vertical-align: middle;
            }
        }
    }

    .login-footer {
        p {
            font-size: 13px;
            color: var(--text-light);
            margin: 0;

            &.terms {
                margin-top: 12px;
                font-size: 11px;
                line-height: 1.5;

                a {
                    color: var(--color-primary);
                    text-decoration: none;

                    &:hover {
                        text-decoration: underline;
                    }
                }
            }
        }
    }
}

@keyframes bounce {
    0%,
    100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-8px);
    }
}

// 다크 모드 대응
.body--dark {
    .google-login-btn {
        background: #202124 !important;
        border-color: #5f6368 !important;
        color: #e8eaed !important;

        &:hover:not(:disabled) {
            background: #303134 !important;
        }
    }
}
</style>

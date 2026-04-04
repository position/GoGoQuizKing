<script setup lang="ts">
import { ToastMessage } from '@/helper/message';
const supabase = useSupabaseClient();

async function login() {
    try {
        // 현재 origin을 기반으로 redirectTo URL 생성
        const redirectTo = `${window.location.origin}/confirm`;

        await supabase.auth.signInWithOAuth({
            provider: 'kakao',
            options: {
                redirectTo,
            },
        });
    } catch (e) {
        console.error(e);
        ToastMessage.error(e);
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
                <q-btn @click="login" class="kakao-login-btn" unelevated size="lg">
                    <NuxtImg
                        :src="`${$imgHost}/img/kakaotalk_sharing_btn_small.png`"
                        alt="카카오 아이콘"
                        class="kakao-img"
                        width="24"
                        height="24"
                    />
                    카카오 로그인
                </q-btn>
            </div>

            <div class="login-footer">
                <p>카카오로 3초만에 로그인! 💛</p>
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
        margin-bottom: 40px;

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
        margin-bottom: 32px;

        .kakao-login-btn {
            width: 100%;
            height: auto;
            padding: 0;
            background: #fee500;
            border-radius: 12px;
            overflow: hidden;
            color: #0f0f1a;

            .kakao-img {
                width: 100%;
                max-width: 30px;
                height: auto;
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
</style>

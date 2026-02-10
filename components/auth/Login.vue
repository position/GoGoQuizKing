<script setup lang="ts">
import { ToastMessage } from '@/helper/message';
const supabase = useSupabaseClient();

async function login() {
    try {
        await supabase.auth.signInWithOAuth({
            provider: 'kakao',
            options: {
                redirectTo: 'http://localhost:3000',
            },
        });

        ToastMessage.success('Success');
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
                <div class="mascot">👑</div>
                <h1 class="login-title">GOGO! QuizKing</h1>
                <p class="login-subtitle">로그인하고 퀴즈 세계를 탐험해요!</p>
            </div>

            <div class="login-actions">
                <q-btn
                    @click="login"
                    class="kakao-login-btn"
                    unelevated
                    size="lg"
                >
                    <img src="https://developers.kakao.com/assets/img/about/logos/kakaologin/kr/kakao_login_medium_wide.png" alt="카카오 로그인" class="kakao-img" />
                </q-btn>
            </div>

            <div class="login-footer">
                <p>소셜 계정으로 간편하게 로그인하세요</p>
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
    padding: 24px;
}

.login-card {
    max-width: 400px;
    width: 100%;
    background: var(--bg-card);
    border-radius: 24px;
    padding: 40px 32px;
    box-shadow: 0 8px 32px var(--shadow-color);
    text-align: center;
    transition: background-color 0.3s ease;

    .login-header {
        margin-bottom: 40px;

        .mascot {
            font-size: 56px;
            margin-bottom: 16px;
            animation: bounce 2s ease-in-out infinite;
        }

        .login-title {
            font-size: 28px;
            font-weight: 800;
            color: var(--text-primary);
            margin: 0 0 8px;
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

            .kakao-img {
                width: 100%;
                max-width: 300px;
                height: auto;
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

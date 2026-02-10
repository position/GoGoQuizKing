<script setup lang="ts">
import { useAuthStore } from '~/store/auth.store';
import { ToastMessage } from '@/helper/message';

definePageMeta({
    name: 'Confirm',
    layout: false,
});

const supabase = useSupabaseClient();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

onMounted(async () => {
    try {
        // OAuth 콜백에서 세션 가져오기
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            console.error('Session error:', error);
            ToastMessage.error('로그인 처리 중 오류가 발생했습니다.');
            await router.push('/login');
            return;
        }

        if (data.session) {
            // 세션이 있으면 사용자 정보 등록
            const userMeta = data.session.user.user_metadata;
            const provider = data.session.user.app_metadata?.provider;

            authStore.registerInfo(userMeta, provider);
            authStore.token = data.session.access_token;

            ToastMessage.success('로그인 성공! 🎉');

            // redirectUrl 쿼리 파라미터가 있으면 해당 경로로, 없으면 홈으로
            const redirectUrl = (route.query.redirectUrl as string) || '/';
            await router.push(redirectUrl);
        } else {
            // 세션이 없으면 로그인 페이지로
            await router.push('/login');
        }
    } catch (e) {
        console.error('Confirm error:', e);
        ToastMessage.error('로그인 처리 중 오류가 발생했습니다.');
        await router.push('/login');
    }
});
</script>

<template>
    <div class="confirm-container">
        <div class="confirm-card">
            <div class="spinner">
                <q-spinner-dots color="primary" size="50px" />
            </div>
            <p class="confirm-text">로그인 처리 중...</p>
        </div>
    </div>
</template>

<style scoped lang="scss">
.confirm-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: var(--bg-page);
}

.confirm-card {
    text-align: center;
    padding: 40px;

    .spinner {
        margin-bottom: 20px;
    }

    .confirm-text {
        font-size: 16px;
        color: var(--text-secondary);
    }
}
</style>

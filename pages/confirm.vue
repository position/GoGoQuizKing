<script setup lang="ts">
import { useAuthStore } from '~/store/auth.store';
import { ToastMessage } from '@/helper/message';
import type { Database } from '@/models/database.types';
import type { LoginResponse } from '@/models/auth';

definePageMeta({
    name: 'Confirm',
    layout: false,
});

// SEO 설정 - 인증 페이지는 검색 엔진에서 제외
useSeoMeta({
    title: '로그인 처리 중 - GoGoQuizKing',
    robots: 'noindex, nofollow',
});

const supabase = useSupabaseClient<Database>();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// 프로필 테이블에 사용자 정보 저장/업데이트
async function upsertProfile(userId: string, userMeta: Record<string, unknown>, provider?: string) {
    try {
        const { error } = await supabase.from('profiles').upsert(
            {
                id: userId,
                email: (userMeta.email as string) || null,
                full_name: ((userMeta.full_name || userMeta.name) as string) || null,
                avatar_url: (userMeta.avatar_url as string) || null,
                preferred_username: (userMeta.preferred_username as string) || null,
                provider: provider || null,
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' },
        );

        if (error) {
            console.error('Profile upsert error:', error);
        }
    } catch (e) {
        console.error('Failed to upsert profile:', e);
    }
}

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
            const user = data.session.user;
            const userMeta = user.user_metadata as LoginResponse;
            const provider = user.app_metadata?.provider;

            // 프로필 테이블에 사용자 정보 저장/업데이트
            await upsertProfile(user.id, user.user_metadata as Record<string, unknown>, provider);

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

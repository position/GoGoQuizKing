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
    title: '로그인 처리 중 - 고고퀴즈킹(GoGo QuizKing)',
});

const supabase = useSupabaseClient<Database>();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// 프로필 테이블에 사용자 정보 저장/업데이트
// 중요: provider는 현재 로그인한 provider로 항상 업데이트됨
// (같은 이메일로 Google/Kakao 등 여러 provider 로그인 시 최신 provider 반영)
async function upsertProfile(userId: string, userMeta: Record<string, unknown>, provider?: string) {
    try {
        // provider가 있으면 항상 업데이트 (현재 로그인한 provider 반영)
        const { error } = await supabase.from('profiles').upsert(
            {
                id: userId,
                email: (userMeta.email as string) || null,
                full_name: ((userMeta.full_name || userMeta.name) as string) || null,
                avatar_url: (userMeta.avatar_url as string) || null,
                preferred_username: (userMeta.preferred_username as string) || null,
                provider: provider || null, // 현재 로그인한 provider로 업데이트
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'id', ignoreDuplicates: false },
        );

        if (error) {
            // 중복 키 에러(23505)는 트리거가 이미 처리했으므로 무시
            if (error.code !== '23505') {
                console.error('Profile upsert error:', error);
            }
        }
    } catch (e) {
        console.error('Failed to upsert profile:', e);
    }
}

onMounted(async () => {
    try {
        // URL 쿼리에서 에러 체크 (OAuth 콜백 에러)
        const errorParam = route.query.error as string | undefined;
        const errorDescription = route.query.error_description as string | undefined;

        if (errorParam) {
            // 중복 키 에러(profiles_pkey)는 트리거가 이미 처리했으므로 무시하고 진행
            const isDuplicateKeyError = errorDescription?.includes('profiles_pkey') ||
                                         errorDescription?.includes('duplicate key');

            if (isDuplicateKeyError) {
                console.log('Profile already exists (created by trigger), continuing...');
                // 에러 파라미터 무시하고 세션 확인으로 진행
            } else {
                // 다른 에러는 로그인 페이지로 리다이렉트
                console.error('OAuth callback error:', errorParam, errorDescription);
                ToastMessage.error('로그인 처리 중 오류가 발생했습니다.');
                await router.push('/login');
                return;
            }
        }

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

            // user.id를 함께 전달
            authStore.registerInfo(user.id, userMeta, provider);
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

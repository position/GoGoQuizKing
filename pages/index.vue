<template>
    <q-btn
        :to="{ name: 'create-quiz' }"
        label="퀴즈생성"
        color="primary"
        size="lg"
        class="button-create-quiz"
    />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '~/store/auth.store';
import { DTO } from '@/models';

const authStore = useAuthStore();
const supabase = useSupabaseClient();

onMounted(() => {
    getUserInfo();
});

async function getUserInfo() {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        await authStore.signOut();
        return;
    }

    const userInfo = { ...user.user_metadata } as DTO.Auth.LoginResponse;
    authStore.registerInfo(userInfo, user?.app_metadata.provider);
}
</script>

<style scoped lang="scss">
.button-create-quiz {
    width: 250px;
    height: 350px;
}
</style>

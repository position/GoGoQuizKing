<script setup lang="ts">
import { ToastMessage } from '@/helper/message';
const supabase = useSupabaseClient();
const $q = useQuasar();

async function login() {
    try {
        const res = await supabase.auth.signInWithOAuth({
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
        <q-card
            flat
            bordered
            class="login-area q-mb-md"
            :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-2'"
        >
            <q-card-section>
                <div class="row items-center no-wrap">
                    <div class="col">
                        <div class="text-h6">Login</div>
                    </div>
                </div>
            </q-card-section>

            <q-card-section>
                <q-btn @click="login" push fill size="xl">Kakao Login</q-btn>
            </q-card-section>

            <q-separator />
        </q-card>
    </div>
</template>

<style scoped lang="scss">
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: 50px;
    > .login-area {
        max-width: 500px;
        width: 100%;
    }
}
</style>

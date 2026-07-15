<script setup lang="ts">
import { useQuasar } from 'quasar';
import type { Database } from '~/models/database.types';
import type { GuestbookSettings, GuestbookVisibility } from '~/models/guestbook';

const supabase = useSupabaseClient<Database>();
const $q = useQuasar();
const loading = ref(true);
const saving = ref(false);
const enabled = ref(true);
const visibility = ref<GuestbookVisibility>('members');
const options = [
    { label: '모든 회원', value: 'members' },
    { label: '친구만 (준비 중)', value: 'friends', disable: true },
    { label: '비공개', value: 'private' },
];

async function load() {
    loading.value = true;
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const { data } = await supabase
        .from('profile_guestbook_settings')
        .select('*')
        .eq('profile_id', auth.user.id)
        .maybeSingle();
    const settings = data as GuestbookSettings | null;
    if (settings) {
        enabled.value = settings.is_enabled;
        visibility.value = settings.visibility;
    }
    loading.value = false;
}

async function save() {
    saving.value = true;
    try {
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) throw new Error('로그인이 필요합니다.');
        const { error } = await supabase.from('profile_guestbook_settings').upsert({
            profile_id: auth.user.id,
            is_enabled: enabled.value,
            visibility: visibility.value,
            updated_at: new Date().toISOString(),
        });
        if (error) throw error;
        $q.notify({ type: 'positive', message: '방명록 설정을 저장했습니다.' });
    } catch (e) {
        $q.notify({
            type: 'negative',
            message: e instanceof Error ? e.message : '설정을 저장하지 못했습니다.',
        });
    } finally {
        saving.value = false;
    }
}

onMounted(load);
</script>

<template>
    <section class="settings-card" aria-labelledby="guestbook-settings-title">
        <div class="settings-heading">
            <div>
                <h2 id="guestbook-settings-title">✍️ 프로필 방명록</h2>
                <p>다른 회원이 내 공개 프로필에 인사를 남길 수 있어요.</p>
            </div>
            <q-toggle
                v-model="enabled"
                color="primary"
                :disable="loading || saving"
                aria-label="방명록 사용"
                @update:model-value="save"
            />
        </div>
        <q-select
            v-model="visibility"
            outlined
            dense
            emit-value
            map-options
            :options="options"
            label="공개 범위"
            :disable="loading || saving || !enabled"
            @update:model-value="save"
        />
        <p class="help-text">차단한 사용자는 내 방명록을 보거나 작성할 수 없습니다.</p>
    </section>
</template>

<style scoped lang="scss">
.settings-card {
    margin-bottom: 24px;
    padding: 20px;
    border-radius: 16px;
    background: var(--bg-card);
    box-shadow: 0 2px 8px var(--shadow-color);
}
.settings-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
}
h2 {
    margin: 0;
    color: var(--text-primary);
    font-size: 18px;
}
p {
    margin: 5px 0 0;
    color: var(--text-secondary);
    font-size: 14px;
}
.help-text {
    margin-top: 12px;
    font-size: 12px;
}
@media (max-width: 600px) {
    .settings-card {
        padding: 16px;
    }
    .settings-heading {
        gap: 8px;
    }
}
</style>

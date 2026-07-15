<script setup lang="ts">
import { useQuasar } from 'quasar';
import GuestbookForm from '~/components/profile/GuestbookForm.vue';
import GuestbookEntry from '~/components/profile/GuestbookEntry.vue';
import { useProfileGuestbook } from '~/composables/use-profile-guestbook';
import type { Database } from '~/models/database.types';
import type { GuestbookEntry as GuestbookEntryModel, PublicProfile } from '~/models/guestbook';

definePageMeta({ layout: 'default' });
useSeoMeta({ title: '회원 프로필 - 고고퀴즈킹(GoGo QuizKing)', robots: 'noindex, nofollow' });

const route = useRoute();
const router = useRouter();
const supabase = useSupabaseClient<Database>();
const $q = useQuasar();
const profileId = computed(() => String(route.params.id || ''));
const currentUserId = ref('');
const profile = ref<PublicProfile | null>(null);
const profileLoading = ref(true);
const profileError = ref<string | null>(null);
const submitting = ref(false);
const form = ref<InstanceType<typeof GuestbookForm> | null>(null);
const stats = reactive({ quizzes: 0, attempts: 0, badges: 0 });
const highlightedId = computed(() => String(route.query.guestbook || ''));
const isSelf = computed(() => currentUserId.value === profileId.value);
const {
    entries,
    settings,
    loading,
    loadingMore,
    hasMore,
    error,
    fetchEntries,
    createEntry,
    updateEntry,
    setStatus,
    reportEntry,
    blockUser,
} = useProfileGuestbook(profileId);

const displayName = computed(() =>
    (profile.value?.preferred_username || profile.value?.full_name || '사용자').replace(/^@+/, ''),
);
const guestbookAvailable = computed(
    () => settings.value?.is_enabled && settings.value.visibility === 'members',
);

async function loadProfile() {
    profileLoading.value = true;
    const { data: auth } = await supabase.auth.getUser();
    currentUserId.value = auth.user?.id || '';
    try {
        const [{ data, error: fetchError }, quizzes, attempts, badges] = await Promise.all([
            supabase
                .from('profiles')
                .select('id, full_name, preferred_username, avatar_url, points, level, created_at')
                .eq('id', profileId.value)
                .maybeSingle(),
            supabase
                .from('quizzes')
                .select('id', { count: 'exact', head: true })
                .eq('created_by', profileId.value)
                .eq('is_public', true),
            supabase
                .from('quiz_attempts')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', profileId.value),
            supabase
                .from('user_badges')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', profileId.value),
        ]);
        if (fetchError) throw fetchError;
        if (!data) throw new Error('프로필을 찾을 수 없습니다.');
        profile.value = data as PublicProfile;
        stats.quizzes = quizzes.count || 0;
        stats.attempts = attempts.count || 0;
        stats.badges = badges.count || 0;
        await fetchEntries();
        await nextTick();
        if (highlightedId.value)
            document
                .getElementById(`guestbook-${highlightedId.value}`)
                ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (e) {
        profileError.value = e instanceof Error ? e.message : '프로필을 불러오지 못했습니다.';
    } finally {
        profileLoading.value = false;
    }
}

async function submit(content: string) {
    submitting.value = true;
    try {
        await createEntry(content);
        form.value?.reset();
        $q.notify({ type: 'positive', message: '방명록을 남겼습니다.' });
    } catch (e) {
        $q.notify({
            type: 'negative',
            message: e instanceof Error ? e.message : '작성하지 못했습니다.',
        });
    } finally {
        submitting.value = false;
    }
}
async function update(id: string, content: string) {
    try {
        await updateEntry(id, content);
        $q.notify({ type: 'positive', message: '방명록을 수정했습니다.' });
    } catch (e) {
        $q.notify({
            type: 'negative',
            message: e instanceof Error ? e.message : '수정하지 못했습니다.',
        });
    }
}
function confirmStatus(entry: GuestbookEntryModel, status: 'hidden' | 'deleted') {
    $q.dialog({
        title: status === 'hidden' ? '방명록 숨기기' : '방명록 삭제',
        message:
            status === 'hidden'
                ? '이 글을 다른 회원에게 숨길까요?'
                : '삭제하면 되돌릴 수 없습니다.',
        cancel: true,
        persistent: true,
    }).onOk(async () => {
        try {
            await setStatus(entry.id, status);
            $q.notify({
                type: 'positive',
                message: status === 'hidden' ? '숨김 처리했습니다.' : '삭제했습니다.',
            });
        } catch (e) {
            $q.notify({ type: 'negative', message: String(e) });
        }
    });
}
function report(entry: GuestbookEntryModel) {
    $q.dialog({
        title: '방명록 신고',
        options: {
            type: 'radio',
            model: 'spam',
            items: [
                { label: '스팸/광고', value: 'spam' },
                { label: '욕설/괴롭힘', value: 'abuse' },
                { label: '개인정보 침해', value: 'privacy' },
                { label: '기타', value: 'other' },
            ],
        },
        cancel: true,
    }).onOk(async (reason: 'spam' | 'abuse' | 'privacy' | 'other') => {
        try {
            await reportEntry(entry.id, reason);
            $q.notify({ type: 'positive', message: '신고가 접수되었습니다.' });
        } catch (e) {
            $q.notify({
                type: 'negative',
                message: e instanceof Error ? e.message : '신고하지 못했습니다.',
            });
        }
    });
}
function block(entry: GuestbookEntryModel) {
    $q.dialog({
        title: '작성자 차단',
        message: '이 사용자를 차단하고 해당 방명록을 숨길까요?',
        cancel: true,
        persistent: true,
    }).onOk(async () => {
        try {
            await blockUser(entry.author_id);
            await setStatus(entry.id, 'hidden');
            $q.notify({ type: 'positive', message: '사용자를 차단했습니다.' });
        } catch (e) {
            $q.notify({ type: 'negative', message: String(e) });
        }
    });
}

watch(profileId, loadProfile);
onMounted(loadProfile);
</script>

<template>
    <main class="public-profile-page">
        <div v-if="profileLoading" class="center-state">
            <q-spinner-dots color="primary" size="56px" />
        </div>
        <q-banner v-else-if="profileError" rounded class="bg-negative text-white"
            >{{ profileError
            }}<template #action><q-btn flat label="뒤로" @click="router.back()" /></template
        ></q-banner>
        <template v-else-if="profile">
            <q-btn flat icon="arrow_back" label="뒤로" class="back-btn" @click="router.back()" />
            <section class="profile-card">
                <q-avatar size="96px" class="profile-avatar"
                    ><q-img v-if="profile.avatar_url" :src="profile.avatar_url" /><q-icon
                        v-else
                        name="person"
                        size="50px"
                        color="grey-5"
                /></q-avatar>
                <div class="profile-info">
                    <h1>{{ displayName }}</h1>
                    <div class="level-badge">⭐ Lv.{{ profile.level }}</div>
                    <p>
                        {{
                            new Date(profile.created_at).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: 'long',
                            })
                        }}
                        가입
                    </p>
                </div>
            </section>
            <section class="stats-grid" aria-label="회원 활동 요약">
                <div>
                    <strong>{{ stats.quizzes }}</strong
                    ><span>공개 퀴즈</span>
                </div>
                <div>
                    <strong>{{ stats.attempts }}</strong
                    ><span>퀴즈 도전</span>
                </div>
                <div>
                    <strong>{{ stats.badges }}</strong
                    ><span>획득 뱃지</span>
                </div>
            </section>
            <section class="guestbook-card">
                <div class="section-heading">
                    <div>
                        <h2>✍️ 방명록</h2>
                        <p>{{ displayName }}님에게 따뜻한 인사를 남겨보세요.</p>
                    </div>
                    <q-chip outline color="primary">{{ entries.length }}개</q-chip>
                </div>
                <GuestbookForm
                    v-if="guestbookAvailable && !isSelf"
                    ref="form"
                    :loading="submitting"
                    @submit="submit"
                />
                <q-banner v-else-if="isSelf" rounded class="guestbook-closed"
                    ><q-icon name="info" /> 내 방명록을 관리하고 있습니다.</q-banner
                >
                <q-banner v-else rounded class="guestbook-closed"
                    ><q-icon name="lock" /> 현재 방명록이 비공개 상태입니다.</q-banner
                >
                <q-separator class="q-mt-lg" />
                <div v-if="loading" class="center-state small">
                    <q-spinner-dots color="primary" size="42px" />
                </div>
                <q-banner v-else-if="error" rounded class="bg-negative text-white q-mt-md"
                    >{{ error
                    }}<template #action
                        ><q-btn flat label="다시 시도" @click="fetchEntries()" /></template
                ></q-banner>
                <div v-else-if="entries.length">
                    <GuestbookEntry
                        v-for="entry in entries"
                        :key="entry.id"
                        :entry="entry"
                        :current-user-id="currentUserId"
                        :profile-owner-id="profileId"
                        :highlighted="highlightedId === entry.id"
                        @update="update"
                        @delete="confirmStatus($event, 'deleted')"
                        @hide="confirmStatus($event, 'hidden')"
                        @report="report"
                        @block="block"
                    />
                    <q-btn
                        v-if="hasMore"
                        flat
                        color="primary"
                        label="더 보기"
                        class="more-btn"
                        :loading="loadingMore"
                        @click="fetchEntries(false)"
                    />
                </div>
                <div v-else class="empty-state">
                    <q-icon name="auto_stories" size="54px" color="grey-4" />
                    <h3>첫 방명록을 남겨보세요</h3>
                    <p>아직 등록된 인사가 없습니다.</p>
                </div>
            </section>
        </template>
    </main>
</template>

<style scoped lang="scss">
.public-profile-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 16px 16px 100px;
}
.back-btn {
    min-height: 44px;
    margin-bottom: 8px;
}
.profile-card {
    display: flex;
    align-items: center;
    gap: 22px;
    padding: 26px;
    border-radius: 20px;
    color: white;
    background: linear-gradient(135deg, #5c6bc0, #7986cb);
}
.profile-avatar {
    flex: 0 0 auto;
    background: white;
    border: 3px solid rgba(255, 255, 255, 0.35);
}
.profile-info h1 {
    margin: 0 0 9px;
    font-size: 25px;
    line-height: 1.25;
    overflow-wrap: anywhere;
}
.profile-info p {
    margin: 9px 0 0;
    opacity: 0.85;
}
.level-badge {
    display: inline-flex;
    padding: 6px 12px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.2);
}
.stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin: 18px 0 24px;
}
.stats-grid > div {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    padding: 16px 8px;
    border-radius: 14px;
    background: var(--bg-card);
    box-shadow: 0 2px 8px var(--shadow-color);
}
.stats-grid strong {
    color: var(--color-primary);
    font-size: 22px;
}
.stats-grid span {
    color: var(--text-secondary);
    font-size: 12px;
}
.guestbook-card {
    padding: 22px;
    border-radius: 18px;
    background: var(--bg-card);
    box-shadow: 0 2px 8px var(--shadow-color);
}
.section-heading {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 18px;
}
.section-heading h2 {
    margin: 0;
    color: var(--text-primary);
    font-size: 20px;
}
.section-heading p {
    margin: 5px 0 0;
    color: var(--text-secondary);
}
.guestbook-closed {
    background: var(--bg-surface);
    color: var(--text-secondary);
}
.center-state {
    display: flex;
    min-height: 360px;
    align-items: center;
    justify-content: center;
}
.center-state.small {
    min-height: 180px;
}
.empty-state {
    padding: 48px 16px;
    text-align: center;
    color: var(--text-secondary);
}
.empty-state h3 {
    margin: 10px 0 4px;
    color: var(--text-primary);
}
.empty-state p {
    margin: 0;
}
.more-btn {
    width: 100%;
    min-height: 46px;
    margin-top: 12px;
}
@media (max-width: 600px) {
    .public-profile-page {
        padding: 10px 12px 88px;
    }
    .profile-card {
        flex-direction: column;
        gap: 14px;
        padding: 22px 16px;
        text-align: center;
    }
    .profile-info h1 {
        font-size: 22px;
    }
    .stats-grid {
        gap: 7px;
    }
    .stats-grid > div {
        padding: 13px 3px;
    }
    .stats-grid strong {
        font-size: 19px;
    }
    .guestbook-card {
        padding: 17px 14px;
    }
    .section-heading {
        align-items: flex-start;
    }
    .section-heading p {
        font-size: 13px;
    }
}
</style>

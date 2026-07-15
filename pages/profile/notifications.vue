<script setup lang="ts">
import { useCommentNotifications } from '~/composables/use-comment-notifications';
import type { CommentMentionNotification } from '~/models/comment';
import type { Database } from '~/models/database.types';
import type { GuestbookNotification } from '~/models/guestbook';

definePageMeta({ title: '커뮤니티 알림' });
useSeoMeta({ title: '커뮤니티 알림 - 고고퀴즈킹(GoGo QuizKing)', robots: 'noindex, nofollow' });

type CommunityNotification =
    | (CommentMentionNotification & { type: 'mention' })
    | (GuestbookNotification & { type: 'guestbook' });

const supabase = useSupabaseClient<Database>();
const router = useRouter();
const notifications = ref<CommunityNotification[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const { markAsRead, markGuestbookAsRead, markAllAsRead } = useCommentNotifications();

function displayName(notification: CommunityNotification): string {
    return (
        notification.actor?.preferred_username ||
        notification.actor?.full_name ||
        '사용자'
    ).replace(/^@+/, '');
}

async function fetchNotifications() {
    loading.value = true;
    error.value = null;
    try {
        const [mentions, guestbook] = await Promise.all([
            supabase
                .from('comment_mention_notifications')
                .select(
                    `*, actor:profiles!comment_mention_notifications_actor_id_fkey (full_name, preferred_username, avatar_url), quiz:quizzes!comment_mention_notifications_quiz_id_fkey (title)`,
                )
                .order('created_at', { ascending: false })
                .limit(50),
            supabase
                .from('guestbook_notifications')
                .select(
                    `*, actor:profiles!guestbook_notifications_actor_id_fkey (full_name, preferred_username, avatar_url)`,
                )
                .order('created_at', { ascending: false })
                .limit(50),
        ]);
        if (mentions.error) throw mentions.error;
        if (guestbook.error) throw guestbook.error;
        notifications.value = [
            ...((mentions.data || []) as unknown as CommentMentionNotification[]).map((item) => ({
                ...item,
                type: 'mention' as const,
            })),
            ...((guestbook.data || []) as unknown as GuestbookNotification[]).map((item) => ({
                ...item,
                type: 'guestbook' as const,
            })),
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } catch (e) {
        error.value = e instanceof Error ? e.message : '알림을 불러오지 못했습니다.';
    } finally {
        loading.value = false;
    }
}

async function openNotification(notification: CommunityNotification) {
    if (!notification.is_read) {
        if (notification.type === 'mention') await markAsRead(notification.id);
        else await markGuestbookAsRead(notification.id);
        notification.is_read = true;
    }
    if (notification.type === 'mention') {
        await router.push({
            path: `/quiz/${notification.quiz_id}`,
            query: { comment: notification.comment_id },
            hash: `#comment-${notification.comment_id}`,
        });
    } else {
        await router.push({
            path: `/profile/${notification.recipient_id}`,
            query: { guestbook: notification.entry_id },
            hash: `#guestbook-${notification.entry_id}`,
        });
    }
}

async function readAll() {
    if (await markAllAsRead())
        notifications.value.forEach((notification) => {
            notification.is_read = true;
        });
}

onMounted(fetchNotifications);
</script>

<template>
    <main class="notifications-page">
        <div class="page-header">
            <q-btn flat round icon="arrow_back" aria-label="마이페이지로 돌아가기" to="/profile" />
            <div class="title-area">
                <h1>🔔 커뮤니티 알림</h1>
                <p>멘션과 내 프로필에 남겨진 새 방명록을 확인하세요.</p>
            </div>
            <q-btn
                v-if="notifications.some((notification) => !notification.is_read)"
                flat
                color="primary"
                label="모두 읽음"
                class="read-all"
                @click="readAll"
            />
        </div>
        <div v-if="loading" class="center-state">
            <q-spinner-dots color="primary" size="48px" />
        </div>
        <q-banner v-else-if="error" rounded class="bg-negative text-white"
            >{{ error
            }}<template #action
                ><q-btn flat label="다시 시도" @click="fetchNotifications" /></template
        ></q-banner>
        <q-list v-else-if="notifications.length" bordered separator class="notification-list">
            <q-item
                v-for="notification in notifications"
                :key="`${notification.type}-${notification.id}`"
                clickable
                v-ripple
                :class="{ unread: !notification.is_read }"
                @click="openNotification(notification)"
            >
                <q-item-section avatar
                    ><q-avatar
                        ><q-img
                            v-if="notification.actor?.avatar_url"
                            :src="notification.actor.avatar_url" /><q-icon
                            v-else
                            name="person"
                            color="grey-6" /></q-avatar
                ></q-item-section>
                <q-item-section>
                    <q-item-label
                        ><strong>@{{ displayName(notification) }}</strong
                        >님이
                        {{
                            notification.type === 'mention'
                                ? '댓글에서 회원님을 언급했어요.'
                                : '회원님의 프로필에 방명록을 남겼어요.'
                        }}</q-item-label
                    >
                    <q-item-label caption lines="2">“{{ notification.preview }}”</q-item-label>
                    <q-item-label v-if="notification.type === 'mention'" caption>{{
                        notification.quiz?.title
                    }}</q-item-label>
                </q-item-section>
                <q-item-section side
                    ><q-icon
                        v-if="!notification.is_read"
                        name="fiber_manual_record"
                        color="primary"
                        size="12px" /><q-icon v-else name="chevron_right"
                /></q-item-section>
            </q-item>
        </q-list>
        <div v-else class="center-state">
            <q-icon name="notifications_none" size="64px" color="grey-4" />
            <h2>새 커뮤니티 알림이 없어요</h2>
        </div>
    </main>
</template>

<style scoped lang="scss">
.notifications-page {
    max-width: 760px;
    margin: 0 auto;
    padding: 16px 16px 100px;
}
.page-header {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 24px;
}
.title-area {
    flex: 1;
    min-width: 0;
}
.page-header h1 {
    margin: 0;
    color: var(--text-primary);
    font-size: 26px;
}
.page-header p {
    margin: 6px 0 0;
    color: var(--text-secondary);
}
.notification-list {
    overflow: hidden;
    border-radius: 14px;
    background: var(--bg-card);
}
.notification-list .unread {
    background: color-mix(in srgb, var(--color-primary) 8%, var(--bg-card));
}
.center-state {
    display: flex;
    min-height: 280px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: var(--text-secondary);
}
.center-state h2 {
    color: var(--text-primary);
}
@media (max-width: 600px) {
    .notifications-page {
        padding: 12px 10px 88px;
    }
    .page-header {
        flex-wrap: wrap;
    }
    .page-header h1 {
        font-size: 21px;
    }
    .page-header p {
        font-size: 13px;
    }
    .read-all {
        margin-left: 48px;
    }
    .notification-list :deep(.q-item) {
        min-height: 76px;
        padding: 12px 10px;
    }
    .notification-list :deep(.q-item__section--avatar) {
        min-width: 48px;
    }
}
</style>

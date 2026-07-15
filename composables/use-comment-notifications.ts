import type { Database } from '~/models/database.types';

export function useCommentNotifications() {
    const supabase = useSupabaseClient<Database>();
    const unreadCount = useState<number>('community-unread-count', () => 0);

    async function fetchUnreadCount(): Promise<void> {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
            unreadCount.value = 0;
            return;
        }

        const [mentions, guestbook] = await Promise.all([
            supabase
                .from('comment_mention_notifications')
                .select('id', { count: 'exact', head: true })
                .eq('recipient_id', userData.user.id)
                .eq('is_read', false),
            supabase
                .from('guestbook_notifications')
                .select('id', { count: 'exact', head: true })
                .eq('recipient_id', userData.user.id)
                .eq('is_read', false),
        ]);
        unreadCount.value =
            (mentions.error ? 0 : mentions.count || 0) +
            (guestbook.error ? 0 : guestbook.count || 0);
    }

    async function markAsRead(notificationId: string): Promise<boolean> {
        const { error } = await supabase
            .from('comment_mention_notifications')
            .update({ is_read: true })
            .eq('id', notificationId);

        if (!error) {
            unreadCount.value = Math.max(0, unreadCount.value - 1);
        }

        return !error;
    }

    async function markGuestbookAsRead(notificationId: string): Promise<boolean> {
        const { error } = await supabase
            .from('guestbook_notifications')
            .update({ is_read: true })
            .eq('id', notificationId);
        if (!error) unreadCount.value = Math.max(0, unreadCount.value - 1);
        return !error;
    }

    async function markAllAsRead(): Promise<boolean> {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
            return false;
        }

        const [mentions, guestbook] = await Promise.all([
            supabase
                .from('comment_mention_notifications')
                .update({ is_read: true })
                .eq('recipient_id', userData.user.id)
                .eq('is_read', false),
            supabase
                .from('guestbook_notifications')
                .update({ is_read: true })
                .eq('recipient_id', userData.user.id)
                .eq('is_read', false),
        ]);

        if (!mentions.error && !guestbook.error) {
            unreadCount.value = 0;
        }
        return !mentions.error && !guestbook.error;
    }

    return {
        unreadCount: readonly(unreadCount),
        fetchUnreadCount,
        markAsRead,
        markGuestbookAsRead,
        markAllAsRead,
    };
}

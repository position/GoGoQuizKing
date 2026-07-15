import type { Database } from '~/models/database.types';
import type { GuestbookEntry, GuestbookSettings, GuestbookStatus } from '~/models/guestbook';

const PAGE_SIZE = 20;

function messageFor(error: unknown): string {
    const message = error instanceof Error ? error.message : String(error || '');
    if (message.includes('WRITE_COOLDOWN')) return '잠시 후 다시 작성해 주세요. (작성 간격 60초)';
    if (message.includes('DAILY_LIMIT_REACHED'))
        return '이 프로필에는 하루 3개까지 남길 수 있어요.';
    if (message.includes('GUESTBOOK_NOT_AVAILABLE')) return '현재 방명록을 작성할 수 없어요.';
    if (message.includes('PROFILE_BLOCKED')) return '이 프로필에는 방명록을 남길 수 없어요.';
    if (message.includes('INVALID_CONTENT')) return '방명록은 1~300자로 입력해 주세요.';
    if (message.includes('FORBIDDEN_CONTENT'))
        return '사용할 수 없는 표현이나 반복 문자가 포함되어 있어요.';
    if (message.includes('DUPLICATE_CONTENT')) return '최근에 같은 내용을 이미 작성했어요.';
    return message || '요청을 처리하지 못했습니다.';
}

export function useProfileGuestbook(profileOwnerId: Ref<string>) {
    const supabase = useSupabaseClient<Database>();
    const entries = ref<GuestbookEntry[]>([]);
    const settings = ref<GuestbookSettings | null>(null);
    const loading = ref(false);
    const loadingMore = ref(false);
    const hasMore = ref(false);
    const error = ref<string | null>(null);

    async function fetchSettings() {
        const { data, error: fetchError } = await supabase
            .from('profile_guestbook_settings')
            .select('*')
            .eq('profile_id', profileOwnerId.value)
            .maybeSingle();
        if (fetchError) throw fetchError;
        settings.value = data as GuestbookSettings | null;
    }

    async function fetchEntries(reset = true) {
        if (reset) loading.value = true;
        else loadingMore.value = true;
        error.value = null;
        try {
            if (reset) await fetchSettings();
            const from = reset ? 0 : entries.value.length;
            const { data, error: fetchError } = await supabase
                .from('profile_guestbook_entries')
                .select(
                    `
                    *,
                    author:profiles!profile_guestbook_entries_author_id_fkey (
                        full_name, preferred_username, avatar_url, level
                    )
                `,
                )
                .eq('profile_owner_id', profileOwnerId.value)
                .order('created_at', { ascending: false })
                .range(from, from + PAGE_SIZE - 1);
            if (fetchError) throw fetchError;
            const next = (data || []) as unknown as GuestbookEntry[];
            entries.value = reset ? next : [...entries.value, ...next];
            hasMore.value = next.length === PAGE_SIZE;
        } catch (e) {
            error.value = messageFor(e);
        } finally {
            loading.value = false;
            loadingMore.value = false;
        }
    }

    async function createEntry(content: string) {
        const { error: rpcError } = await supabase.rpc('create_profile_guestbook_entry', {
            p_profile_owner_id: profileOwnerId.value,
            p_content: content,
        });
        if (rpcError) throw new Error(messageFor(rpcError));
        await fetchEntries();
    }

    async function updateEntry(id: string, content: string) {
        const { error: rpcError } = await supabase.rpc('update_profile_guestbook_entry', {
            p_entry_id: id,
            p_content: content,
        });
        if (rpcError) throw new Error(messageFor(rpcError));
        await fetchEntries();
    }

    async function setStatus(id: string, status: GuestbookStatus) {
        const { error: rpcError } = await supabase.rpc('set_profile_guestbook_entry_status', {
            p_entry_id: id,
            p_status: status,
        });
        if (rpcError) throw new Error(messageFor(rpcError));
        await fetchEntries();
    }

    async function reportEntry(id: string, reason: 'spam' | 'abuse' | 'privacy' | 'other') {
        const { data } = await supabase.auth.getUser();
        if (!data.user) throw new Error('로그인이 필요합니다.');
        const { error: insertError } = await supabase.from('community_reports').insert({
            reporter_id: data.user.id,
            target_type: 'guestbook',
            target_id: id,
            reason,
        });
        if (insertError) {
            if (insertError.code === '23505') throw new Error('이미 신고한 방명록입니다.');
            throw insertError;
        }
    }

    async function blockUser(userId: string) {
        const { data } = await supabase.auth.getUser();
        if (!data.user) throw new Error('로그인이 필요합니다.');
        const { error: insertError } = await supabase
            .from('profile_blocks')
            .upsert(
                { blocker_id: data.user.id, blocked_id: userId },
                { onConflict: 'blocker_id,blocked_id', ignoreDuplicates: true },
            );
        if (insertError) throw insertError;
        await fetchEntries();
    }

    return {
        entries: readonly(entries),
        settings: readonly(settings),
        loading: readonly(loading),
        loadingMore: readonly(loadingMore),
        hasMore: readonly(hasMore),
        error: readonly(error),
        fetchEntries,
        createEntry,
        updateEntry,
        setStatus,
        reportEntry,
        blockUser,
    };
}

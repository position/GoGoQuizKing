export type GuestbookVisibility = 'members' | 'friends' | 'private';
export type GuestbookStatus = 'visible' | 'hidden' | 'deleted';

export interface PublicProfile {
    id: string;
    full_name: string | null;
    preferred_username: string | null;
    avatar_url: string | null;
    points: number;
    level: number;
    created_at: string;
}

export interface GuestbookSettings {
    profile_id: string;
    is_enabled: boolean;
    visibility: GuestbookVisibility;
    updated_at: string;
}

export interface GuestbookEntry {
    id: string;
    profile_owner_id: string;
    author_id: string;
    content: string;
    status: GuestbookStatus;
    hidden_by: string | null;
    hidden_at: string | null;
    created_at: string;
    updated_at: string;
    author?: Pick<
        PublicProfile,
        'full_name' | 'preferred_username' | 'avatar_url' | 'level'
    > | null;
}

export interface GuestbookNotification {
    id: string;
    recipient_id: string;
    actor_id: string;
    entry_id: string;
    preview: string;
    is_read: boolean;
    created_at: string;
    actor?: Pick<PublicProfile, 'full_name' | 'preferred_username' | 'avatar_url'> | null;
}

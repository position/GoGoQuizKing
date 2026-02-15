export interface CommentInfo {
    content: string;
    created_at: string;
    id: string;
    parent_id: number | null;
    post_id: number;
    updated_at: string;
    user_id: string;
    profiles?: {
        full_name: string | null;
        avatar_url: string | null;
    };
}

export type UserRole = 'user' | 'admin' | 'moderator';

export interface LoginResponse {
    avatar_url: string | null;
    email: string | null;
    email_verified: boolean;
    full_name: string | null;
    iss: string | null;
    name: string | null;
    phone_verified: boolean;
    preferred_username: string | null;
    provider_id: string | null;
    sub: string | null;
    user_name: string | null;
    provider: string | null;
    role?: UserRole;
}

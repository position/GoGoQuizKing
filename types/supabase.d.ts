import type { Database } from '../models/database.types';

declare module '#supabase/server' {
    function serverSupabaseClient<T = Database>(): Promise<T>;
}

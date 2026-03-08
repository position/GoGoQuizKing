// ~/composables/useSupabase.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '~/models/database.types';

export function useSupabase(): SupabaseClient<Database> {
    // @nuxtjs/supabase 모듈의 useSupabaseClient 사용
    return useSupabaseClient<Database>();
}

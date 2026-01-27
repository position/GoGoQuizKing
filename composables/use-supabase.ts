// ~/composables/useSupabase.ts
import { useNuxtApp } from '#app'
import type { SupabaseClient } from '@supabase/supabase-js'

export function useSupabase(): SupabaseClient {
    const nuxtApp = useNuxtApp()
    // defineNuxtPlugin 에서 provide('supabase', client) 해 둔 객체
    console.log(nuxtApp);
    return nuxtApp.$supabase as SupabaseClient;
}

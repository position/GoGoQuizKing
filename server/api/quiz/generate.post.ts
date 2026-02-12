import { createClient } from '@supabase/supabase-js';

/**
 * 퀴즈 자동 생성 API
 */
export default defineEventHandler(async (event) => {
    try {
        const config = useRuntimeConfig();
        const supabase = createClient(
            config.public.supabaseUrl!,
            config.public.supabaseServiceRoleKey!,
        );

        // Edge Function 호출
        const { data, error } = await supabase.functions.invoke('daily-quiz-generation', {
            body: { trigger: 'manual' },
        });

        if (error) {
            throw error;
        }

        return {
            success: true,
            data,
        };
    } catch (error: any) {
        console.error('퀴즈 생성 오류:', error);
        return {
            success: false,
            error: error.message || '퀴즈 생성 중 오류가 발생했습니다.',
        };
    }
});

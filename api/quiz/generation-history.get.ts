import { createClient } from '@supabase/supabase-js';
/**
 * 퀴즈 생성 이력 조회 API
 */
export default defineEventHandler(async (event) => {
    try {
        const config = useRuntimeConfig();
        const supabase = createClient(
            config.public.supabaseUrl!,
            config.public.supabaseServiceRoleKey!,
        );
        const query = getQuery(event);
        const page = parseInt(query.page as string) || 1;
        const limit = parseInt(query.limit as string) || 10;
        const offset = (page - 1) * limit;

        // 퀴즈 생성 이력 조회
        const { data, error, count } = await supabase
            .from('quiz_generation_history')
            .select('*, quizzes(id, title, category, difficulty)', { count: 'exact' })
            .order('generated_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            throw error;
        }

        return {
            success: true,
            data: data || [],
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            },
        };
    } catch (error: any) {
        console.error('히스토리 조회 오류:', error);
        return {
            success: false,
            error: error.message || '히스토리 조회 중 오류가 발생했습니다.',
        };
    }
});

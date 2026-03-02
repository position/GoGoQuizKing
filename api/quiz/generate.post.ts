import { createClient } from '@supabase/supabase-js';

interface GenerateQuizBody {
    mode?: 'daily' | 'all' | 'single' | 'batch';
    index?: number;
    count?: number;
}

/**
 * 퀴즈 자동 생성 API
 *
 * @body mode - 생성 모드 ('daily' | 'all' | 'single' | 'batch')
 * @body index - single 모드에서 사용할 템플릿 인덱스
 * @body count - batch 모드에서 생성할 퀴즈 개수
 */
export default defineEventHandler(async (event) => {
    try {
        const config = useRuntimeConfig();
        const body = await readBody<GenerateQuizBody>(event);

        // 환경 변수 검증
        if (!config.public.supabaseUrl || !config.public.supabaseServiceRoleKey) {
            console.error('Supabase 환경 변수가 설정되지 않았습니다.');
            return {
                success: false,
                error: 'Supabase 환경 변수가 설정되지 않았습니다.',
            };
        }

        const supabase = createClient(
            config.public.supabaseUrl,
            config.public.supabaseServiceRoleKey,
        );

        console.log('Edge Function 호출 시작:', {
            mode: body?.mode || 'daily',
            index: body?.index,
            count: body?.count,
        });

        // Edge Function 호출
        const { data, error } = await supabase.functions.invoke('daily-quiz-generation', {
            body: {
                mode: body?.mode || 'daily',
                index: body?.index,
                count: body?.count,
            },
        });

        if (error) {
            console.error('Edge Function 호출 에러:', {
                message: error.message,
                name: error.name,
                context: error.context,
                details: JSON.stringify(error),
            });

            // FunctionsHttpError인 경우 상세 정보 추출
            if (error.name === 'FunctionsHttpError') {
                const errorData = await error.context?.json?.();
                return {
                    success: false,
                    error: errorData?.error || error.message || 'Edge Function 호출 실패',
                    details: errorData,
                };
            }

            return {
                success: false,
                error: error.message || 'Edge Function 호출 실패',
            };
        }

        console.log('Edge Function 호출 성공:', data);

        return {
            success: true,
            ...data,
        };
    } catch (error: any) {
        console.error('퀴즈 생성 오류:', error);
        return {
            success: false,
            error: error.message || '퀴즈 생성 중 오류가 발생했습니다.',
        };
    }
});

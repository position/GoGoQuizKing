import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

interface QuizTemplate {
    title: string;
    description: string;
    category: string;
    grade_level: number;
    difficulty: 'seedling' | 'leaf' | 'tree' | 'king';
    questions: Question[];
}

interface Question {
    question_type: 'multiple' | 'ox';
    question_text: string;
    correct_answer: string;
    options: string[];
    hint: string;
}

const quizTemplates: QuizTemplate[] = [
    // ====== 4학년용 수학 seedling 1: 기초 연산 ======
    {
        title: '🌱 4학년 수학 기초 연산',
        description: '4학년을 위한 덧셈, 뺄셈, 곱셈 기초 연산 문제예요.',
        category: 'math',
        grade_level: 4,
        difficulty: 'seedling',
        questions: [
            {
                question_type: 'multiple',
                question_text: '125 + 37 = ?',
                correct_answer: '162',
                options: ['142', '152', '162', '172'],
                hint: '일의 자리부터 차근차근 더해보세요.',
            },
            {
                question_type: 'multiple',
                question_text: '300 - 145 = ?',
                correct_answer: '155',
                options: ['145', '150', '155', '165'],
                hint: '먼저 300 - 100, 그다음 45를 빼보세요.',
            },
            {
                question_type: 'multiple',
                question_text: '6 × 7 = ?',
                correct_answer: '42',
                options: ['36', '40', '42', '48'],
                hint: '6단 구구단을 떠올려 보세요.',
            },
            {
                question_type: 'ox',
                question_text: '5 × 8은 45이다. O일까요 X일까요?',
                correct_answer: 'X',
                options: ['O', 'X'],
                hint: '5 × 8은 5를 8번 더한 값이에요.',
            },
            {
                question_type: 'multiple',
                question_text: '다음 중 값이 가장 큰 것은?',
                correct_answer: '9 × 5',
                options: ['7 × 6', '8 × 4', '9 × 5', '10 × 3'],
                hint: '각각의 곱셈 결과를 계산해 보세요.',
            },
        ],
    },

    // ====== 4학년용 수학 leaf 2: 도형 기초 ======
    {
        title: '🍃 4학년 수학 도형 기초',
        description: '삼각형, 사각형, 직각을 구분하는 연습을 해봐요.',
        category: 'math',
        grade_level: 4,
        difficulty: 'leaf',
        questions: [
            {
                question_type: 'ox',
                question_text: '정사각형은 네 변의 길이가 모두 같다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '정사각형은 네 변, 네 각이 모두 같은 도형이에요.',
            },
            {
                question_type: 'multiple',
                question_text: '다음 중 삼각형이 아닌 것은?',
                correct_answer: '네 변을 가진 도형',
                options: [
                    '세 변을 가진 도형',
                    '네 변을 가진 도형',
                    '세 각을 가진 도형',
                    '직각 하나를 가진 도형',
                ],
                hint: '삼각형은 변이 몇 개일까요?',
            },
            {
                question_type: 'multiple',
                question_text: '직각은 몇 도인가요?',
                correct_answer: '90도',
                options: ['45도', '60도', '90도', '180도'],
                hint: '모서리처럼 꺾인 각도예요.',
            },
            {
                question_type: 'multiple',
                question_text: '다음 중 직사각형의 특징으로 알맞은 것은?',
                correct_answer: '네 각이 모두 직각이다.',
                options: [
                    '네 변의 길이가 모두 같다.',
                    '네 각이 모두 직각이다.',
                    '세 변의 길이가 같다.',
                    '한 각만 직각이다.',
                ],
                hint: '정사각형은 직사각형의 한 종류예요.',
            },
            {
                question_type: 'ox',
                question_text: '원에는 꼭짓점이 없다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '꼭짓점은 직선들이 만나는 점이에요.',
            },
        ],
    },

    // ====== 4학년용 국어 seedling 3: 읽기 이해 ======
    {
        title: '📖 4학년 국어 읽기 이해',
        description: '짧은 글을 읽고 내용을 이해하는 연습을 해봐요.',
        category: 'korean',
        grade_level: 4,
        difficulty: 'seedling',
        questions: [
            {
                question_type: 'multiple',
                question_text: '민수는 학교가 끝나고 도서관에 갔다. 민수가 간 곳은 어디인가요?',
                correct_answer: '도서관',
                options: ['학교', '놀이터', '도서관', '집'],
                hint: '문장에서 장소를 잘 찾아보세요.',
            },
            {
                question_type: 'multiple',
                question_text:
                    '다음 글을 읽고, 친구를 도와준 사람은 누구인지 고르세요.\n\n"지수는 무거운 가방을 들고 힘들어했다. 그때 민지가 와서 가방을 들어 주었다."',
                correct_answer: '민지',
                options: ['지수', '민지', '선생님', '모르겠다'],
                hint: '누가 가방을 들어 주었나요?',
            },
            {
                question_type: 'ox',
                question_text:
                    '"봄에는 꽃이 피고, 여름에는 날씨가 덥다." 이 문장에서 봄에는 날씨가 춥다고 했다. O일까요 X일까요?',
                correct_answer: 'X',
                options: ['O', 'X'],
                hint: '봄에 대해 뭐라고 말했는지 다시 읽어보세요.',
            },
            {
                question_type: 'multiple',
                question_text:
                    '다음 글의 내용과 알맞은 제목을 고르세요.\n\n"오늘 우리 반은 소풍을 갔다. 친구들과 함께 도시락을 나누어 먹고, 공에서 놀았다."',
                correct_answer: '즐거운 소풍',
                options: ['학교 급식 시간', '즐거운 소풍', '운동회 이야기', '시험 준비'],
                hint: '글에서 반복해서 나오는 활동이 무엇인지 보세요.',
            },
            {
                question_type: 'multiple',
                question_text:
                    '"민수는 비가 와도 약속을 지키기 위해 우산을 쓰고 놀이터로 갔다." 민수의 행동에서 알 수 있는 점은?',
                correct_answer: '약속을 잘 지키는 사람이다.',
                options: [
                    '약속 시간을 자주 잊는다.',
                    '우산을 좋아한다.',
                    '약속을 잘 지키는 사람이다.',
                    '놀이터를 싫어한다.',
                ],
                hint: '비가 오는데도 왜 나갔는지 생각해보세요.',
            },
        ],
    },

    // ====== 4학년용 과학 seedling 4: 계절과 날씨 ======
    {
        title: '🔬 4학년 과학: 계절과 날씨',
        description: '계절에 따라 달라지는 날씨를 알아봐요.',
        category: 'science',
        grade_level: 4,
        difficulty: 'seedling',
        questions: [
            {
                question_type: 'multiple',
                question_text: '다음 중 봄에 볼 수 있는 모습으로 가장 알맞은 것은?',
                correct_answer: '꽃이 피고 날씨가 따뜻해진다.',
                options: [
                    '눈이 많이 내리고 매우 춥다.',
                    '꽃이 피고 날씨가 따뜻해진다.',
                    '낙엽이 지고 쌀쌀해진다.',
                    '매우 덥고 장마가 온다.',
                ],
                hint: '봄, 여름, 가을, 겨울의 특징을 떠올려 보세요.',
            },
            {
                question_type: 'multiple',
                question_text: '여름에 자주 일어나는 날씨 현상은 무엇인가요?',
                correct_answer: '장마와 소나기',
                options: ['눈보라', '안개', '장마와 소나기', '낙엽비'],
                hint: '비가 많이 오는 계절을 떠올려 보세요.',
            },
            {
                question_type: 'ox',
                question_text: '가을에는 나무의 잎이 푸르게 변한다. O일까요 X일까요?',
                correct_answer: 'X',
                options: ['O', 'X'],
                hint: '가을의 단풍을 생각해 보세요.',
            },
            {
                question_type: 'multiple',
                question_text: '다음 중 겨울의 특징으로 알맞은 것은?',
                correct_answer: '기온이 낮고 눈이 내리기도 한다.',
                options: [
                    '기온이 높고 땀이 난다.',
                    '꽃이 피고 새싹이 난다.',
                    '기온이 낮고 눈이 내리기도 한다.',
                    '낙엽이 피고 나무가 푸르러진다.',
                ],
                hint: '겨울에 입는 옷을 떠올려 보세요.',
            },
            {
                question_type: 'ox',
                question_text:
                    '하루 동안의 기온과 날씨의 변화를 살피는 것을 "기후"라고 한다. O일까요 X일까요?',
                correct_answer: 'X',
                options: ['O', 'X'],
                hint: '짧은 기간의 날씨는 "날씨", 오랜 기간의 평균은 "기후"예요.',
            },
        ],
    },

    // ====== 4학년용 생활 leaf 5: 생활 예절과 안전 ======
    {
        title: '✨ 4학년 생활 예절과 안전',
        description: '학교와 집에서 지켜야 할 예절과 안전 수칙을 알아봐요.',
        category: 'general',
        grade_level: 4,
        difficulty: 'leaf',
        questions: [
            {
                question_type: 'multiple',
                question_text: '친구와 다툰 뒤 가장 알맞은 행동은 무엇인가요?',
                correct_answer: '서로 이야기를 나누고 먼저 사과한다.',
                options: [
                    '끝까지 화를 낸다.',
                    '다른 친구에게 험담한다.',
                    '서로 이야기를 나누고 먼저 사과한다.',
                    '다시는 말을 하지 않는다.',
                ],
                hint: '좋은 친구 관계를 유지하려면 어떻게 해야 할까요?',
            },
            {
                question_type: 'ox',
                question_text:
                    '횡단보도를 건널 때 파란 불이 켜지면 바로 뛰어가야 한다. O일까요 X일까요?',
                correct_answer: 'X',
                options: ['O', 'X'],
                hint: '좌우를 살핀 뒤 천천히 걸어가야 해요.',
            },
            {
                question_type: 'multiple',
                question_text:
                    '온라인에서 모르는 사람이 주소를 알려 달라고 할 때 어떻게 해야 하나요?',
                correct_answer: '개인 정보를 알려주지 않고 어른께 이야기한다.',
                options: [
                    '친하니까 알려준다.',
                    '정확한 집 주소를 보낸다.',
                    '개인 정보를 알려주지 않고 어른께 이야기한다.',
                    '전화번호만 알려준다.',
                ],
                hint: '개인 정보는 절대 함부로 알려주면 안 돼요.',
            },
            {
                question_type: 'multiple',
                question_text: '교실에서 지켜야 할 예절로 가장 알맞은 것은?',
                correct_answer: '수업 시간에 떠들지 않고 집중한다.',
                options: [
                    '친구의 물건을 허락 없이 사용한다.',
                    '수업 시간에 떠들지 않고 집중한다.',
                    '쓰레기를 책상 속에 넣어 둔다.',
                    '복도에서 큰 소리로 뛰어다닌다.',
                ],
                hint: '모두가 함께 사용하는 공간에서의 예절을 생각해 보세요.',
            },
            {
                question_type: 'ox',
                question_text:
                    '엘리베이터 안에서는 장난을 치지 않고 조용히 타야 한다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '작은 공간에서는 안전이 특히 중요해요.',
            },
        ],
    },
];
// 단일 퀴즈 생성 함수
async function createQuizFromTemplate(
    supabase: ReturnType<typeof createClient>,
    template: QuizTemplate,
    systemUserId: string,
    dateLabel?: string,
): Promise<{ quiz_id: string; title: string; questions_count: number }> {
    const today = new Date();
    const label = dateLabel || today.toLocaleDateString('ko-KR');

    console.log(`퀴즈 생성 시작: ${template.title}, 사용자 ID: ${systemUserId}`);

    // 퀴즈 생성
    const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert({
            created_by: systemUserId,
            title: template.title,
            description: template.description,
            category: template.category,
            grade_level: template.grade_level,
            difficulty: template.difficulty,
            is_public: true,
        })
        .select()
        .single();

    if (quizError) {
        console.error('퀴즈 INSERT 에러:', quizError);
        throw new Error(`퀴즈 생성 실패: ${quizError.message}`);
    }

    console.log(`퀴즈 생성 완료: ${quiz.id}`);

    // 질문들 생성
    const questions = template.questions.map((q, index) => ({
        quiz_id: quiz.id,
        question_type: q.question_type,
        question_text: q.question_text,
        correct_answer: q.correct_answer,
        options: q.options,
        hint: q.hint,
        order_index: index,
    }));

    const { error: questionsError } = await supabase.from('quiz_questions').insert(questions);

    if (questionsError) {
        console.error('질문 INSERT 에러:', questionsError);
        throw new Error(`질문 생성 실패: ${questionsError.message}`);
    }

    console.log(`질문 ${questions.length}개 생성 완료`);

    // 생성 이력 기록
    const { error: historyError } = await supabase.from('quiz_generation_history').insert({
        quiz_id: quiz.id,
        template_name: template.title,
        generated_at: new Date().toISOString(),
    });

    if (historyError) {
        console.error('히스토리 기록 실패:', historyError);
        // 히스토리 실패는 치명적이지 않으므로 계속 진행
    }

    return {
        quiz_id: quiz.id,
        title: quiz.title,
        questions_count: questions.length,
    };
}

/**
 * 퀴즈 생성 Edge Function
 *
 * 요청 방식:
 * 1. mode: 'daily' (기본값) - 오늘 날짜 기준으로 1개의 퀴즈 생성 (순환)
 * 2. mode: 'all' - 모든 템플릿으로 퀴즈 한 번에 생성
 * 3. mode: 'single' + index - 특정 인덱스의 템플릿으로 퀴즈 생성
 * 4. mode: 'batch' + count - 지정한 개수만큼 순차적으로 퀴즈 생성
 *
 * 예시:
 * POST /generate-daily-quiz
 * { "mode": "all" }
 * { "mode": "single", "index": 0 }
 * { "mode": "batch", "count": 5 }
 */
Deno.serve(async (req: Request) => {
    try {
        // CORS 헤더
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        };

        if (req.method === 'OPTIONS') {
            return new Response('ok', { headers: corsHeaders });
        }

        // 요청 본문 파싱
        let mode = 'daily';
        let templateIndex: number | undefined;
        let batchCount: number | undefined;

        if (req.method === 'POST') {
            try {
                const body = await req.json();
                mode = body.mode || 'daily';
                templateIndex = body.index;
                batchCount = body.count;
            } catch {
                // 본문이 없거나 파싱 실패 시 기본값 사용
            }
        }

        // Supabase 클라이언트 생성
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase 환경 변수가 설정되지 않았습니다.');
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // 시스템 사용자 가져오기 (첫 번째 사용자)
        const { data: users, error: userError } = await supabase
            .from('profiles')
            .select('id')
            .limit(1)
            .single();

        if (userError) {
            console.error('프로필 조회 에러:', userError);
            throw new Error(`시스템 사용자 조회 실패: ${userError.message}`);
        }

        if (!users) {
            throw new Error(
                '시스템 사용자를 찾을 수 없습니다. profiles 테이블에 사용자가 있는지 확인하세요.',
            );
        }

        const systemUserId = users.id;
        const today = new Date();
        const results: { quiz_id: string; title: string; questions_count: number }[] = [];

        switch (mode) {
            case 'all': {
                // 모든 템플릿으로 퀴즈 생성
                for (let i = 0; i < quizTemplates.length; i++) {
                    const template = quizTemplates[i];
                    const result = await createQuizFromTemplate(
                        supabase,
                        template,
                        systemUserId,
                        `${today.toLocaleDateString('ko-KR')} #${i + 1}`,
                    );
                    results.push(result);
                }
                break;
            }

            case 'single': {
                // 특정 인덱스의 템플릿으로 퀴즈 생성
                const idx = templateIndex ?? 0;
                if (idx < 0 || idx >= quizTemplates.length) {
                    throw new Error(
                        `잘못된 인덱스입니다. 0-${quizTemplates.length - 1} 범위 내에서 지정해주세요.`,
                    );
                }
                const template = quizTemplates[idx];
                const result = await createQuizFromTemplate(supabase, template, systemUserId);
                results.push(result);
                break;
            }

            case 'batch': {
                // 지정한 개수만큼 순차적으로 퀴즈 생성
                const count = Math.min(batchCount ?? 3, quizTemplates.length);
                for (let i = 0; i < count; i++) {
                    const template = quizTemplates[i];
                    const result = await createQuizFromTemplate(
                        supabase,
                        template,
                        systemUserId,
                        `${today.toLocaleDateString('ko-KR')} #${i + 1}`,
                    );
                    results.push(result);
                }
                break;
            }

            case 'daily':
            default: {
                // 오늘 날짜 기준으로 퀴즈 선택 (순환) - 기존 로직
                const dayOfYear = Math.floor(
                    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000,
                );
                const idx = dayOfYear % quizTemplates.length;
                const template = quizTemplates[idx];
                const result = await createQuizFromTemplate(supabase, template, systemUserId);
                results.push(result);
                break;
            }
        }

        return new Response(
            JSON.stringify({
                success: true,
                mode,
                total_created: results.length,
                quizzes: results,
                message:
                    results.length === 1
                        ? '퀴즈가 성공적으로 생성되었습니다!'
                        : `${results.length}개의 퀴즈가 성공적으로 생성되었습니다!`,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            },
        );
    } catch (error) {
        console.error('퀴즈 생성 오류:', error);
        const errorMessage =
            error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
        return new Response(
            JSON.stringify({
                success: false,
                error: errorMessage,
            }),
            {
                headers: { 'Content-Type': 'application/json' },
                status: 500,
            },
        );
    }
});

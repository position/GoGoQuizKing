import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

interface QuizTemplate {
    title: string;
    description: string;
    category: string;
    grade_level: number;
    difficulty: 'seedling' | 'sprout' | 'tree' | 'king';
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
    {
        title: '🌱 숫자 놀이',
        description: '1부터 10까지 숫자를 배워요!',
        category: 'math',
        grade_level: 1,
        difficulty: 'seedling',
        questions: [
            {
                question_type: 'multiple',
                question_text: '사과 2개와 사과 3개를 합치면 몇 개일까요?',
                correct_answer: '5개',
                options: ['5개', '4개', '6개', '3개'],
                hint: '손가락으로 세어보세요!',
            },
            {
                question_type: 'ox',
                question_text: '10은 5보다 크다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '두 숫자를 비교해보세요.',
            },
            {
                question_type: 'multiple',
                question_text: '7 다음에 오는 숫자는 무엇일까요?',
                correct_answer: '8',
                options: ['8', '6', '9', '7'],
                hint: '7, 8, 9... 순서대로 세어보세요!',
            },
            {
                question_type: 'multiple',
                question_text: '가장 작은 숫자는 무엇일까요?',
                correct_answer: '1',
                options: ['1', '5', '3', '2'],
                hint: '숫자를 크기대로 나열해보세요.',
            },
            {
                question_type: 'ox',
                question_text: '4 + 4 = 8이다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '손가락 4개씩 펴보세요!',
            },
        ],
    },
    {
        title: '🌱 색깔 나라',
        description: '예쁜 색깔들을 알아봐요!',
        category: 'art',
        grade_level: 1,
        difficulty: 'seedling',
        questions: [
            {
                question_type: 'multiple',
                question_text: '바나나는 무슨 색일까요?',
                correct_answer: '노란색',
                options: ['노란색', '빨간색', '파란색', '초록색'],
                hint: '밝고 환한 색이에요!',
            },
            {
                question_type: 'multiple',
                question_text: '하늘은 보통 무슨 색일까요?',
                correct_answer: '파란색',
                options: ['파란색', '빨간색', '검은색', '노란색'],
                hint: '맑은 날 하늘을 올려다보세요.',
            },
            {
                question_type: 'ox',
                question_text: '딸기는 파란색이다. O일까요 X일까요?',
                correct_answer: 'X',
                options: ['O', 'X'],
                hint: '딸기를 먹어본 적 있나요?',
            },
            {
                question_type: 'multiple',
                question_text: '풀과 나뭇잎은 무슨 색일까요?',
                correct_answer: '초록색',
                options: ['초록색', '노란색', '보라색', '주황색'],
                hint: '공원에 가면 많이 볼 수 있어요!',
            },
            {
                question_type: 'multiple',
                question_text: '빨간색과 노란색을 섞으면?',
                correct_answer: '주황색',
                options: ['주황색', '보라색', '초록색', '분홍색'],
                hint: '당근 색이에요!',
            },
        ],
    },
    {
        title: '🍃 한글 맞춤법',
        description: '올바른 맞춤법을 배워요!',
        category: 'korean',
        grade_level: 3,
        difficulty: 'sprout',
        questions: [
            {
                question_type: 'multiple',
                question_text: '다음 중 맞춤법이 맞는 것은?',
                correct_answer: '됐어요',
                options: ['됐어요', '됬어요', '됫어요', '돼써요'],
                hint: "'되었어요'를 줄인 말이에요.",
            },
            {
                question_type: 'multiple',
                question_text: "'안녕'의 반대말은?",
                correct_answer: '작별',
                options: ['작별', '만남', '시작', '출발'],
                hint: '헤어질 때 하는 인사예요.',
            },
            {
                question_type: 'ox',
                question_text: "'웬지'가 맞는 표현이다. O일까요 X일까요?",
                correct_answer: 'X',
                options: ['O', 'X'],
                hint: "'왠지'가 맞는 표현이에요.",
            },
            {
                question_type: 'multiple',
                question_text: '다음 중 바른 표현은?',
                correct_answer: '어떻게',
                options: ['어떻게', '어떡게', '어떻겨', '얻게'],
                hint: "'어떠하게'를 줄인 말이에요.",
            },
            {
                question_type: 'multiple',
                question_text: "'가르치다'와 비슷한 말은?",
                correct_answer: '알려주다',
                options: ['알려주다', '나누다', '보여주다', '들려주다'],
                hint: '선생님이 학생에게 하는 일이에요.',
            },
        ],
    },
    {
        title: '🍃 세계 여행',
        description: '세계 여러 나라에 대해 알아봐요!',
        category: 'social',
        grade_level: 3,
        difficulty: 'sprout',
        questions: [
            {
                question_type: 'multiple',
                question_text: '프랑스의 수도는 어디일까요?',
                correct_answer: '파리',
                options: ['파리', '런던', '로마', '베를린'],
                hint: '에펠탑이 있는 도시예요!',
            },
            {
                question_type: 'multiple',
                question_text: '이탈리아에서 유명한 탑은?',
                correct_answer: '피사의 사탑',
                options: ['피사의 사탑', '에펠탑', '자유의 여신상', '빅벤'],
                hint: '기울어진 탑이에요!',
            },
            {
                question_type: 'ox',
                question_text: '일본의 수도는 도쿄다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '우리나라와 가까운 나라예요.',
            },
            {
                question_type: 'multiple',
                question_text: '만리장성은 어느 나라에 있을까요?',
                correct_answer: '중국',
                options: ['중국', '일본', '한국', '몽골'],
                hint: '아주 긴 성벽이에요!',
            },
            {
                question_type: 'multiple',
                question_text: '자유의 여신상은 어느 나라에 있을까요?',
                correct_answer: '미국',
                options: ['미국', '영국', '프랑스', '독일'],
                hint: '뉴욕에 있어요!',
            },
        ],
    },
    {
        title: '🍃 재미있는 영어',
        description: '기초 영어 단어를 배워요!',
        category: 'english',
        grade_level: 4,
        difficulty: 'sprout',
        questions: [
            {
                question_type: 'multiple',
                question_text: "'사과'를 영어로 하면?",
                correct_answer: 'Apple',
                options: ['Apple', 'Banana', 'Orange', 'Grape'],
                hint: 'A로 시작하는 과일이에요!',
            },
            {
                question_type: 'multiple',
                question_text: "'Dog'는 무슨 뜻일까요?",
                correct_answer: '강아지',
                options: ['강아지', '고양이', '새', '물고기'],
                hint: '멍멍 짖는 동물이에요.',
            },
            {
                question_type: 'ox',
                question_text: "'Hello'는 인사말이다. O일까요 X일까요?",
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '만났을 때 하는 말이에요.',
            },
            {
                question_type: 'multiple',
                question_text: "숫자 'Three'는 몇일까요?",
                correct_answer: '3',
                options: ['3', '2', '4', '5'],
                hint: 'One, Two, Three...',
            },
            {
                question_type: 'multiple',
                question_text: "'Happy'의 반대말은?",
                correct_answer: 'Sad',
                options: ['Sad', 'Angry', 'Tired', 'Hungry'],
                hint: '슬플 때의 감정이에요.',
            },
        ],
    },
    {
        title: '🌳 과학 탐험대',
        description: '신비한 과학의 세계로!',
        category: 'science',
        grade_level: 5,
        difficulty: 'tree',
        questions: [
            {
                question_type: 'multiple',
                question_text: '식물이 광합성을 할 때 필요한 것이 아닌 것은?',
                correct_answer: '소금',
                options: ['소금', '빛', '물', '이산화탄소'],
                hint: '식물은 햇빛, 물, 공기 중의 기체가 필요해요.',
            },
            {
                question_type: 'multiple',
                question_text: '지구의 자전 주기는 얼마일까요?',
                correct_answer: '약 24시간',
                options: ['약 24시간', '약 12시간', '약 365일', '약 1시간'],
                hint: '하루는 몇 시간일까요?',
            },
            {
                question_type: 'ox',
                question_text: '소리는 진공에서도 전달된다. O일까요 X일까요?',
                correct_answer: 'X',
                options: ['O', 'X'],
                hint: '소리는 매질이 필요해요.',
            },
            {
                question_type: 'multiple',
                question_text: '물이 끓는 온도는 몇 도일까요?',
                correct_answer: '100°C',
                options: ['100°C', '0°C', '50°C', '200°C'],
                hint: '기압이 1기압일 때 기준이에요.',
            },
            {
                question_type: 'multiple',
                question_text: '우리 몸에서 피를 온몸으로 보내는 기관은?',
                correct_answer: '심장',
                options: ['심장', '폐', '간', '위'],
                hint: '두근두근 뛰는 기관이에요.',
            },
        ],
    },
    {
        title: '🌳 수학 마스터',
        description: '수학 실력을 키워봐요!',
        category: 'math',
        grade_level: 5,
        difficulty: 'tree',
        questions: [
            {
                question_type: 'multiple',
                question_text: '25 × 4는 얼마일까요?',
                correct_answer: '100',
                options: ['100', '90', '110', '80'],
                hint: '25를 4번 더해보세요.',
            },
            {
                question_type: 'multiple',
                question_text: '정사각형의 한 변이 5cm일 때, 넓이는?',
                correct_answer: '25cm²',
                options: ['25cm²', '20cm²', '10cm²', '15cm²'],
                hint: '한 변 × 한 변이에요.',
            },
            {
                question_type: 'ox',
                question_text: '1/2와 2/4는 같은 크기다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '2/4를 약분해보세요.',
            },
            {
                question_type: 'multiple',
                question_text: '직각은 몇 도일까요?',
                correct_answer: '90도',
                options: ['90도', '45도', '180도', '60도'],
                hint: 'ㄱ자 모양의 각도예요.',
            },
            {
                question_type: 'multiple',
                question_text: '5의 3제곱은 얼마일까요?',
                correct_answer: '125',
                options: ['125', '15', '25', '75'],
                hint: '5 × 5 × 5를 계산해보세요.',
            },
        ],
    },
    {
        title: '🌳 상식 퀴즈왕',
        description: '다양한 상식을 테스트해요!',
        category: 'general',
        grade_level: 6,
        difficulty: 'tree',
        questions: [
            {
                question_type: 'multiple',
                question_text: '올림픽은 몇 년마다 열릴까요?',
                correct_answer: '4년',
                options: ['4년', '2년', '3년', '5년'],
                hint: '하계와 동계 올림픽이 번갈아 열려요.',
            },
            {
                question_type: 'multiple',
                question_text: '피아노 건반의 흰 건반은 몇 개일까요?',
                correct_answer: '52개',
                options: ['52개', '36개', '88개', '44개'],
                hint: '전체 건반은 88개예요.',
            },
            {
                question_type: 'ox',
                question_text: '에베레스트 산은 세계에서 가장 높은 산이다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '히말라야 산맥에 있어요.',
            },
            {
                question_type: 'multiple',
                question_text: '무지개는 몇 가지 색으로 이루어져 있을까요?',
                correct_answer: '7가지',
                options: ['7가지', '5가지', '6가지', '8가지'],
                hint: '빨주노초파남보!',
            },
            {
                question_type: 'multiple',
                question_text: '1년은 총 몇 주일까요?',
                correct_answer: '52주',
                options: ['52주', '48주', '50주', '54주'],
                hint: '365일을 7로 나눠보세요.',
            },
        ],
    },
    {
        title: '👑 역사 천재',
        description: '어려운 역사 문제에 도전!',
        category: 'social',
        grade_level: 6,
        difficulty: 'king',
        questions: [
            {
                question_type: 'multiple',
                question_text: '임진왜란이 일어난 해는?',
                correct_answer: '1592년',
                options: ['1592년', '1492년', '1692년', '1392년'],
                hint: '이순신 장군이 활약한 전쟁이에요.',
            },
            {
                question_type: 'multiple',
                question_text: '고구려, 백제, 신라를 통일한 나라는?',
                correct_answer: '신라',
                options: ['신라', '고려', '조선', '백제'],
                hint: '삼국 통일을 이룬 나라예요.',
            },
            {
                question_type: 'ox',
                question_text: '세종대왕은 조선의 4대 왕이다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '태조-정종-태종-세종 순서예요.',
            },
            {
                question_type: 'multiple',
                question_text: '독립문이 세워진 해는?',
                correct_answer: '1897년',
                options: ['1897년', '1945년', '1919년', '1910년'],
                hint: '대한제국 선포와 관련있어요.',
            },
            {
                question_type: 'multiple',
                question_text: '한글날은 언제일까요?',
                correct_answer: '10월 9일',
                options: ['10월 9일', '10월 3일', '9월 10일', '8월 15일'],
                hint: '훈민정음 반포를 기념하는 날이에요.',
            },
        ],
    },
    {
        title: '👑 과학 올림피아드',
        description: '최고 난이도 과학 문제!',
        category: 'science',
        grade_level: 6,
        difficulty: 'king',
        questions: [
            {
                question_type: 'multiple',
                question_text: '원소 주기율표에서 금의 기호는?',
                correct_answer: 'Au',
                options: ['Au', 'Ag', 'Fe', 'Cu'],
                hint: '라틴어 Aurum에서 왔어요.',
            },
            {
                question_type: 'multiple',
                question_text: '빛이 1년 동안 이동하는 거리를 뭐라고 할까요?',
                correct_answer: '1광년',
                options: ['1광년', '1천문단위', '1파섹', '1킬로미터'],
                hint: '우주의 거리를 재는 단위예요.',
            },
            {
                question_type: 'ox',
                question_text: '산소의 원자번호는 8이다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '양성자 수가 원자번호예요.',
            },
            {
                question_type: 'multiple',
                question_text: '뉴턴의 운동 제2법칙 공식은?',
                correct_answer: 'F = ma',
                options: ['F = ma', 'E = mc²', 'V = IR', 'P = IV'],
                hint: '힘 = 질량 × 가속도예요.',
            },
            {
                question_type: 'multiple',
                question_text: '인체에서 가장 큰 장기는?',
                correct_answer: '피부',
                options: ['피부', '간', '폐', '심장'],
                hint: '몸 전체를 감싸고 있어요.',
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

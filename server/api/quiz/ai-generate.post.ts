import { GoogleGenerativeAI } from '@google/generative-ai';

interface AIGenerateQuizBody {
    topic: string;
    category: string;
    difficulty: 'seedling' | 'leaf' | 'tree' | 'king';
    gradeLevel: number;
    questionCount: number;
    questionTypes: ('multiple' | 'ox' | 'short')[];
}

interface GeneratedQuestion {
    question_type: 'multiple' | 'ox' | 'short';
    question_text: string;
    correct_answer: string;
    options: string[];
    hint: string;
}

interface GeneratedQuiz {
    title: string;
    description: string;
    questions: GeneratedQuestion[];
}

/**
 * AI를 통한 퀴즈 자동 생성 API (Gemini 사용)
 *
 * @body topic - 퀴즈 주제/토픽
 * @body category - 카테고리
 * @body difficulty - 난이도
 * @body gradeLevel - 학년
 * @body questionCount - 생성할 문제 수
 * @body questionTypes - 문제 유형 배열
 */
export default defineEventHandler({
    onRequest: [],
    onBeforeResponse: [],
    handler: async (event) => {
        try {
            const config = useRuntimeConfig();
            const body = await readBody<AIGenerateQuizBody>(event);

            // 입력값 검증
            if (!body.topic || body.topic.trim().length === 0) {
                return {
                    success: false,
                    error: '퀴즈 주제를 입력해주세요.',
                };
            }

            // Gemini API 키 확인
            const geminiApiKey = config.public.geminiApiKey as string;
            if (!geminiApiKey) {
                console.error('Gemini API 키가 설정되지 않았습니다.');
                return {
                    success: false,
                    error: 'AI 서비스가 설정되지 않았습니다.',
                };
            }

            // 난이도별 설명
            const difficultyDescriptions: Record<string, string> = {
                seedling: '1~2학년 수준의 매우 쉬운',
                leaf: '3~4학년 수준의 적당한',
                tree: '5~6학년 수준의 어려운',
                king: '최고 난이도의 도전적인',
            };

            // 카테고리별 설명
            const categoryDescriptions: Record<string, string> = {
                korean: '국어/한글',
                math: '수학/계산',
                social: '사회/역사',
                science: '과학/자연',
                english: '영어',
                general: '일반 상식',
                art: '예술/체육',
                fun: '재미/오락',
            };

            const difficultyDesc = difficultyDescriptions[body.difficulty] || '적당한';
            const categoryDesc = categoryDescriptions[body.category] || body.category;
            const questionCount = Math.min(Math.max(body.questionCount || 5, 1), 10);
            const questionTypes =
                body.questionTypes?.length > 0 ? body.questionTypes : ['multiple'];

            // 문제 유형 설명
            const typeDescriptions = questionTypes
                .map((type) => {
                    if (type === 'multiple') {
                        return '객관식 (4지선다)';
                    }
                    if (type === 'ox') {
                        return 'OX 퀴즈';
                    }
                    if (type === 'short') {
                        return '단답형';
                    }
                    return '';
                })
                .filter(Boolean)
                .join(', ');

            // Gemini 프롬프트 구성
            const prompt = `당신은 초등학생을 위한 교육용 퀴즈 생성 전문가입니다. 
한국 초등학교 ${body.gradeLevel}학년 학생들을 대상으로 ${difficultyDesc} 난이도의 퀴즈를 만들어주세요.
퀴즈는 교육적이면서도 재미있어야 합니다. 이모지를 적절히 활용해주세요.

다음 조건에 맞는 퀴즈를 JSON 형식으로 생성해주세요:

- 주제: ${body.topic}
- 카테고리: ${categoryDesc}
- 난이도: ${difficultyDesc}
- 대상 학년: ${body.gradeLevel}학년
- 문제 수: ${questionCount}개
- 문제 유형: ${typeDescriptions}

반드시 아래 JSON 형식을 따라주세요:
{
    "title": "퀴즈 제목 (이모지 포함, 예: 🎯 재미있는 수학 퀴즈)",
    "description": "퀴즈에 대한 간단한 설명",
    "questions": [
        {
            "question_type": "multiple" 또는 "ox" 또는 "short",
            "question_text": "문제 내용",
            "correct_answer": "정답",
            "options": ["선택지1", "선택지2", "선택지3", "선택지4"] (객관식: 4개, OX: ["O", "X"], 단답형: []),
            "hint": "힌트 (선택사항, 없으면 빈 문자열)"
        }
    ]
}

중요 규칙:
1. 객관식(multiple)은 반드시 4개의 선택지를 제공하고, correct_answer는 선택지 중 하나와 정확히 일치해야 합니다.
2. OX 퀴즈는 options를 ["O", "X"]로, correct_answer는 "O" 또는 "X"로 설정합니다.
3. 단답형(short)은 options를 빈 배열 []로, correct_answer는 짧고 명확한 답으로 설정합니다.
4. 모든 문제는 해당 학년 수준에 적합해야 합니다.
5. 힌트는 직접적인 답을 알려주지 않으면서 도움이 되어야 합니다.
6. JSON만 반환하고, 다른 텍스트는 포함하지 마세요.`;

            // Gemini API 호출
            const genAI = new GoogleGenerativeAI(geminiApiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

            let result;
            try {
                result = await model.generateContent(prompt);
            } catch (apiError: any) {
                console.error('Gemini API 에러:', apiError);

                // 구체적인 에러 메시지 처리
                const errorMessage = apiError?.message || '';

                if (errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
                    return {
                        success: false,
                        error: 'AI 서비스 사용량이 초과되었습니다. 관리자에게 문의해주세요.',
                        errorCode: 'QUOTA_EXCEEDED',
                    };
                }

                if (errorMessage.includes('rate') || errorMessage.includes('429')) {
                    return {
                        success: false,
                        error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
                        errorCode: 'RATE_LIMIT',
                    };
                }

                if (errorMessage.includes('API_KEY') || errorMessage.includes('invalid')) {
                    return {
                        success: false,
                        error: 'AI 서비스 설정에 문제가 있습니다. 관리자에게 문의해주세요.',
                        errorCode: 'INVALID_KEY',
                    };
                }

                return {
                    success: false,
                    error: 'AI 퀴즈 생성에 실패했습니다. 잠시 후 다시 시도해주세요.',
                    errorCode: 'AI_ERROR',
                };
            }

            const content = result.response?.text();

            if (!content) {
                return {
                    success: false,
                    error: 'AI 응답을 받지 못했습니다.',
                };
            }

            // JSON 파싱
            let generatedQuiz: GeneratedQuiz;
            try {
                // JSON 블록 추출 (```json ... ``` 형식 처리)
                let jsonContent = content.trim();
                if (jsonContent.startsWith('```json')) {
                    jsonContent = jsonContent.slice(7);
                }
                if (jsonContent.startsWith('```')) {
                    jsonContent = jsonContent.slice(3);
                }
                if (jsonContent.endsWith('```')) {
                    jsonContent = jsonContent.slice(0, -3);
                }
                generatedQuiz = JSON.parse(jsonContent.trim());
            } catch (parseError) {
                console.error('JSON 파싱 에러:', parseError, content);
                return {
                    success: false,
                    error: 'AI 응답 형식이 올바르지 않습니다.',
                };
            }

            // 응답 데이터 검증 및 정규화
            if (
                !generatedQuiz.title ||
                !generatedQuiz.questions ||
                !Array.isArray(generatedQuiz.questions)
            ) {
                return {
                    success: false,
                    error: '생성된 퀴즈 형식이 올바르지 않습니다.',
                };
            }

            // 문제 데이터 정규화
            const normalizedQuestions = generatedQuiz.questions.map((q, index) => ({
                question_type: q.question_type || 'multiple',
                question_text: q.question_text || '',
                question_image_url: null,
                correct_answer: q.correct_answer || '',
                options: q.options || [],
                hint: q.hint || '',
                order_index: index,
            }));

            return {
                success: true,
                quiz: {
                    title: generatedQuiz.title,
                    description: generatedQuiz.description || '',
                    category: body.category,
                    grade_level: body.gradeLevel,
                    difficulty: body.difficulty,
                    is_public: true,
                    questions: normalizedQuestions,
                },
            };
        } catch (error: unknown) {
            console.error('AI 퀴즈 생성 오류:', error);
            const errorMessage =
                error instanceof Error ? error.message : 'AI 퀴즈 생성 중 오류가 발생했습니다.';
            return {
                success: false,
                error: errorMessage,
            };
        }
    },
    config: {
        maxDuration: 60,
    },
});

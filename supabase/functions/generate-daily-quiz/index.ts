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

interface DailyQuizSpec {
    gradeLevel: number;
    category: string;
    difficulty: 'seedling' | 'leaf' | 'tree' | 'king';
    topic: string;
    questionCount: number;
}

interface GeminiResponse {
    candidates?: Array<{
        content?: {
            parts?: Array<{ text?: string }>;
        };
    }>;
}

interface GeneratedQuiz {
    title?: string;
    description?: string;
    questions?: Partial<Question>[];
}

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

const difficultyDescriptions: Record<DailyQuizSpec['difficulty'], string> = {
    seedling: '1~2학년 수준의 매우 쉬운',
    leaf: '3~4학년 수준의 적당한',
    tree: '5~6학년 수준의 어려운',
    king: '최고 난이도의 도전적인',
};

const GEMINI_MAX_ATTEMPTS = 3;
const GEMINI_RETRY_BASE_DELAY_MS = 1000;

class GeminiApiError extends Error {
    status?: number;
    retryable: boolean;

    constructor(message: string, options: { status?: number; retryable?: boolean } = {}) {
        super(message);
        this.name = 'GeminiApiError';
        this.status = options.status;
        this.retryable = options.retryable ?? false;
    }
}

const dailyQuizBlueprints: Record<
    number,
    Array<Pick<DailyQuizSpec, 'category' | 'difficulty' | 'topic'>>
> = {
    1: [
        { category: 'korean', difficulty: 'seedling', topic: '받침 있는 낱말 읽기' },
        { category: 'math', difficulty: 'seedling', topic: '10 이하의 덧셈과 뺄셈' },
        { category: 'science', difficulty: 'seedling', topic: '동물과 식물의 특징' },
        { category: 'general', difficulty: 'seedling', topic: '학교생활 안전과 예절' },
    ],
    2: [
        { category: 'math', difficulty: 'seedling', topic: '두 자리 수 계산과 시각 읽기' },
        { category: 'korean', difficulty: 'seedling', topic: '문장 부호와 짧은 글 이해' },
        { category: 'science', difficulty: 'seedling', topic: '계절과 날씨 변화' },
        { category: 'english', difficulty: 'seedling', topic: '기초 영어 인사와 색깔 단어' },
    ],
    3: [
        { category: 'social', difficulty: 'leaf', topic: '우리 고장과 지도 읽기' },
        { category: 'math', difficulty: 'leaf', topic: '곱셈과 나눗셈 기초' },
        { category: 'science', difficulty: 'leaf', topic: '물질의 상태와 변화' },
        { category: 'korean', difficulty: 'leaf', topic: '중심 문장 찾기' },
    ],
    4: [
        { category: 'science', difficulty: 'leaf', topic: '식물의 한살이와 생태' },
        { category: 'math', difficulty: 'leaf', topic: '분수와 소수 기초' },
        { category: 'social', difficulty: 'leaf', topic: '지역의 생활 모습과 문화유산' },
        { category: 'english', difficulty: 'leaf', topic: '일상생활 영어 표현' },
    ],
    5: [
        { category: 'science', difficulty: 'tree', topic: '태양계와 지구의 운동' },
        { category: 'math', difficulty: 'tree', topic: '약수와 배수, 분수 계산' },
        { category: 'social', difficulty: 'tree', topic: '한국사 주요 사건과 인물' },
        { category: 'korean', difficulty: 'tree', topic: '글의 주장과 근거 파악' },
    ],
    6: [
        { category: 'math', difficulty: 'tree', topic: '비와 비율, 백분율' },
        { category: 'english', difficulty: 'tree', topic: '과거형과 미래 표현' },
        { category: 'science', difficulty: 'tree', topic: '전기 회로와 에너지' },
        { category: 'social', difficulty: 'tree', topic: '민주주의와 세계 여러 나라' },
    ],
};

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

    // ====== 1학년용 국어 seedling: 낱말과 문장 ======
    {
        title: '📚 1학년 국어 낱말과 문장',
        description: '1학년을 위한 쉬운 낱말, 문장, 받침 문제예요.',
        category: 'korean',
        grade_level: 1,
        difficulty: 'seedling',
        questions: [
            {
                question_type: 'multiple',
                question_text: '다음 중 동물을 나타내는 낱말은 무엇인가요?',
                correct_answer: '강아지',
                options: ['연필', '강아지', '책상', '가방'],
                hint: '살아 움직이고 우리와 함께 지낼 수 있어요.',
            },
            {
                question_type: 'ox',
                question_text: '"학교"는 두 글자로 된 낱말이다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '학, 교를 한 글자씩 세어 보세요.',
            },
            {
                question_type: 'multiple',
                question_text: '문장을 마칠 때 쓰는 기호는 무엇인가요?',
                correct_answer: '마침표',
                options: ['쉼표', '마침표', '물결표', '따옴표'],
                hint: '문장이 끝났다는 표시예요.',
            },
            {
                question_type: 'multiple',
                question_text: '"하늘이 파랗다."에서 색깔을 나타내는 말은?',
                correct_answer: '파랗다',
                options: ['하늘', '이', '파랗다', '없다'],
                hint: '어떤 색인지 알려 주는 말이에요.',
            },
            {
                question_type: 'ox',
                question_text: '"친구와 사이좋게 지내요."는 문장이다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '뜻이 이어져 있고 끝맺음이 있어요.',
            },
        ],
    },

    // ====== 2학년용 수학 seedling: 덧셈과 시각 ======
    {
        title: '🔢 2학년 수학 덧셈과 시각',
        description: '두 자리 수 계산과 시계를 읽는 연습을 해봐요.',
        category: 'math',
        grade_level: 2,
        difficulty: 'seedling',
        questions: [
            {
                question_type: 'multiple',
                question_text: '38 + 24 = ?',
                correct_answer: '62',
                options: ['52', '60', '62', '72'],
                hint: '일의 자리에서 받아올림이 있는지 확인해 보세요.',
            },
            {
                question_type: 'multiple',
                question_text: '70 - 18 = ?',
                correct_answer: '52',
                options: ['48', '50', '52', '58'],
                hint: '70에서 20을 빼고 2를 다시 더해도 돼요.',
            },
            {
                question_type: 'ox',
                question_text: '1시간은 60분이다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '시계의 긴 바늘이 한 바퀴 도는 시간이에요.',
            },
            {
                question_type: 'multiple',
                question_text: '시계가 3시를 가리킬 때 짧은 바늘은 어디를 가리키나요?',
                correct_answer: '3',
                options: ['12', '3', '6', '9'],
                hint: '몇 시인지 알려 주는 바늘이에요.',
            },
            {
                question_type: 'multiple',
                question_text: '10이 5개이면 얼마인가요?',
                correct_answer: '50',
                options: ['15', '30', '50', '100'],
                hint: '10 + 10 + 10 + 10 + 10을 계산해 보세요.',
            },
        ],
    },

    // ====== 3학년용 사회 leaf: 우리 고장 ======
    {
        title: '🌍 3학년 사회 우리 고장',
        description: '지도, 방위, 공공장소 등 우리 고장을 알아봐요.',
        category: 'social',
        grade_level: 3,
        difficulty: 'leaf',
        questions: [
            {
                question_type: 'multiple',
                question_text: '지도에서 위쪽은 보통 어느 방향을 나타내나요?',
                correct_answer: '북쪽',
                options: ['동쪽', '서쪽', '남쪽', '북쪽'],
                hint: '나침반의 N이 가리키는 방향이에요.',
            },
            {
                question_type: 'ox',
                question_text: '도서관은 여러 사람이 함께 이용하는 공공장소이다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '공공장소에서는 모두를 위한 예절이 필요해요.',
            },
            {
                question_type: 'multiple',
                question_text: '고장의 옛 모습을 알 수 있는 자료로 알맞은 것은?',
                correct_answer: '옛 사진',
                options: ['새 장난감', '옛 사진', '오늘의 날씨', '급식 메뉴'],
                hint: '예전에 어떤 모습이었는지 보여 주는 자료예요.',
            },
            {
                question_type: 'multiple',
                question_text: '동서남북을 알아볼 때 사용하는 도구는?',
                correct_answer: '나침반',
                options: ['자', '나침반', '계산기', '돋보기'],
                hint: '방향을 알려 주는 도구예요.',
            },
            {
                question_type: 'ox',
                question_text: '고장마다 자연환경과 생활 모습이 다를 수 있다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '바닷가, 산, 도시의 생활 모습을 떠올려 보세요.',
            },
        ],
    },

    // ====== 5학년용 과학 tree: 생물과 환경 ======
    {
        title: '🌳 5학년 과학 생물과 환경',
        description: '생물의 특징과 환경의 관계를 이해하는 퀴즈예요.',
        category: 'science',
        grade_level: 5,
        difficulty: 'tree',
        questions: [
            {
                question_type: 'multiple',
                question_text: '식물이 스스로 양분을 만들 때 필요한 것은?',
                correct_answer: '햇빛',
                options: ['햇빛', '소금', '모래', '플라스틱'],
                hint: '광합성에 꼭 필요한 에너지예요.',
            },
            {
                question_type: 'ox',
                question_text: '생태계에는 생물 요소와 비생물 요소가 함께 있다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '물, 공기, 햇빛도 생태계에 영향을 줘요.',
            },
            {
                question_type: 'multiple',
                question_text: '먹이사슬에서 생산자에 해당하는 것은?',
                correct_answer: '풀',
                options: ['토끼', '여우', '풀', '독수리'],
                hint: '스스로 양분을 만드는 생물을 찾아보세요.',
            },
            {
                question_type: 'multiple',
                question_text: '동물이 겨울을 나기 위해 잠을 자는 것을 무엇이라고 하나요?',
                correct_answer: '겨울잠',
                options: ['여름잠', '겨울잠', '낮잠', '선잠'],
                hint: '곰이나 개구리를 떠올려 보세요.',
            },
            {
                question_type: 'ox',
                question_text: '환경이 변하면 생물의 생활 모습도 달라질 수 있다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '먹이와 살 곳이 바뀌면 생물도 영향을 받아요.',
            },
        ],
    },

    // ====== 6학년용 영어 tree: 기본 표현 ======
    {
        title: '🔤 6학년 영어 기본 표현',
        description: '초등 고학년을 위한 영어 단어와 생활 표현 퀴즈예요.',
        category: 'english',
        grade_level: 6,
        difficulty: 'tree',
        questions: [
            {
                question_type: 'multiple',
                question_text: '"나는 과학을 좋아해요."를 영어로 가장 알맞게 표현한 것은?',
                correct_answer: 'I like science.',
                options: ['I like science.', 'I am science.', 'I has science.', 'I go science.'],
                hint: '좋아한다는 표현은 like를 사용해요.',
            },
            {
                question_type: 'multiple',
                question_text: '"library"의 뜻은 무엇인가요?',
                correct_answer: '도서관',
                options: ['운동장', '도서관', '병원', '시장'],
                hint: '책을 읽거나 빌리는 곳이에요.',
            },
            {
                question_type: 'ox',
                question_text: '"What time is it?"은 시간을 묻는 표현이다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: 'time이라는 단어에 주목해 보세요.',
            },
            {
                question_type: 'multiple',
                question_text: '다음 중 과거를 나타내는 표현은?',
                correct_answer: 'yesterday',
                options: ['today', 'tomorrow', 'yesterday', 'now'],
                hint: '어제를 뜻하는 단어예요.',
            },
            {
                question_type: 'multiple',
                question_text: '"Can I help you?"의 자연스러운 뜻은?',
                correct_answer: '도와드릴까요?',
                options: ['몇 살인가요?', '도와드릴까요?', '어디 가나요?', '무엇을 먹나요?'],
                hint: '가게나 안내 데스크에서 들을 수 있어요.',
            },
        ],
    },

    // ====== 6학년용 수학 king: 비와 비례 ======
    {
        title: '👑 6학년 수학 비와 비례',
        description: '비, 비율, 백분율을 활용해 보는 도전 퀴즈예요.',
        category: 'math',
        grade_level: 6,
        difficulty: 'king',
        questions: [
            {
                question_type: 'multiple',
                question_text: '20의 25%는 얼마인가요?',
                correct_answer: '5',
                options: ['4', '5', '10', '25'],
                hint: '25%는 1/4과 같아요.',
            },
            {
                question_type: 'multiple',
                question_text: '3:5와 같은 비는 무엇인가요?',
                correct_answer: '6:10',
                options: ['3:10', '5:3', '6:10', '9:10'],
                hint: '두 수에 같은 수를 곱해 보세요.',
            },
            {
                question_type: 'ox',
                question_text: '0.5는 50%와 같다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '소수에 100을 곱하면 백분율이 돼요.',
            },
            {
                question_type: 'multiple',
                question_text: '사과 4개가 2000원이라면 사과 1개 가격은?',
                correct_answer: '500원',
                options: ['400원', '500원', '600원', '800원'],
                hint: '전체 가격을 개수로 나누어 보세요.',
            },
            {
                question_type: 'multiple',
                question_text: '분수 2/5를 백분율로 나타내면?',
                correct_answer: '40%',
                options: ['20%', '25%', '40%', '50%'],
                hint: '2를 5로 나누면 0.4예요.',
            },
        ],
    },
];
const DAILY_DIVERSE_QUIZ_COUNT = 6;
const DAILY_AI_QUESTION_COUNT = 5;
const KOREA_TIME_ZONE = 'Asia/Seoul';
const GEMINI_MODEL = 'gemini-2.5-flash';

function getKoreanDateParts(date: Date): { year: number; month: number; day: number } {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: KOREA_TIME_ZONE,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    }).formatToParts(date);

    const values = Object.fromEntries(
        parts
            .filter((part) => part.type !== 'literal')
            .map((part) => [part.type, Number(part.value)]),
    );

    return {
        year: values.year,
        month: values.month,
        day: values.day,
    };
}

function getDayOfYear(date: Date): number {
    const { year, month, day } = getKoreanDateParts(date);
    const startOfYear = Date.UTC(year, 0, 0);
    const currentDay = Date.UTC(year, month - 1, day);

    return Math.floor((currentDay - startOfYear) / 86400000);
}

function formatKoreanDate(date: Date): string {
    return new Intl.DateTimeFormat('ko-KR', { timeZone: KOREA_TIME_ZONE }).format(date);
}

function selectDailyAiSpecs(date: Date): DailyQuizSpec[] {
    const dayOfYear = getDayOfYear(date);

    return [1, 2, 3, 4, 5, 6].map((gradeLevel) => {
        const blueprints = dailyQuizBlueprints[gradeLevel];
        const blueprint = blueprints[(dayOfYear + gradeLevel) % blueprints.length];

        return {
            ...blueprint,
            gradeLevel,
            questionCount: DAILY_AI_QUESTION_COUNT,
        };
    });
}

function selectDailyDiverseTemplates(date: Date, count = DAILY_DIVERSE_QUIZ_COUNT): QuizTemplate[] {
    const dayOfYear = getDayOfYear(date);
    const selected: QuizTemplate[] = [];
    const selectedTitles = new Set<string>();

    for (const gradeLevel of [1, 2, 3, 4, 5, 6]) {
        const candidates = quizTemplates.filter((template) => template.grade_level === gradeLevel);

        if (candidates.length === 0) {
            continue;
        }

        const template = candidates[(dayOfYear + gradeLevel) % candidates.length];
        selected.push(template);
        selectedTitles.add(template.title);

        if (selected.length >= count) {
            return selected;
        }
    }

    for (let i = 0; selected.length < count && i < quizTemplates.length; i++) {
        const template = quizTemplates[(dayOfYear + i) % quizTemplates.length];

        if (!selectedTitles.has(template.title)) {
            selected.push(template);
            selectedTitles.add(template.title);
        }
    }

    return selected;
}

function buildGeminiPrompt(spec: DailyQuizSpec, dateLabel: string, sequence: number): string {
    const categoryDesc = categoryDescriptions[spec.category] || spec.category;
    const difficultyDesc = difficultyDescriptions[spec.difficulty];

    return `당신은 한국 초등학생을 위한 교육용 퀴즈 생성 전문가입니다.
오늘 날짜는 ${dateLabel}이고, 매시간 새롭게 공개되는 자동 퀴즈 ${sequence}번을 만들고 있습니다.

아래 조건에 맞는 완전히 새로운 퀴즈를 JSON 형식으로만 생성해주세요.

- 대상 학년: 초등학교 ${spec.gradeLevel}학년
- 과목/카테고리: ${categoryDesc}
- 주제: ${spec.topic}
- 난이도: ${difficultyDesc}
- 문제 수: ${spec.questionCount}개
- 문제 유형: 객관식(multiple)과 OX(ox)를 섞어서 사용

반드시 아래 JSON 형식만 반환하세요. 설명, 마크다운, 코드블록은 포함하지 마세요.
{
  "title": "퀴즈 제목 (이모지 1개 포함)",
  "description": "퀴즈에 대한 한 문장 설명",
  "questions": [
    {
      "question_type": "multiple",
      "question_text": "문제 내용",
      "correct_answer": "정답",
      "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
      "hint": "정답을 직접 말하지 않는 짧은 힌트"
    }
  ]
}

중요 규칙:
1. question_type은 "multiple" 또는 "ox"만 사용합니다.
2. multiple은 options 4개를 제공하고 correct_answer가 options 중 하나와 정확히 일치해야 합니다.
3. ox는 options를 ["O", "X"]로 제공하고 correct_answer는 "O" 또는 "X"만 사용합니다.
4. 모든 문제는 한국 초등학교 ${spec.gradeLevel}학년 수준에 맞아야 합니다.
5. 문제와 선택지는 서로 중복되지 않게 하세요.
6. 정답이 모호하거나 논란이 있을 수 있는 문제는 만들지 마세요.
7. 어제와 똑같은 제목처럼 보이지 않도록 주제 안에서 구체적인 소재를 바꿔 주세요.`;
}

function parseGeneratedQuiz(content: string): GeneratedQuiz {
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

    return JSON.parse(jsonContent.trim());
}

function truncateTitle(title: string): string {
    const normalizedTitle = title.trim();

    if (!normalizedTitle) {
        throw new Error('AI 응답 title이 비어 있습니다.');
    }

    if (normalizedTitle.length <= 100) {
        return normalizedTitle;
    }

    return normalizedTitle.slice(0, 99).trimEnd();
}

function normalizeGeneratedQuiz(generatedQuiz: GeneratedQuiz, spec: DailyQuizSpec): QuizTemplate {
    if (
        !generatedQuiz.title ||
        !generatedQuiz.questions ||
        !Array.isArray(generatedQuiz.questions)
    ) {
        throw new Error('AI 응답에 title 또는 questions가 없습니다.');
    }

    const questions = generatedQuiz.questions
        .slice(0, spec.questionCount)
        .map((question, index) => {
            const questionType = question.question_type === 'ox' ? 'ox' : 'multiple';
            const options = Array.isArray(question.options)
                ? question.options.map((option) => String(option).trim()).filter(Boolean)
                : [];
            const correctAnswer = String(question.correct_answer || '').trim();
            const questionText = String(question.question_text || '').trim();

            if (!questionText) {
                throw new Error(`AI 응답 ${index + 1}번 문제의 question_text가 비어 있습니다.`);
            }

            if (!correctAnswer) {
                throw new Error(`AI 응답 ${index + 1}번 문제의 correct_answer가 비어 있습니다.`);
            }

            if (questionType === 'ox') {
                if (correctAnswer !== 'O' && correctAnswer !== 'X') {
                    throw new Error(`AI 응답 ${index + 1}번 OX 문제의 정답이 O/X가 아닙니다.`);
                }

                return {
                    question_type: 'ox' as const,
                    question_text: questionText,
                    correct_answer: correctAnswer,
                    options: ['O', 'X'],
                    hint: String(question.hint || ''),
                };
            }

            if (options.length !== 4) {
                throw new Error(`AI 응답 ${index + 1}번 객관식 문제의 선택지가 4개가 아닙니다.`);
            }

            if (!options.includes(correctAnswer)) {
                throw new Error(`AI 응답 ${index + 1}번 객관식 문제의 정답이 선택지에 없습니다.`);
            }

            return {
                question_type: 'multiple' as const,
                question_text: questionText,
                correct_answer: correctAnswer,
                options,
                hint: String(question.hint || ''),
            };
        });

    if (questions.length < spec.questionCount) {
        throw new Error(`AI 응답 문제 수가 부족합니다. ${questions.length}/${spec.questionCount}`);
    }

    return {
        title: truncateTitle(String(generatedQuiz.title)),
        description: String(
            generatedQuiz.description || `${spec.gradeLevel}학년 ${spec.topic} 퀴즈`,
        ),
        category: spec.category,
        grade_level: spec.gradeLevel,
        difficulty: spec.difficulty,
        questions,
    };
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableGeminiStatus(status: number): boolean {
    return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

function shouldUseTemplateFallback(error: unknown, enableTemplateFallback: boolean): boolean {
    if (enableTemplateFallback) {
        return true;
    }

    return error instanceof GeminiApiError && error.retryable;
}

async function generateQuizTemplateWithGemini(
    spec: DailyQuizSpec,
    dateLabel: string,
    sequence: number,
): Promise<QuizTemplate> {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    if (!geminiApiKey) {
        throw new Error('GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.');
    }

    let lastError: unknown;

    for (let attempt = 1; attempt <= GEMINI_MAX_ATTEMPTS; attempt++) {
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${geminiApiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [
                            {
                                role: 'user',
                                parts: [{ text: buildGeminiPrompt(spec, dateLabel, sequence) }],
                            },
                        ],
                        generationConfig: {
                            responseMimeType: 'application/json',
                            temperature: 0.9,
                        },
                    }),
                },
            );

            if (!response.ok) {
                const errorText = await response.text();
                const retryable = isRetryableGeminiStatus(response.status);
                throw new GeminiApiError(
                    `Gemini API 호출 실패: ${response.status} ${errorText}`,
                    {
                        status: response.status,
                        retryable,
                    },
                );
            }

            const data = (await response.json()) as GeminiResponse;
            const content = data.candidates?.[0]?.content?.parts
                ?.map((part) => part.text || '')
                .join('')
                .trim();

            if (!content) {
                throw new Error('Gemini API 응답 텍스트가 비어 있습니다.');
            }

            return normalizeGeneratedQuiz(parseGeneratedQuiz(content), spec);
        } catch (error) {
            lastError = error;
            const retryable =
                error instanceof GeminiApiError
                    ? error.retryable
                    : error instanceof TypeError;

            if (!retryable) {
                throw error;
            }

            if (attempt === GEMINI_MAX_ATTEMPTS) {
                throw error instanceof GeminiApiError
                    ? error
                    : new GeminiApiError(
                          `Gemini API 네트워크 오류: ${
                              error instanceof Error ? error.message : String(error)
                          }`,
                          { retryable: true },
                      );
            }

            await sleep(GEMINI_RETRY_BASE_DELAY_MS * attempt);
        }
    }

    throw lastError instanceof Error
        ? lastError
        : new Error('Gemini API 호출 중 알 수 없는 오류가 발생했습니다.');
}

async function getAdminUserId(supabase: ReturnType<typeof createClient>): Promise<string> {
    const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin')
        .order('created_at', { ascending: true })
        .limit(1);

    if (error) {
        throw new Error(`관리자 사용자 조회 실패: ${error.message}`);
    }

    const adminUser = data?.[0];

    if (!adminUser?.id) {
        throw new Error(
            'admin role 사용자를 찾을 수 없습니다. profiles 테이블에서 role = admin 인 사용자를 1명 이상 설정하세요.',
        );
    }

    return adminUser.id;
}
// 단일 퀴즈 생성 함수
async function createQuizFromTemplate(
    supabase: ReturnType<typeof createClient>,
    template: QuizTemplate,
    systemUserId: string,
    dateLabel?: string,
): Promise<{ quiz_id: string; title: string; questions_count: number }> {
    const today = new Date();
    const generationLabel = dateLabel || formatKoreanDate(today);
    console.log(
        `퀴즈 생성 시작: ${template.title}, 사용자 ID: ${systemUserId}, 생성 라벨: ${generationLabel}`,
    );

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
 * 1. mode: 'daily' (기본값) - 오늘 날짜 기준으로 학년별 퀴즈를 다양하게 생성
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

        // 생성 주체는 admin role 사용자로 고정
        const systemUserId = await getAdminUserId(supabase);
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
                        `${formatKoreanDate(today)} #${i + 1}`,
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
                        `${formatKoreanDate(today)} #${i + 1}`,
                    );
                    results.push(result);
                }
                break;
            }

            case 'daily':
            default: {
                // 매일 한국 날짜 기준으로 학년별/과목별 AI 퀴즈를 새로 생성
                const dateLabel = formatKoreanDate(today);
                const specs = selectDailyAiSpecs(today);
                const enableTemplateFallback =
                    Deno.env.get('ENABLE_DAILY_AI_TEMPLATE_FALLBACK') === 'true';

                for (let i = 0; i < specs.length; i++) {
                    let template: QuizTemplate;

                    try {
                        template = await generateQuizTemplateWithGemini(specs[i], dateLabel, i + 1);
                    } catch (aiError) {
                        console.error('AI 퀴즈 생성 실패:', {
                            spec: specs[i],
                            error: aiError instanceof Error ? aiError.message : aiError,
                        });

                        if (!shouldUseTemplateFallback(aiError, enableTemplateFallback)) {
                            throw aiError;
                        }

                        const fallbackTemplates = selectDailyDiverseTemplates(today);
                        template = fallbackTemplates[i % fallbackTemplates.length];
                    }

                    const result = await createQuizFromTemplate(
                        supabase,
                        template,
                        systemUserId,
                        `${dateLabel} AI #${i + 1}`,
                    );
                    results.push(result);
                }
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

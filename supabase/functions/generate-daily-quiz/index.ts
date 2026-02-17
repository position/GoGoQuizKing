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
    // ============================================
    // 🌱 SEEDLING (새싹) - 1~2학년 난이도 (10개)
    // ============================================
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
        title: '🌱 동물 친구들',
        description: '귀여운 동물들을 알아봐요!',
        category: 'science',
        grade_level: 1,
        difficulty: 'seedling',
        questions: [
            {
                question_type: 'multiple',
                question_text: '멍멍 짖는 동물은 무엇일까요?',
                correct_answer: '강아지',
                options: ['강아지', '고양이', '소', '돼지'],
                hint: '사람의 가장 친한 친구예요!',
            },
            {
                question_type: 'ox',
                question_text: '고양이는 야옹 소리를 낸다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '고양이 소리를 들어본 적 있나요?',
            },
            {
                question_type: 'multiple',
                question_text: '코가 긴 동물은 무엇일까요?',
                correct_answer: '코끼리',
                options: ['코끼리', '기린', '사자', '원숭이'],
                hint: '동물원에서 볼 수 있는 큰 동물이에요.',
            },
            {
                question_type: 'multiple',
                question_text: '물속에서 사는 동물은?',
                correct_answer: '물고기',
                options: ['물고기', '토끼', '참새', '다람쥐'],
                hint: '헤엄을 치며 다녀요.',
            },
            {
                question_type: 'ox',
                question_text: '새는 날개가 있다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '새가 하늘을 나는 모습을 생각해보세요.',
            },
        ],
    },
    {
        title: '🌱 과일 퀴즈',
        description: '맛있는 과일을 알아봐요!',
        category: 'science',
        grade_level: 1,
        difficulty: 'seedling',
        questions: [
            {
                question_type: 'multiple',
                question_text: '빨간색이고 새콤달콤한 과일은?',
                correct_answer: '딸기',
                options: ['딸기', '바나나', '포도', '오렌지'],
                hint: '케이크 위에 많이 올라가요!',
            },
            {
                question_type: 'multiple',
                question_text: '껍질을 까서 먹는 노란 과일은?',
                correct_answer: '바나나',
                options: ['바나나', '사과', '수박', '참외'],
                hint: '원숭이가 좋아하는 과일이에요.',
            },
            {
                question_type: 'ox',
                question_text: '수박은 여름에 먹는 과일이다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '시원하고 달콤한 과일이에요.',
            },
            {
                question_type: 'multiple',
                question_text: '보라색 작은 알갱이 과일은?',
                correct_answer: '포도',
                options: ['포도', '귤', '복숭아', '배'],
                hint: '포도주를 만드는 과일이에요.',
            },
            {
                question_type: 'multiple',
                question_text: '오렌지는 무슨 색일까요?',
                correct_answer: '주황색',
                options: ['주황색', '빨간색', '노란색', '초록색'],
                hint: '과일 이름과 색 이름이 같아요!',
            },
        ],
    },
    {
        title: '🌱 가족 이야기',
        description: '우리 가족을 알아봐요!',
        category: 'social',
        grade_level: 1,
        difficulty: 'seedling',
        questions: [
            {
                question_type: 'multiple',
                question_text: '아빠의 아빠는 누구일까요?',
                correct_answer: '할아버지',
                options: ['할아버지', '할머니', '삼촌', '이모'],
                hint: '머리가 하얗고 수염이 있을 수도 있어요.',
            },
            {
                question_type: 'ox',
                question_text: '엄마의 엄마는 할머니다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '외할머니도 할머니예요.',
            },
            {
                question_type: 'multiple',
                question_text: '형이나 오빠보다 나이가 적은 남자아이를 뭐라고 할까요?',
                correct_answer: '남동생',
                options: ['남동생', '누나', '언니', '형'],
                hint: '나보다 어린 남자 형제예요.',
            },
            {
                question_type: 'multiple',
                question_text: '엄마의 언니는 나에게 누구일까요?',
                correct_answer: '이모',
                options: ['이모', '고모', '삼촌', '할머니'],
                hint: '엄마 쪽 여자 친척이에요.',
            },
            {
                question_type: 'ox',
                question_text: '아빠의 여자 형제는 고모다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '아빠 쪽 여자 친척이에요.',
            },
        ],
    },
    {
        title: '🌱 모양 탐험',
        description: '여러 가지 모양을 알아봐요!',
        category: 'math',
        grade_level: 1,
        difficulty: 'seedling',
        questions: [
            {
                question_type: 'multiple',
                question_text: '세모는 몇 개의 꼭짓점이 있을까요?',
                correct_answer: '3개',
                options: ['3개', '4개', '5개', '2개'],
                hint: '삼각형이라고도 해요.',
            },
            {
                question_type: 'ox',
                question_text: '네모는 4개의 변이 있다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '사각형을 생각해보세요.',
            },
            {
                question_type: 'multiple',
                question_text: '동그라미와 가장 비슷한 것은?',
                correct_answer: '공',
                options: ['공', '책', '연필', '자'],
                hint: '둥글둥글한 것을 찾아보세요.',
            },
            {
                question_type: 'multiple',
                question_text: '피자 조각은 무슨 모양일까요?',
                correct_answer: '세모',
                options: ['세모', '네모', '동그라미', '별'],
                hint: '뾰족한 모양이에요.',
            },
            {
                question_type: 'multiple',
                question_text: '창문은 보통 무슨 모양일까요?',
                correct_answer: '네모',
                options: ['네모', '세모', '동그라미', '하트'],
                hint: '네 개의 변이 있어요.',
            },
        ],
    },
    {
        title: '🌱 계절 이야기',
        description: '사계절을 알아봐요!',
        category: 'science',
        grade_level: 2,
        difficulty: 'seedling',
        questions: [
            {
                question_type: 'multiple',
                question_text: '눈이 오는 계절은 언제일까요?',
                correct_answer: '겨울',
                options: ['겨울', '여름', '봄', '가을'],
                hint: '가장 추운 계절이에요.',
            },
            {
                question_type: 'ox',
                question_text: '봄에는 꽃이 핀다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '따뜻해지면 꽃이 피어요.',
            },
            {
                question_type: 'multiple',
                question_text: '나뭇잎이 빨갛고 노랗게 변하는 계절은?',
                correct_answer: '가을',
                options: ['가을', '봄', '여름', '겨울'],
                hint: '단풍이 드는 계절이에요.',
            },
            {
                question_type: 'multiple',
                question_text: '수박과 아이스크림을 많이 먹는 계절은?',
                correct_answer: '여름',
                options: ['여름', '겨울', '봄', '가을'],
                hint: '가장 더운 계절이에요.',
            },
            {
                question_type: 'ox',
                question_text: '1년은 4계절이다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '봄, 여름, 가을, 겨울을 세어보세요.',
            },
        ],
    },
    {
        title: '🌱 몸 알아보기',
        description: '우리 몸을 알아봐요!',
        category: 'science',
        grade_level: 2,
        difficulty: 'seedling',
        questions: [
            {
                question_type: 'multiple',
                question_text: '우리가 음식 맛을 느끼는 곳은?',
                correct_answer: '혀',
                options: ['혀', '코', '귀', '눈'],
                hint: '입 안에 있어요.',
            },
            {
                question_type: 'ox',
                question_text: '눈으로 소리를 듣는다. O일까요 X일까요?',
                correct_answer: 'X',
                options: ['O', 'X'],
                hint: '눈은 무엇을 할까요?',
            },
            {
                question_type: 'multiple',
                question_text: '냄새를 맡는 곳은 어디일까요?',
                correct_answer: '코',
                options: ['코', '입', '손', '발'],
                hint: '얼굴 가운데 있어요.',
            },
            {
                question_type: 'multiple',
                question_text: '손가락은 몇 개일까요?',
                correct_answer: '10개',
                options: ['10개', '5개', '8개', '12개'],
                hint: '양손의 손가락을 다 세어보세요.',
            },
            {
                question_type: 'ox',
                question_text: '귀로 소리를 듣는다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '음악을 들을 때 어디를 사용하나요?',
            },
        ],
    },
    {
        title: '🌱 학교생활',
        description: '즐거운 학교에 대해 알아봐요!',
        category: 'social',
        grade_level: 1,
        difficulty: 'seedling',
        questions: [
            {
                question_type: 'multiple',
                question_text: '학교에서 공부를 가르쳐주시는 분은?',
                correct_answer: '선생님',
                options: ['선생님', '의사', '소방관', '경찰관'],
                hint: '칠판 앞에 서 계세요.',
            },
            {
                question_type: 'ox',
                question_text: '교실에는 책상과 의자가 있다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '앉아서 공부하는 곳이에요.',
            },
            {
                question_type: 'multiple',
                question_text: '쉬는 시간에 친구들과 뛰어노는 곳은?',
                correct_answer: '운동장',
                options: ['운동장', '교실', '도서관', '급식실'],
                hint: '밖에서 뛰어놀 수 있어요.',
            },
            {
                question_type: 'multiple',
                question_text: '책을 빌려볼 수 있는 곳은?',
                correct_answer: '도서관',
                options: ['도서관', '음악실', '미술실', '체육관'],
                hint: '조용히 책을 읽는 곳이에요.',
            },
            {
                question_type: 'multiple',
                question_text: '점심을 먹는 곳은 어디일까요?',
                correct_answer: '급식실',
                options: ['급식실', '교실', '운동장', '화장실'],
                hint: '맛있는 밥을 먹어요.',
            },
        ],
    },
    {
        title: '🌱 숫자 세기',
        description: '10까지 숫자를 세어봐요!',
        category: 'math',
        grade_level: 1,
        difficulty: 'seedling',
        questions: [
            {
                question_type: 'multiple',
                question_text: '3 + 2는 얼마일까요?',
                correct_answer: '5',
                options: ['5', '4', '6', '3'],
                hint: '손가락 3개와 2개를 합쳐보세요.',
            },
            {
                question_type: 'ox',
                question_text: '1 + 1 = 2이다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '하나 더하기 하나는?',
            },
            {
                question_type: 'multiple',
                question_text: '5보다 1 작은 수는?',
                correct_answer: '4',
                options: ['4', '6', '3', '5'],
                hint: '5에서 하나를 빼세요.',
            },
            {
                question_type: 'multiple',
                question_text: '2 + 2 + 2는 얼마일까요?',
                correct_answer: '6',
                options: ['6', '4', '8', '5'],
                hint: '2를 세 번 더해보세요.',
            },
            {
                question_type: 'ox',
                question_text: '10은 9보다 1 크다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '9 다음 숫자를 생각해보세요.',
            },
        ],
    },
    // ============================================
    // 🍃 LEAF (풀잎) - 3~4학년 난이도 (10개)
    // ============================================
    {
        title: '🍃 한글 맞춤법',
        description: '올바른 맞춤법을 배워요!',
        category: 'korean',
        grade_level: 3,
        difficulty: 'leaf',
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
        difficulty: 'leaf',
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
        difficulty: 'leaf',
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
        title: '🍃 곱셈 구구단',
        description: '구구단을 외워봐요!',
        category: 'math',
        grade_level: 3,
        difficulty: 'leaf',
        questions: [
            {
                question_type: 'multiple',
                question_text: '3 × 4는 얼마일까요?',
                correct_answer: '12',
                options: ['12', '7', '10', '14'],
                hint: '3을 4번 더해보세요.',
            },
            {
                question_type: 'ox',
                question_text: '5 × 5 = 25이다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '5단을 떠올려보세요.',
            },
            {
                question_type: 'multiple',
                question_text: '7 × 8는 얼마일까요?',
                correct_answer: '56',
                options: ['56', '54', '63', '48'],
                hint: '7단의 8번째 수예요.',
            },
            {
                question_type: 'multiple',
                question_text: '9 × 6는 얼마일까요?',
                correct_answer: '54',
                options: ['54', '45', '63', '56'],
                hint: '9단을 생각해보세요.',
            },
            {
                question_type: 'multiple',
                question_text: '8 × 7는 얼마일까요?',
                correct_answer: '56',
                options: ['56', '54', '48', '64'],
                hint: '7 × 8과 같아요.',
            },
        ],
    },
    {
        title: '🍃 식물의 세계',
        description: '식물에 대해 알아봐요!',
        category: 'science',
        grade_level: 3,
        difficulty: 'leaf',
        questions: [
            {
                question_type: 'multiple',
                question_text: '식물이 자라는 데 필요한 것이 아닌 것은?',
                correct_answer: '텔레비전',
                options: ['텔레비전', '물', '햇빛', '흙'],
                hint: '자연에서 얻을 수 있는 것들이에요.',
            },
            {
                question_type: 'ox',
                question_text: '나무도 식물이다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '식물은 크기가 다양해요.',
            },
            {
                question_type: 'multiple',
                question_text: '꽃에서 열매가 되는 부분은?',
                correct_answer: '씨방',
                options: ['씨방', '꽃잎', '줄기', '잎'],
                hint: '꽃의 가운데 부분이에요.',
            },
            {
                question_type: 'multiple',
                question_text: '물을 빨아들이는 식물의 부분은?',
                correct_answer: '뿌리',
                options: ['뿌리', '잎', '꽃', '줄기'],
                hint: '땅 속에 있어요.',
            },
            {
                question_type: 'multiple',
                question_text: '광합성을 주로 하는 곳은?',
                correct_answer: '잎',
                options: ['잎', '꽃', '뿌리', '열매'],
                hint: '초록색인 부분이에요.',
            },
        ],
    },
    {
        title: '🍃 우리나라 지리',
        description: '우리나라의 지역을 알아봐요!',
        category: 'social',
        grade_level: 4,
        difficulty: 'leaf',
        questions: [
            {
                question_type: 'multiple',
                question_text: '우리나라의 수도는 어디일까요?',
                correct_answer: '서울',
                options: ['서울', '부산', '대구', '인천'],
                hint: '가장 큰 도시예요.',
            },
            {
                question_type: 'ox',
                question_text: '제주도는 섬이다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '사면이 바다로 둘러싸여 있어요.',
            },
            {
                question_type: 'multiple',
                question_text: '우리나라에서 가장 긴 강은?',
                correct_answer: '낙동강',
                options: ['낙동강', '한강', '금강', '영산강'],
                hint: '부산을 지나 바다로 흘러요.',
            },
            {
                question_type: 'multiple',
                question_text: '우리나라에서 가장 높은 산은?',
                correct_answer: '한라산',
                options: ['한라산', '지리산', '설악산', '북한산'],
                hint: '제주도에 있어요.',
            },
            {
                question_type: 'multiple',
                question_text: '경기도에 있는 도시가 아닌 것은?',
                correct_answer: '대전',
                options: ['대전', '수원', '고양', '성남'],
                hint: '대전은 충청도에 있어요.',
            },
        ],
    },
    {
        title: '🍃 분수와 소수',
        description: '분수와 소수를 배워요!',
        category: 'math',
        grade_level: 4,
        difficulty: 'leaf',
        questions: [
            {
                question_type: 'multiple',
                question_text: '1/2은 소수로 얼마일까요?',
                correct_answer: '0.5',
                options: ['0.5', '0.2', '0.1', '0.25'],
                hint: '반을 소수로 나타내면?',
            },
            {
                question_type: 'ox',
                question_text: '1/4 + 1/4 = 1/2이다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '분자끼리 더해보세요.',
            },
            {
                question_type: 'multiple',
                question_text: '3/4은 소수로 얼마일까요?',
                correct_answer: '0.75',
                options: ['0.75', '0.34', '0.25', '0.5'],
                hint: '3 나누기 4를 계산해보세요.',
            },
            {
                question_type: 'multiple',
                question_text: '0.25를 분수로 나타내면?',
                correct_answer: '1/4',
                options: ['1/4', '1/2', '1/5', '2/5'],
                hint: '25는 100의 몇 분의 몇일까요?',
            },
            {
                question_type: 'multiple',
                question_text: '1/3 + 1/3 + 1/3은 얼마일까요?',
                correct_answer: '1',
                options: ['1', '3/3', '1/1', '모두 정답'],
                hint: '3/3과 같아요.',
            },
        ],
    },
    {
        title: '🍃 음악 이야기',
        description: '음악에 대해 알아봐요!',
        category: 'art',
        grade_level: 3,
        difficulty: 'leaf',
        questions: [
            {
                question_type: 'multiple',
                question_text: '4분음표는 몇 박일까요?',
                correct_answer: '1박',
                options: ['1박', '2박', '4박', '반박'],
                hint: '기본이 되는 음표예요.',
            },
            {
                question_type: 'ox',
                question_text: '피아노는 건반 악기다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '검은 건반과 흰 건반이 있어요.',
            },
            {
                question_type: 'multiple',
                question_text: '바이올린은 어떤 종류의 악기일까요?',
                correct_answer: '현악기',
                options: ['현악기', '관악기', '타악기', '건반악기'],
                hint: '줄을 긁어서 소리를 내요.',
            },
            {
                question_type: 'multiple',
                question_text: '높은음자리표를 뭐라고 할까요?',
                correct_answer: '사표',
                options: ['사표', '바표', '도표', '레표'],
                hint: 'G를 뜻하는 기호예요.',
            },
            {
                question_type: 'multiple',
                question_text: '드럼은 어떤 종류의 악기일까요?',
                correct_answer: '타악기',
                options: ['타악기', '현악기', '관악기', '건반악기'],
                hint: '두드려서 소리를 내요.',
            },
        ],
    },
    {
        title: '🍃 속담 퀴즈',
        description: '재미있는 속담을 알아봐요!',
        category: 'korean',
        grade_level: 4,
        difficulty: 'leaf',
        questions: [
            {
                question_type: 'multiple',
                question_text: '"낮말은 새가 듣고 밤말은 ___가 듣는다"',
                correct_answer: '쥐',
                options: ['쥐', '고양이', '개', '새'],
                hint: '밤에 돌아다니는 작은 동물이에요.',
            },
            {
                question_type: 'multiple',
                question_text: '"세 살 버릇 ___ 간다"',
                correct_answer: '여든',
                options: ['여든', '백', '서른', '예순'],
                hint: '80까지라는 뜻이에요.',
            },
            {
                question_type: 'ox',
                question_text:
                    '"콩 심은 데 콩 나고 팥 심은 데 팥 난다"는 원인과 결과를 말한다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '심은 대로 거둔다는 뜻이에요.',
            },
            {
                question_type: 'multiple',
                question_text: '"우물 안 ___"는 세상 물정을 모르는 사람을 뜻해요.',
                correct_answer: '개구리',
                options: ['개구리', '물고기', '거북이', '뱀'],
                hint: '개굴개굴 우는 동물이에요.',
            },
            {
                question_type: 'multiple',
                question_text: '"호랑이도 제 말 하면 ___"',
                correct_answer: '온다',
                options: ['온다', '간다', '운다', '논다'],
                hint: '말을 조심하라는 뜻이에요.',
            },
        ],
    },
    {
        title: '🍃 시간과 달력',
        description: '시간과 날짜를 알아봐요!',
        category: 'math',
        grade_level: 3,
        difficulty: 'leaf',
        questions: [
            {
                question_type: 'multiple',
                question_text: '1시간은 몇 분일까요?',
                correct_answer: '60분',
                options: ['60분', '30분', '100분', '50분'],
                hint: '분침이 한 바퀴 돌아요.',
            },
            {
                question_type: 'ox',
                question_text: '1년은 365일이다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '윤년이 아닐 때 기준이에요.',
            },
            {
                question_type: 'multiple',
                question_text: '2월은 보통 며칠까지 있을까요?',
                correct_answer: '28일',
                options: ['28일', '30일', '31일', '29일'],
                hint: '가장 짧은 달이에요.',
            },
            {
                question_type: 'multiple',
                question_text: '하루는 몇 시간일까요?',
                correct_answer: '24시간',
                options: ['24시간', '12시간', '60시간', '30시간'],
                hint: '오전 12시간, 오후 12시간이에요.',
            },
            {
                question_type: 'multiple',
                question_text: '1주일은 며칠일까요?',
                correct_answer: '7일',
                options: ['7일', '5일', '10일', '6일'],
                hint: '월화수목금토일을 세어보세요.',
            },
        ],
    },
    // ============================================
    // 🌳 TREE (나무) - 5~6학년 난이도 (10개)
    // ============================================
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
        title: '🌳 한국사 탐험',
        description: '우리나라 역사를 알아봐요!',
        category: 'social',
        grade_level: 5,
        difficulty: 'tree',
        questions: [
            {
                question_type: 'multiple',
                question_text: '고조선을 세운 사람은 누구일까요?',
                correct_answer: '단군왕검',
                options: ['단군왕검', '주몽', '온조', '박혁거세'],
                hint: '우리나라 최초의 나라를 세웠어요.',
            },
            {
                question_type: 'ox',
                question_text: '신라는 삼국 중 가장 먼저 세워졌다. O일까요 X일까요?',
                correct_answer: 'X',
                options: ['O', 'X'],
                hint: '고구려가 먼저 세워졌어요.',
            },
            {
                question_type: 'multiple',
                question_text: '한글을 만든 왕은 누구일까요?',
                correct_answer: '세종대왕',
                options: ['세종대왕', '태조', '정조', '영조'],
                hint: '조선의 4대 왕이에요.',
            },
            {
                question_type: 'multiple',
                question_text: '고려를 세운 사람은?',
                correct_answer: '왕건',
                options: ['왕건', '이성계', '궁예', '견훤'],
                hint: '고려 태조라고 불려요.',
            },
            {
                question_type: 'multiple',
                question_text: '조선을 세운 사람은?',
                correct_answer: '이성계',
                options: ['이성계', '왕건', '세종', '정조'],
                hint: '조선 태조라고 불려요.',
            },
        ],
    },
    {
        title: '🌳 영어 문법',
        description: '영어 문법을 배워봐요!',
        category: 'english',
        grade_level: 5,
        difficulty: 'tree',
        questions: [
            {
                question_type: 'multiple',
                question_text: '"She ___ a student." 빈칸에 들어갈 말은?',
                correct_answer: 'is',
                options: ['is', 'are', 'am', 'be'],
                hint: '3인칭 단수에 맞는 be동사예요.',
            },
            {
                question_type: 'ox',
                question_text: '"He have a book."은 올바른 문장이다. O일까요 X일까요?',
                correct_answer: 'X',
                options: ['O', 'X'],
                hint: 'He에는 has를 써야 해요.',
            },
            {
                question_type: 'multiple',
                question_text: '"I ___ to school every day." 빈칸에 들어갈 말은?',
                correct_answer: 'go',
                options: ['go', 'goes', 'going', 'went'],
                hint: 'I와 함께 쓰는 동사 형태예요.',
            },
            {
                question_type: 'multiple',
                question_text: '"There ___ many books." 빈칸에 들어갈 말은?',
                correct_answer: 'are',
                options: ['are', 'is', 'am', 'be'],
                hint: 'books는 복수형이에요.',
            },
            {
                question_type: 'multiple',
                question_text: '과거형이 아닌 것은?',
                correct_answer: 'run',
                options: ['run', 'went', 'ate', 'saw'],
                hint: 'run의 과거형은 ran이에요.',
            },
        ],
    },
    {
        title: '🌳 지구와 우주',
        description: '우주에 대해 알아봐요!',
        category: 'science',
        grade_level: 6,
        difficulty: 'tree',
        questions: [
            {
                question_type: 'multiple',
                question_text: '태양계에서 가장 큰 행성은?',
                correct_answer: '목성',
                options: ['목성', '토성', '지구', '화성'],
                hint: '가스로 이루어진 거대한 행성이에요.',
            },
            {
                question_type: 'ox',
                question_text: '달은 스스로 빛을 낸다. O일까요 X일까요?',
                correct_answer: 'X',
                options: ['O', 'X'],
                hint: '달은 태양빛을 반사해요.',
            },
            {
                question_type: 'multiple',
                question_text: '지구에서 가장 가까운 별은?',
                correct_answer: '태양',
                options: ['태양', '북극성', '시리우스', '베텔게우스'],
                hint: '우리에게 빛과 열을 주는 별이에요.',
            },
            {
                question_type: 'multiple',
                question_text: '지구의 공전 주기는?',
                correct_answer: '약 365일',
                options: ['약 365일', '약 24시간', '약 28일', '약 12시간'],
                hint: '1년이 얼마인지 생각해보세요.',
            },
            {
                question_type: 'multiple',
                question_text: '고리가 있는 것으로 유명한 행성은?',
                correct_answer: '토성',
                options: ['토성', '목성', '천왕성', '해왕성'],
                hint: '아름다운 고리로 유명해요.',
            },
        ],
    },
    {
        title: '🌳 비례와 비율',
        description: '비례와 비율을 배워요!',
        category: 'math',
        grade_level: 6,
        difficulty: 'tree',
        questions: [
            {
                question_type: 'multiple',
                question_text: '3:6을 간단히 하면?',
                correct_answer: '1:2',
                options: ['1:2', '2:4', '1:3', '3:6'],
                hint: '공약수로 나눠보세요.',
            },
            {
                question_type: 'ox',
                question_text: '50%는 1/2과 같다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '100의 절반은 50이에요.',
            },
            {
                question_type: 'multiple',
                question_text: '20의 25%는 얼마일까요?',
                correct_answer: '5',
                options: ['5', '4', '10', '25'],
                hint: '20 × 0.25를 계산해보세요.',
            },
            {
                question_type: 'multiple',
                question_text: '2:5 = x:15일 때, x는?',
                correct_answer: '6',
                options: ['6', '5', '8', '10'],
                hint: '비례식을 풀어보세요.',
            },
            {
                question_type: 'multiple',
                question_text: '75%를 분수로 나타내면?',
                correct_answer: '3/4',
                options: ['3/4', '7/5', '1/4', '4/5'],
                hint: '75/100을 약분해보세요.',
            },
        ],
    },
    {
        title: '🌳 세계 지리',
        description: '세계 지리를 알아봐요!',
        category: 'social',
        grade_level: 6,
        difficulty: 'tree',
        questions: [
            {
                question_type: 'multiple',
                question_text: '세계에서 가장 큰 대륙은?',
                correct_answer: '아시아',
                options: ['아시아', '아프리카', '유럽', '북아메리카'],
                hint: '우리나라가 속한 대륙이에요.',
            },
            {
                question_type: 'ox',
                question_text: '아마존 강은 아프리카에 있다. O일까요 X일까요?',
                correct_answer: 'X',
                options: ['O', 'X'],
                hint: '아마존 강은 남아메리카에 있어요.',
            },
            {
                question_type: 'multiple',
                question_text: '세계에서 가장 큰 사막은?',
                correct_answer: '사하라 사막',
                options: ['사하라 사막', '고비 사막', '칼라하리 사막', '아타카마 사막'],
                hint: '아프리카 북부에 있어요.',
            },
            {
                question_type: 'multiple',
                question_text: '적도가 지나는 대륙이 아닌 것은?',
                correct_answer: '유럽',
                options: ['유럽', '아프리카', '남아메리카', '아시아'],
                hint: '유럽은 적도보다 북쪽에 있어요.',
            },
            {
                question_type: 'multiple',
                question_text: '태평양과 대서양 사이에 있는 운하는?',
                correct_answer: '파나마 운하',
                options: ['파나마 운하', '수에즈 운하', '키엘 운하', '코린트 운하'],
                hint: '중앙아메리카에 있어요.',
            },
        ],
    },
    {
        title: '🌳 문학 이야기',
        description: '문학 작품을 알아봐요!',
        category: 'korean',
        grade_level: 5,
        difficulty: 'tree',
        questions: [
            {
                question_type: 'multiple',
                question_text: '흥부전에서 흥부가 얻은 것은?',
                correct_answer: '박',
                options: ['박', '금', '쌀', '옷'],
                hint: '제비가 물어다 준 씨앗에서 자랐어요.',
            },
            {
                question_type: 'ox',
                question_text: '심청전의 주인공 심청이는 아버지의 눈을 뜨게 했다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '효녀 심청이의 이야기예요.',
            },
            {
                question_type: 'multiple',
                question_text: '춘향전의 배경이 되는 지역은?',
                correct_answer: '남원',
                options: ['남원', '서울', '평양', '부산'],
                hint: '전라북도에 있는 도시예요.',
            },
            {
                question_type: 'multiple',
                question_text: '홍길동전을 지은 사람은?',
                correct_answer: '허균',
                options: ['허균', '김시습', '박지원', '정약용'],
                hint: '조선시대 소설가예요.',
            },
            {
                question_type: 'multiple',
                question_text: '별주부전에서 토끼에게 간을 달라고 한 동물은?',
                correct_answer: '자라',
                options: ['자라', '거북이', '용', '물고기'],
                hint: '용왕의 신하예요.',
            },
        ],
    },
    {
        title: '🌳 생물의 분류',
        description: '생물을 분류해봐요!',
        category: 'science',
        grade_level: 5,
        difficulty: 'tree',
        questions: [
            {
                question_type: 'multiple',
                question_text: '척추동물이 아닌 것은?',
                correct_answer: '지렁이',
                options: ['지렁이', '개구리', '뱀', '참새'],
                hint: '척추동물은 등뼈가 있어요.',
            },
            {
                question_type: 'ox',
                question_text: '고래는 포유류다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '새끼에게 젖을 먹여요.',
            },
            {
                question_type: 'multiple',
                question_text: '양서류의 특징이 아닌 것은?',
                correct_answer: '비늘이 있다',
                options: [
                    '비늘이 있다',
                    '물과 땅에서 산다',
                    '허파와 피부로 호흡한다',
                    '알을 낳는다',
                ],
                hint: '양서류의 피부는 축축해요.',
            },
            {
                question_type: 'multiple',
                question_text: '곤충의 다리는 몇 개일까요?',
                correct_answer: '6개',
                options: ['6개', '4개', '8개', '10개'],
                hint: '거미는 곤충이 아니에요.',
            },
            {
                question_type: 'multiple',
                question_text: '파충류에 해당하는 동물은?',
                correct_answer: '도마뱀',
                options: ['도마뱀', '개구리', '고래', '참새'],
                hint: '비늘로 덮여 있고 알을 낳아요.',
            },
        ],
    },
    // ============================================
    // 👑 KING (킹왕짱) - 도전 난이도 (10개)
    // ============================================
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
    {
        title: '👑 수학 천재',
        description: '어려운 수학 문제에 도전!',
        category: 'math',
        grade_level: 6,
        difficulty: 'king',
        questions: [
            {
                question_type: 'multiple',
                question_text: '원주율 π의 값은 약 얼마일까요?',
                correct_answer: '3.14159',
                options: ['3.14159', '3.15926', '2.71828', '1.41421'],
                hint: '원의 둘레와 지름의 비율이에요.',
            },
            {
                question_type: 'multiple',
                question_text: '피타고라스 정리에서 빗변의 길이를 구하는 공식은?',
                correct_answer: 'c² = a² + b²',
                options: ['c² = a² + b²', 'c = a + b', 'c² = a² - b²', 'c = a × b'],
                hint: '직각삼각형에서 사용해요.',
            },
            {
                question_type: 'ox',
                question_text: '0으로 나누는 것은 가능하다. O일까요 X일까요?',
                correct_answer: 'X',
                options: ['O', 'X'],
                hint: '수학에서 정의되지 않아요.',
            },
            {
                question_type: 'multiple',
                question_text: '2의 10제곱은 얼마일까요?',
                correct_answer: '1024',
                options: ['1024', '512', '2048', '256'],
                hint: '2를 10번 곱해보세요.',
            },
            {
                question_type: 'multiple',
                question_text: '정육면체의 면은 몇 개일까요?',
                correct_answer: '6개',
                options: ['6개', '4개', '8개', '12개'],
                hint: '주사위를 생각해보세요.',
            },
        ],
    },
    {
        title: '👑 세계사 마스터',
        description: '세계 역사에 도전해봐요!',
        category: 'social',
        grade_level: 6,
        difficulty: 'king',
        questions: [
            {
                question_type: 'multiple',
                question_text: '제2차 세계대전이 끝난 해는?',
                correct_answer: '1945년',
                options: ['1945년', '1939년', '1918년', '1950년'],
                hint: '우리나라가 광복을 맞은 해이기도 해요.',
            },
            {
                question_type: 'ox',
                question_text: '피라미드는 그리스에서 만들어졌다. O일까요 X일까요?',
                correct_answer: 'X',
                options: ['O', 'X'],
                hint: '이집트의 유명한 건축물이에요.',
            },
            {
                question_type: 'multiple',
                question_text: '콜럼버스가 아메리카 대륙을 발견한 해는?',
                correct_answer: '1492년',
                options: ['1492년', '1592년', '1392년', '1292년'],
                hint: '임진왜란 100년 전이에요.',
            },
            {
                question_type: 'multiple',
                question_text: '프랑스 혁명이 일어난 해는?',
                correct_answer: '1789년',
                options: ['1789년', '1776년', '1815년', '1848년'],
                hint: '바스티유 감옥이 함락됐어요.',
            },
            {
                question_type: 'multiple',
                question_text: '로마 제국의 공용어는?',
                correct_answer: '라틴어',
                options: ['라틴어', '그리스어', '영어', '이탈리아어'],
                hint: '많은 유럽 언어의 기원이에요.',
            },
        ],
    },
    {
        title: '👑 영어 마스터',
        description: '고급 영어에 도전해봐요!',
        category: 'english',
        grade_level: 6,
        difficulty: 'king',
        questions: [
            {
                question_type: 'multiple',
                question_text: '"I wish I ___ a bird." 빈칸에 들어갈 말은?',
                correct_answer: 'were',
                options: ['were', 'was', 'am', 'is'],
                hint: '가정법에서는 were를 써요.',
            },
            {
                question_type: 'ox',
                question_text:
                    '"If I had known, I would have helped."는 과거 사실의 반대를 말한다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '가정법 과거완료예요.',
            },
            {
                question_type: 'multiple',
                question_text: '"enormous"의 뜻은?',
                correct_answer: '거대한',
                options: ['거대한', '작은', '빠른', '느린'],
                hint: 'huge와 비슷한 뜻이에요.',
            },
            {
                question_type: 'multiple',
                question_text: '"He is good ___ math." 빈칸에 들어갈 전치사는?',
                correct_answer: 'at',
                options: ['at', 'in', 'on', 'for'],
                hint: 'be good at은 ~을 잘하다는 뜻이에요.',
            },
            {
                question_type: 'multiple',
                question_text: '과거분사가 아닌 것은?',
                correct_answer: 'bring',
                options: ['bring', 'written', 'eaten', 'spoken'],
                hint: 'bring의 과거분사는 brought예요.',
            },
        ],
    },
    {
        title: '👑 화학 탐구',
        description: '화학의 세계에 도전!',
        category: 'science',
        grade_level: 6,
        difficulty: 'king',
        questions: [
            {
                question_type: 'multiple',
                question_text: '물(H₂O)은 몇 개의 원자로 이루어져 있을까요?',
                correct_answer: '3개',
                options: ['3개', '2개', '4개', '5개'],
                hint: '수소 2개와 산소 1개예요.',
            },
            {
                question_type: 'ox',
                question_text: '소금의 화학식은 NaCl이다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '나트륨과 염소의 화합물이에요.',
            },
            {
                question_type: 'multiple',
                question_text: '산성 용액에서 pH는?',
                correct_answer: '7 미만',
                options: ['7 미만', '7 초과', '정확히 7', '14'],
                hint: '레몬즙은 산성이에요.',
            },
            {
                question_type: 'multiple',
                question_text: '공기 중 가장 많은 기체는?',
                correct_answer: '질소',
                options: ['질소', '산소', '이산화탄소', '아르곤'],
                hint: '약 78%를 차지해요.',
            },
            {
                question_type: 'multiple',
                question_text: '철의 원소 기호는?',
                correct_answer: 'Fe',
                options: ['Fe', 'Ir', 'Fr', 'F'],
                hint: '라틴어 Ferrum에서 왔어요.',
            },
        ],
    },
    {
        title: '👑 문학 마스터',
        description: '세계 문학에 도전해봐요!',
        category: 'korean',
        grade_level: 6,
        difficulty: 'king',
        questions: [
            {
                question_type: 'multiple',
                question_text: '셰익스피어가 쓴 작품이 아닌 것은?',
                correct_answer: '레 미제라블',
                options: ['레 미제라블', '햄릿', '로미오와 줄리엣', '맥베스'],
                hint: '레 미제라블은 빅토르 위고의 작품이에요.',
            },
            {
                question_type: 'ox',
                question_text: '어린 왕자의 작가는 생텍쥐페리다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '프랑스 작가이자 비행사예요.',
            },
            {
                question_type: 'multiple',
                question_text: "'소설가 구보씨의 일일'을 쓴 작가는?",
                correct_answer: '박태원',
                options: ['박태원', '이상', '김유정', '현진건'],
                hint: '모더니즘 작가예요.',
            },
            {
                question_type: 'multiple',
                question_text: '안데르센의 동화가 아닌 것은?',
                correct_answer: '백설공주',
                options: ['백설공주', '인어공주', '미운 오리 새끼', '성냥팔이 소녀'],
                hint: '백설공주는 그림 형제의 작품이에요.',
            },
            {
                question_type: 'multiple',
                question_text: '시조의 기본 형식은 몇 장일까요?',
                correct_answer: '3장',
                options: ['3장', '2장', '4장', '5장'],
                hint: '초장, 중장, 종장이에요.',
            },
        ],
    },
    {
        title: '👑 지구과학 탐구',
        description: '지구과학에 도전해봐요!',
        category: 'science',
        grade_level: 6,
        difficulty: 'king',
        questions: [
            {
                question_type: 'multiple',
                question_text: '지구의 대기층 중 가장 낮은 층은?',
                correct_answer: '대류권',
                options: ['대류권', '성층권', '중간권', '열권'],
                hint: '우리가 살고 있는 곳이에요.',
            },
            {
                question_type: 'ox',
                question_text: '지진의 세기를 나타내는 단위는 리히터 규모다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '진도와는 다른 개념이에요.',
            },
            {
                question_type: 'multiple',
                question_text: '가장 단단한 광물은?',
                correct_answer: '다이아몬드',
                options: ['다이아몬드', '석영', '강옥', '황옥'],
                hint: '모스 경도 10이에요.',
            },
            {
                question_type: 'multiple',
                question_text: '화산이 폭발할 때 나오는 붉은 액체를?',
                correct_answer: '용암',
                options: ['용암', '마그마', '화산재', '화산가스'],
                hint: '마그마가 지표로 나오면 부르는 이름이에요.',
            },
            {
                question_type: 'multiple',
                question_text: '지구 내부 구조 중 가장 바깥쪽은?',
                correct_answer: '지각',
                options: ['지각', '맨틀', '외핵', '내핵'],
                hint: '우리가 서 있는 곳이에요.',
            },
        ],
    },
    {
        title: '👑 경제 상식',
        description: '경제 개념에 도전해봐요!',
        category: 'social',
        grade_level: 6,
        difficulty: 'king',
        questions: [
            {
                question_type: 'multiple',
                question_text: '물가가 계속 오르는 현상을 뭐라고 할까요?',
                correct_answer: '인플레이션',
                options: ['인플레이션', '디플레이션', '스태그플레이션', '리세션'],
                hint: '돈의 가치가 떨어지는 현상이에요.',
            },
            {
                question_type: 'ox',
                question_text: '수요가 늘면 가격이 오른다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '수요와 공급의 법칙이에요.',
            },
            {
                question_type: 'multiple',
                question_text: '우리나라의 중앙은행은?',
                correct_answer: '한국은행',
                options: ['한국은행', '국민은행', '신한은행', '우리은행'],
                hint: '화폐를 발행하는 곳이에요.',
            },
            {
                question_type: 'multiple',
                question_text: 'GDP는 무엇의 약자일까요?',
                correct_answer: '국내총생산',
                options: ['국내총생산', '국민총소득', '국제무역수지', '국가부채'],
                hint: 'Gross Domestic Product예요.',
            },
            {
                question_type: 'multiple',
                question_text: '주식을 사고파는 곳을 뭐라고 할까요?',
                correct_answer: '증권거래소',
                options: ['증권거래소', '은행', '마트', '시장'],
                hint: '코스피, 코스닥과 관련있어요.',
            },
        ],
    },
    {
        title: '👑 논리 퍼즐',
        description: '논리력을 테스트해봐요!',
        category: 'math',
        grade_level: 6,
        difficulty: 'king',
        questions: [
            {
                question_type: 'multiple',
                question_text: '1, 4, 9, 16, ? 다음에 올 숫자는?',
                correct_answer: '25',
                options: ['25', '20', '24', '36'],
                hint: '1², 2², 3², 4², ?',
            },
            {
                question_type: 'multiple',
                question_text: '2, 6, 12, 20, ? 다음에 올 숫자는?',
                correct_answer: '30',
                options: ['30', '28', '32', '26'],
                hint: 'n × (n+1)의 패턴이에요.',
            },
            {
                question_type: 'ox',
                question_text: '모든 정사각형은 직사각형이다. O일까요 X일까요?',
                correct_answer: 'O',
                options: ['O', 'X'],
                hint: '정사각형은 네 각이 모두 직각이에요.',
            },
            {
                question_type: 'multiple',
                question_text: 'A가 B보다 크고, B가 C보다 크면, A와 C의 관계는?',
                correct_answer: 'A가 C보다 크다',
                options: ['A가 C보다 크다', 'C가 A보다 크다', '같다', '알 수 없다'],
                hint: '추이성을 생각해보세요.',
            },
            {
                question_type: 'multiple',
                question_text: '3명이 악수를 한 번씩 하면 총 몇 번 악수할까요?',
                correct_answer: '3번',
                options: ['3번', '6번', '2번', '9번'],
                hint: 'A-B, A-C, B-C를 세어보세요.',
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

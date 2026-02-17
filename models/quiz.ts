// 퀴즈 시스템 타입 정의

// 문제 유형
export type QuestionType = 'multiple' | 'ox' | 'short';

// 카테고리
export type QuizCategory =
    | 'korean' // 국어
    | 'math' // 수학
    | 'social' // 사회
    | 'science' // 과학
    | 'english' // 영어
    | 'general' // 상식
    | 'art' // 예체능
    | 'fun'; // 재미

// 난이도 (학년별)
export type DifficultyLevel = 'seedling' | 'leaf' | 'tree' | 'king';

// 카테고리 정보
export const CATEGORIES: Record<QuizCategory, { label: string; icon: string; color: string }> = {
    korean: { label: '국어', icon: '📚', color: '#ff6b6b' },
    math: { label: '수학', icon: '🔢', color: '#45b7d1' },
    social: { label: '사회', icon: '🌍', color: '#4ecdc4' },
    science: { label: '과학', icon: '🔬', color: '#95e77e' },
    english: { label: '영어', icon: '🔤', color: '#ffe66d' },
    general: { label: '상식', icon: '💡', color: '#878d8f' },
    art: { label: '예체능', icon: '🎨', color: '#fd79a8' },
    fun: { label: '재미', icon: '🎮', color: '#a29bfe' },
};

// 난이도 정보
export const DIFFICULTIES: Record<
    DifficultyLevel,
    { label: string; gradeRange: string; color: string }
> = {
    seedling: { label: '새싹', gradeRange: '1~2학년', color: '#95e77e' },
    leaf: { label: '풀잎', gradeRange: '3~4학년', color: '#4ecdc4' },
    tree: { label: '나무', gradeRange: '5~6학년', color: '#45b7d1' },
    king: { label: '킹왕짱', gradeRange: '도전', color: '#ff6b6b' },
};

// 퀴즈 인터페이스
export interface Quiz {
    id: string;
    created_by: string;
    title: string;
    description: string | null;
    category: QuizCategory;
    grade_level: number; // 1-6
    difficulty: DifficultyLevel;
    is_public: boolean;
    play_count: number;
    created_at: string;
    updated_at: string;
}

// 문제 인터페이스
export interface Question {
    id: string;
    quiz_id: string;
    question_type: QuestionType;
    question_text: string;
    question_image_url: string | null;
    correct_answer: string;
    options: string[] | null; // 객관식 보기
    hint: string | null;
    order_index: number;
    created_at: string;
}

// 퀴즈 시도 인터페이스
export interface QuizAttempt {
    id: string;
    user_id: string;
    quiz_id: string;
    score: number;
    total_questions: number;
    time_spent: number | null; // 초 단위
    completed_at: string;
}

// 퀴즈 생성 폼 데이터
export interface QuizFormData {
    title: string;
    description: string;
    category: QuizCategory;
    grade_level: number;
    difficulty: DifficultyLevel;
    is_public: boolean;
    questions: QuestionFormData[];
}

// 문제 생성 폼 데이터
export interface QuestionFormData {
    question_type: QuestionType;
    question_text: string;
    question_image_url: string | null;
    correct_answer: string;
    options: string[]; // 객관식: 4개, OX: ['O', 'X']
    hint: string;
    order_index: number;
}

// 퀴즈 플레이 상태
export interface QuizPlayState {
    quiz: Quiz | null;
    questions: Question[];
    currentIndex: number;
    answers: Record<string, string>; // questionId -> userAnswer
    startTime: number;
    isCompleted: boolean;
}

// 퀴즈 결과
export interface QuizResultData {
    quiz: Quiz;
    questions: Question[];
    answers: Record<string, string>;
    score: number;
    totalQuestions: number;
    timeSpent: number;
    correctAnswers: string[];
}

// 퀴즈 목록 필터
export interface QuizListFilter {
    category: QuizCategory | null;
    difficulty: DifficultyLevel | null;
    gradeLevel: number | null;
    searchQuery: string;
    sortBy: 'created_at' | 'play_count' | 'title';
    sortOrder: 'asc' | 'desc';
}

// 퀴즈 with 작성자 정보
export interface QuizWithAuthor extends Quiz {
    profiles?: {
        full_name: string | null;
        avatar_url: string | null;
    };
}

// 기본 필터 값
export const DEFAULT_QUIZ_FILTER: QuizListFilter = {
    category: null,
    difficulty: null,
    gradeLevel: null,
    searchQuery: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
};

// 기본 문제 폼 데이터
export const DEFAULT_QUESTION_FORM: QuestionFormData = {
    question_type: 'multiple',
    question_text: '',
    question_image_url: null,
    correct_answer: '',
    options: ['', '', '', ''],
    hint: '',
    order_index: 0,
};

// 기본 퀴즈 폼 데이터
export const DEFAULT_QUIZ_FORM: QuizFormData = {
    title: '',
    description: '',
    category: 'general',
    grade_level: 3,
    difficulty: 'leaf',
    is_public: true,
    questions: [
        { ...DEFAULT_QUESTION_FORM, options: [...DEFAULT_QUESTION_FORM.options], order_index: 0 },
    ],
};

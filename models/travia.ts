export interface QuestionInfo {
    category: string;
    correctAnswer: string;
    difficulty: string;
    id: string;
    incorrectAnswers: string[];
    isNiche: boolean;
    question: string;
    regions: string[];
    tags: string[];
    type: string;
    randomAnswers: string[];
}

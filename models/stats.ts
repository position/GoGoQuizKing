// 통계 관련 타입 정의

export interface UserStats {
    totalQuizzesTaken: number;
    totalQuizzesCreated: number;
    totalCorrectAnswers: number;
    totalQuestions: number;
    averageScore: number;
    totalTimeSpent: number;
    averageTimePerQuiz: number;
}

export interface CategoryStats {
    category: string;
    attemptCount: number;
    correctCount: number;
    totalQuestions: number;
    accuracy: number;
}

export interface DifficultyStats {
    difficulty: string;
    attemptCount: number;
    correctCount: number;
    totalQuestions: number;
    accuracy: number;
    avgTimeSpent: number;
}

export interface DailyActivity {
    date: string;
    quizCount: number;
    correctCount: number;
    totalQuestions: number;
    pointsEarned: number;
}

export interface WeeklyActivity {
    weekStart: string;
    weekEnd: string;
    quizCount: number;
    correctCount: number;
    totalQuestions: number;
    pointsEarned: number;
}

export interface MonthlyActivity {
    month: string;
    quizCount: number;
    correctCount: number;
    totalQuestions: number;
    pointsEarned: number;
}

export interface PointTrend {
    date: string;
    points: number;
    cumulativePoints: number;
}

export interface QuizPerformance {
    quizId: string;
    quizTitle: string;
    score: number;
    totalQuestions: number;
    timeSpent: number;
    completedAt: string;
}

export interface StatsOverview {
    userStats: UserStats;
    categoryStats: CategoryStats[];
    difficultyStats: DifficultyStats[];
    recentPerformance: QuizPerformance[];
}

export interface ProfileUpdateData {
    full_name?: string;
    preferred_username?: string;
    avatar_url?: string;
}

// Chart 색상 팔레트
export const CHART_COLORS = {
    primary: '#5c6bc0',
    secondary: '#26a69a',
    accent: '#ff7043',
    success: '#66bb6a',
    warning: '#ffa726',
    error: '#ef5350',
    info: '#42a5f5',
    purple: '#ab47bc',
    pink: '#ec407a',
    teal: '#26a69a',
} as const;

export const CATEGORY_COLORS: Record<string, string> = {
    국어: '#5c6bc0',
    수학: '#ef5350',
    영어: '#26a69a',
    과학: '#66bb6a',
    사회: '#ffa726',
    역사: '#ab47bc',
    예술: '#ec407a',
    체육: '#42a5f5',
    기타: '#78909c',
};

export const DIFFICULTY_COLORS: Record<string, string> = {
    easy: '#66bb6a',
    medium: '#ffa726',
    hard: '#ef5350',
};

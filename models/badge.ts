// 뱃지 시스템 타입 정의

/**
 * 뱃지 카테고리
 */
export type BadgeCategory = 'quiz' | 'streak' | 'social' | 'category';

/**
 * 뱃지 조건 타입
 */
export type BadgeConditionType =
    | 'quiz_completed' // 퀴즈 완료 수
    | 'quiz_created' // 퀴즈 생성 수
    | 'quiz_played' // 내 퀴즈가 풀린 수
    | 'perfect_score' // 전체 정답 횟수
    | 'streak_days' // 연속 접속일
    | `category_correct_${string}`; // 카테고리별 정답 수

/**
 * 뱃지 정보
 */
export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: BadgeCategory;
    condition_type: BadgeConditionType;
    condition_value: number;
    is_active: boolean;
    sort_order: number;
    created_at: string;
}

/**
 * 사용자 뱃지 (획득한 뱃지)
 */
export interface UserBadge {
    id: string;
    user_id: string;
    badge_id: string;
    earned_at: string;
}

/**
 * 업적 진행률
 */
export interface UserAchievement {
    id: string;
    user_id: string;
    achievement_type: string;
    current_value: number;
    last_updated_at: string;
}

/**
 * 뱃지 + 획득 상태 (UI용)
 */
export interface BadgeWithStatus {
    badge_id: string;
    badge_name: string;
    badge_description: string;
    badge_icon: string;
    category: BadgeCategory;
    condition_type: string;
    condition_value: number;
    current_progress: number;
    is_earned: boolean;
    earned_at: string | null;
    sort_order: number;
}

/**
 * 새로 획득한 뱃지 (알림용)
 */
export interface NewlyEarnedBadge {
    badge_id: string;
    badge_name: string;
    badge_icon: string;
}

/**
 * 뱃지 상수 정보
 */
export const BADGE_INFO: Record<string, Omit<Badge, 'id' | 'created_at' | 'is_active' | 'sort_order'>> = {
    // 퀴즈 관련
    first_step: {
        name: '첫 발걸음',
        description: '첫 번째 퀴즈를 완료했어요!',
        icon: '👣',
        category: 'quiz',
        condition_type: 'quiz_completed',
        condition_value: 1,
    },
    quiz_10: {
        name: '퀴즈 도전자',
        description: '퀴즈 10개를 완료했어요!',
        icon: '🎯',
        category: 'quiz',
        condition_type: 'quiz_completed',
        condition_value: 10,
    },
    quiz_50: {
        name: '퀴즈 탐험가',
        description: '퀴즈 50개를 완료했어요!',
        icon: '🗺️',
        category: 'quiz',
        condition_type: 'quiz_completed',
        condition_value: 50,
    },
    quiz_100: {
        name: '퀴즈 정복자',
        description: '퀴즈 100개를 완료했어요!',
        icon: '🏅',
        category: 'quiz',
        condition_type: 'quiz_completed',
        condition_value: 100,
    },
    perfect_score: {
        name: '백점왕',
        description: '퀴즈에서 전체 정답을 맞췄어요!',
        icon: '💯',
        category: 'quiz',
        condition_type: 'perfect_score',
        condition_value: 1,
    },

    // 퀴즈 생성 관련
    quiz_creator: {
        name: '문제 제작자',
        description: '첫 번째 퀴즈를 만들었어요!',
        icon: '✏️',
        category: 'quiz',
        condition_type: 'quiz_created',
        condition_value: 1,
    },
    quiz_creator_5: {
        name: '퀴즈 작가',
        description: '퀴즈 5개를 만들었어요!',
        icon: '📝',
        category: 'quiz',
        condition_type: 'quiz_created',
        condition_value: 5,
    },
    quiz_creator_20: {
        name: '퀴즈 명장',
        description: '퀴즈 20개를 만들었어요!',
        icon: '📚',
        category: 'quiz',
        condition_type: 'quiz_created',
        condition_value: 20,
    },
    popular_quiz: {
        name: '인기스타',
        description: '내 퀴즈가 100번 풀렸어요!',
        icon: '⭐',
        category: 'social',
        condition_type: 'quiz_played',
        condition_value: 100,
    },

    // 연속 접속 관련
    streak_3: {
        name: '출석 스타트',
        description: '3일 연속 접속했어요!',
        icon: '🌟',
        category: 'streak',
        condition_type: 'streak_days',
        condition_value: 3,
    },
    streak_5: {
        name: '연속 5일',
        description: '5일 연속 접속했어요!',
        icon: '🔥',
        category: 'streak',
        condition_type: 'streak_days',
        condition_value: 5,
    },
    streak_7: {
        name: '주간 챔피언',
        description: '7일 연속 접속했어요!',
        icon: '🌈',
        category: 'streak',
        condition_type: 'streak_days',
        condition_value: 7,
    },
    streak_30: {
        name: '월간 챔피언',
        description: '30일 연속 접속했어요!',
        icon: '👑',
        category: 'streak',
        condition_type: 'streak_days',
        condition_value: 30,
    },

    // 카테고리별
    math_master: {
        name: '수학 천재',
        description: '수학 문제 50개를 맞췄어요!',
        icon: '🧮',
        category: 'category',
        condition_type: 'category_correct_수학',
        condition_value: 50,
    },
    science_expert: {
        name: '과학 박사',
        description: '과학 문제 50개를 맞췄어요!',
        icon: '🔬',
        category: 'category',
        condition_type: 'category_correct_과학',
        condition_value: 50,
    },
    korean_master: {
        name: '국어 달인',
        description: '국어 문제 50개를 맞췄어요!',
        icon: '📖',
        category: 'category',
        condition_type: 'category_correct_국어',
        condition_value: 50,
    },
    english_expert: {
        name: '영어 고수',
        description: '영어 문제 50개를 맞췄어요!',
        icon: '🔤',
        category: 'category',
        condition_type: 'category_correct_영어',
        condition_value: 50,
    },
    social_expert: {
        name: '사회 박사',
        description: '사회 문제 50개를 맞췄어요!',
        icon: '🌍',
        category: 'category',
        condition_type: 'category_correct_사회',
        condition_value: 50,
    },
};

/**
 * 카테고리별 라벨
 */
export const BADGE_CATEGORY_LABELS: Record<BadgeCategory, string> = {
    quiz: '퀴즈',
    streak: '출석',
    social: '소셜',
    category: '과목별',
};

/**
 * 진행률 퍼센트 계산
 */
export function calculateBadgeProgress(currentValue: number, targetValue: number): number {
    if (targetValue <= 0) return 0;
    return Math.min(100, Math.round((currentValue / targetValue) * 100));
}

/**
 * 뱃지 획득 가능 여부 확인
 */
export function canEarnBadge(currentValue: number, targetValue: number): boolean {
    return currentValue >= targetValue;
}

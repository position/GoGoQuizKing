// 데일리 미션 시스템 타입 정의

// 미션 타입
export type MissionType = 'quiz_solve' | 'consecutive_correct' | 'today_quiz' | 'quiz_create';

// 데일리 미션 정의
export interface DailyMission {
    id: string;
    name: string;
    description: string;
    icon: string;
    mission_type: MissionType;
    target_value: number;
    reward_points: number;
    is_active: boolean;
    sort_order: number;
    created_at: string;
}

// 사용자 데일리 미션 진행 상황
export interface UserDailyMission {
    mission_id: string;
    name: string;
    description: string;
    icon: string;
    mission_type: MissionType;
    target_value: number;
    current_value: number;
    reward_points: number;
    is_completed: boolean;
    reward_claimed: boolean;
    sort_order: number;
}

// 오늘의 퀴즈
export interface TodayQuiz {
    quiz_id: string;
    title: string;
    description: string | null;
    category: string;
    difficulty: string;
    play_count: number;
    bonus_points: number;
    author_name: string;
    author_avatar: string | null;
}

// 미션 진행 업데이트 결과
export interface MissionProgressResult {
    mission_id: string;
    mission_name: string;
    is_newly_completed: boolean;
    reward_points: number;
}

// 미션 보상 수령 결과
export interface ClaimRewardResult {
    success: boolean;
    points_earned: number;
    message: string;
}

// 오늘의 퀴즈 완료 결과
export interface TodayQuizCompleteResult {
    is_today_quiz: boolean;
    bonus_awarded: boolean;
    bonus_points: number;
}

// 미션 타입별 아이콘 매핑
export const MISSION_TYPE_ICONS: Record<MissionType, string> = {
    quiz_solve: '🎯',
    consecutive_correct: '🔥',
    today_quiz: '⭐',
    quiz_create: '✏️',
};

// 미션 타입별 색상
export const MISSION_TYPE_COLORS: Record<MissionType, string> = {
    quiz_solve: '#45b7d1',
    consecutive_correct: '#ff6b6b',
    today_quiz: '#ffe66d',
    quiz_create: '#95e77e',
};

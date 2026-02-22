// 포인트 시스템 타입 정의

/**
 * 포인트 액션 타입
 */
export type PointActionType =
    | 'quiz_correct' // 퀴즈 정답 (+10)
    | 'streak_bonus' // 연속 정답 보너스 (+5, 3연속 이상)
    | 'quiz_create' // 퀴즈 생성 (+20)
    | 'daily_attendance' // 일일 출석 (+5)
    | 'quiz_share'; // 퀴즈 공유 (+10)

/**
 * 포인트 히스토리 항목
 */
export interface PointHistory {
    id: string;
    user_id: string;
    points: number;
    action_type: PointActionType;
    description: string | null;
    metadata: Record<string, unknown>;
    created_at: string;
}

/**
 * 레벨 정보
 */
export interface LevelInfo {
    level: number;
    name: string;
    icon: string;
    min_points: number;
    max_points: number;
}

/**
 * 사용자 포인트 요약
 */
export interface UserPointSummary {
    user_id: string;
    points: number;
    level: number;
    streak_days: number;
    last_active_at: string | null;
    level_name: string;
    level_icon: string;
    min_points: number;
    max_points: number;
    level_progress: number;
}

/**
 * 포인트 추가 결과
 */
export interface AddPointsResult {
    new_points: number;
    new_level: number;
    level_up: boolean;
}

/**
 * 출석 체크 결과
 */
export interface AttendanceResult {
    attendance_points: number;
    new_streak: number;
    already_checked: boolean;
}

/**
 * 퀴즈 포인트 결과
 */
export interface QuizPointsResult {
    total_earned: number;
    base_points: number;
    bonus_points: number;
}

/**
 * 레벨 상수
 */
export const LEVEL_CONFIG: LevelInfo[] = [
    { level: 1, name: '퀴즈 새싹', icon: '🌱', min_points: 0, max_points: 100 },
    { level: 2, name: '퀴즈 풀잎', icon: '🌿', min_points: 101, max_points: 300 },
    { level: 3, name: '퀴즈 나무', icon: '🌳', min_points: 301, max_points: 600 },
    { level: 4, name: '퀴즈 숲', icon: '🌲', min_points: 601, max_points: 1000 },
    { level: 5, name: '퀴즈 마스터', icon: '⭐', min_points: 1001, max_points: 2000 },
    { level: 6, name: '퀴즈 챔피언', icon: '🏆', min_points: 2001, max_points: 5000 },
    { level: 7, name: '퀴즈 킹', icon: '👑', min_points: 5001, max_points: 999999 },
];

/**
 * 포인트 상수
 */
export const POINT_VALUES = {
    QUIZ_CORRECT: 10,
    STREAK_BONUS: 5,
    QUIZ_CREATE: 20,
    DAILY_ATTENDANCE: 5,
    QUIZ_SHARE: 10,
    STREAK_THRESHOLD: 3, // 연속 정답 보너스 발동 조건
} as const;

/**
 * 포인트로 레벨 계산
 */
export function calculateLevel(points: number): number {
    if (points >= 5001) return 7;
    if (points >= 2001) return 6;
    if (points >= 1001) return 5;
    if (points >= 601) return 4;
    if (points >= 301) return 3;
    if (points >= 101) return 2;
    return 1;
}

/**
 * 레벨 정보 가져오기
 */
export function getLevelInfo(level: number): LevelInfo {
    return LEVEL_CONFIG[level - 1] || LEVEL_CONFIG[0];
}

/**
 * 다음 레벨까지 필요한 포인트
 */
export function getPointsToNextLevel(currentPoints: number): number {
    const currentLevel = calculateLevel(currentPoints);
    if (currentLevel >= 7) return 0;
    const nextLevelInfo = LEVEL_CONFIG[currentLevel];
    return nextLevelInfo.min_points - currentPoints;
}

/**
 * 레벨 진행률 계산 (0-100)
 */
export function calculateLevelProgress(points: number): number {
    const levelInfo = getLevelInfo(calculateLevel(points));
    if (levelInfo.level === 7) return 100;
    const range = levelInfo.max_points - levelInfo.min_points + 1;
    const progress = points - levelInfo.min_points;
    return Math.round((progress / range) * 100);
}

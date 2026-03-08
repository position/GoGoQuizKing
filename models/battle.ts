// 대결 시스템 타입 정의

// 대결 상태
export type BattleStatus = 'waiting' | 'ready' | 'playing' | 'finished' | 'cancelled';

// 대결 유형
export type BattleType = 'quick' | 'normal' | 'ranked';

// 대결 결과
export type BattleResult = 'win' | 'lose' | 'draw';

// 대결 방 인터페이스
export interface IBattleRoom {
    id: string;
    room_code: string | null;
    host_id: string;
    guest_id: string | null;
    quiz_id: string | null;
    status: BattleStatus;
    battle_type: BattleType;
    question_count: number;
    current_question_index: number;
    host_score: number;
    guest_score: number;
    host_answers: IBattleAnswer[];
    guest_answers: IBattleAnswer[];
    host_streak: number;
    guest_streak: number;
    winner_id: string | null;
    question_started_at: string | null;
    started_at: string | null;
    finished_at: string | null;
    created_at: string;
}

// 대결 답변 인터페이스
export interface IBattleAnswer {
    question_index: number;
    answer: string;
    is_correct: boolean;
    response_time: number; // 초 단위
    score: number;
}

// 대결 방 with 참가자 정보
export interface IBattleRoomWithPlayers extends IBattleRoom {
    host?: {
        id: string;
        full_name: string | null;
        preferred_username: string | null;
        avatar_url: string | null;
        level: number;
    };
    guest?: {
        id: string;
        full_name: string | null;
        preferred_username: string | null;
        avatar_url: string | null;
        level: number;
    } | null;
}

// 매칭 대기열 인터페이스
export interface IBattleMatchmaking {
    id: string;
    user_id: string;
    user_level: number;
    grade_level: number | null;
    battle_type: BattleType;
    same_grade_only: boolean;
    created_at: string;
}

// 대결 기록 인터페이스
export interface IBattleHistory {
    id: string;
    room_id: string;
    user_id: string;
    opponent_id: string | null;
    result: BattleResult;
    my_score: number;
    opponent_score: number;
    correct_count: number;
    total_questions: number;
    avg_response_time: number | null;
    points_earned: number;
    ranking_points_earned: number;
    created_at: string;
}

// 대결 기록 with 상대방 정보
export interface IBattleHistoryWithOpponent extends IBattleHistory {
    opponent_name: string;
    opponent_avatar: string | null;
}

// 사용자 랭킹 통계 인터페이스
export interface IUserRankingStats {
    id: string;
    ranking_points: number;
    season_wins: number;
    season_losses: number;
    season_draws: number;
    total_wins: number;
    total_losses: number;
    total_draws: number;
    win_streak: number;
    best_win_streak: number;
    total_battles: number;
    perfect_wins: number;
    season_id: number;
    updated_at: string;
}

// 대결 랭킹 항목
export interface IBattleRankingEntry {
    rank: number;
    user_id: string;
    full_name: string | null;
    preferred_username: string | null;
    avatar_url: string | null;
    ranking_points: number;
    total_wins: number;
    total_battles: number;
    win_rate: number;
}

// 대결 보상
export interface IBattleReward {
    points_earned: number;
    ranking_points_earned: number;
    badges_earned?: {
        badge_id: string;
        badge_name: string;
        badge_icon: string;
    }[];
}

// 대결 플레이 상태
export interface IBattlePlayState {
    room: IBattleRoomWithPlayers | null;
    isHost: boolean;
    currentQuestion: {
        id: string;
        question_text: string;
        question_type: string;
        options: string[] | null;
        question_image_url: string | null;
    } | null;
    timeRemaining: number;
    hasAnswered: boolean;
    myAnswer: string | null;
    opponentAnswered: boolean;
    roundResult: {
        myAnswer: string;
        opponentAnswer: string;
        correctAnswer: string;
        myScore: number;
        opponentScore: number;
    } | null;
}

// 대결 결과
export interface IBattleResult {
    room_id: string;
    winner_id: string | null;
    is_winner: boolean;
    is_draw: boolean;
    my_score: number;
    opponent_score: number;
    my_correct_count: number;
    opponent_correct_count: number;
    total_questions: number;
    reward: IBattleReward;
    opponent: {
        id: string;
        name: string;
        avatar_url: string | null;
        level: number;
    };
}

// 매칭 옵션
export interface IMatchmakingOptions {
    battle_type: BattleType;
    same_grade_only?: boolean;
}

// 매칭 상태
export type MatchmakingStatus = 'idle' | 'searching' | 'found' | 'timeout' | 'error';

export interface IMatchmakingState {
    status: MatchmakingStatus;
    elapsed_time: number; // 초 단위
    room_id: string | null;
    error: string | null;
}

// 점수 계산 관련 상수
export const BATTLE_SCORING = {
    BASE_SCORE: 100,
    MAX_TIME_BONUS: 50,
    TIME_LIMIT: 15, // 초
    STREAK_BONUS_3: 30,
    STREAK_BONUS_5: 50,
} as const;

// 보상 상수
export const BATTLE_REWARDS = {
    WIN_POINTS: 50,
    DRAW_POINTS: 20,
    LOSE_POINTS: 10,
    PERFECT_WIN_POINTS: 100,
    WIN_RP: 25,
    DRAW_RP: 5,
    LOSE_RP: -10,
    PERFECT_WIN_RP: 50,
} as const;

// 매칭 설정 상수
export const MATCHMAKING_CONFIG = {
    TIMEOUT_SECONDS: 30,
    LEVEL_RANGE_INITIAL: 2,
    LEVEL_RANGE_EXPAND_10S: 3,
    LEVEL_RANGE_EXPAND_20S: 4,
} as const;

// 대결 유형 정보
export const BATTLE_TYPES: Record<BattleType, { label: string; questionCount: number; icon: string; color: string }> = {
    quick: { label: '빠른 대결', questionCount: 5, icon: '⚡', color: '#FFE66D' },
    normal: { label: '일반 대결', questionCount: 10, icon: '⚔️', color: '#4ECDC4' },
    ranked: { label: '랭킹전', questionCount: 10, icon: '🏆', color: '#FF6B6B' },
};

// 대결 결과 정보
export const BATTLE_RESULTS: Record<BattleResult, { label: string; icon: string; color: string }> = {
    win: { label: '승리', icon: '🏆', color: '#95E77E' },
    lose: { label: '패배', icon: '😢', color: '#FF6B6B' },
    draw: { label: '무승부', icon: '🤝', color: '#45B7D1' },
};

// 기본 매칭 옵션
export const DEFAULT_MATCHMAKING_OPTIONS: IMatchmakingOptions = {
    battle_type: 'quick',
    same_grade_only: false,
};

// 점수 계산 헬퍼 함수
export function calculateBattleScore(isCorrect: boolean, responseTime: number, streak: number): number {
    if (!isCorrect) {
        return 0;
    }

    const timeBonus = Math.min(
        BATTLE_SCORING.MAX_TIME_BONUS,
        Math.max(0, Math.floor((BATTLE_SCORING.TIME_LIMIT - responseTime) * 3.33))
    );

    let streakBonus = 0;
    if (streak >= 5) {
        streakBonus = BATTLE_SCORING.STREAK_BONUS_5;
    } else if (streak >= 3) {
        streakBonus = BATTLE_SCORING.STREAK_BONUS_3;
    }

    return BATTLE_SCORING.BASE_SCORE + timeBonus + streakBonus;
}

// 승률 계산
export function calculateWinRate(wins: number, totalBattles: number): number {
    if (totalBattles === 0) {
        return 0;
    }
    return Math.round((wins / totalBattles) * 100 * 100) / 100; // 소수점 2자리
}

// 대결 결과 판정
export function determineBattleResult(myScore: number, opponentScore: number): BattleResult {
    if (myScore > opponentScore) {
        return 'win';
    }
    if (myScore < opponentScore) {
        return 'lose';
    }
    return 'draw';
}

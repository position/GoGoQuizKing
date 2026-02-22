// 랭킹 시스템 타입 정의

import type { QuizCategory } from './quiz';

/**
 * 랭킹 기간 타입
 */
export type RankingPeriod = 'all' | 'weekly' | 'monthly';

/**
 * 랭킹 타입
 */
export type RankingType = 'points' | 'quizzes' | 'category';

/**
 * 랭킹 엔트리 (사용자 랭킹 정보)
 */
export interface RankingEntry {
    user_id: string;
    full_name: string | null;
    preferred_username: string | null;
    avatar_url: string | null;
    period_points: number;
    total_points: number;
    level: number;
    rank: number;
}

/**
 * 내 랭킹 정보 (추가 정보 포함)
 */
export interface MyRankingInfo extends RankingEntry {
    total_users: number;
    percentile: number; // 상위 몇 %인지
}

/**
 * 카테고리별 랭킹 엔트리
 */
export interface CategoryRankingEntry {
    user_id: string;
    full_name: string | null;
    preferred_username: string | null;
    avatar_url: string | null;
    category_points: number;
    total_points: number;
    level: number;
    rank: number;
}

/**
 * 퀴즈 풀이 횟수 랭킹 엔트리
 */
export interface QuizAttemptRankingEntry {
    user_id: string;
    full_name: string | null;
    preferred_username: string | null;
    avatar_url: string | null;
    attempt_count: number;
    total_points: number;
    level: number;
    rank: number;
}

/**
 * 리더보드 필터 옵션
 */
export interface LeaderboardFilter {
    period: RankingPeriod;
    type: RankingType;
    category?: QuizCategory;
    limit: number;
}

/**
 * 기간 라벨 설정
 */
export const PERIOD_LABELS: Record<RankingPeriod, { label: string; icon: string }> = {
    all: { label: '전체', icon: '🏆' },
    weekly: { label: '이번 주', icon: '📅' },
    monthly: { label: '이번 달', icon: '📆' },
};

/**
 * 랭킹 타입 라벨 설정
 */
export const RANKING_TYPE_LABELS: Record<RankingType, { label: string; icon: string }> = {
    points: { label: '포인트', icon: '⭐' },
    quizzes: { label: '퀴즈 풀이', icon: '📝' },
    category: { label: '카테고리', icon: '📚' },
};

/**
 * 순위 변동 타입
 */
export type RankChange = 'up' | 'down' | 'same' | 'new';

/**
 * 순위 배지 정보
 */
export interface RankBadge {
    rank: number;
    emoji: string;
    color: string;
    bgColor: string;
}

/**
 * TOP 3 배지 설정
 */
export const RANK_BADGES: Record<1 | 2 | 3, RankBadge> = {
    1: { rank: 1, emoji: '🥇', color: '#FFD700', bgColor: '#FFF8E1' },
    2: { rank: 2, emoji: '🥈', color: '#C0C0C0', bgColor: '#F5F5F5' },
    3: { rank: 3, emoji: '🥉', color: '#CD7F32', bgColor: '#FBE9E7' },
};

/**
 * 기본 리더보드 필터
 */
export const DEFAULT_LEADERBOARD_FILTER: LeaderboardFilter = {
    period: 'all',
    type: 'points',
    limit: 100,
};

/**
 * 퍼센타일 계산
 */
export function calculatePercentile(rank: number, totalUsers: number): number {
    if (totalUsers === 0) return 0;
    return Math.round(((totalUsers - rank + 1) / totalUsers) * 100);
}

/**
 * 순위에 따른 배지 가져오기
 */
export function getRankBadge(rank: number): RankBadge | null {
    if (rank === 1 || rank === 2 || rank === 3) {
        return RANK_BADGES[rank];
    }
    return null;
}

/**
 * 표시 이름 가져오기 (full_name 또는 username 또는 기본값)
 */
export function getDisplayName(entry: Pick<RankingEntry, 'full_name' | 'preferred_username'>): string {
    return entry.full_name || entry.preferred_username || '익명 사용자';
}

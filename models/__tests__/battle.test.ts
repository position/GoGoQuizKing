import { describe, it, expect } from 'vitest';
import {
    calculateBattleScore,
    calculateWinRate,
    determineBattleResult,
    BATTLE_SCORING,
} from '../battle';
import type { BattleResult } from '../battle';

// ─── 테스트 데이터 팩토리 ───

function createScoreParams(overrides?: {
    isCorrect?: boolean;
    responseTime?: number;
    streak?: number;
}) {
    return {
        isCorrect: overrides?.isCorrect ?? true,
        responseTime: overrides?.responseTime ?? 5,
        streak: overrides?.streak ?? 0,
    };
}

// ─── calculateBattleScore ───

describe('calculateBattleScore', () => {
    describe('오답인 경우', () => {
        it('오답이면 0점을 반환한다', () => {
            const { isCorrect, responseTime, streak } = createScoreParams({
                isCorrect: false,
            });

            expect(calculateBattleScore(isCorrect, responseTime, streak)).toBe(0);
        });

        it('오답이면 responseTime이 빠르더라도 0점을 반환한다', () => {
            expect(calculateBattleScore(false, 0, 10)).toBe(0);
        });

        it('오답이면 연속 정답 streak가 높아도 0점을 반환한다', () => {
            expect(calculateBattleScore(false, 1, 5)).toBe(0);
        });
    });

    describe('정답 + 기본 점수', () => {
        it('정답이면 기본 점수(100)를 포함한다', () => {
            const score = calculateBattleScore(true, BATTLE_SCORING.TIME_LIMIT, 0);

            // responseTime이 TIME_LIMIT(15초)이면 timeBonus = 0
            expect(score).toBe(BATTLE_SCORING.BASE_SCORE);
        });
    });

    describe('정답 + 시간 보너스', () => {
        it('응답 시간 0초이면 최대 시간 보너스를 받는다', () => {
            // (15 - 0) * 3.33 = 49.95 → floor = 49, min(50, 49) = 49
            const score = calculateBattleScore(true, 0, 0);

            expect(score).toBe(BATTLE_SCORING.BASE_SCORE + 49);
        });

        it('응답 시간 5초이면 적절한 시간 보너스를 받는다', () => {
            // (15 - 5) * 3.33 = 33.3 → floor = 33
            const score = calculateBattleScore(true, 5, 0);

            expect(score).toBe(BATTLE_SCORING.BASE_SCORE + 33);
        });

        it('응답 시간이 TIME_LIMIT와 같으면 시간 보너스가 0이다', () => {
            const score = calculateBattleScore(true, BATTLE_SCORING.TIME_LIMIT, 0);

            expect(score).toBe(BATTLE_SCORING.BASE_SCORE);
        });

        it('응답 시간이 TIME_LIMIT를 초과하면 시간 보너스가 0이다', () => {
            // (15 - 20) * 3.33 = -16.65 → floor = -17, max(0, -17) = 0
            const score = calculateBattleScore(true, 20, 0);

            expect(score).toBe(BATTLE_SCORING.BASE_SCORE);
        });

        it('시간 보너스는 MAX_TIME_BONUS(50)를 초과하지 않는다', () => {
            // 음수 responseTime으로 MAX를 초과 시도
            // (15 - (-10)) * 3.33 = 83.25 → floor = 83, min(50, 83) = 50
            const score = calculateBattleScore(true, -10, 0);

            expect(score).toBe(BATTLE_SCORING.BASE_SCORE + BATTLE_SCORING.MAX_TIME_BONUS);
        });
    });

    describe('정답 + 연속 정답 보너스 (streak)', () => {
        it('streak가 0이면 streak 보너스가 없다', () => {
            const score = calculateBattleScore(true, BATTLE_SCORING.TIME_LIMIT, 0);

            expect(score).toBe(BATTLE_SCORING.BASE_SCORE);
        });

        it('streak가 2이면 streak 보너스가 없다', () => {
            const score = calculateBattleScore(true, BATTLE_SCORING.TIME_LIMIT, 2);

            expect(score).toBe(BATTLE_SCORING.BASE_SCORE);
        });

        it('streak가 3이면 STREAK_BONUS_3(30)을 받는다', () => {
            const score = calculateBattleScore(true, BATTLE_SCORING.TIME_LIMIT, 3);

            expect(score).toBe(BATTLE_SCORING.BASE_SCORE + BATTLE_SCORING.STREAK_BONUS_3);
        });

        it('streak가 4이면 STREAK_BONUS_3(30)을 받는다', () => {
            const score = calculateBattleScore(true, BATTLE_SCORING.TIME_LIMIT, 4);

            expect(score).toBe(BATTLE_SCORING.BASE_SCORE + BATTLE_SCORING.STREAK_BONUS_3);
        });

        it('streak가 5이면 STREAK_BONUS_5(50)를 받는다', () => {
            const score = calculateBattleScore(true, BATTLE_SCORING.TIME_LIMIT, 5);

            expect(score).toBe(BATTLE_SCORING.BASE_SCORE + BATTLE_SCORING.STREAK_BONUS_5);
        });

        it('streak가 10이면 STREAK_BONUS_5(50)를 받는다', () => {
            const score = calculateBattleScore(true, BATTLE_SCORING.TIME_LIMIT, 10);

            expect(score).toBe(BATTLE_SCORING.BASE_SCORE + BATTLE_SCORING.STREAK_BONUS_5);
        });
    });

    describe('정답 + 복합 보너스', () => {
        it('빠른 응답(0초) + 5연속 정답이면 최대 점수를 받는다', () => {
            // BASE(100) + timeBonus(49) + streak(50) = 199
            const score = calculateBattleScore(true, 0, 5);

            expect(score).toBe(BATTLE_SCORING.BASE_SCORE + 49 + BATTLE_SCORING.STREAK_BONUS_5);
        });

        it('중간 응답(7초) + 3연속 정답이면 적절한 점수를 받는다', () => {
            // (15 - 7) * 3.33 = 26.64 → floor = 26
            // BASE(100) + timeBonus(26) + streak(30) = 156
            const score = calculateBattleScore(true, 7, 3);

            expect(score).toBe(BATTLE_SCORING.BASE_SCORE + 26 + BATTLE_SCORING.STREAK_BONUS_3);
        });
    });

    describe('경계값 테스트', () => {
        it('응답 시간이 정확히 0일 때 정상 동작한다', () => {
            const score = calculateBattleScore(true, 0, 0);

            expect(score).toBeGreaterThan(BATTLE_SCORING.BASE_SCORE);
        });

        it('streak가 음수여도 에러 없이 동작한다', () => {
            const score = calculateBattleScore(true, BATTLE_SCORING.TIME_LIMIT, -1);

            expect(score).toBe(BATTLE_SCORING.BASE_SCORE);
        });

        it('응답 시간이 소수점이어도 정상 동작한다', () => {
            // (15 - 3.5) * 3.33 = 38.295 → floor = 38
            const score = calculateBattleScore(true, 3.5, 0);

            expect(score).toBe(BATTLE_SCORING.BASE_SCORE + 38);
        });
    });
});

// ─── calculateWinRate ───

describe('calculateWinRate', () => {
    describe('정상 케이스', () => {
        it('10전 5승이면 승률 50%를 반환한다', () => {
            expect(calculateWinRate(5, 10)).toBe(50);
        });

        it('10전 10승이면 승률 100%를 반환한다', () => {
            expect(calculateWinRate(10, 10)).toBe(100);
        });

        it('10전 0승이면 승률 0%를 반환한다', () => {
            expect(calculateWinRate(0, 10)).toBe(0);
        });

        it('3전 1승이면 승률 33.33%를 반환한다 (소수점 2자리)', () => {
            expect(calculateWinRate(1, 3)).toBe(33.33);
        });

        it('3전 2승이면 승률 66.67%를 반환한다 (소수점 2자리)', () => {
            expect(calculateWinRate(2, 3)).toBe(66.67);
        });

        it('7전 3승이면 승률 42.86%를 반환한다', () => {
            expect(calculateWinRate(3, 7)).toBe(42.86);
        });
    });

    describe('경계값 테스트', () => {
        it('0전이면 0을 반환한다 (zero division 방지)', () => {
            expect(calculateWinRate(0, 0)).toBe(0);
        });

        it('1전 1승이면 100%를 반환한다', () => {
            expect(calculateWinRate(1, 1)).toBe(100);
        });

        it('1전 0승이면 0%를 반환한다', () => {
            expect(calculateWinRate(0, 1)).toBe(0);
        });
    });

    describe('반환값 형식', () => {
        it('반환값은 숫자 타입이다', () => {
            expect(typeof calculateWinRate(5, 10)).toBe('number');
        });

        it('소수점 2자리까지만 반환한다', () => {
            const result = calculateWinRate(1, 3);
            const decimalPlaces = result.toString().split('.')[1]?.length ?? 0;

            expect(decimalPlaces).toBeLessThanOrEqual(2);
        });
    });
});

// ─── determineBattleResult ───

describe('determineBattleResult', () => {
    describe('승리 판정', () => {
        it('내 점수가 높으면 win을 반환한다', () => {
            const result: BattleResult = determineBattleResult(100, 50);

            expect(result).toBe('win');
        });

        it('1점 차이로도 win을 반환한다', () => {
            expect(determineBattleResult(51, 50)).toBe('win');
        });
    });

    describe('패배 판정', () => {
        it('상대 점수가 높으면 lose를 반환한다', () => {
            const result: BattleResult = determineBattleResult(50, 100);

            expect(result).toBe('lose');
        });

        it('1점 차이로도 lose를 반환한다', () => {
            expect(determineBattleResult(50, 51)).toBe('lose');
        });
    });

    describe('무승부 판정', () => {
        it('점수가 같으면 draw를 반환한다', () => {
            const result: BattleResult = determineBattleResult(100, 100);

            expect(result).toBe('draw');
        });

        it('양쪽 모두 0점이면 draw를 반환한다', () => {
            expect(determineBattleResult(0, 0)).toBe('draw');
        });
    });

    describe('경계값 테스트', () => {
        it('음수 점수로도 정상 동작한다', () => {
            expect(determineBattleResult(-10, -20)).toBe('win');
        });

        it('매우 큰 점수로도 정상 동작한다', () => {
            expect(determineBattleResult(999999, 999998)).toBe('win');
        });

        it('소수점 점수로도 정상 동작한다', () => {
            expect(determineBattleResult(100.5, 100.4)).toBe('win');
        });
    });

    describe('반환값 타입', () => {
        it('반환값은 BattleResult 타입이다', () => {
            const validResults: BattleResult[] = ['win', 'lose', 'draw'];
            const result = determineBattleResult(100, 50);

            expect(validResults).toContain(result);
        });
    });
});


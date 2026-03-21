// ~/composables/use-quiz-share.ts
import type { ComputedRef } from 'vue';
import { ToastMessage } from '~/helper/message';
import { usePointStore } from '~/store/point.store';

interface QuizShareData {
    title: string;
    description?: string;
    quizId: string;
}

interface QuizResultShareData {
    title: string;
    score: number;
    totalQuestions: number;
    quizId: string;
}

interface UseQuizShareReturn {
    /** OS 네이티브 공유 지원 여부 */
    isNativeShareSupported: ComputedRef<boolean>;
    /** 퀴즈 공유 */
    shareQuiz: (data: QuizShareData) => Promise<boolean>;
    /** 퀴즈 결과 공유 */
    shareResult: (data: QuizResultShareData) => Promise<boolean>;
    /** URL 클립보드 복사 */
    copyToClipboard: (quizId: string) => Promise<boolean>;
    /** 카카오톡 공유 링크 생성 */
    getKakaoShareUrl: (quizId: string, title: string) => string;
    /** X(Twitter) 공유 링크 생성 */
    getTwitterShareUrl: (quizId: string, title: string) => string;
    /** 공유 포인트 지급 */
    claimShareReward: (quizId: string) => Promise<void>;
}

const SITE_URL = 'https://gogoquizking.com';

/**
 * 퀴즈 공유 Composable
 * - 모바일: Web Share API (navigator.share)
 * - 데스크탑: 클립보드 복사 + SNS 링크
 * - 공유 성공 시 포인트 지급 (1일 3회 제한)
 */
export function useQuizShare(): UseQuizShareReturn {
    const runtimeConfig = useRuntimeConfig();
    const siteUrl = (runtimeConfig.public.siteUrl as string) || SITE_URL;

    const isNativeShareSupported = computed(() => {
        if (import.meta.server) {
            return false;
        }
        return typeof navigator !== 'undefined' && !!navigator.share;
    });

    /**
     * 퀴즈 공유 URL 생성
     */
    function buildQuizUrl(quizId: string): string {
        return `${siteUrl}/quiz/${quizId}`;
    }

    /**
     * 공유 성공 시 포인트 지급 (1일 3회 제한)
     */
    async function claimShareReward(quizId: string): Promise<void> {
        const pointStore = usePointStore();
        const result = await pointStore.awardSharePoints(quizId);

        if (result.success) {
            ToastMessage.success(result.message);
        }
        // 실패(한도 초과)는 무음 처리 — 공유 자체는 성공이므로
    }

    /**
     * 퀴즈 공유 (네이티브 → 폴백)
     */
    async function shareQuiz(data: QuizShareData): Promise<boolean> {
        const url = buildQuizUrl(data.quizId);
        const shareData: ShareData = {
            title: `${data.title} - 고고퀴즈킹`,
            text: data.description || '이 퀴즈에 도전해보세요! 🎯',
            url,
        };

        if (isNativeShareSupported.value) {
            const success = await nativeShare(shareData);
            if (success) {
                await claimShareReward(data.quizId);
            }
            return success;
        }

        // 데스크탑 폴백: 클립보드 복사
        return copyToClipboard(data.quizId);
    }

    /**
     * 퀴즈 결과 공유
     */
    async function shareResult(data: QuizResultShareData): Promise<boolean> {
        const url = buildQuizUrl(data.quizId);
        const text = `🎯 "${data.title}" 퀴즈에서 ${data.totalQuestions}문제 중 ${data.score}문제를 맞췄어요! 도전해보세요!`;

        const shareData: ShareData = {
            title: `퀴즈 결과 - 고고퀴즈킹`,
            text,
            url,
        };

        if (isNativeShareSupported.value) {
            const success = await nativeShare(shareData);
            if (success) {
                await claimShareReward(data.quizId);
            }
            return success;
        }

        return copyToClipboard(data.quizId);
    }

    /**
     * OS 네이티브 공유 호출
     */
    async function nativeShare(data: ShareData): Promise<boolean> {
        try {
            await navigator.share(data);
            return true;
        } catch (e) {
            // 사용자가 공유 취소한 경우 무시
            if (e instanceof Error && e.name === 'AbortError') {
                return false;
            }
            ToastMessage.error('공유에 실패했습니다.');
            return false;
        }
    }

    /**
     * 클립보드에 URL 복사 (+ 포인트 지급)
     */
    async function copyToClipboard(quizId: string): Promise<boolean> {
        const url = buildQuizUrl(quizId);

        try {
            await navigator.clipboard.writeText(url);
            ToastMessage.success('링크가 복사되었습니다! 📋');
            await claimShareReward(quizId);
            return true;
        } catch {
            ToastMessage.error('링크 복사에 실패했습니다.');
            return false;
        }
    }

    /**
     * 카카오톡 공유 링크
     */
    function getKakaoShareUrl(quizId: string, title: string): string {
        const url = buildQuizUrl(quizId);
        const text = encodeURIComponent(`${title} - 이 퀴즈에 도전해보세요! 🎯`);
        return `https://sharer.kakao.com/talk/friends/picker/link?url=${encodeURIComponent(url)}&text=${text}`;
    }

    /**
     * X(Twitter) 공유 링크
     */
    function getTwitterShareUrl(quizId: string, title: string): string {
        const url = buildQuizUrl(quizId);
        const text = encodeURIComponent(`${title} - 이 퀴즈에 도전해보세요! 🎯 #고고퀴즈킹 #퀴즈`);
        return `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`;
    }

    return {
        isNativeShareSupported,
        shareQuiz,
        shareResult,
        copyToClipboard,
        getKakaoShareUrl,
        getTwitterShareUrl,
        claimShareReward,
    };
}

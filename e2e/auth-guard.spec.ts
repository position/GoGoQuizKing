import { test, expect } from '@playwright/test';

test.describe('인증 가드 (Auth Guard)', () => {
    test('비로그인 상태에서 퀴즈 목록 접근 시 로그인으로 리다이렉트', async ({ page }) => {
        await page.goto('/quiz/quiz-list');
        await page.waitForURL(/\/login/);
        await expect(page).toHaveURL(/\/login.*redirectUrl/);
    });

    test('비로그인 상태에서 랭킹 접근 시 로그인으로 리다이렉트', async ({ page }) => {
        await page.goto('/ranking');
        await page.waitForURL(/\/login/);
        await expect(page).toHaveURL(/\/login/);
    });

    test('비로그인 상태에서 배틀 로비 접근 시 로그인으로 리다이렉트', async ({ page }) => {
        await page.goto('/battle/lobby');
        await page.waitForURL(/\/login/);
        await expect(page).toHaveURL(/\/login/);
    });

    test('비로그인 상태에서 프로필 접근 시 로그인으로 리다이렉트', async ({ page }) => {
        await page.goto('/profile');
        await page.waitForURL(/\/login/);
        await expect(page).toHaveURL(/\/login/);
    });

    test('Public 경로는 인증 없이 접근 가능 - 로그인 페이지', async ({ page }) => {
        await page.goto('/login');
        await expect(page).toHaveURL(/\/login$/);
        // 로그인 페이지에 머물러야 함 (리다이렉트 없음)
        const loginCard = page.locator('.login-card');
        await expect(loginCard).toBeVisible();
    });

    test('Public 경로는 인증 없이 접근 가능 - 공지사항', async ({ page }) => {
        await page.goto('/notice/notice-list');
        await expect(page).toHaveURL(/\/notice\/notice-list/);
    });
});


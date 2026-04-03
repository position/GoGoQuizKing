import { test, expect } from '@playwright/test';

test.describe('홈페이지 (비로그인 → 로그인 리다이렉트)', () => {
    test('비로그인 상태에서 홈 접근 시 로그인 페이지로 리다이렉트된다', async ({ page }) => {
        await page.goto('/');
        await page.waitForURL(/\/login/);
        await expect(page).toHaveURL(/\/login/);
    });

    test('리다이렉트된 로그인 페이지에 redirectUrl 파라미터가 포함된다', async ({ page }) => {
        await page.goto('/');
        await page.waitForURL(/\/login/);
        await expect(page).toHaveURL(/redirectUrl/);
    });

    test('리다이렉트된 로그인 페이지가 올바르게 렌더링된다', async ({ page }) => {
        await page.goto('/');
        await page.waitForURL(/\/login/);

        // 로그인 카드가 보여야 함
        const loginCard = page.locator('.login-card');
        await expect(loginCard).toBeVisible();

        // 카카오 로그인 버튼
        const kakaoBtn = page.locator('.kakao-login-btn');
        await expect(kakaoBtn).toBeVisible();
    });

    test('페이지 타이틀이 올바르게 표시된다', async ({ page }) => {
        await page.goto('/');
        await page.waitForURL(/\/login/);
        await expect(page).toHaveTitle(/고고퀴즈킹|GoGo QuizKing|로그인/);
    });
});

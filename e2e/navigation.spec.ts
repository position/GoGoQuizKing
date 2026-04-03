import { test, expect } from '@playwright/test';

test.describe('네비게이션', () => {
    test('인증 필요 페이지 접근 시 로그인으로 리다이렉트', async ({ page }) => {
        // 비로그인 상태에서 퀴즈 목록 접근
        await page.goto('/quiz/quiz-list');
        await page.waitForURL(/\/login/);
        await expect(page).toHaveURL(/\/login.*redirectUrl/);
    });

    test('로그인 페이지에서 뒤로가기 시 이전 페이지로 돌아감', async ({ page }) => {
        // 공지사항(public) → 로그인 → 뒤로가기
        await page.goto('/notice/notice-list');
        await page.goto('/login');
        await page.goBack();
        await expect(page).toHaveURL(/\/notice\/notice-list/);
    });
});

test.describe('반응형 디자인', () => {
    test('모바일 뷰포트에서 로그인 페이지가 올바르게 표시된다', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/login');

        // 로그인 카드가 보여야 함
        const loginCard = page.locator('.login-card');
        await expect(loginCard).toBeVisible();

        // 카카오 로그인 버튼
        const kakaoBtn = page.locator('.kakao-login-btn');
        await expect(kakaoBtn).toBeVisible();
    });

    test('태블릿 뷰포트에서 로그인 페이지가 올바르게 표시된다', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.goto('/login');

        const loginCard = page.locator('.login-card');
        await expect(loginCard).toBeVisible();
    });

    test('모바일 뷰포트에서 공지사항 페이지가 올바르게 표시된다', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/notice/notice-list');

        const noticePage = page.locator('.notice-list-page');
        await expect(noticePage).toBeVisible();
    });
});

test.describe('접근성 (a11y)', () => {
    test('로그인 페이지 이미지에 alt 속성이 있다', async ({ page }) => {
        await page.goto('/login');

        const images = page.locator('.login-card img');
        const count = await images.count();

        for (let i = 0; i < count; i++) {
            const img = images.nth(i);
            const alt = await img.getAttribute('alt');
            expect(alt).toBeTruthy();
        }
    });

    test('공지사항 페이지가 접근 가능하다', async ({ page }) => {
        await page.goto('/notice/notice-list');
        // 페이지가 정상 로드되어야 함
        const noticePage = page.locator('.notice-list-page');
        await expect(noticePage).toBeVisible();
    });
});

import { test, expect } from '@playwright/test';

test.describe('공지사항 목록 페이지 (Public)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/notice/notice-list');
    });

    test('공지사항 페이지가 렌더링된다', async ({ page }) => {
        const noticePage = page.locator('.notice-list-page');
        await expect(noticePage).toBeVisible();
    });

    test('SEO 메타 태그가 올바르게 설정된다', async ({ page }) => {
        await expect(page).toHaveTitle(/공지사항.*고고퀴즈킹/);
    });
});


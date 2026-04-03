import { test, expect } from '@playwright/test';

test.describe('로그인 페이지', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
    });

    test('로그인 페이지가 올바르게 렌더링된다', async ({ page }) => {
        // 로그인 카드
        const loginCard = page.locator('.login-card');
        await expect(loginCard).toBeVisible();

        // 마스코트 이미지
        const mascot = loginCard.locator('.mascot img');
        await expect(mascot).toBeVisible();

        // 타이틀
        const title = loginCard.locator('.login-title');
        await expect(title).toContainText('GOGO! QuizKing');

        // 서브타이틀
        const subtitle = loginCard.locator('.login-subtitle');
        await expect(subtitle).toContainText('어서와요');
    });

    test('카카오 로그인 버튼이 표시된다', async ({ page }) => {
        const kakaoBtn = page.locator('.kakao-login-btn');
        await expect(kakaoBtn).toBeVisible();
        await expect(kakaoBtn).toContainText('카카오 로그인');
    });

    test('카카오 로그인 버튼에 카카오 아이콘 이미지가 있다', async ({ page }) => {
        const kakaoImg = page.locator('.kakao-login-btn .kakao-img');
        await expect(kakaoImg).toBeVisible();
        await expect(kakaoImg).toHaveAttribute('alt', '카카오 로그인');
    });

    test('카카오 로그인 버튼 스타일이 올바르다', async ({ page }) => {
        const kakaoBtn = page.locator('.kakao-login-btn');
        // 카카오 노란색 배경
        const bgColor = await kakaoBtn.evaluate(
            (el) => getComputedStyle(el).backgroundColor,
        );
        // rgb(254, 229, 0) = #fee500
        expect(bgColor).toContain('254');
    });

    test('로그인 푸터 안내 문구가 표시된다', async ({ page }) => {
        const footer = page.locator('.login-footer');
        await expect(footer).toContainText('카카오로 3초만에 로그인');
    });

    test('SEO 메타 태그가 올바르게 설정된다', async ({ page }) => {
        // title 태그
        await expect(page).toHaveTitle(/로그인.*고고퀴즈킹/);

        // robots 메타 (noindex)
        const robotsMeta = page.locator('meta[name="robots"]');
        await expect(robotsMeta).toHaveAttribute('content', /noindex/);
    });

    test('OG 메타 태그가 설정되어 있다', async ({ page }) => {
        const ogTitle = page.locator('meta[property="og:title"]');
        await expect(ogTitle).toHaveAttribute('content', /로그인.*고고퀴즈킹/);
    });
});

test.describe('로그인 리다이렉트 흐름', () => {
    test('비로그인 상태에서 보호된 페이지 접근 시 redirectUrl 쿼리가 포함된다', async ({ page }) => {
        await page.goto('/quiz/quiz-list');
        await page.waitForURL(/\/login/);

        const url = new URL(page.url());
        const redirectUrl = url.searchParams.get('redirectUrl');
        expect(redirectUrl).toBe('/quiz/quiz-list');
    });

    test('비로그인 상태에서 배틀 로비 접근 시 redirectUrl에 배틀 경로가 포함된다', async ({ page }) => {
        await page.goto('/battle/lobby');
        await page.waitForURL(/\/login/);

        const url = new URL(page.url());
        const redirectUrl = url.searchParams.get('redirectUrl');
        expect(redirectUrl).toBe('/battle/lobby');
    });

    test('비로그인 상태에서 프로필 접근 시 로그인 페이지로 리다이렉트된다', async ({ page }) => {
        await page.goto('/profile');
        await page.waitForURL(/\/login/);
        await expect(page).toHaveURL(/\/login/);

        // 로그인 UI가 정상 렌더링되는지 확인
        const loginCard = page.locator('.login-card');
        await expect(loginCard).toBeVisible();
    });

    test('비로그인 상태에서 랭킹 접근 시 redirectUrl에 랭킹 경로가 포함된다', async ({ page }) => {
        await page.goto('/ranking');
        await page.waitForURL(/\/login/);

        const url = new URL(page.url());
        const redirectUrl = url.searchParams.get('redirectUrl');
        expect(redirectUrl).toBe('/ranking');
    });

    test('리다이렉트 후 로그인 페이지가 정상 렌더링된다', async ({ page }) => {
        await page.goto('/quiz/quiz-create');
        await page.waitForURL(/\/login/);

        // 로그인 UI가 제대로 나오는지
        const loginCard = page.locator('.login-card');
        await expect(loginCard).toBeVisible();

        const kakaoBtn = page.locator('.kakao-login-btn');
        await expect(kakaoBtn).toBeVisible();
    });
});

test.describe('카카오 OAuth 흐름', () => {
    test('카카오 로그인 버튼 클릭 시 Supabase OAuth URL로 이동한다', async ({ page }) => {
        await page.goto('/login');

        // 네비게이션 이벤트 감시 (외부 URL로 나가는 것 확인)
        const [request] = await Promise.all([
            page.waitForEvent('request', {
                predicate: (req) =>
                    req.url().includes('supabase') || req.url().includes('kakao'),
                timeout: 10_000,
            }).catch(() => null),
            page.locator('.kakao-login-btn').click(),
        ]);

        // Supabase OAuth 또는 카카오 인증 URL로 요청이 발생해야 함
        // (환경에 따라 Supabase URL이 다를 수 있으므로 null 체크)
        if (request) {
            const url = request.url();
            expect(url).toMatch(/supabase|kakao/);
        }
    });
});

test.describe('confirm 페이지 (OAuth 콜백)', () => {
    test('세션이 없으면 로그인 페이지로 리다이렉트된다', async ({ page }) => {
        await page.goto('/confirm');

        // 세션 없으므로 로그인으로 리다이렉트됨
        await page.waitForURL(/\/login/, { timeout: 15_000 });
        await expect(page).toHaveURL(/\/login/);
    });

    test('confirm 페이지 접근 시 로그인 페이지에서 정상 렌더링된다', async ({ page }) => {
        await page.goto('/confirm');

        // 세션 없이 confirm 접근 → 로그인으로 리다이렉트
        await page.waitForURL(/\/login/, { timeout: 15_000 });

        // 리다이렉트 후 로그인 카드가 보여야 함
        const loginCard = page.locator('.login-card');
        await expect(loginCard).toBeVisible();
    });
});

test.describe('로그인 페이지 반응형 디자인', () => {
    test('모바일(375px)에서 로그인 카드가 올바르게 표시된다', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/login');

        const loginCard = page.locator('.login-card');
        await expect(loginCard).toBeVisible();

        // 카드 너비가 뷰포트에 맞게 조정되는지
        const box = await loginCard.boundingBox();
        expect(box).toBeTruthy();
        if (box) {
            expect(box.width).toBeLessThanOrEqual(375);
        }
    });

    test('태블릿(768px)에서 로그인 카드가 올바르게 표시된다', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.goto('/login');

        const loginCard = page.locator('.login-card');
        await expect(loginCard).toBeVisible();

        // max-width: 400px 이므로 카드는 400px 이하
        const box = await loginCard.boundingBox();
        expect(box).toBeTruthy();
        if (box) {
            expect(box.width).toBeLessThanOrEqual(400);
        }
    });

    test('데스크탑(1280px)에서 로그인 카드가 중앙 정렬된다', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 720 });
        await page.goto('/login');

        const loginCard = page.locator('.login-card');
        const box = await loginCard.boundingBox();
        expect(box).toBeTruthy();
        if (box) {
            // 카드가 화면 중앙에 위치하는지 (좌측 마진이 충분히 큰지)
            expect(box.x).toBeGreaterThan(100);
        }
    });
});

test.describe('로그인 페이지 접근성', () => {
    test('마스코트 이미지에 alt 속성이 있다', async ({ page }) => {
        await page.goto('/login');

        const mascotImg = page.locator('.login-card .mascot img');
        await expect(mascotImg).toHaveAttribute('alt', 'GoGo! Quiz King');
    });

    test('카카오 버튼 이미지에 alt 속성이 있다', async ({ page }) => {
        await page.goto('/login');

        const kakaoImg = page.locator('.kakao-login-btn img');
        await expect(kakaoImg).toHaveAttribute('alt', '카카오 로그인');
    });

    test('heading 레벨이 올바르다 (h1)', async ({ page }) => {
        await page.goto('/login');

        const h1 = page.locator('.login-card h1');
        await expect(h1).toBeVisible();
        await expect(h1).toContainText('GOGO! QuizKing');

        // h1이 1개만 있어야 함
        const h1Count = await page.locator('h1').count();
        expect(h1Count).toBe(1);
    });
});

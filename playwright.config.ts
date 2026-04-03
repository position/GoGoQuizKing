import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E 테스트 설정
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    testDir: './e2e',
    /* 테스트 타임아웃 (30초) */
    timeout: 30_000,
    /* Assertion 타임아웃 */
    expect: {
        timeout: 10_000,
    },
    /* 병렬 실행 */
    fullyParallel: true,
    /* CI에서만 재시도 */
    retries: process.env.CI ? 2 : 0,
    /* CI에서는 워커 제한 */
    workers: process.env.CI ? 1 : undefined,
    /* 리포터 설정 */
    reporter: [
        ['html', { open: 'never' }],
        ['list'],
    ],
    /* 공통 설정 */
    use: {
        /* 기본 URL */
        baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
        /* 실패 시 스크린샷 */
        screenshot: 'only-on-failure',
        /* 실패 시 트레이스 */
        trace: 'on-first-retry',
        /* 뷰포트 */
        viewport: { width: 1280, height: 720 },
    },
    /* 브라우저 프로젝트 */
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'mobile-chrome',
            use: { ...devices['Pixel 5'] },
        },
    ],
    /* 개발 서버 자동 시작 */
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
    },
});


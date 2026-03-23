import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
    test: {
        globals: true,
        environment: 'happy-dom',
        include: ['**/__tests__/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            include: ['models/**', 'helper/**', 'store/**', 'composables/**'],
        },
    },
    resolve: {
        alias: {
            '~': resolve(__dirname, '.'),
            '@': resolve(__dirname, '.'),
        },
    },
});


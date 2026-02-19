import { Platform } from 'quasar';

type ThemeMode = 'light' | 'dark' | 'system';

interface CommonStore {
    tempTitle: string;
    isMenuCollapse: boolean;
    serverTime: string;
    themeMode: ThemeMode;
}

export const useCommonStore = defineStore('common', {
    state: (): CommonStore => ({
        tempTitle: '',
        isMenuCollapse: false, // 기본값을 false로 변경 (닫힌 상태)
        serverTime: '',
        themeMode: 'light',
    }),
    getters: {
        isDarkMode(): boolean {
            if (this.themeMode === 'system') {
                if (typeof window !== 'undefined') {
                    return window.matchMedia('(prefers-color-scheme: dark)').matches;
                }
                return false;
            }
            return this.themeMode === 'dark';
        },
    },
    actions: {
        // Quasar Platform을 이용한 메뉴 상태 초기화
        initMenuState() {
            // 모바일/태블릿에서는 닫힌 상태, 데스크톱에서는 열린 상태
            this.isMenuCollapse = Platform.is.desktop;
        },
        setTheme(mode: ThemeMode) {
            this.themeMode = mode;
            this.applyTheme();
        },
        toggleTheme() {
            this.themeMode = this.isDarkMode ? 'light' : 'dark';
            this.applyTheme();
        },
        applyTheme() {
            if (typeof document !== 'undefined') {
                const isDark = this.isDarkMode;
                document.documentElement.classList.toggle('dark-mode', isDark);
                document.body.classList.toggle('body--dark', isDark);
                document.body.classList.toggle('body--light', !isDark);
            }
        },
        initTheme() {
            this.applyTheme();
            if (typeof window !== 'undefined' && this.themeMode === 'system') {
                window
                    .matchMedia('(prefers-color-scheme: dark)')
                    .addEventListener('change', () => this.applyTheme());
            }
        },
    },
    persist: {
        storage: piniaPluginPersistedstate.localStorage(),
        pick: ['tempTitle', 'themeMode'], // isMenuCollapse 제거 - 화면 크기에 따라 동적으로 설정
    },
});

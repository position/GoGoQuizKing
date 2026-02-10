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
        isMenuCollapse: true,
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
        paths: ['tempTitle', 'isMenuCollapse', 'themeMode'],
    },
});

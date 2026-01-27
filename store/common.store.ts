interface CommonStore {
    tempTitle: string;
    isMenuCollapse: boolean;
    serverTime: string;
}

export const useCommonStore = defineStore('common', {
    state: (): CommonStore => ({
        tempTitle: '',
        isMenuCollapse: true,
        serverTime: '',
    }),
    getters: {},
    actions: {},
    persist: {
        storage: piniaPluginPersistedstate.sessionStorage(),
        paths: ['tempTitle', 'isMenuCollapse'],
    },
});

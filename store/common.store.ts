import { defineStore } from 'pinia';
import dayjs from 'dayjs';

interface CommonStore {
    tempTitle: string;
    isMenuCollapse: boolean;
    serverTime: dayjs.Dayjs;
}

export const useCommonStore = defineStore('common', {
    state: (): CommonStore => ({
        tempTitle: '',
        isMenuCollapse: true,
        serverTime: dayjs.utc(),
    }),
    getters: {},
    actions: {},
    persist: {
        storage: sessionStorage,
        paths: ['tempTitle', 'isMenuCollapse'],
    },
});

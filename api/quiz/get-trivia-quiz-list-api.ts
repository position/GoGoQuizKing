import type { FetchOptions } from 'ofetch';

export default async function getTriviaQuizListApi(data: any, options?: FetchOptions) {
    const $api = useNuxtApp().$api;
    const config = useRuntimeConfig();

    return await $api<any>('/questions', {
        ...options,
        baseURL: config.public.triviaApi,
        method: 'GET',
        params: data,
    });
}

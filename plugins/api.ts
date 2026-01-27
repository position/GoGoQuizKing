import type { AvailableRouterMethod, NitroFetchOptions, NitroFetchRequest } from 'nitropack';
import { isDevelopment } from 'std-env';
import { useAuthStore } from '~/store/auth.store';

export type ApiAbortRef = Ref<undefined | (() => void)>;

export interface ApiOptions {
    forwardedForDev?: boolean;
    abort?: { ref: ApiAbortRef };
}

const FORWARDED_FOR_LOCALHOST = { 'X-Forwarded-For': 'localhost' };

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig();
    const authStore = useAuthStore();

    const api = $fetch.create({
        baseURL: config.public.triviaApi,
        timeout: Number(config.public.apiTimeout) || 10000,

        async onRequest({ options }) {
            if (authStore.accessToken) {
                options.headers = {
                    ...options.headers,
                    // Authorization: `Bearer ${authStore.accessToken}`,
                };
            }
        },
        // async onResponse({ response }) {},
    });

    const wrapApi = <
        T = unknown,
        R extends NitroFetchRequest = NitroFetchRequest,
        O extends NitroFetchOptions<R, AvailableRouterMethod<R>> = NitroFetchOptions<
            R,
            AvailableRouterMethod<R>
        >,
    >(
        request: R,
        opts?: O & ApiOptions,
    ): Promise<T> => {
        const { abort, ...newOpts } = { ...opts };

        if (abort) {
            const abortController = new AbortController();
            newOpts.signal = abortController.signal;
            abort.ref.value = () => abortController.abort('Cancel Api');
        }

        if (newOpts.forwardedForDev && isDevelopment) {
            newOpts.headers = {
                ...newOpts.headers,
                ...FORWARDED_FOR_LOCALHOST,
            };

            delete newOpts.forwardedForDev;
        }

        return api<T, R>(request, newOpts as O).catch(async (error) => {
            if (error.cause === 'Cancel Api') {
                return;
            }
            throw error?.data || error;
        });
    };

    return {
        provide: {
            api: wrapApi,
        },
    };
});

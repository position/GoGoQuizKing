import type { AvailableRouterMethod, NitroFetchOptions, NitroFetchRequest } from 'nitropack';
import { isDevelopment } from 'std-env';

export type ApiAbortRef = Ref<undefined | (() => void)>;

export interface ApiOptions {
    forwardedForDev?: boolean;
    abort?: { ref: ApiAbortRef };
}

const FORWARDED_FOR_LOCALHOST = { 'X-Forwarded-For': 'localhost' };

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig();
    const authStore = useAuthStore();
    const serverTimeStore = useServerTimeStore();
    const { $dayjs } = useNuxtApp();

    // [s] refresh
    let isRefreshing = false;
    let failedQueue: any[] = [];
    const processQueue = (error = null) => {
        failedQueue.forEach((prom) => {
            if (error) {
                prom.reject(error);
            } else {
                prom.resolve();
            }
        });

        failedQueue = [];
    };

    const callRefreshToken: any = (request: RequestInfo, requestOptions: any) => {
        const authStore = useAuthStore();
        delete requestOptions.onRequest;
        delete requestOptions.onResponse;
        delete requestOptions.onResponseError;

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then(async () => {
                    if (requestOptions) {
                        requestOptions.headers = {
                            ...requestOptions.headers,
                            Authorization: `Bearer ${authStore.accessToken}`,
                        };
                        return await useNuxtApp().$api(request, requestOptions);
                    }
                })
                .catch((err) => {
                    return Promise.reject(err);
                });
        }

        if (config) {
            config._retry = true;
        }
        isRefreshing = true;

        return new Promise(async (resolve, reject) => {
            try {
                await authStore.refresh();
                processQueue();

                if (requestOptions) {
                    requestOptions.headers = {
                        ...requestOptions.headers,
                        Authorization: `Bearer ${authStore.accessToken}`,
                    };
                    await useNuxtApp()
                        .$api(request, requestOptions)
                        .then((retryData) => {
                            resolve(retryData);
                        })
                        .catch((e) => {
                            reject(e);
                        });
                }
            } catch (err: any) {
                processQueue(err);
                reject(err.response.data);
                await authStore.logout();
            } finally {
                isRefreshing = false;
            }
        });
    };
    // [e] refresh

    const api = $fetch.create({
        baseURL: config.public.apiBase,
        timeout: config.public.apiTimeout,

        async onRequest({ options }) {
            if (authStore.accessToken) {
                options.headers = {
                    ...options.headers,
                    Authorization: `Bearer ${authStore.accessToken}`,
                };
            }
        },
        async onResponse({ response }) {
            if (import.meta.client) {
                const date = response.headers.get('date');
                if (!!date) {
                    serverTimeStore.setServerTime($dayjs.utc(date));
                }
            }
        },
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

            if (error.response && error.response.status === 401) {
                try {
                    return await callRefreshToken(request, newOpts);
                } catch (e) {
                    return Promise.reject(e);
                }
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

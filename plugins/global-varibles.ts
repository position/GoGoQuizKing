export default defineNuxtPlugin(() => {
    return {
        provide: {
            imgHost: useRuntimeConfig().public.cdnBase,
        },
    };
});

import { useAuthStore } from '~/store/auth.store';

export default defineNuxtRouteMiddleware(async (to, from) => {
    console.log(to);
    const authStore = useAuthStore();
});

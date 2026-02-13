<script setup lang="ts">
import { computed } from 'vue';
import { useCommonStore } from '~/store/common.store';

const commonStore = useCommonStore();
const isDarkMode = computed(() => commonStore.isDarkMode);
</script>

<template>
    <q-footer class="app-footer" :class="{ 'footer-dark': isDarkMode }" reveal elevated>
        <q-toolbar class="footer-toolbar">
            <q-toolbar-title class="footer-text">
                <span class="copyright">© {{ new Date().getFullYear() }} GoGoQuizKing</span>
                <span class="divider">|</span>
                <span class="rights">All rights reserved.</span>
            </q-toolbar-title>
        </q-toolbar>
    </q-footer>
</template>

<style scoped lang="scss">
.app-footer {
    background: linear-gradient(135deg, var(--color-primary) 0%, #e55a5a 100%);
    transition: background-color 0.3s ease;

    .footer-toolbar {
        min-height: 48px;
        padding: 0 16px;
    }

    .footer-text {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: 13px;
        color: rgba(255, 255, 255, 0.9);

        .divider {
            opacity: 0.5;
        }

        @media (max-width: 480px) {
            flex-direction: column;
            gap: 2px;

            .divider {
                display: none;
            }
        }
    }
}
</style>

<template>
    <q-header class="app-header" reveal elevated>
        <q-toolbar class="header-toolbar">
            <q-btn @click="onExpendedMenu" flat round dense icon="menu" class="menu-btn" />

            <div @click="goMain" class="brand-container cursor-pointer">
                <q-avatar size="36px" class="brand-avatar">
                    <q-icon name="fas fa-crown" size="20px" color="amber" />
                </q-avatar>
                <span class="brand-title">GOGO! QuizKing</span>
            </div>

            <q-space />

            <q-btn
                @click="toggleTheme"
                flat
                round
                dense
                :icon="isDarkMode ? 'light_mode' : 'dark_mode'"
                class="theme-toggle-btn"
            >
                <q-tooltip>{{ isDarkMode ? '라이트 모드' : '다크 모드' }}</q-tooltip>
            </q-btn>
        </q-toolbar>
    </q-header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCommonStore } from '~/store/common.store';

const commonStore = useCommonStore();
const router = useRouter();

const isDarkMode = computed(() => commonStore.isDarkMode);

function onExpendedMenu() {
    commonStore.isMenuCollapse = !commonStore.isMenuCollapse;
}

function goMain() {
    router.push({ path: '/' });
}

function toggleTheme() {
    commonStore.toggleTheme();
}
</script>

<style scoped lang="scss">
.app-header {
    background: linear-gradient(135deg, var(--color-primary) 0%, #e55a5a 100%);

    .header-toolbar {
        min-height: 56px;
        padding: 0 12px;
    }

    .menu-btn {
        color: white;
    }

    .brand-container {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-left: 8px;

        .brand-avatar {
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
        }

        .brand-title {
            font-size: 18px;
            font-weight: 700;
            color: white;
            letter-spacing: -0.5px;

            @media (max-width: 480px) {
                display: none;
            }
        }
    }

    .theme-toggle-btn {
        color: white;
        transition: transform 0.3s ease;

        &:hover {
            transform: rotate(15deg);
        }
    }
}
</style>

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
                <q-tooltip
                    ><span class="text-no-wrap">{{
                        isDarkMode ? '☀️ 밝게!' : '🌙 어둡게!'
                    }}</span></q-tooltip
                >
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
    height: 56px; // CLS 방지 - 고정 높이

    .header-toolbar {
        height: 56px;
        min-height: 56px;
        max-height: 56px;
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
            font-size: 22px;
            font-weight: 700;
            font-family: 'Fredoka', sans-serif;
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

    .profile-btn {
        margin-left: 4px;

        .profile-avatar {
            border: 2px solid rgba(255, 255, 255, 0.4);
            background: rgba(255, 255, 255, 0.2);
            transition: border-color 0.2s;
        }

        &:hover .profile-avatar {
            border-color: rgba(255, 255, 255, 0.8);
        }
    }
}
</style>

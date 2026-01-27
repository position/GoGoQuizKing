<script setup lang="ts">
import { router } from '@/router';
import { useCommonStore } from '@/store/common.store.ts';

const commonStore = useCommonStore();

function onExpendedMenu() {
    commonStore.isMenuCollapse = !commonStore.isMenuCollapse;
}

function goMain() {
    router.push({ name: 'main' });
}
</script>

<template>
    <q-header reveal elevated>
        <q-toolbar>
            <q-btn @click="onExpendedMenu" flat round dense icon="menu" class="q-mr-sm" />
            <q-avatar @click="goMain" class="cursor-pointer">
                <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg" alt="고고 퀴즈왕" loading="lazy" />
            </q-avatar>
            <q-toolbar-title @click="goMain" class="cursor-pointer">Quasar Framework</q-toolbar-title>
        </q-toolbar>
    </q-header>
</template>

<style scoped lang="scss"></style>

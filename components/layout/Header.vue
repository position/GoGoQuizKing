<template>
    <q-header reveal elevated>
        <q-toolbar>
            <q-btn @click="onExpendedMenu" flat round dense icon="menu" class="q-mr-sm" />
            <q-avatar @click="goMain" class="cursor-pointer">
                <q-icon name="fas fa-crown" size="25px" />
            </q-avatar>
            <q-toolbar-title @click="goMain" class="cursor-pointer">GOGO! QuizKing</q-toolbar-title>
        </q-toolbar>
    </q-header>
</template>

<script setup lang="ts">
import { useCommonStore } from '~/store/common.store';

const commonStore = useCommonStore();
const router = useRouter();

function onExpendedMenu() {
    commonStore.isMenuCollapse = !commonStore.isMenuCollapse;
}

function goMain() {
    router.push({ path: '/' });
}
</script>

<style scoped lang="scss"></style>

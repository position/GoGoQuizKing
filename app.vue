<template>
    <NuxtLayout>
        <q-layout view="lHh lpr lFf" container class="quiz-container">
            <Header />
            <Navbar />
            <q-page-container>
                <q-page class="q-pa-md main-page">
                    <NuxtPage />
                </q-page>
            </q-page-container>
            <Footer />
        </q-layout>
    </NuxtLayout>
</template>

<script setup lang="ts">
import Header from '@/components/layout/Header.vue';
import Footer from '@/components/layout/Footer.vue';
import Navbar from '@/components/layout/Navbar.vue';
</script>

<style scoped>
.quiz-container {
    height: 100%;
    background-color: var(--bg-primary);
    transition: background-color 0.3s ease;
}

.main-page {
    background-color: var(--bg-primary);
    transition: background-color 0.3s ease;
}
</style>

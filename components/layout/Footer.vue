<script setup lang="ts">
window.onerror = function (message, source, lineno, colno, error) {
    console.error('Global error:', { message, source, lineno, colno, error });
};
</script>

<template>
    <q-footer reveal elevated>
        <q-toolbar>
            <q-toolbar-title class="address">&copy; 2024 gogoquizking.net All rights reserved.</q-toolbar-title>
        </q-toolbar>
    </q-footer>
</template>

<style scoped lang="scss">
.address {
    font-size: 1em;
    text-align: center;
}
</style>

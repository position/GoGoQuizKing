<script setup lang="ts">
const props = withDefaults(defineProps<{ loading?: boolean; disabled?: boolean }>(), {
    loading: false,
    disabled: false,
});
const emit = defineEmits<{ (e: 'submit', content: string): void }>();
const content = ref('');

function submit() {
    const value = content.value.trim();
    if (!value || props.disabled || props.loading) return;
    emit('submit', value);
}

function reset() {
    content.value = '';
}

defineExpose({ reset });
</script>

<template>
    <form class="guestbook-form" @submit.prevent="submit">
        <q-input
            v-model="content"
            type="textarea"
            outlined
            autogrow
            maxlength="300"
            counter
            :disable="disabled"
            placeholder="따뜻한 인사를 남겨보세요."
            aria-label="방명록 내용"
        />
        <q-btn
            type="submit"
            color="primary"
            unelevated
            no-caps
            label="방명록 남기기"
            icon="edit_note"
            :loading="loading"
            :disable="disabled || !content.trim()"
            class="submit-btn"
        />
    </form>
</template>

<style scoped lang="scss">
.guestbook-form {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
    gap: 12px;

    .submit-btn {
        min-height: 48px;
        border-radius: 12px;
    }
}
@media (max-width: 600px) {
    .guestbook-form {
        grid-template-columns: 1fr;
    }
    .submit-btn {
        width: 100%;
    }
}
</style>

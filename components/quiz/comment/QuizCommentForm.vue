<script setup lang="ts">
interface Props {
    quizId: string;
    parentId?: string;
    placeholder?: string;
    submitLabel?: string;
    initialContent?: string;
    isEdit?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    placeholder: '댓글을 입력하세요...',
    submitLabel: '등록',
    initialContent: '',
    isEdit: false,
});

const emit = defineEmits<{
    (e: 'submit', content: string): void;
    (e: 'cancel'): void;
}>();

const content = ref(props.initialContent);
const isSubmitting = ref(false);

const isValid = computed(() => {
    return content.value.trim().length > 0;
});

async function handleSubmit() {
    if (!isValid.value || isSubmitting.value) {
        return;
    }

    isSubmitting.value = true;
    try {
        emit('submit', content.value.trim());
        if (!props.isEdit) {
            content.value = '';
        }
    } finally {
        isSubmitting.value = false;
    }
}

function handleCancel() {
    content.value = '';
    emit('cancel');
}

// 초기값이 변경될 때 업데이트
watch(
    () => props.initialContent,
    (newVal) => {
        content.value = newVal;
    },
);
</script>

<template>
    <div class="quiz-comment-form">
        <q-input
            v-model="content"
            type="textarea"
            :placeholder="placeholder"
            outlined
            autogrow
            :max-height="150"
            class="comment-input"
            @keydown.ctrl.enter="handleSubmit"
            @keydown.meta.enter="handleSubmit"
        >
            <template #hint>
                <span class="hint-text">Ctrl + Enter로 빠르게 등록</span>
            </template>
        </q-input>

        <div class="form-actions">
            <q-btn
                v-if="isEdit || parentId"
                flat
                no-caps
                color="grey-7"
                label="취소"
                @click="handleCancel"
            />
            <q-btn
                unelevated
                no-caps
                color="primary"
                :label="submitLabel"
                :loading="isSubmitting"
                :disable="!isValid"
                @click="handleSubmit"
            />
        </div>
    </div>
</template>

<style scoped lang="scss">
.quiz-comment-form {
    background: var(--bg-card);
    border-radius: 12px;
    padding: 12px;
    box-shadow: 0 1px 3px var(--shadow-color);

    .comment-input {
        :deep(.q-field__control) {
            border-radius: 8px;
        }

        .hint-text {
            color: var(--text-light);
            font-size: 12px;
        }
    }

    .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 8px;
    }
}
</style>

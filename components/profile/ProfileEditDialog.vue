<template>
    <q-dialog v-model="dialogModel" persistent>
        <q-card class="profile-edit-dialog">
            <q-card-section class="dialog-header">
                <div class="text-h6">프로필 수정</div>
                <q-btn flat round dense icon="close" @click="closeDialog" />
            </q-card-section>

            <q-card-section class="dialog-content">
                <!-- 아바타 수정 -->
                <div class="avatar-edit">
                    <q-avatar size="80px" class="edit-avatar">
                        <img v-if="formData.avatar_url" :src="formData.avatar_url" alt="프로필" />
                        <q-icon v-else name="person" size="40px" color="grey-5" />
                    </q-avatar>
                    <q-input
                        v-model="formData.avatar_url"
                        label="아바타 URL"
                        outlined
                        dense
                        class="avatar-url-input"
                        placeholder="https://example.com/avatar.jpg"
                    />
                </div>

                <!-- 이름 -->
                <q-input
                    v-model="formData.full_name"
                    label="이름"
                    outlined
                    class="form-input"
                    :rules="[(val) => !val || val.length <= 50 || '50자 이하로 입력해주세요']"
                />

                <!-- 사용자 이름 -->
                <q-input
                    v-model="formData.preferred_username"
                    label="사용자 이름"
                    outlined
                    class="form-input"
                    :rules="[(val) => !val || val.length <= 30 || '30자 이하로 입력해주세요']"
                >
                    <template v-slot:prepend>
                        <span class="username-prefix">@</span>
                    </template>
                </q-input>
            </q-card-section>

            <q-card-actions class="dialog-actions">
                <q-btn flat label="취소" color="grey" @click="closeDialog" />
                <q-btn
                    unelevated
                    label="저장"
                    color="primary"
                    :loading="isLoading"
                    @click="handleSave"
                />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useAuthStore } from '@/store/auth.store';
import { useStatsStore } from '@/store/stats.store';
import type { ProfileUpdateData } from '@/models/stats';

interface Props {
    modelValue: boolean;
}

interface Emits {
    (e: 'update:modelValue', value: boolean): void;
    (e: 'updated'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const authStore = useAuthStore();
const statsStore = useStatsStore();

const isLoading = ref(false);
const formData = ref<ProfileUpdateData>({
    full_name: '',
    preferred_username: '',
    avatar_url: '',
});

const dialogModel = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
});

watch(
    () => props.modelValue,
    (newVal) => {
        if (newVal) {
            // 다이얼로그 열릴 때 현재 값으로 초기화
            formData.value = {
                full_name: authStore.userInfo.full_name || '',
                preferred_username: authStore.userInfo.preferred_username || '',
                avatar_url: authStore.userInfo.avatar_url || '',
            };
        }
    },
);

function closeDialog() {
    dialogModel.value = false;
}

async function handleSave() {
    isLoading.value = true;
    try {
        const success = await statsStore.updateProfile(formData.value);
        if (success) {
            // auth store 업데이트
            authStore.userInfo.full_name = formData.value.full_name || null;
            authStore.userInfo.preferred_username = formData.value.preferred_username || null;
            authStore.userInfo.avatar_url = formData.value.avatar_url || null;

            emit('updated');
            closeDialog();
        }
    } finally {
        isLoading.value = false;
    }
}
</script>

<style scoped lang="scss">
.profile-edit-dialog {
    width: 100%;
    max-width: 420px;
    border-radius: 16px;
    background: var(--bg-card);
}

.dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 0;

    .text-h6 {
        font-weight: 700;
    }
}

.dialog-content {
    .avatar-edit {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        margin-bottom: 24px;

        .edit-avatar {
            border: 2px solid var(--border-color);
            background: var(--bg-surface);
        }

        .avatar-url-input {
            width: 100%;
        }
    }

    .form-input {
        margin-bottom: 16px;
    }

    .username-prefix {
        color: var(--text-secondary);
        font-weight: 500;
    }
}

.dialog-actions {
    padding: 16px;
    justify-content: flex-end;
    gap: 8px;
}
</style>

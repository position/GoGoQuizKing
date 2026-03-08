<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ToastMessage } from '~/helper/message';
import { useRoute } from 'vue-router';
import type { Database } from '~/models/database.types';

const noticeForm = reactive({ title: '', body: '' });
const route = useRoute();
const router = useRouter();
const isEdit = ref(route.name === 'edit-notice');
const supabase = useSupabaseClient<Database>();
const user = useSupabaseUser();

onMounted(async () => {
    if (isEdit.value) {
        await getNoticeDetail();
    }
});

async function getNoticeDetail() {
    try {
        const { data, error } = await supabase
            .from('notice')
            .select('*')
            .eq('id', Number(route.params.id))
            .single();

        if (error) {
            throw error;
        }

        if (data) {
            Object.assign(noticeForm, data);
        }
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : '데이터를 불러오는데 실패했습니다.';
        ToastMessage.error(errorMessage);
    }
}

async function updateNotice() {
    try {
        if (isEdit.value) {
            const payload = { title: noticeForm.title, body: noticeForm.body };
            await supabase
                .from('notice')
                .update(payload)
                .eq('id', Number(route.params.id))
                .throwOnError();

            ToastMessage.success('수정이 완료 되었습니다!');
            await router.push({ path: './notice-list' });
            return;
        }

        const payload = { title: noticeForm.title, body: noticeForm.body, user_id: user.value?.id };
        await supabase.from('notice').insert(payload).select().throwOnError();

        ToastMessage.success('공지사항이 작성 되었습니다!');
        await router.push({ path: './notice-list' });
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : '저장에 실패했습니다.';
        ToastMessage.error(errorMessage);
    }
}
</script>

<template>
    <q-card class="create-notice-form">
        <q-card-section>
            <div class="text-h6">공지사항 쓰기</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
            <dl class="input-area">
                <dt class="label">제목</dt>
                <dd class="value">
                    <q-input
                        v-model="noticeForm.title"
                        type="text"
                        label="제목을 작성하세요!"
                        outlined
                        dense
                        hide-bottom-space
                    />
                </dd>
            </dl>
            <dl class="input-area editor-area">
                <dt class="label">내용</dt>
                <dd class="value">
                    <q-editor
                        v-model="noticeForm.body"
                        placeholder="내용을 작성하세요!"
                        min-height="10rem"
                        :toolbar="[
                            ['bold', 'italic', 'underline', 'strike'],
                            ['quote', 'unordered', 'ordered'],
                            ['link'],
                            ['undo', 'redo'],
                            ['viewsource'],
                        ]"
                    />
                </dd>
            </dl>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
            <q-btn
                to="./notice-list"
                label="취소"
                color="grey"
                size="lg"
                style="min-width: 150px"
            />
            <q-btn
                @click="updateNotice"
                :label="isEdit ? '수정완료' : '작성완료'"
                color="primary"
                size="lg"
                style="min-width: 150px"
            />
        </q-card-actions>
    </q-card>
</template>

<style scoped lang="scss">
.create-notice-form {
    background: var(--bg-card);
    border-radius: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    .text-h6 {
        color: var(--text-primary);
        font-weight: 600;
    }

    .input-area {
        display: flex;
        align-items: center;
        margin-top: 16px;
        margin-bottom: 0;

        .label {
            width: 60px;
            font-weight: 500;
            color: var(--text-secondary);
        }

        .value {
            flex: 1;

            :deep(.q-field) {
                .q-field__control {
                    background: var(--bg-input);
                    border-radius: 8px;
                }

                .q-field__label {
                    color: var(--text-light);
                }

                .q-field__native {
                    color: var(--text-primary);
                }
            }
        }

        &.editor-area {
            align-items: flex-start;

            .label {
                margin-top: 12px;
            }

            .value {
                :deep(.q-editor) {
                    background: var(--bg-input);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;

                    .q-editor__toolbar {
                        background: var(--bg-secondary);
                        border-bottom: 1px solid var(--border-color);
                    }

                    .q-editor__content {
                        color: var(--text-primary);
                        min-height: 200px;
                    }

                    .q-btn {
                        color: var(--text-secondary);
                    }
                }
            }
        }
    }

    :deep(.q-card-actions) {
        border-top: 1px solid var(--border-color);
        padding-top: 16px;

        .q-btn {
            border-radius: 8px;
            font-weight: 600;
        }
    }
}

// 다크모드 대응
.body--dark {
    .create-notice-form {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

        :deep(.q-editor) {
            .q-editor__toolbar {
                .q-btn {
                    color: var(--text-primary);

                    &:hover {
                        background: rgba(255, 255, 255, 0.1);
                    }
                }
            }
        }
    }
}
</style>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ToastMessage } from '~/helper/message';
import { useRoute } from 'vue-router';

const noticeForm = reactive({ title: '', body: '' });
const route = useRoute();
const router = useRouter();
const isEdit = ref(route.name === 'edit-notice');
const supabase = useSupabaseClient();
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
        Object.assign(noticeForm, data);
    } catch (e) {
        console.error(e);
        ToastMessage.error(e);
    }
}

async function updateNotice() {
    try {
        if (isEdit.value) {
            const payload = { title: noticeForm.title, body: noticeForm.body };
            const { data, error } = await supabase
                .from('notice')
                .update(payload)
                .eq('id', Number(route.params.id))
                .throwOnError();
            ToastMessage.success('수정이 완료 되었습니다!');
            await router.push({ path: './notice-list' });
            return;
        }
        const payload = { title: noticeForm.title, body: noticeForm.body, user_id: user.value?.id };
        const { data, error } = await supabase
            .from('notice')
            .insert([payload])
            .select()
            .throwOnError();
        ToastMessage.success('공지사항이 작성 되었습니다!');
        await router.push({ path: './notice-list' });
    } catch (e) {
        console.error(e);
        ToastMessage.error(e);
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
            <dl class="input-area">
                <dt class="label">내용</dt>
                <dd class="value">
                    <q-input
                        v-model="noticeForm.body"
                        type="textarea"
                        label="내용을 작성하세요!"
                        input-style="height: 150px; resize: none"
                        outlined
                        dense
                        hide-bottom-space
                    />
                </dd>
            </dl>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
            <q-btn to="./notice-list" label="취소" color="gray" size="lg" />
            <q-btn
                @click="updateNotice"
                :label="isEdit ? '수정완료' : '작성완료'"
                color="primary"
                size="lg"
            />
        </q-card-actions>
    </q-card>
</template>

<style scoped lang="scss">
.create-notice-form {
    .input-area {
        display: flex;
        align-items: center;
        margin-top: 10px;

        > .label {
            width: 60px;
        }

        > .value {
            flex: 1 0;
        }
    }
}
</style>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ToastMessage } from '~/helper/message';
import dayjs from 'dayjs';
import { useRoute } from 'vue-router';
import { useRouter } from '#vue-router';
import type { NoticeInfo } from '~/models/notice';
import NoticeCommentList from '~/components/notice/NoticeCommentList.vue';

const route = useRoute();
const router = useRouter();
const noticeId = Number(route.params.id);
const noticeForm = reactive({ title: '', body: '' });
const isLoadingPage = ref(false);
const noticeDetail = ref<NoticeInfo>({} as NoticeInfo);
const supabase = useSupabaseClient();
const props = defineProps<{
    isEdit?: boolean;
}>();

onMounted(async () => {
    await getNoticeDetail();
});

async function getNoticeDetail() {
    try {
        isLoadingPage.value = true;
        const { data, error } = await supabase
            .from('notice')
            .select('*')
            .eq('id', noticeId)
            .single();
        Object.assign(noticeDetail.value, data);
        noticeDetail.value.body = noticeDetail.value.body.replace(/(?:\r\n|\r|\n)/g, '<br>');
        if (props.isEdit) {
            noticeForm.title = noticeDetail.value.title;
            noticeForm.body = noticeDetail.value.body;
        }
    } catch (e) {
        console.error(e);
        ToastMessage.error(e);
    } finally {
        isLoadingPage.value = false;
    }
}

async function editNotice() {
    try {
        const payload = {
            title: noticeForm.title,
            body: noticeForm.body,
        } as never;
        const { data, error } = await supabase
            .from('notice')
            .update(payload)
            .eq('id', Number(noticeId))
            .throwOnError();
        console.log(data, error);
        ToastMessage.success('Success');
        await router.push({ path: '../notice-list' });
    } catch (e) {
        console.error(e);
        ToastMessage.error(e);
    }
}
</script>

<template>
    <q-card flat bordered class="notice-detail-area">
        <q-card-section class="title-area">
            <div class="text-h6">
                <template v-if="props.isEdit">
                    <q-input
                        v-model="noticeForm.title"
                        style="width: 100%"
                        type="text"
                        label="제목을 작성하세요!"
                        outlined
                        dense
                        hide-bottom-space
                    />
                </template>
                <template v-else>
                    {{ noticeDetail.title }}
                </template>
            </div>
            <div class="text-caption">
                {{ dayjs(noticeDetail.created_at).format('YYYY-MM-DD hh:mm A') }}
            </div>
        </q-card-section>
        <q-separator inset />
        <q-card-section>
            <template v-if="props.isEdit">
                <q-input
                    v-model="noticeForm.body"
                    type="textarea"
                    label="내용을 작성하세요!"
                    input-style="height: 150px; resize: none"
                    outlined
                    dense
                    hide-bottom-space
                />
            </template>
            <template v-else>
                <div v-html="noticeDetail.body" class="description-area"></div>
            </template>
        </q-card-section>
        <q-card-actions class="q-pa-md">
            <template v-if="props.isEdit">
                <q-btn
                    @click="editNotice"
                    label="공지사항 수정"
                    color="primary"
                    class="button-create"
                />
            </template>
            <template v-else>
                <q-btn
                    to="../create-notice"
                    label="공지사항 쓰기"
                    color="primary"
                    class="button-create"
                />
                <q-btn
                    :to="`../edit-notice/${noticeId}`"
                    label="수정"
                    color="secondary"
                    class="button-create"
                />
            </template>
            <q-btn to="../notice-list" label="리스트" color="secondary" class="button-create" />
        </q-card-actions>
    </q-card>
    <q-card flat bordered class="q-pa-md q-mt-md">
        <notice-comment-list :postId="noticeId" />
    </q-card>
</template>

<style scoped>
.notice-detail-area {
    .title-area {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        .text-h6 {
            flex: 5 0;
        }
        .text-caption {
            flex: 1 0;
            text-align: right;
        }
    }
    .description-area {
        min-height: 250px;
    }
}
</style>

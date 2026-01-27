<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ToastMessage } from '@/helper/message.ts';
import dayjs from 'dayjs';
import noticeService from '@/services/notice.service.ts';
import { useRoute } from 'vue-router';

const route = useRoute();
const noticeId = Number(route.params.id);
const isLoadingPage = ref(false);
const noticeDetail = ref({});

onMounted(async () => {
    await getNoticeDetail();
});

async function getNoticeDetail() {
    try {
        isLoadingPage.value = true;
        const { data, error } = await noticeService.getNoticeDetail(noticeId);
        noticeDetail.value = data;
        noticeDetail.value.body = noticeDetail.value.body.replace(/(?:\r\n|\r|\n)/g, '<br>');
    } catch (e) {
        console.error(e);
        ToastMessage.error(e);
    } finally {
        isLoadingPage.value = false;
    }
}
</script>

<template>
    <q-card flat bordered class="notice-detail-area">
        <q-card-section class="title-area">
            <div class="text-h6">{{ noticeDetail.title }}</div>
            <div class="text-caption">{{ dayjs(noticeDetail.created_at).format('YYYY-MM-DD hh:mm A') }}</div>
        </q-card-section>
        <q-separator inset />
        <q-card-section>
            <div v-html="noticeDetail.body" class="description-area"></div>
        </q-card-section>
        <q-card-actions class="q-pa-md">
            <q-btn :to="{ name: 'create-notice' }" label="공지사항 쓰기" color="primary" class="button-create" />
            <q-btn :to="{ name: 'edit-notice', params: noticeId }" label="수정" color="secondary" class="button-create" />
            <q-btn :to="{ name: 'notice-list' }" label="리스트" color="secondary" class="button-create" />
        </q-card-actions>
    </q-card>
</template>

<style scoped>
.notice-detail-area {
    .title-area {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
    }
    .description-area {
        min-height: 250px;
    }
}
</style>

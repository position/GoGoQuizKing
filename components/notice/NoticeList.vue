<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ConfirmMessage, ToastMessage } from '~/helper/message';
import dayjs from 'dayjs';

const router = useRouter();
const noticeList = ref([]);
const isVisibleCreateModal = ref(false);
const isLoadingPage = ref(false);
const supabase = useSupabaseClient();

onMounted(async () => {
    await getNoticeList();
});

async function getNoticeList() {
    try {
        isLoadingPage.value = true;

        const { data: record, error } = await supabase
            .from('notice')
            .select('*')
            .order('created_at', { ascending: false })
            // .range((pages - 1) * pageSize, pages * pageSize - 1)
            .throwOnError();
        noticeList.value = record;
    } catch (e) {
        console.error(e);
        ToastMessage.error(e);
    } finally {
        isLoadingPage.value = false;
    }
}

function confirmDeleteNotice(id: number) {
    ConfirmMessage({ message: '정말 이 글을 삭제할까요? 🥲' })
        .then(() => {
            deleteNotice(id);
        })
        .catch((e) => {
            console.error(e);
        });
}

async function deleteNotice(id: number) {
    try {
        const { error } = await supabase.from('notice').delete().eq('id', id).throwOnError();
        ToastMessage.success('Success');
        await getNoticeList();
    } catch (e) {
        console.error(e);
        ToastMessage.error(e);
    }
}

function visibleCrateModal() {
    isVisibleCreateModal.value = true;
}

function goToNoticeDetail(id: number) {
    router.push({ path: `./notice-detail/${id}` });
}
</script>

<template>
    <section class="page-area">
        <q-btn to="./create-notice" label="공지사항 쓰기 ✍️" color="primary" class="button-create" />
        <q-table
            flat
            bordered
            :rows="noticeList"
            row-key="index"
            no-data-label="아직 공지가 없어요~ 📭"
            :virtual-scroll-item-size="48"
            :virtual-scroll-slice-size="100"
            virtual-scroll
            :rows-per-page-options="[10]"
            class="page-list-table"
        >
            <template v-slot:header>
                <tr>
                    <th>번호</th>
                    <th>제목</th>
                    <th>내용</th>
                    <th>날짜</th>
                    <th>삭제</th>
                </tr>
            </template>
            <template v-slot:body="notice">
                <tr @click="goToNoticeDetail(notice.row.id)" class="cursor-pointer">
                    <td>{{ notice.row.id }}</td>
                    <td>{{ notice.row.title }}</td>
                    <td>{{ notice.row.body }}</td>
                    <td>
                        {{
                            dayjs.utc(notice.row.created_at).local().format('YYYY-MM-DD hh:mm:ss A')
                        }}
                    </td>
                    <td>
                        <q-btn
                            @click.stop="confirmDeleteNotice(notice.row.id)"
                            label="삭제 🗑️"
                            color="primary"
                        />
                    </td>
                </tr>
            </template>
            <template v-slot:no-data>
                <div class="no-data">아직 공지가 없어요~ 📭</div>
            </template>
        </q-table>
    </section>

    <q-dialog v-model="isVisibleCreateModal" class="post-modal-area"> </q-dialog>
</template>

<style scoped>
.page-area {
    > .button-create {
        margin-bottom: 10px;
    }

    .page-list-table {
        td {
            &:nth-child(1) {
                width: 10%;
                text-align: center;
            }

            &:nth-child(2) {
                width: 20%;
            }

            &:nth-child(3) {
                width: auto;
            }

            &:nth-child(4) {
                width: 20%;
                text-align: center;
            }

            &:nth-child(5) {
                width: 10%;
                text-align: center;
            }
        }
    }
}
</style>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ConfirmMessage, ToastMessage } from '~/helper/message';
import dayjs from 'dayjs';
import { useAuthStore } from '~/store/auth.store';

const router = useRouter();
const noticeList = ref<any[]>([]);
const isLoadingPage = ref(false);
const authStore = useAuthStore();
const supabase = useSupabaseClient();

// Pagination 설정
const pagination = ref({
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 0,
    sortBy: 'created_at',
    descending: true,
});

onMounted(async () => {
    await onRequest({ pagination: pagination.value });
});

// QTable 서버 사이드 페이지네이션 핸들러
async function onRequest(props: {
    pagination: {
        page: number;
        rowsPerPage: number;
        rowsNumber?: number;
        sortBy?: string;
        descending?: boolean;
    };
}) {
    const { page, rowsPerPage } = props.pagination;

    isLoadingPage.value = true;
    try {
        const offset = (page - 1) * rowsPerPage;

        // 총 개수 조회
        const { count } = await supabase.from('notice').select('*', { count: 'exact', head: true });

        // 데이터 조회
        const { data: record } = await supabase
            .from('notice')
            .select('*')
            .order('created_at', { ascending: false })
            .range(offset, offset + rowsPerPage - 1)
            .throwOnError();

        noticeList.value = record || [];

        // 페이지네이션 상태 업데이트
        pagination.value.page = page;
        pagination.value.rowsPerPage = rowsPerPage;
        pagination.value.rowsNumber = count || 0;
    } catch (e) {
        console.error(e);
        ToastMessage.error(e as string);
    } finally {
        isLoadingPage.value = false;
    }
}

async function getNoticeList() {
    await onRequest({ pagination: pagination.value });
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
        await supabase.from('notice').delete().eq('id', id).throwOnError();
        ToastMessage.success('Success');
        await getNoticeList();
    } catch (e) {
        console.error(e);
        ToastMessage.error(e as string);
    }
}

function goToNoticeDetail(id: number) {
    router.push({ path: `./notice-detail/${id}` });
}
</script>

<template>
    <section class="page-area">
        <div class="page-header">
            <h1 class="page-title">공지사항</h1>
            <q-btn
                v-if="authStore.isAdmin"
                to="./create-notice"
                label="공지사항 쓰기"
                color="primary"
                class="button-create"
                unelevated
            >
                <q-icon name="add" left />
            </q-btn>
        </div>

        <q-table
            flat
            bordered
            :rows="noticeList"
            row-key="id"
            :loading="isLoadingPage"
            v-model:pagination="pagination"
            no-data-label="등록된 공지사항이 없습니다"
            class="page-list-table"
            @request="onRequest"
        >
            <template v-slot:header>
                <tr>
                    <th class="text-center">번호</th>
                    <th class="text-left">제목</th>
                    <th class="text-left">내용</th>
                    <th class="text-center">작성일</th>
                    <th class="text-center">관리</th>
                </tr>
            </template>
            <template v-slot:body="notice">
                <tr @click="goToNoticeDetail(notice.row.id)" class="cursor-pointer table-row">
                    <td>{{ notice.row.id }}</td>
                    <td class="notice-title">{{ notice.row.title }}</td>
                    <td class="notice-body">{{ notice.row.body }}</td>
                    <td class="notice-date">
                        {{
                            dayjs.utc(notice.row.created_at).local().format('YYYY-MM-DD hh:mm:ss A')
                        }}
                    </td>
                    <td>
                        <q-btn
                            v-if="authStore.isAdmin"
                            @click.stop="confirmDeleteNotice(notice.row.id)"
                            label="삭제"
                            size="md"
                            color="negative"
                            unelevated
                            dense
                            rounded
                            icon="delete"
                            style="width: 80px"
                        />
                    </td>
                </tr>
            </template>
            <template v-slot:no-data>
                <div class="no-data">
                    <q-icon name="info" size="24px" color="grey-5" />
                    <div>등록된 공지사항이 없습니다</div>
                </div>
            </template>

            <!-- Pagination Slot -->
            <template #pagination="scope">
                <div class="row items-center justify-center q-gutter-sm">
                    <span class="text-caption text-grey-7 q-mr-md">
                        총 {{ scope.pagination.rowsNumber }}개
                    </span>

                    <q-btn
                        icon="first_page"
                        color="grey-8"
                        round
                        dense
                        flat
                        :disable="scope.isFirstPage"
                        @click="scope.firstPage"
                    />
                    <q-btn
                        icon="chevron_left"
                        color="grey-8"
                        round
                        dense
                        flat
                        :disable="scope.isFirstPage"
                        @click="scope.prevPage"
                    />

                    <span class="text-body1">
                        {{ scope.pagination.page }} / {{ scope.pagesNumber || 1 }}
                    </span>

                    <q-btn
                        icon="chevron_right"
                        color="grey-8"
                        round
                        dense
                        flat
                        :disable="scope.isLastPage"
                        @click="scope.nextPage"
                    />
                    <q-btn
                        icon="last_page"
                        color="grey-8"
                        round
                        dense
                        flat
                        :disable="scope.isLastPage"
                        @click="scope.lastPage"
                    />
                </div>
            </template>
        </q-table>
    </section>
</template>

<style scoped lang="scss">
@import '@/assets/scss/variables';

.page-area {
    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: $spacing-lg;
        padding-bottom: $spacing-md;
        border-bottom: 2px solid var(--color-primary);

        .page-title {
            font-size: $font-size-3xl;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0;
            display: flex;
            align-items: center;
            gap: $spacing-sm;

            &::before {
                content: '';
                width: 4px;
                height: 32px;
                background: linear-gradient(135deg, $primary 0%, $secondary 100%);
                border-radius: $radius-sm;
            }
        }

        .button-create {
            border-radius: $radius-md;
            font-weight: 600;
            background: linear-gradient(135deg, $primary 0%, #e55a5a 100%);
            color: $text-white;
            box-shadow: $shadow-md;
            transition: all $transition-normal;
            padding: $spacing-sm $spacing-lg;

            &:hover {
                transform: translateY(-2px);
                box-shadow: $shadow-lg;
            }
        }
    }

    .page-list-table {
        background: var(--bg-card);
        border-radius: $radius-lg;
        box-shadow: $shadow-md;
        border: 1px solid var(--border-color);
        overflow: hidden;

        :deep(.q-table__top) {
            background: linear-gradient(135deg, $bg-secondary 0%, #d4edda 100%);
            padding: $spacing-md;
            border-bottom: 1px solid var(--border-color);
        }

        :deep(thead tr th) {
            background: linear-gradient(135deg, $secondary 0%, #3cb0a9 100%);
            color: $text-white;
            font-weight: 600;
            font-size: $font-size-sm;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: $spacing-md;
            border: none;
            position: sticky;
            top: 0;
            z-index: 1;
        }

        :deep(tbody .table-row) {
            transition: all $transition-fast;
            border-bottom: 1px solid var(--border-color);

            &:hover {
                background-color: var(--hover-overlay);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }

            &:last-child {
                border-bottom: none;
            }
        }

        :deep(tbody td) {
            padding: $spacing-md;
            border: none;
            color: var(--text-primary);

            &:nth-child(1) {
                width: 80px;
                text-align: center;
                font-weight: 600;
                color: var(--color-primary);
                font-size: $font-size-sm;
            }

            &.notice-title {
                width: 200px;
                font-weight: 600;
                color: var(--text-primary);
                cursor: pointer;

                &:hover {
                    color: var(--color-primary);
                }
            }

            &.notice-body {
                width: auto;
                max-width: 300px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                color: var(--text-secondary);
                font-size: $font-size-sm;
            }

            &.notice-date {
                width: 160px;
                text-align: center;
                font-family: 'Monaco', 'Consolas', monospace;
                font-size: $font-size-xs;
                color: var(--text-light);
            }

            &:nth-child(5) {
                width: 100px;
                text-align: center;

                .q-btn {
                    background: linear-gradient(135deg, $negative 0%, #c0392b 100%);
                    color: $text-white;
                    border-radius: $radius-full;
                    font-size: $font-size-xs;
                    font-weight: 500;
                    padding: 6px $spacing-sm;
                    min-height: unset;
                    box-shadow: $shadow-sm;
                    transition: all $transition-fast;

                    &:hover {
                        transform: translateY(-1px);
                        box-shadow: $shadow-md;
                        background: linear-gradient(135deg, #e74c3c 0%, #a93226 100%);
                    }
                }
            }
        }

        :deep(.q-table__bottom) {
            background: var(--bg-secondary);
            border-top: 1px solid var(--border-color);
            padding: $spacing-sm $spacing-md;
            color: var(--text-primary);
        }

        .no-data {
            padding: $spacing-xxl;
            text-align: center;
            color: var(--text-light);
            font-size: $font-size-lg;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: $spacing-sm;
        }
    }
}
</style>

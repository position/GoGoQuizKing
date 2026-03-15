<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { ToastMessage } from '~/helper/message';
import dayjs from 'dayjs';
import { useRoute } from 'vue-router';
import { useRouter } from '#vue-router';
import type { NoticeInfo } from '~/models/notice';
import NoticeCommentList from '~/components/notice/NoticeCommentList.vue';
import { useAuthStore } from '~/store/auth.store';

const route = useRoute();
const router = useRouter();
const noticeId = Number(route.params.id);
const noticeForm = reactive({ title: '', body: '' });
const isLoadingPage = ref(false);
const noticeDetail = ref<NoticeInfo>({} as NoticeInfo);
const supabase = useSupabaseClient();
const authStore = useAuthStore();
const props = defineProps<{
    isEdit?: boolean;
}>();

// 동적 SEO - 공지사항 정보에 따라 메타 태그 설정
const seoTitle = computed(() => {
    if (props.isEdit) return '공지사항 수정 - GoGoQuizKing';
    return noticeDetail.value.title
        ? `${noticeDetail.value.title} - GoGoQuizKing`
        : '공지사항 - GoGoQuizKing';
});

const seoDescription = computed(() => {
    const body = noticeDetail.value.body || '';
    const cleanBody = body
        .replace(/<[^>]*>/g, '')
        .replace(/<br>/g, ' ')
        .slice(0, 160);
    return cleanBody || 'GoGoQuizKing 공지사항입니다.';
});

useSeoMeta({
    title: seoTitle,
    description: seoDescription,
    ogTitle: seoTitle,
    ogDescription: seoDescription,
    robots: () => (props.isEdit ? 'noindex, nofollow' : 'index, follow'),
});

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

        if (error) {
            throw error;
        }

        Object.assign(noticeDetail.value, data);
        noticeDetail.value.body = noticeDetail.value.body.replace(/\r\n|\r|\n/g, '<br>');
        if (props.isEdit) {
            noticeForm.title = noticeDetail.value.title;
            noticeForm.body = noticeDetail.value.body;
        }
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : '데이터를 불러오는데 실패했습니다.';
        ToastMessage.error(errorMessage);
    } finally {
        isLoadingPage.value = false;
    }
}

async function editNotice() {
    try {
        const payload = {
            title: noticeForm.title,
            body: noticeForm.body,
        };
        await supabase.from('notice').update(payload).eq('id', Number(noticeId)).throwOnError();

        ToastMessage.success('수정이 완료되었습니다!');
        await router.push({ path: '../notice-list' });
    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : '수정에 실패했습니다.';
        ToastMessage.error(errorMessage);
    }
}
</script>

<template>
    <q-card flat bordered class="notice-detail-area">
        <q-card-section class="title-area">
            <h3 class="text-h3">
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
            </h3>
            <div class="text-caption">
                {{ dayjs(noticeDetail.created_at).format('YYYY-MM-DD hh:mm A') }}
            </div>
        </q-card-section>
        <q-separator inset />
        <q-card-section>
            <template v-if="props.isEdit">
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
            </template>
            <template v-else>
                <div v-html="noticeDetail.body" class="description-area"></div>
            </template>
        </q-card-section>
        <q-card-actions class="q-pa-md">
            <template v-if="authStore.isAdmin">
                <template v-if="props.isEdit">
                    <q-btn
                        @click="editNotice"
                        label="공지사항 수정"
                        color="primary"
                        class="button-create"
                        size="lg"
                    />
                </template>
                <template v-else>
                    <q-btn
                        to="../create-notice"
                        label="공지사항 쓰기"
                        color="primary"
                        class="button-create"
                        size="lg"
                    />
                    <q-btn
                        :to="`../edit-notice/${noticeId}`"
                        label="수정"
                        color="secondary"
                        class="button-create"
                        size="lg"
                        style="min-width: 80px"
                    />
                </template>
            </template>
            <q-btn
                to="../notice-list"
                label="리스트"
                color="secondary"
                class="button-create"
                size="lg"
                style="min-width: 80px"
            />
        </q-card-actions>
    </q-card>
    <q-card flat bordered class="q-pa-md q-mt-md">
        <notice-comment-list :postId="noticeId" />
    </q-card>
</template>

<style scoped lang="scss">
.notice-detail-area {
    background: var(--bg-card);
    border-color: var(--border-color);
    border-radius: 16px;

    .title-area {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        flex-wrap: wrap;
        gap: 12px;

        .text-h3 {
            font-weight: 700;
            color: var(--text-primary);
            margin: 0;
            flex: 1;
            min-width: 200px;
        }

        .text-caption {
            flex-shrink: 0;
            text-align: right;
            color: var(--text-light);
        }

        :deep(.q-field) {
            .q-field__control {
                background: var(--bg-input);
                border-radius: 8px;
            }

            .q-field__native {
                color: var(--text-primary);
            }

            .q-field__label {
                color: var(--text-light);
            }
        }
    }

    .description-area {
        min-height: 250px;
        font-size: 14px;
        line-height: 1.8;
        color: var(--text-primary);

        :deep(a) {
            color: var(--color-primary);

            &:hover {
                text-decoration: underline;
            }
        }

        :deep(ul) {
            padding-left: 20px;
        }

        :deep(ul > li > ul) {
            padding-left: 40px;
        }

        :deep(blockquote) {
            border-left: 4px solid var(--color-primary);
            margin: 16px 0;
            color: var(--text-secondary);
            background: var(--bg-secondary);
            padding: 12px 16px;
            border-radius: 0 8px 8px 0;
        }
    }

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

    :deep(.q-separator) {
        background: var(--border-color);
    }

    .q-card-actions {
        border-top: 1px solid var(--border-color);
        flex-wrap: wrap;
        gap: 8px;

        .q-btn {
            border-radius: 8px;
            font-weight: 600;
        }
    }
}

// 댓글 영역
.q-card.q-mt-md {
    background: var(--bg-card);
    border-color: var(--border-color);
    border-radius: 16px;
}

// 다크모드 대응
.body--dark {
    .notice-detail-area {
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

// 라이트모드 대응
.body--light {
    .notice-detail-area {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
}

// 모바일 대응
@media (max-width: 600px) {
    .notice-detail-area {
        .title-area {
            flex-direction: column;
            align-items: flex-start;

            .text-h3 {
                font-size: 1.5rem;
            }

            .text-caption {
                text-align: left;
            }
        }

        .q-card-actions {
            .q-btn {
                flex: 1;
                min-width: 80px;
            }
        }
    }
}
</style>

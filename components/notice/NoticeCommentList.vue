<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { ToastMessage } from '~/helper/message';
import dayjs from 'dayjs';
import type { CommentInfo } from '~/models/comment';
import { useAuthStore } from '~/store/auth.store';

const isLoading = ref<boolean>(false);
const isSubmitting = ref<boolean>(false);
const commentList = ref<CommentInfo[]>([]);
const newComment = ref<string>('');
const editingCommentId = ref<string | null>(null);
const editingContent = ref<string>('');

const supabase = useSupabaseClient();
const authStore = useAuthStore();

const props = defineProps<{
    postId?: number;
}>();

const isLoggedIn = computed(() => authStore.isLogin);
const currentUserId = computed(() => authStore.userInfo?.sub);

onMounted(async () => {
    await getCommentList();
});

async function getCommentList() {
    if (!props.postId) {
        console.error('Notice ID is required to fetch comments.');
        return;
    }
    isLoading.value = true;
    try {
        // 댓글 목록 조회
        const { data: comments, error: commentsError } = await supabase
            .from('comments')
            .select('*')
            .eq('post_id', props.postId)
            .order('created_at', { ascending: true });

        if (commentsError) throw commentsError;

        if (!comments || comments.length === 0) {
            commentList.value = [];
            return;
        }

        // 유저 ID 목록 추출
        const userIds = [...new Set(comments.map((c) => c.user_id))];

        // 프로필 정보 별도 조회
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', userIds);

        if (profilesError) {
            console.warn('프로필 조회 실패:', profilesError);
        }

        // 프로필 정보 매핑
        const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

        // 댓글에 프로필 정보 병합
        commentList.value = comments.map((comment) => ({
            ...comment,
            profiles: profileMap.get(comment.user_id) || null,
        }));
    } catch (e) {
        console.error(e);
        ToastMessage.error('댓글을 불러오는데 실패했습니다.');
    } finally {
        isLoading.value = false;
    }
}

async function submitComment() {
    if (!newComment.value.trim()) {
        ToastMessage.warning('댓글 내용을 입력해주세요.');
        return;
    }

    if (!isLoggedIn.value) {
        ToastMessage.warning('로그인이 필요합니다.');
        return;
    }

    isSubmitting.value = true;
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error('로그인이 필요합니다.');

        const { error } = await supabase.from('comments').insert({
            post_id: props.postId,
            user_id: user.id,
            content: newComment.value.trim(),
        });

        if (error) throw error;

        newComment.value = '';
        ToastMessage.success('댓글이 작성되었습니다.');
        await getCommentList();
    } catch (e: any) {
        console.error(e);
        ToastMessage.error(e.message || '댓글 작성에 실패했습니다.');
    } finally {
        isSubmitting.value = false;
    }
}

function startEdit(comment: CommentInfo) {
    editingCommentId.value = comment.id;
    editingContent.value = comment.content;
}

function cancelEdit() {
    editingCommentId.value = null;
    editingContent.value = '';
}

async function saveEdit(commentId: string) {
    if (!editingContent.value.trim()) {
        ToastMessage.warning('댓글 내용을 입력해주세요.');
        return;
    }

    isSubmitting.value = true;
    try {
        const { error } = await supabase
            .from('comments')
            .update({
                content: editingContent.value.trim(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', commentId);

        if (error) throw error;

        ToastMessage.success('댓글이 수정되었습니다.');
        cancelEdit();
        await getCommentList();
    } catch (e: any) {
        console.error(e);
        ToastMessage.error(e.message || '댓글 수정에 실패했습니다.');
    } finally {
        isSubmitting.value = false;
    }
}

async function deleteComment(commentId: string) {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;

    isSubmitting.value = true;
    try {
        const { error } = await supabase.from('comments').delete().eq('id', commentId);

        if (error) throw error;

        ToastMessage.success('댓글이 삭제되었습니다.');
        await getCommentList();
    } catch (e: any) {
        console.error(e);
        ToastMessage.error(e.message || '댓글 삭제에 실패했습니다.');
    } finally {
        isSubmitting.value = false;
    }
}

function isOwner(comment: CommentInfo): boolean {
    return currentUserId.value === comment.user_id;
}

function getAuthorName(comment: any): string {
    return comment.profiles?.full_name || '익명';
}

function getAuthorAvatar(comment: any): string {
    return comment.profiles?.avatar_url || '';
}
</script>

<template>
    <div class="notice-comment-list">
        <div class="comment-header">
            <h3>💬 댓글 {{ commentList.length > 0 ? `(${commentList.length})` : '' }}</h3>
        </div>

        <!-- 댓글 작성 영역 -->
        <div class="comment-form">
            <template v-if="isLoggedIn">
                <q-input
                    v-model="newComment"
                    type="textarea"
                    placeholder="댓글을 작성해주세요..."
                    outlined
                    autogrow
                    :maxlength="500"
                    class="comment-input"
                >
                    <template #append>
                        <q-btn
                            @click="submitComment"
                            :loading="isSubmitting"
                            :disable="!newComment.trim()"
                            icon="send"
                            color="primary"
                            flat
                            round
                        />
                    </template>
                </q-input>
            </template>
            <template v-else>
                <q-banner class="login-banner" rounded>
                    <template #avatar>
                        <q-icon name="info" color="primary" />
                    </template>
                    댓글을 작성하려면
                    <router-link to="/login" class="text-primary">로그인</router-link>
                    이 필요합니다.
                </q-banner>
            </template>
        </div>

        <!-- 댓글 목록 -->
        <div v-if="isLoading" class="loading-area">
            <q-spinner-dots color="primary" size="40px" />
        </div>

        <div v-else-if="commentList.length === 0" class="empty-comments">
            <q-icon name="chat_bubble_outline" size="48px" color="grey-5" />
            <p>아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요! 🎉</p>
        </div>

        <ul v-else class="comment-list">
            <li v-for="comment in commentList" :key="comment.id" class="comment-item">
                <div class="comment-avatar">
                    <q-avatar size="36px" color="primary" text-color="white">
                        <img
                            v-if="getAuthorAvatar(comment)"
                            :src="getAuthorAvatar(comment)"
                            width="36"
                            height="36"
                            referrerpolicy="no-referrer"
                            crossorigin="anonymous"
                            :alt="getAuthorName(comment)"
                        />
                        <span v-else>{{ getAuthorName(comment).charAt(0) }}</span>
                    </q-avatar>
                </div>
                <div class="comment-content">
                    <div class="comment-meta">
                        <span class="author-name">{{ getAuthorName(comment) }}</span>
                        <span class="comment-date">
                            {{ dayjs(comment.created_at).format('YYYY-MM-DD HH:mm') }}
                            <template v-if="comment.updated_at !== comment.created_at">
                                (수정됨)
                            </template>
                        </span>
                    </div>

                    <!-- 수정 모드 -->
                    <template v-if="editingCommentId === comment.id">
                        <q-input
                            v-model="editingContent"
                            type="textarea"
                            outlined
                            autogrow
                            dense
                            class="edit-input"
                        />
                        <div class="edit-actions">
                            <q-btn
                                @click="saveEdit(comment.id)"
                                label="저장"
                                color="primary"
                                size="sm"
                                :loading="isSubmitting"
                            />
                            <q-btn @click="cancelEdit" label="취소" color="grey" flat size="sm" />
                        </div>
                    </template>

                    <!-- 일반 모드 -->
                    <template v-else>
                        <p class="comment-text">{{ comment.content }}</p>
                        <div v-if="isOwner(comment)" class="comment-actions">
                            <q-btn
                                @click="startEdit(comment)"
                                icon="edit"
                                size="xs"
                                flat
                                round
                                color="grey"
                            >
                                <q-tooltip>수정</q-tooltip>
                            </q-btn>
                            <q-btn
                                @click="deleteComment(comment.id)"
                                icon="delete"
                                size="xs"
                                flat
                                round
                                color="negative"
                            >
                                <q-tooltip>삭제</q-tooltip>
                            </q-btn>
                        </div>
                    </template>
                </div>
            </li>
        </ul>
    </div>
</template>

<style scoped lang="scss">
.notice-comment-list {
    .comment-header {
        h3 {
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 12px;
            margin-bottom: 16px;
            font-size: 1.1em;
            font-weight: 700;
            color: var(--text-primary);
        }
    }

    .comment-form {
        margin-bottom: 24px;

        .comment-input {
            :deep(.q-field__control) {
                background: var(--bg-card);
            }
        }

        .login-banner {
            background: var(--bg-card);
            color: var(--text-primary);
        }
    }

    .loading-area {
        display: flex;
        justify-content: center;
        padding: 40px;
    }

    .empty-comments {
        text-align: center;
        padding: 40px 20px;
        color: var(--text-light);

        p {
            margin-top: 12px;
            font-size: 14px;
        }
    }

    .comment-list {
        list-style: none;
        padding: 0;
        margin: 0;

        .comment-item {
            display: flex;
            gap: 12px;
            padding: 16px 0;
            border-bottom: 1px solid var(--border-color);

            &:last-child {
                border-bottom: none;
            }

            .comment-avatar {
                flex-shrink: 0;
            }

            .comment-content {
                flex: 1;
                min-width: 0;

                .comment-meta {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 6px;

                    .author-name {
                        font-weight: 600;
                        font-size: 14px;
                        color: var(--text-primary);
                    }

                    .comment-date {
                        font-size: 12px;
                        color: var(--text-light);
                    }
                }

                .comment-text {
                    margin: 0;
                    font-size: 14px;
                    color: var(--text-primary);
                    line-height: 1.5;
                    white-space: pre-wrap;
                    word-break: break-word;
                }

                .comment-actions {
                    margin-top: 8px;
                    display: flex;
                    gap: 4px;
                }

                .edit-input {
                    margin-top: 8px;
                }

                .edit-actions {
                    margin-top: 8px;
                    display: flex;
                    gap: 8px;
                }
            }
        }
    }
}
</style>

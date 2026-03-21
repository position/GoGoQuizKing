<script setup lang="ts">
import { useQuasar } from 'quasar';
import type { QuizComment } from '~/models/comment';

interface Props {
    comment: QuizComment;
    currentUserId?: string;
    depth?: number;
}

const props = withDefaults(defineProps<Props>(), {
    depth: 0,
});

const emit = defineEmits<{
    (e: 'reply', commentId: string): void;
    (e: 'update', commentId: string, content: string): void;
    (e: 'delete', commentId: string): void;
}>();

const $q = useQuasar();

// 인라인 수정 상태
const isEditing = ref(false);
const editContent = ref('');

const isOwner = computed(() => {
    return props.currentUserId === props.comment.user_id;
});

const displayName = computed(() => {
    return props.comment.profiles?.full_name || '익명 사용자';
});

const avatarUrl = computed(() => {
    return props.comment.profiles?.avatar_url || '';
});

const isEdited = computed(() => {
    if (!props.comment.updated_at || !props.comment.created_at) {
        return false;
    }
    return props.comment.updated_at !== props.comment.created_at;
});

const formattedDate = computed(() => {
    const date = new Date(props.comment.created_at);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) {
        return '방금 전';
    }
    if (minutes < 60) {
        return `${minutes}분 전`;
    }
    if (hours < 24) {
        return `${hours}시간 전`;
    }
    if (days < 7) {
        return `${days}일 전`;
    }

    return date.toLocaleDateString('ko-KR');
});

function handleReply() {
    emit('reply', props.comment.id);
}

function handleEdit() {
    editContent.value = props.comment.content;
    isEditing.value = true;
}

function handleCancelEdit() {
    isEditing.value = false;
    editContent.value = '';
}

function handleSubmitEdit() {
    const trimmed = editContent.value.trim();
    if (!trimmed) {
        return;
    }
    emit('update', props.comment.id, trimmed);
    isEditing.value = false;
    editContent.value = '';
}

function handleDelete() {
    $q.dialog({
        title: '댓글 삭제',
        message: '이 댓글을 삭제하시겠습니까?',
        cancel: {
            label: '취소',
            flat: true,
            color: 'grey-7',
        },
        ok: {
            label: '삭제',
            color: 'negative',
            unelevated: true,
        },
        persistent: false,
    }).onOk(() => {
        emit('delete', props.comment.id);
    });
}
</script>

<template>
    <div class="quiz-comment-item" :style="{ marginLeft: `${depth * 24}px` }">
        <div class="comment-container">
            <!-- 대댓글 표시선 -->
            <div v-if="depth > 0" class="reply-indicator">
                <q-icon name="subdirectory_arrow_right" size="16px" color="grey-5" />
            </div>

            <div class="comment-content">
                <!-- 헤더: 아바타, 이름, 날짜 -->
                <div class="comment-header">
                    <q-avatar size="32px" class="avatar">
                        <q-img v-if="avatarUrl" :src="avatarUrl" />
                        <q-icon v-else name="person" color="grey-6" />
                    </q-avatar>

                    <div class="header-info">
                        <span class="author-name">{{ displayName }}</span>
                        <span class="comment-date">
                            {{ formattedDate }}
                            <span v-if="isEdited" class="edited-badge">(수정됨)</span>
                        </span>
                    </div>

                    <!-- 소유자 메뉴 -->
                    <q-btn
                        v-if="isOwner && !isEditing"
                        flat
                        round
                        dense
                        size="sm"
                        icon="more_vert"
                        color="grey-6"
                    >
                        <q-menu>
                            <q-list style="min-width: 120px">
                                <q-item v-close-popup clickable @click="handleEdit">
                                    <q-item-section avatar>
                                        <q-icon name="edit" size="18px" />
                                    </q-item-section>
                                    <q-item-section>수정</q-item-section>
                                </q-item>
                                <q-item v-close-popup clickable @click="handleDelete">
                                    <q-item-section avatar>
                                        <q-icon name="delete" size="18px" color="negative" />
                                    </q-item-section>
                                    <q-item-section class="text-negative">삭제</q-item-section>
                                </q-item>
                            </q-list>
                        </q-menu>
                    </q-btn>
                </div>

                <!-- 인라인 수정 폼 -->
                <div v-if="isEditing" class="edit-form">
                    <q-input
                        v-model="editContent"
                        type="textarea"
                        outlined
                        autogrow
                        :max-height="150"
                        placeholder="댓글을 수정하세요..."
                        class="edit-input"
                        @keydown.ctrl.enter="handleSubmitEdit"
                        @keydown.meta.enter="handleSubmitEdit"
                    />
                    <div class="edit-actions">
                        <q-btn
                            flat
                            no-caps
                            color="grey-7"
                            label="취소"
                            size="md"
                            @click="handleCancelEdit"
                            class="text-no-wrap"
                        />
                        <q-btn
                            unelevated
                            no-caps
                            color="primary"
                            label="수정"
                            size="md"
                            :disable="!editContent.trim()"
                            @click="handleSubmitEdit"
                            class="text-no-wrap"
                        />
                    </div>
                </div>

                <!-- 댓글 본문 -->
                <div v-else class="comment-body">
                    {{ comment.content }}
                </div>

                <!-- 액션 버튼 -->
                <div v-if="!isEditing" class="comment-actions">
                    <q-btn
                        flat
                        dense
                        no-caps
                        size="sm"
                        color="grey-7"
                        icon="reply"
                        label="답글"
                        @click="handleReply"
                    />
                </div>
            </div>
        </div>

        <!-- 대댓글 목록 -->
        <template v-if="comment.replies?.length">
            <QuizCommentItem
                v-for="reply in comment.replies"
                :key="reply.id"
                :comment="reply"
                :current-user-id="currentUserId"
                :depth="depth + 1"
                @reply="$emit('reply', $event)"
                @update="(id: string, content: string) => $emit('update', id, content)"
                @delete="$emit('delete', $event)"
            />
        </template>
    </div>
</template>

<style scoped lang="scss">
.quiz-comment-item {
    margin-bottom: 8px;
}

.comment-container {
    display: flex;
    align-items: flex-start;
    gap: 8px;
}

.reply-indicator {
    padding-top: 8px;
    opacity: 0.6;
}

.comment-content {
    flex: 1;
    background: var(--bg-card, #f8f9fa);
    border-radius: 12px;
    padding: 12px;
}

.comment-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}

.avatar {
    background: var(--bg-avatar, #e0e0e0);
}

.header-info {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.author-name {
    font-weight: 600;
    font-size: 14px;
    color: var(--text-primary, #333);
}

.comment-date {
    font-size: 12px;
    color: var(--text-light, #888);

    .edited-badge {
        color: var(--text-light, #999);
        font-style: italic;
    }
}

.comment-body {
    font-size: 14px;
    line-height: 1.5;
    color: var(--text-primary, #333);
    white-space: pre-wrap;
    word-break: break-word;
}

.comment-actions {
    margin-top: 8px;
}

.edit-form {
    margin-top: 4px;

    .edit-input {
        :deep(.q-field__control) {
            border-radius: 8px;
        }
    }

    .edit-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 8px;
    }
}
</style>

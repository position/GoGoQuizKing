<script setup lang="ts">
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
    (e: 'edit', comment: QuizComment): void;
    (e: 'delete', commentId: string): void;
}>();

const isOwner = computed(() => {
    return props.currentUserId === props.comment.user_id;
});

const displayName = computed(() => {
    return props.comment.profiles?.full_name || '익명 사용자';
});

const avatarUrl = computed(() => {
    return props.comment.profiles?.avatar_url || '';
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
    emit('edit', props.comment);
}

function handleDelete() {
    emit('delete', props.comment.id);
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
                        <span class="comment-date">{{ formattedDate }}</span>
                    </div>

                    <!-- 소유자 메뉴 -->
                    <q-btn
                        v-if="isOwner"
                        flat
                        round
                        dense
                        size="sm"
                        icon="more_vert"
                        color="grey-6"
                    >
                        <q-menu>
                            <q-list style="min-width: 100px">
                                <q-item clickable v-close-popup @click="handleEdit">
                                    <q-item-section avatar>
                                        <q-icon name="edit" size="18px" />
                                    </q-item-section>
                                    <q-item-section>수정</q-item-section>
                                </q-item>
                                <q-item clickable v-close-popup @click="handleDelete">
                                    <q-item-section avatar>
                                        <q-icon name="delete" size="18px" color="negative" />
                                    </q-item-section>
                                    <q-item-section class="text-negative">삭제</q-item-section>
                                </q-item>
                            </q-list>
                        </q-menu>
                    </q-btn>
                </div>

                <!-- 댓글 본문 -->
                <div class="comment-body">
                    {{ comment.content }}
                </div>

                <!-- 액션 버튼 -->
                <div class="comment-actions">
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
                @edit="$emit('edit', $event)"
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
    background: #f8f9fa;
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
    background: #e0e0e0;
}

.header-info {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.author-name {
    font-weight: 600;
    font-size: 14px;
    color: #333;
}

.comment-date {
    font-size: 12px;
    color: #888;
}

.comment-body {
    font-size: 14px;
    line-height: 1.5;
    color: #333;
    white-space: pre-wrap;
    word-break: break-word;
}

.comment-actions {
    margin-top: 8px;
}
</style>

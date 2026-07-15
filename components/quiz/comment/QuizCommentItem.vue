<script setup lang="ts">
import { useQuasar } from 'quasar';
import type { MentionCandidate, QuizComment, QuizCommentMention } from '~/models/comment';

interface Props {
    comment: QuizComment;
    currentUserId?: string;
    mentionCandidates?: MentionCandidate[];
    highlightedCommentId?: string | null;
    depth?: number;
}

const props = withDefaults(defineProps<Props>(), {
    depth: 0,
    mentionCandidates: () => [],
    highlightedCommentId: null,
});

const emit = defineEmits<{
    (e: 'reply', commentId: string): void;
    (e: 'update', commentId: string, content: string, mentions: QuizCommentMention[]): void;
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
    return (
        props.comment.profiles?.preferred_username ||
        props.comment.profiles?.full_name ||
        '익명 사용자'
    ).replace(/^@+/, '');
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

const contentSegments = computed(() => {
    const mentions = [...(props.comment.mentions || [])].sort(
        (a, b) => a.start_offset - b.start_offset,
    );
    const segments: Array<{ text: string; isMention: boolean; userId?: string }> = [];
    let cursor = 0;

    mentions.forEach((mention) => {
        if (mention.start_offset < cursor || mention.start_offset >= props.comment.content.length) {
            return;
        }

        if (mention.start_offset > cursor) {
            segments.push({
                text: props.comment.content.slice(cursor, mention.start_offset),
                isMention: false,
            });
        }

        const end = Math.min(props.comment.content.length, mention.start_offset + mention.length);
        segments.push({
            text: props.comment.content.slice(mention.start_offset, end),
            isMention: true,
            userId: mention.mentioned_user_id,
        });
        cursor = end;
    });

    if (cursor < props.comment.content.length) {
        segments.push({ text: props.comment.content.slice(cursor), isMention: false });
    }

    return segments.length ? segments : [{ text: props.comment.content, isMention: false }];
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

function handleSubmitEdit(content: string, mentions: QuizCommentMention[]) {
    emit('update', props.comment.id, content, mentions);
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
    <div
        :id="`comment-${comment.id}`"
        class="quiz-comment-item"
        :class="{ 'is-highlighted': highlightedCommentId === comment.id }"
        :style="{ marginLeft: `${depth * 24}px` }"
    >
        <div class="comment-container">
            <!-- 대댓글 표시선 -->
            <div v-if="depth > 0" class="reply-indicator">
                <q-icon name="subdirectory_arrow_right" size="16px" color="grey-5" />
            </div>

            <div class="comment-content">
                <!-- 헤더: 아바타, 이름, 날짜 -->
                <div class="comment-header">
                    <NuxtLink
                        :to="`/profile/${comment.user_id}`"
                        class="profile-link"
                        :aria-label="`${displayName} 프로필 보기`"
                    >
                        <q-avatar size="32px" class="avatar">
                            <q-img v-if="avatarUrl" :src="avatarUrl" />
                            <q-icon v-else name="person" color="grey-6" />
                        </q-avatar>
                    </NuxtLink>

                    <div class="header-info">
                        <NuxtLink :to="`/profile/${comment.user_id}`" class="author-name">{{
                            displayName
                        }}</NuxtLink>
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
                    <QuizCommentForm
                        :quiz-id="comment.quiz_id"
                        placeholder="댓글을 수정하세요..."
                        submit-label="수정"
                        :initial-content="editContent"
                        :initial-mentions="comment.mentions || []"
                        :mention-candidates="mentionCandidates"
                        is-edit
                        @submit="handleSubmitEdit"
                        @cancel="handleCancelEdit"
                    />
                </div>

                <!-- 댓글 본문 -->
                <div v-else class="comment-body">
                    <component
                        v-for="(segment, index) in contentSegments"
                        :key="index"
                        :is="segment.isMention ? resolveComponent('NuxtLink') : 'span'"
                        :to="segment.isMention ? `/profile/${segment.userId}` : undefined"
                        :class="{ mention: segment.isMention }"
                        >{{ segment.text }}</component
                    >
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
                :mention-candidates="mentionCandidates"
                :highlighted-comment-id="highlightedCommentId"
                :depth="depth + 1"
                @reply="$emit('reply', $event)"
                @update="
                    (id: string, content: string, mentions: QuizCommentMention[]) =>
                        $emit('update', id, content, mentions)
                "
                @delete="$emit('delete', $event)"
            />
        </template>
    </div>
</template>

<style scoped lang="scss">
.quiz-comment-item {
    margin-bottom: 8px;
    scroll-margin-top: 80px;
    transition:
        background-color 0.3s ease,
        box-shadow 0.3s ease;

    &.is-highlighted > .comment-container > .comment-content {
        background: color-mix(in srgb, var(--color-accent, #ffe66d) 28%, var(--bg-card, white));
        box-shadow: 0 0 0 2px var(--color-accent, #ffe66d);
    }
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

.profile-link,
.author-name,
.mention {
    text-decoration: none;
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

    .mention {
        color: var(--color-primary, #ff6b6b);
        font-weight: 700;
    }
}

.comment-actions {
    margin-top: 8px;
}

.edit-form {
    margin-top: 4px;
}
</style>

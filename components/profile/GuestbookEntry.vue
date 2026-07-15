<script setup lang="ts">
import type { GuestbookEntry } from '~/models/guestbook';

const props = defineProps<{
    entry: GuestbookEntry;
    currentUserId: string;
    profileOwnerId: string;
    highlighted?: boolean;
}>();
const emit = defineEmits<{
    (e: 'update', id: string, content: string): void;
    (e: 'delete' | 'hide' | 'report' | 'block', entry: GuestbookEntry): void;
}>();
const editing = ref(false);
const editContent = ref('');
const isAuthor = computed(() => props.entry.author_id === props.currentUserId);
const isProfileOwner = computed(() => props.profileOwnerId === props.currentUserId);
const displayName = computed(() =>
    (props.entry.author?.preferred_username || props.entry.author?.full_name || '사용자').replace(
        /^@+/,
        '',
    ),
);
const formattedDate = computed(() =>
    new Date(props.entry.created_at).toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }),
);

function startEdit() {
    editContent.value = props.entry.content;
    editing.value = true;
}
function saveEdit() {
    const value = editContent.value.trim();
    if (!value) return;
    emit('update', props.entry.id, value);
    editing.value = false;
}
</script>

<template>
    <article
        :id="`guestbook-${entry.id}`"
        class="guestbook-entry"
        :class="{ highlighted, muted: entry.status !== 'visible' }"
    >
        <NuxtLink
            :to="`/profile/${entry.author_id}`"
            class="author-link"
            :aria-label="`${displayName} 프로필 보기`"
        >
            <q-avatar size="42px">
                <q-img v-if="entry.author?.avatar_url" :src="entry.author.avatar_url" />
                <q-icon v-else name="person" color="grey-6" />
            </q-avatar>
        </NuxtLink>
        <div class="entry-main">
            <div class="entry-header">
                <div>
                    <NuxtLink :to="`/profile/${entry.author_id}`" class="author-name">{{
                        displayName
                    }}</NuxtLink>
                    <span class="entry-date">{{ formattedDate }}</span>
                </div>
                <q-btn
                    v-if="isAuthor || isProfileOwner"
                    flat
                    round
                    dense
                    icon="more_vert"
                    aria-label="방명록 메뉴"
                >
                    <q-menu>
                        <q-list style="min-width: 150px">
                            <q-item
                                v-if="isAuthor && entry.status === 'visible'"
                                v-close-popup
                                clickable
                                @click="startEdit"
                            >
                                <q-item-section avatar><q-icon name="edit" /></q-item-section
                                ><q-item-section>수정</q-item-section>
                            </q-item>
                            <q-item
                                v-if="isProfileOwner && entry.status === 'visible'"
                                v-close-popup
                                clickable
                                @click="emit('hide', entry)"
                            >
                                <q-item-section avatar
                                    ><q-icon name="visibility_off" /></q-item-section
                                ><q-item-section>숨기기</q-item-section>
                            </q-item>
                            <q-item
                                v-close-popup
                                clickable
                                class="text-negative"
                                @click="emit('delete', entry)"
                            >
                                <q-item-section avatar><q-icon name="delete" /></q-item-section
                                ><q-item-section>삭제</q-item-section>
                            </q-item>
                            <q-item
                                v-if="isProfileOwner && !isAuthor"
                                v-close-popup
                                clickable
                                class="text-negative"
                                @click="emit('block', entry)"
                            >
                                <q-item-section avatar><q-icon name="block" /></q-item-section
                                ><q-item-section>작성자 차단</q-item-section>
                            </q-item>
                            <q-item
                                v-if="isProfileOwner && !isAuthor"
                                v-close-popup
                                clickable
                                @click="emit('report', entry)"
                            >
                                <q-item-section avatar><q-icon name="flag" /></q-item-section
                                ><q-item-section>신고</q-item-section>
                            </q-item>
                        </q-list>
                    </q-menu>
                </q-btn>
                <q-btn v-else flat round dense icon="more_vert" aria-label="방명록 메뉴">
                    <q-menu
                        ><q-list
                            ><q-item v-close-popup clickable @click="emit('report', entry)"
                                ><q-item-section avatar><q-icon name="flag" /></q-item-section
                                ><q-item-section>신고</q-item-section></q-item
                            ></q-list
                        ></q-menu
                    >
                </q-btn>
            </div>
            <div v-if="editing" class="edit-area">
                <q-input
                    v-model="editContent"
                    outlined
                    autogrow
                    maxlength="300"
                    counter
                    aria-label="방명록 수정 내용"
                />
                <div class="edit-actions">
                    <q-btn flat label="취소" @click="editing = false" /><q-btn
                        unelevated
                        color="primary"
                        label="저장"
                        :disable="!editContent.trim()"
                        @click="saveEdit"
                    />
                </div>
            </div>
            <p v-else-if="entry.status === 'deleted'" class="entry-content deleted-content">
                삭제된 방명록입니다.
            </p>
            <p v-else class="entry-content">{{ entry.content }}</p>
            <span
                v-if="entry.updated_at !== entry.created_at && entry.status === 'visible'"
                class="edited-label"
                >수정됨</span
            >
            <q-chip
                v-if="entry.status === 'hidden'"
                dense
                color="grey-3"
                text-color="grey-8"
                icon="visibility_off"
                >숨김 처리됨</q-chip
            >
        </div>
    </article>
</template>

<style scoped lang="scss">
.guestbook-entry {
    display: flex;
    gap: 12px;
    padding: 18px 4px;
    scroll-margin-top: 88px;
    border-bottom: 1px solid var(--border-color);
    transition:
        background 0.25s,
        box-shadow 0.25s;
}
.guestbook-entry.highlighted {
    background: color-mix(in srgb, var(--color-accent, #ffe66d) 20%, transparent);
    box-shadow: inset 3px 0 var(--color-accent, #ffe66d);
}
.guestbook-entry.muted {
    opacity: 0.72;
}
.author-link {
    flex: 0 0 auto;
    text-decoration: none;
}
.entry-main {
    min-width: 0;
    flex: 1;
}
.entry-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
}
.author-name {
    color: var(--text-primary);
    font-weight: 700;
    text-decoration: none;
}
.entry-date {
    display: block;
    margin-top: 2px;
    color: var(--text-secondary);
    font-size: 12px;
}
.entry-content {
    margin: 9px 0 0;
    color: var(--text-primary);
    line-height: 1.65;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
}
.deleted-content {
    color: var(--text-secondary);
    font-style: italic;
}
.edited-label {
    color: var(--text-secondary);
    font-size: 11px;
}
.edit-area {
    margin-top: 10px;
}
.edit-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 8px;
}
@media (max-width: 600px) {
    .guestbook-entry {
        gap: 10px;
        padding: 16px 0;
    }
    .edit-actions > * {
        min-height: 44px;
    }
}
</style>

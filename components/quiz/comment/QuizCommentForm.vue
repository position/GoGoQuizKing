<script setup lang="ts">
import type { MentionCandidate, QuizCommentMention } from '~/models/comment';

interface Props {
    quizId: string;
    parentId?: string;
    placeholder?: string;
    submitLabel?: string;
    initialContent?: string;
    initialMentions?: QuizCommentMention[];
    mentionCandidates?: MentionCandidate[];
    autoMention?: MentionCandidate | null;
    isEdit?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    placeholder: '댓글을 입력하세요...',
    submitLabel: '등록',
    initialContent: '',
    initialMentions: () => [],
    mentionCandidates: () => [],
    autoMention: null,
    isEdit: false,
});

const emit = defineEmits<{
    (e: 'submit', content: string, mentions: QuizCommentMention[]): void;
    (e: 'cancel'): void;
}>();

const content = ref(props.initialContent);
const isSubmitting = ref(false);
const inputRef = ref<{ getNativeElement?: () => HTMLTextAreaElement | HTMLInputElement } | null>(
    null,
);
const mentionDrafts = ref<QuizCommentMention[]>(
    props.initialMentions.map((mention) => ({ ...mention })),
);
const previousContent = ref(content.value);
const showMentionPicker = ref(false);
const mentionQuery = ref('');
const mentionStart = ref(-1);
const activeCandidateIndex = ref(0);

function getMentionName(candidate: MentionCandidate): string {
    return (candidate.preferred_username || candidate.full_name || '사용자').replace(/^@+/, '');
}

function restoreInitialMentions() {
    mentionDrafts.value = props.initialMentions.map((mention) => ({ ...mention }));
}

function applyAutoMention() {
    if (!props.autoMention || content.value.trim()) {
        return;
    }

    const name = getMentionName(props.autoMention);
    content.value = `@${name} `;
    previousContent.value = content.value;
    mentionDrafts.value = [
        {
            mentioned_user_id: props.autoMention.user_id,
            mention_text: name,
            start_offset: 0,
            length: name.length + 1,
        },
    ];
}

const filteredCandidates = computed(() => {
    const query = mentionQuery.value.toLocaleLowerCase('ko-KR');
    return props.mentionCandidates
        .filter((candidate) => {
            const name = getMentionName(candidate).toLocaleLowerCase('ko-KR');
            return !query || name.includes(query);
        })
        .slice(0, 8);
});

const isValid = computed(() => {
    return content.value.trim().length > 0;
});

async function handleSubmit() {
    if (!isValid.value || isSubmitting.value) {
        return;
    }

    isSubmitting.value = true;
    try {
        const trimmedContent = content.value.trim();
        emit('submit', trimmedContent, buildMentions(trimmedContent));
        if (!props.isEdit) {
            content.value = '';
            previousContent.value = '';
            mentionDrafts.value = [];
        }
    } finally {
        isSubmitting.value = false;
    }
}

function handleCancel() {
    content.value = '';
    previousContent.value = '';
    mentionDrafts.value = [];
    closeMentionPicker();
    emit('cancel');
}

function buildMentions(value: string): QuizCommentMention[] {
    const leadingWhitespace = content.value.length - content.value.trimStart().length;

    return mentionDrafts.value
        .map((mention) => ({
            ...mention,
            start_offset: mention.start_offset - leadingWhitespace,
        }))
        .filter((mention) => {
            if (mention.start_offset < 0) {
                return false;
            }
            const token = `@${mention.mention_text}`;
            return (
                value.slice(mention.start_offset, mention.start_offset + mention.length) === token
            );
        })
        .sort((a, b) => a.start_offset - b.start_offset);
}

function reconcileMentionOffsets(oldValue: string, newValue: string) {
    if (oldValue === newValue || !mentionDrafts.value.length) {
        return;
    }

    let prefixLength = 0;
    const maxPrefix = Math.min(oldValue.length, newValue.length);
    while (prefixLength < maxPrefix && oldValue[prefixLength] === newValue[prefixLength]) {
        prefixLength++;
    }

    let suffixLength = 0;
    const maxSuffix = Math.min(oldValue.length - prefixLength, newValue.length - prefixLength);
    while (
        suffixLength < maxSuffix &&
        oldValue[oldValue.length - 1 - suffixLength] ===
            newValue[newValue.length - 1 - suffixLength]
    ) {
        suffixLength++;
    }

    const oldChangeEnd = oldValue.length - suffixLength;
    const newChangeEnd = newValue.length - suffixLength;
    const delta = newChangeEnd - oldChangeEnd;

    mentionDrafts.value = mentionDrafts.value
        .map((mention) => {
            const mentionEnd = mention.start_offset + mention.length;
            if (mentionEnd <= prefixLength) {
                return mention;
            }
            if (mention.start_offset >= oldChangeEnd) {
                return { ...mention, start_offset: mention.start_offset + delta };
            }
            return null;
        })
        .filter((mention): mention is QuizCommentMention => Boolean(mention))
        .filter((mention) => {
            const token = `@${mention.mention_text}`;
            return (
                newValue.slice(mention.start_offset, mention.start_offset + mention.length) ===
                token
            );
        });
}

function handleContentUpdate(value: string | number | null) {
    const newValue = String(value ?? '');
    reconcileMentionOffsets(previousContent.value, newValue);
    previousContent.value = newValue;
    updateMentionPicker();
}

function getNativeInput(): HTMLTextAreaElement | HTMLInputElement | null {
    return inputRef.value?.getNativeElement?.() || null;
}

async function updateMentionPicker() {
    await nextTick();
    const input = getNativeInput();
    const cursor = input?.selectionStart ?? content.value.length;
    const beforeCursor = content.value.slice(0, cursor);
    const match = beforeCursor.match(/(?:^|\s)@([^\s@]*)$/);

    if (!match) {
        closeMentionPicker();
        return;
    }

    mentionQuery.value = match[1] || '';
    mentionStart.value = cursor - mentionQuery.value.length - 1;
    activeCandidateIndex.value = 0;
    showMentionPicker.value = filteredCandidates.value.length > 0;
}

function closeMentionPicker() {
    showMentionPicker.value = false;
    mentionQuery.value = '';
    mentionStart.value = -1;
    activeCandidateIndex.value = 0;
}

async function selectMention(candidate: MentionCandidate) {
    const input = getNativeInput();
    const cursor = input?.selectionStart ?? content.value.length;
    const name = getMentionName(candidate);
    const token = `@${name}`;
    const start = Math.max(0, mentionStart.value);
    const oldValue = content.value;
    const newValue = `${oldValue.slice(0, start)}${token} ${oldValue.slice(cursor)}`;

    reconcileMentionOffsets(oldValue, newValue);
    mentionDrafts.value.push({
        mentioned_user_id: candidate.user_id,
        mention_text: name,
        start_offset: start,
        length: token.length,
    });

    content.value = newValue;
    previousContent.value = newValue;
    closeMentionPicker();

    await nextTick();
    const nextCursor = start + token.length + 1;
    getNativeInput()?.setSelectionRange(nextCursor, nextCursor);
    getNativeInput()?.focus();
}

function handleMentionKeydown(event: KeyboardEvent) {
    if (!showMentionPicker.value || !filteredCandidates.value.length) {
        return;
    }

    if (event.key === 'ArrowDown') {
        event.preventDefault();
        activeCandidateIndex.value =
            (activeCandidateIndex.value + 1) % filteredCandidates.value.length;
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        activeCandidateIndex.value =
            (activeCandidateIndex.value - 1 + filteredCandidates.value.length) %
            filteredCandidates.value.length;
    } else if (event.key === 'Enter' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        selectMention(filteredCandidates.value[activeCandidateIndex.value]);
    } else if (event.key === 'Escape') {
        event.preventDefault();
        closeMentionPicker();
    }
}

// 초기값이 변경될 때 업데이트
watch(
    () => props.initialContent,
    (newVal) => {
        content.value = newVal;
        previousContent.value = newVal;
        restoreInitialMentions();
    },
);

watch(
    () => props.initialMentions,
    () => restoreInitialMentions(),
    { deep: true },
);

onMounted(() => {
    restoreInitialMentions();
    applyAutoMention();
});
</script>

<template>
    <div class="quiz-comment-form">
        <div class="mention-input-wrapper">
            <q-input
                ref="inputRef"
                v-model="content"
                type="textarea"
                :placeholder="placeholder"
                outlined
                autogrow
                :max-height="150"
                class="comment-input"
                @update:model-value="handleContentUpdate"
                @click="updateMentionPicker"
                @keydown="handleMentionKeydown"
                @keydown.ctrl.enter="handleSubmit"
                @keydown.meta.enter="handleSubmit"
            >
                <template #hint>
                    <span class="hint-text">@로 친구를 부를 수 있어요 · Ctrl + Enter로 등록</span>
                </template>
            </q-input>

            <q-list v-if="showMentionPicker" bordered class="mention-picker">
                <q-item
                    v-for="(candidate, index) in filteredCandidates"
                    :key="candidate.user_id"
                    clickable
                    :active="index === activeCandidateIndex"
                    active-class="mention-candidate-active"
                    @mousedown.prevent="selectMention(candidate)"
                >
                    <q-item-section avatar>
                        <q-avatar size="32px">
                            <q-img v-if="candidate.avatar_url" :src="candidate.avatar_url" />
                            <q-icon v-else name="person" color="grey-6" />
                        </q-avatar>
                    </q-item-section>
                    <q-item-section>
                        <q-item-label>@{{ getMentionName(candidate) }}</q-item-label>
                        <q-item-label v-if="candidate.level" caption>
                            Lv.{{ candidate.level }}
                        </q-item-label>
                    </q-item-section>
                </q-item>
            </q-list>
        </div>

        <div class="form-actions">
            <q-btn
                v-if="isEdit || parentId"
                flat
                no-caps
                color="grey-7"
                label="취소"
                @click="handleCancel"
            />
            <q-btn
                unelevated
                no-caps
                color="primary"
                :label="submitLabel"
                :loading="isSubmitting"
                :disable="!isValid"
                @click="handleSubmit"
            />
        </div>
    </div>
</template>

<style scoped lang="scss">
.quiz-comment-form {
    background: var(--bg-card);
    border-radius: 12px;
    padding: 12px;
    box-shadow: 0 1px 3px var(--shadow-color);

    .mention-input-wrapper {
        position: relative;
    }

    .mention-picker {
        position: absolute;
        z-index: 20;
        right: 0;
        bottom: calc(100% + 6px);
        left: 0;
        max-height: 260px;
        overflow-y: auto;
        border-radius: 10px;
        background: var(--bg-card, white);
        box-shadow: 0 8px 24px var(--shadow-color);
    }

    :deep(.mention-candidate-active) {
        background: var(--hover-overlay, #f2f2f2);
        color: var(--text-primary, #333);
    }

    .comment-input {
        :deep(.q-field__control) {
            border-radius: 8px;
        }

        .hint-text {
            color: var(--text-light);
            font-size: 12px;
        }
    }

    .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 8px;
    }
}
</style>

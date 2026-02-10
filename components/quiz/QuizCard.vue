<template>
    <q-card class="quiz-card-component" @click="handleClick">
        <q-card-section class="card-header">
            <div class="badges">
                <CategoryChip :category="quiz.category" />
                <DifficultyBadge :difficulty="quiz.difficulty" />
            </div>
        </q-card-section>

        <q-card-section class="card-body">
            <h3 class="title">{{ quiz.title }}</h3>
            <p v-if="quiz.description" class="description">{{ quiz.description }}</p>
        </q-card-section>

        <q-card-section class="card-footer">
            <div class="meta">
                <span class="play-count">
                    <q-icon name="play_arrow" size="16px" />
                    {{ quiz.play_count }}회 플레이
                </span>
                <span class="date">
                    <q-icon name="schedule" size="16px" />
                    {{ formatDate(quiz.created_at) }}
                </span>
            </div>

            <div v-if="showActions" class="actions">
                <q-btn
                    @click.stop="$emit('edit', quiz.id)"
                    icon="edit"
                    flat
                    round
                    size="sm"
                    color="primary"
                >
                    <q-tooltip>수정</q-tooltip>
                </q-btn>
                <q-btn
                    @click.stop="$emit('delete', quiz.id)"
                    icon="delete"
                    flat
                    round
                    size="sm"
                    color="negative"
                >
                    <q-tooltip>삭제</q-tooltip>
                </q-btn>
            </div>
        </q-card-section>

        <q-card-actions v-if="showPlayButton" class="play-actions">
            <q-btn
                @click.stop="$emit('play', quiz.id)"
                label="퀴즈 풀기"
                icon="play_arrow"
                color="primary"
                class="full-width play-btn"
                unelevated
            />
        </q-card-actions>
    </q-card>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import type { Quiz, QuizWithAuthor } from '@/models/quiz';
import CategoryChip from './CategoryChip.vue';
import DifficultyBadge from './DifficultyBadge.vue';

const props = withDefaults(
    defineProps<{
        quiz: Quiz | QuizWithAuthor;
        showActions?: boolean;
        showPlayButton?: boolean;
    }>(),
    {
        showActions: false,
        showPlayButton: true,
    }
);

const emit = defineEmits<{
    (e: 'click', id: string): void;
    (e: 'play', id: string): void;
    (e: 'edit', id: string): void;
    (e: 'delete', id: string): void;
}>();

function formatDate(date: string): string {
    return dayjs(date).format('YYYY.MM.DD');
}

function handleClick() {
    emit('click', props.quiz.id);
}
</script>

<style scoped lang="scss">
.quiz-card-component {
    cursor: pointer;
    border-radius: 16px;
    transition:
        transform 0.25s ease,
        box-shadow 0.25s ease;
    background: #ffffff;
    overflow: hidden;

    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    .card-header {
        padding: 16px 16px 8px;

        .badges {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }
    }

    .card-body {
        padding: 8px 16px;

        .title {
            font-size: 18px;
            font-weight: 700;
            color: #2d3436;
            margin: 0 0 8px;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .description {
            font-size: 14px;
            color: #636e72;
            margin: 0;
            line-height: 1.5;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
    }

    .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 16px;
        border-top: 1px solid #f1f3f4;

        .meta {
            display: flex;
            gap: 12px;
            font-size: 12px;
            color: #b2bec3;

            span {
                display: flex;
                align-items: center;
                gap: 4px;
            }
        }

        .actions {
            display: flex;
            gap: 4px;
        }
    }

    .play-actions {
        padding: 12px 16px 16px;

        .play-btn {
            border-radius: 12px;
            font-weight: 600;
            min-height: 44px;
        }
    }
}
</style>

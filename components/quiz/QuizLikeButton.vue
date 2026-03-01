<script setup lang="ts">
import { useQuizLikes } from '~/composables/use-quiz-likes';

interface Props {
    quizId: string;
    size?: 'sm' | 'md' | 'lg';
    showCount?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    size: 'md',
    showCount: true,
});

const { isLiked, likeCount, loading, error, fetchLikeStatus, toggleLike } = useQuizLikes({
    quizId: props.quizId,
});

const supabase = useSupabase();
const isLoggedIn = ref(false);

onMounted(async () => {
    const { data } = await supabase.auth.getUser();
    isLoggedIn.value = !!data.user;

    await fetchLikeStatus();
});

async function handleClick() {
    if (!isLoggedIn.value) {
        // 로그인 필요 메시지
        alert('좋아요를 누르려면 로그인이 필요합니다.');
        return;
    }

    await toggleLike();
}

const iconSize = computed(() => {
    switch (props.size) {
        case 'sm':
            return '20px';
        case 'lg':
            return '28px';
        default:
            return '24px';
    }
});

const buttonSize = computed(() => {
    switch (props.size) {
        case 'sm':
            return 'sm';
        case 'lg':
            return 'md';
        default:
            return 'sm';
    }
});

const formattedCount = computed(() => {
    if (likeCount.value >= 1000) {
        return `${(likeCount.value / 1000).toFixed(1)}K`;
    }
    return likeCount.value.toString();
});
</script>

<template>
    <div class="quiz-like-button">
        <q-btn
            :flat="!isLiked"
            :unelevated="isLiked"
            round
            :color="isLiked ? 'red' : 'grey-7'"
            :loading="loading"
            :size="buttonSize"
            @click="handleClick"
        >
            <q-icon
                :name="isLiked ? 'favorite' : 'favorite_border'"
                :size="iconSize"
                :class="{ 'like-animation': isLiked }"
            />
            <q-tooltip v-if="!isLiked">좋아요</q-tooltip>
            <q-tooltip v-else>좋아요 취소</q-tooltip>
        </q-btn>

        <span v-if="showCount" class="like-count" :class="{ liked: isLiked }">
            {{ formattedCount }}
        </span>
    </div>
</template>

<style scoped lang="scss">
.quiz-like-button {
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

.like-count {
    font-size: 14px;
    font-weight: 500;
    color: #666;
    min-width: 24px;
    text-align: center;

    &.liked {
        color: #e53935;
    }
}

.like-animation {
    animation: heartbeat 0.3s ease-in-out;
}

@keyframes heartbeat {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.3);
    }
    100% {
        transform: scale(1);
    }
}
</style>

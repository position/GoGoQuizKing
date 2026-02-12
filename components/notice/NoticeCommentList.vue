<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ToastMessage } from '~/helper/message';
import dayjs from 'dayjs';
import type { CommentInfo } from '~/models/comment';

const isLoading = ref<boolean>(false);
const commentList = ref<CommentInfo[]>([]);
const supabase = useSupabaseClient();
const props = defineProps<{
    postId?: number;
}>();

onMounted(async () => {
    await getCommentList();
});

async function getCommentList() {
    if (!props.postId) {
        console.error('Notice ID is required to fetch comments.');
        return;
    }
    try {
        const { data, error } = await supabase
                .from('comments')
                .select('*')
                .eq('post_id', props.postId)
                .order('created_at', { ascending: true });
        console.log(data);
        commentList.value = data || [];
    } catch (e) {
        console.error(e);
        ToastMessage.error(e);
    }
}
</script>

<template>
    <div class="notice-comment-list">
        <h3>댓글</h3>
        <ul>
            <li v-for="comment in commentList" :key="comment.id">
                <p>{{ comment.content }}</p>
                <span>{{ dayjs(comment.created_at).format('YYYY-MM-DD HH:mm') }}</span>
            </li>
        </ul>
    </div>
</template>

<style scoped lang="scss">
.notice-comment-list {
    margin-top: 10px;
    h3 {
        border-bottom: 1px solid var(--border-color);
        padding-bottom: 10px;
        margin-bottom: 10px;
        font-size: 1.2em;
        line-height: 100%;
        color: var(--text-primary);
    }
    ul {
        list-style-type: none;
        padding: 0;
        li {
            margin-bottom: 10px;
            p {
                margin: 0;
                color: var(--text-primary);
            }
            span {
                font-size: 0.8em;
                color: var(--text-light);
            }
        }
    }
}
</style>

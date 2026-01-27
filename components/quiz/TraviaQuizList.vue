<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { DTO } from '@/models';
import getTriviaQuizListApi from '~/api/quiz/get-trivia-quiz-list-api';

const answerList = ref<string[]>([]);
const questionList = ref<DTO.Travia.QuestionInfo[]>([]);
const quizListFetch = useAsyncData(
    () => {
        getTriviaQuizListApi({ limit: 10 });
    },
    {
        transform: (data) => {
            questionList.value = data.transactionHistoryList;
            answerList.value = questionList.value.map((q) => {
                q.randomAnswers = q.incorrectAnswers
                    .concat(q.correctAnswer)
                    .sort(() => Math.random() - 0.5);
                return q;
            });
        },
        watch: [],
    },
);

const isLoading = computed(() => quizListFetch.status.value === 'pending');

async function getQuizList() {
    try {
        const params = {
            limit: 10,
        };
        answerList.value = questionList.value.map((q) => {
            q.randomAnswers = q.incorrectAnswers
                .concat(q.correctAnswer)
                .sort(() => Math.random() - 0.5);
            return q;
        });
        // console.log(answerList.value);
    } catch (e) {
        console.error(e);
    }
}
</script>

<template>
    <q-card v-for="(question, i) in questionList" :key="i" flat bordered class="my-card q-mb-md">
        <q-card-section>
            <div class="row items-center no-wrap">
                <div class="col">
                    <div class="text-h6">{{ question.question }}</div>
                    <div class="text-subtitle2">{{ question.category }}</div>
                </div>

                <div class="col-auto">
                    <q-btn color="grey-7" round flat icon="more_vert">
                        <q-menu cover auto-close>
                            <q-list>
                                <q-item clickable>
                                    <q-item-section>Remove Card</q-item-section>
                                </q-item>
                                <q-item clickable>
                                    <q-item-section>Send Feedback</q-item-section>
                                </q-item>
                                <q-item clickable>
                                    <q-item-section>Share</q-item-section>
                                </q-item>
                            </q-list>
                        </q-menu>
                    </q-btn>
                </div>
            </div>
        </q-card-section>

        <q-card-section>
            <ol class="answer-list-area">
                <li v-for="(answer, j) in question.randomAnswers" :key="j" class="list">
                    {{ answer }}
                </li>
            </ol>
        </q-card-section>

        <q-separator />

        <q-card-actions>
            <q-btn flat outline round>1</q-btn>
            <q-btn flat outline round>2</q-btn>
            <q-btn flat outline round>3</q-btn>
            <q-btn flat outline round>4</q-btn>
        </q-card-actions>
    </q-card>
</template>

<style scoped lang="scss">
.answer-list-area {
    padding: 15px;
    > .list {
        padding-bottom: 10px;
    }
}
</style>

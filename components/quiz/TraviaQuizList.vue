<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { DTO } from '@/models';
import getTriviaQuizListApi from '~/api/quiz/get-trivia-quiz-list-api';
import { AlertMessage } from '~/helper/message';

const answerList = ref<DTO.Travia.QuestionInfo[]>([]);
const questionList = ref<DTO.Travia.QuestionInfo[]>([]);
const quizListFetch = useAsyncData(() => getTriviaQuizListApi({ limit: 10 }), {
    transform: (data) => {
        questionList.value = data;
        answerList.value = questionList.value.map((q) => {
            q.randomAnswers = q.incorrectAnswers
                .concat(q.correctAnswer)
                .sort(() => Math.random() - 0.5);
            return q;
        });
    },
    watch: [],
});

const isLoading = computed(() => quizListFetch.status.value === 'pending');

function getSelectedAnswer(question: DTO.Travia.QuestionInfo, selectedAnswer: string) {
    // Handle answer selection logic here
    if (question.correctAnswer === selectedAnswer) {
        AlertMessage({
            title: '정답 확인',
            message: `Correct! The answer is: ${question.correctAnswer}`,
        });
    } else {
        AlertMessage({
            title: '정답 확인',
            message: `Incorrect! The correct answer is: ${question.correctAnswer}`,
        });
    }
}
</script>

<template>
    <div v-if="isLoading" class="row justify-center items-center no-wrap full-height">
        <q-spinner color="primary" size="100px" class="q-mt-md" />
    </div>
    <template v-else>
        <q-card
            v-for="(question, i) in questionList"
            :key="i"
            flat
            bordered
            class="my-card q-mb-md"
        >
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
                        <span @click="getSelectedAnswer(question, answer)" class="answer">{{
                            answer
                        }}</span>
                    </li>
                </ol>
            </q-card-section>

            <q-separator />
        </q-card>
        <div class="row justify-center">
            <q-btn
                @click="quizListFetch.refresh()"
                color="primary"
                label="다음 10문제"
                size="lg"
                icon="arrow_forward"
            />
        </div>
    </template>
</template>

<style scoped lang="scss">
.answer-list-area {
    padding: 15px;
    > .list {
        padding-bottom: 10px;
        > .answer {
            cursor: pointer;
            padding: 10px;
            border-radius: 5px;
            transition: background-color 0.3s ease;
            &:hover {
                background-color: #52a8f6;
            }
        }
    }
}
</style>

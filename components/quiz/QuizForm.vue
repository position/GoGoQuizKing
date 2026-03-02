<template>
    <div class="quiz-form">
        <!-- 기본 정보 -->
        <q-card class="form-section">
            <q-card-section>
                <h3 class="section-title">📝 퀴즈 기본 정보를 적어주세요!</h3>

                <q-input
                    v-model="formData.title"
                    label="퀴즈 제목 ✨"
                    placeholder="예: 재미있는 한글 맞춤법 퀴즈"
                    outlined
                    :rules="[(v) => !!v || '제목을 적어주세요~ 🙏']"
                    class="q-mb-md"
                />

                <q-input
                    v-model="formData.description"
                    label="퀴즈 설명 (선택사항)"
                    placeholder="퀴즈에 대해 간단히 소개해주세요~"
                    outlined
                    type="textarea"
                    rows="2"
                    class="q-mb-md"
                />

                <div class="row q-col-gutter-md">
                    <div class="col-12 col-sm-6">
                        <q-select
                            v-model="formData.category"
                            :options="categoryOptions"
                            label="카테고리"
                            outlined
                            emit-value
                            map-options
                        />
                    </div>
                    <div class="col-12 col-sm-6">
                        <q-select
                            v-model="formData.difficulty"
                            :options="difficultyOptions"
                            label="난이도"
                            outlined
                            emit-value
                            map-options
                        />
                    </div>
                </div>

                <div class="row q-col-gutter-md q-mt-sm">
                    <div class="col-12 col-sm-6">
                        <q-select
                            v-model="formData.grade_level"
                            :options="gradeLevelOptions"
                            label="추천 학년"
                            outlined
                            emit-value
                            map-options
                        />
                    </div>
                    <div class="col-12 col-sm-6">
                        <q-toggle
                            v-model="formData.is_public"
                            label="모두에게 공개하기 🌍"
                            color="primary"
                        />
                    </div>
                </div>
            </q-card-section>
        </q-card>

        <!-- AI 자동 생성 섹션 -->
        <q-card class="form-section ai-section">
            <q-card-section>
                <div class="ai-header">
                    <h3 class="section-title">🤖 AI로 퀴즈 자동 생성</h3>
                    <q-badge color="purple" label="Beta" />
                </div>
                <p class="ai-description">주제만 입력하면 AI가 자동으로 퀴즈를 만들어줘요!</p>

                <div class="ai-input-row">
                    <q-input
                        v-model="aiTopic"
                        label="퀴즈 주제"
                        placeholder="예: 한국의 역사, 태양계 행성, 구구단..."
                        outlined
                        class="ai-topic-input"
                        :disable="isGeneratingAI"
                    />
                    <q-select
                        v-model="aiQuestionCount"
                        :options="questionCountOptions"
                        label="문제 수"
                        outlined
                        emit-value
                        map-options
                        class="ai-count-select"
                        :disable="isGeneratingAI"
                    />
                </div>

                <div class="ai-options-row">
                    <q-btn-toggle
                        v-model="aiQuestionTypes"
                        :options="aiTypeOptions"
                        multiple
                        no-caps
                        rounded
                        unelevated
                        toggle-color="primary"
                        class="ai-type-toggle"
                        :disable="isGeneratingAI"
                    />
                </div>

                <div class="ai-action-row">
                    <q-btn
                        @click="generateWithAI"
                        label="AI로 퀴즈 생성하기 ✨"
                        icon="auto_awesome"
                        color="purple"
                        unelevated
                        :loading="isGeneratingAI"
                        :disable="!aiTopic.trim() || isGeneratingAI"
                        class="ai-generate-btn"
                        size="lg"
                    />
                </div>

                <q-linear-progress
                    v-if="isGeneratingAI"
                    indeterminate
                    color="purple"
                    class="q-mt-sm"
                />
            </q-card-section>
        </q-card>

        <!-- 문제 목록 -->
        <div class="questions-section">
            <div class="section-header">
                <h3 class="section-title">퀴즈를 만들어봐요!</h3>
                <q-btn
                    @click="addQuestion"
                    label="문제 추가하기"
                    icon="add"
                    color="secondary"
                    unelevated
                    class="add-btn"
                    size="large"
                />
            </div>

            <div v-for="(question, index) in formData.questions" :key="index" class="question-item">
                <q-card class="question-card">
                    <q-card-section>
                        <div class="question-header">
                            <span class="question-number">문제 {{ index + 1 }}</span>
                            <q-btn
                                v-if="formData.questions.length > 1"
                                @click="removeQuestion(index)"
                                icon="close"
                                flat
                                round
                                size="sm"
                                color="negative"
                            />
                        </div>

                        <q-btn-toggle
                            v-model="question.question_type"
                            :options="questionTypeOptions"
                            spread
                            no-caps
                            class="q-mb-md type-toggle"
                        />

                        <q-input
                            v-model="question.question_text"
                            label="문제 내용"
                            placeholder="문제를 적어주세요~ 🤔"
                            outlined
                            type="textarea"
                            rows="2"
                            :rules="[(v) => !!v || '문제를 적어주세요~']"
                            class="q-mb-md"
                        />

                        <!-- 객관식 보기 -->
                        <div v-if="question.question_type === 'multiple'" class="options-section">
                            <p class="options-label">보기를 적고 정답을 선택해주세요! ✅</p>
                            <div
                                v-for="(_, optIndex) in question.options"
                                :key="optIndex"
                                class="option-row"
                            >
                                <q-radio
                                    :model-value="question.correct_answer"
                                    @update:model-value="question.correct_answer = $event"
                                    :val="question.options[optIndex]"
                                    :label="undefined"
                                    color="primary"
                                />
                                <q-input
                                    v-model="question.options[optIndex]"
                                    :label="`보기 ${optIndex + 1}`"
                                    outlined
                                    dense
                                    class="option-input"
                                    :rules="[(v) => !!v || '보기를 적어주세요~']"
                                />
                            </div>
                        </div>

                        <!-- OX 퀴즈 -->
                        <div v-else-if="question.question_type === 'ox'" class="ox-section">
                            <p class="options-label">O일까요, X일까요? 🤔</p>
                            <q-btn-toggle
                                v-model="question.correct_answer"
                                :options="[
                                    { label: '⭕ O', value: 'O' },
                                    { label: '❌ X', value: 'X' },
                                ]"
                                spread
                                no-caps
                                class="ox-toggle"
                            />
                        </div>

                        <!-- 단답형 -->
                        <div v-else-if="question.question_type === 'short'" class="short-section">
                            <q-input
                                v-model="question.correct_answer"
                                label="정답을 적어주세요!"
                                placeholder="정답이 뭘까요~?"
                                outlined
                                :rules="[(v) => !!v || '정답을 적어주세요~']"
                            />
                        </div>

                        <q-input
                            v-model="question.hint"
                            label="💡 힌트 (선택사항)"
                            placeholder="어려우면 도움이 될 힌트를 적어주세요~"
                            outlined
                            class="q-mt-md"
                        />
                    </q-card-section>
                </q-card>
            </div>
        </div>

        <!-- 제출 버튼 -->
        <div class="submit-section">
            <q-btn
                @click="handleCancel"
                label="취소"
                outline
                color="grey"
                class="cancel-btn"
                size="lg"
            />
            <q-btn
                @click="handleSubmit"
                :label="isEdit ? '퀴즈 수정 완료! ✏️' : '퀴즈 생성 완료! 🎉'"
                :loading="isLoading"
                color="primary"
                unelevated
                class="submit-btn"
                size="lg"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { CATEGORIES, DIFFICULTIES, DEFAULT_QUESTION_FORM, DEFAULT_QUIZ_FORM } from '@/models/quiz';
import type { QuizFormData, QuestionFormData } from '@/models/quiz';

const $q = useQuasar();

const props = withDefaults(
    defineProps<{
        initialData?: QuizFormData;
        isEdit?: boolean;
        isLoading?: boolean;
    }>(),
    {
        isEdit: false,
        isLoading: false,
    },
);

const emit = defineEmits<{
    (e: 'submit', data: QuizFormData): void;
    (e: 'cancel'): void;
}>();

// 깊은 복사 헬퍼 함수
function deepCloneQuizForm(data: QuizFormData): QuizFormData {
    return {
        ...data,
        questions: data.questions.map((q) => ({
            ...q,
            options: [...q.options],
        })),
    };
}

const formData = ref<QuizFormData>(
    props.initialData ? deepCloneQuizForm(props.initialData) : deepCloneQuizForm(DEFAULT_QUIZ_FORM),
);

// 초기 데이터 변경 감지
watch(
    () => props.initialData,
    (newData) => {
        if (newData) {
            formData.value = deepCloneQuizForm(newData);
        }
    },
    { deep: true },
);

// AI 자동 생성 관련 상태
const aiTopic = ref('');
const aiQuestionCount = ref(5);
const aiQuestionTypes = ref<string[]>(['multiple']);
const isGeneratingAI = ref(false);

// 문제 수 옵션
const questionCountOptions = [
    { label: '3문제', value: 3 },
    { label: '5문제', value: 5 },
    { label: '7문제', value: 7 },
    { label: '10문제', value: 10 },
];

// AI 문제 유형 옵션
const aiTypeOptions = [
    { label: '📝 객관식', value: 'multiple' },
    { label: '⭕ OX', value: 'ox' },
    { label: '✏️ 단답형', value: 'short' },
];

// AI로 퀴즈 생성
async function generateWithAI() {
    if (!aiTopic.value.trim()) {
        $q.notify({
            type: 'warning',
            message: '퀴즈 주제를 입력해주세요!',
            icon: 'warning',
        });
        return;
    }

    if (aiQuestionTypes.value.length === 0) {
        $q.notify({
            type: 'warning',
            message: '문제 유형을 하나 이상 선택해주세요!',
            icon: 'warning',
        });
        return;
    }

    isGeneratingAI.value = true;

    try {
        const response = await $fetch('/api/quiz/ai-generate', {
            method: 'POST',
            body: {
                topic: aiTopic.value.trim(),
                category: formData.value.category,
                difficulty: formData.value.difficulty,
                gradeLevel: formData.value.grade_level,
                questionCount: aiQuestionCount.value,
                questionTypes: aiQuestionTypes.value,
            },
        });

        if (response.success && response.quiz) {
            // 생성된 퀴즈 데이터로 폼 업데이트
            formData.value.title = response.quiz.title;
            formData.value.description = response.quiz.description;
            formData.value.questions = response.quiz.questions;

            $q.notify({
                type: 'positive',
                message: `🎉 AI가 ${response.quiz.questions.length}개의 문제를 생성했어요!`,
                icon: 'auto_awesome',
            });

            // 입력 필드 초기화
            aiTopic.value = '';
        } else {
            $q.notify({
                type: 'negative',
                message: response.error || 'AI 퀴즈 생성에 실패했습니다.',
                icon: 'error',
            });
        }
    } catch (error: any) {
        console.error('AI 퀴즈 생성 오류:', error);
        $q.notify({
            type: 'negative',
            message: '네트워크 오류가 발생했습니다. 다시 시도해주세요.',
            icon: 'error',
        });
    } finally {
        isGeneratingAI.value = false;
    }
}

// 카테고리 옵션
const categoryOptions = Object.entries(CATEGORIES).map(([value, info]) => ({
    label: `${info.icon} ${info.label}`,
    value,
}));

// 난이도 옵션
const difficultyOptions = Object.entries(DIFFICULTIES).map(([value, info]) => ({
    label: `${getDifficultyIcon(value)} ${info.label} (${info.gradeRange})`,
    value,
}));

function getDifficultyIcon(difficulty: string): string {
    const icons: Record<string, string> = {
        seedling: '🌱',
        leaf: '🌿',
        tree: '🌳',
        king: '👑',
    };
    return icons[difficulty] || '🌿';
}

// 학년 옵션
const gradeLevelOptions = [
    { label: '1학년', value: 1 },
    { label: '2학년', value: 2 },
    { label: '3학년', value: 3 },
    { label: '4학년', value: 4 },
    { label: '5학년', value: 5 },
    { label: '6학년', value: 6 },
];

// 문제 유형 옵션
const questionTypeOptions = [
    { label: '📝 객관식', value: 'multiple' },
    { label: '⭕ OX', value: 'ox' },
    { label: '✏️ 단답형', value: 'short' },
];

// 문제 추가
function addQuestion() {
    formData.value.questions.push({
        ...DEFAULT_QUESTION_FORM,
        options: [...DEFAULT_QUESTION_FORM.options], // 배열 깊은 복사
        order_index: formData.value.questions.length,
    });
}

// 문제 삭제
function removeQuestion(index: number) {
    formData.value.questions.splice(index, 1);
    // 순서 재정렬
    formData.value.questions.forEach((q, i) => {
        q.order_index = i;
    });
}

// 제출
function handleSubmit() {
    // 유효성 검사
    if (!formData.value.title.trim()) {
        return;
    }

    // 각 문제 유효성 검사
    for (const question of formData.value.questions) {
        if (!question.question_text.trim()) {
            return;
        }
        if (!question.correct_answer.trim()) {
            return;
        }
    }

    emit('submit', formData.value);
}

// 취소
function handleCancel() {
    emit('cancel');
}
</script>

<style scoped lang="scss">
.quiz-form {
    max-width: 800px;
    margin: 0 auto;

    .form-section {
        border-radius: 16px;
        margin-bottom: 24px;
        background: var(--bg-card);
        box-shadow: 0 4px 12px var(--shadow-color);
        transition: background-color 0.3s ease;
    }

    .section-title {
        font-size: 18px;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 20px;
    }

    // AI 자동 생성 섹션 스타일
    .ai-section {
        border: 2px solid rgba(156, 39, 176, 0.3);
        background: linear-gradient(
            135deg,
            rgba(156, 39, 176, 0.05) 0%,
            rgba(103, 58, 183, 0.05) 100%
        );

        .ai-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 8px;

            .section-title {
                margin: 0;
            }
        }

        .ai-description {
            font-size: 14px;
            color: var(--text-secondary);
            margin: 0 0 20px;
        }

        .ai-input-row {
            display: flex;
            gap: 16px;
            margin-bottom: 16px;

            .ai-topic-input {
                flex: 1;
            }

            .ai-count-select {
                width: 120px;
                flex-shrink: 0;
            }
        }

        .ai-options-row {
            margin-bottom: 16px;

            .ai-type-toggle {
                flex-wrap: wrap;
            }
        }

        .ai-action-row {
            display: flex;
            justify-content: center;

            .ai-generate-btn {
                min-width: 200px;
                border-radius: 12px;
                font-weight: 600;
            }
        }
    }

    @media (max-width: 600px) {
        .ai-section {
            .ai-input-row {
                flex-direction: column;

                .ai-count-select {
                    width: 100%;
                }
            }
        }
    }

    .questions-section {
        margin-top: 32px;

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;

            .section-title {
                margin: 0;
            }
        }

        .question-item {
            margin-bottom: 16px;
        }

        .question-card {
            border-radius: 16px;
            border: 2px solid var(--border-color);
            background: var(--bg-card);
            box-shadow: 0 2px 8px var(--shadow-color);
            transition: background-color 0.3s ease;

            .question-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;

                .question-number {
                    font-size: 16px;
                    font-weight: 700;
                    color: #4ecdc4;
                }
            }

            .type-toggle {
                border-radius: 12px;
            }

            .options-section {
                .options-label {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text-secondary);
                    margin-bottom: 12px;
                }

                .option-row {
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                    margin-bottom: 8px;

                    .option-input {
                        flex: 1;
                    }
                }
            }

            .ox-section {
                .options-label {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text-secondary);
                    margin-bottom: 12px;
                }

                .ox-toggle {
                    max-width: 300px;
                }
            }
        }
    }

    .submit-section {
        display: flex;
        gap: 16px;
        justify-content: flex-end;
        margin-top: 32px;
        padding-bottom: 32px;

        .cancel-btn {
            min-width: 120px;
            border-radius: 12px;
        }

        .submit-btn {
            min-width: 160px;
            border-radius: 12px;
            font-weight: 600;
        }
    }
}
</style>

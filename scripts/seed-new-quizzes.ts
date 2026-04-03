/**
 * 새로운 퀴즈 시드 데이터 생성 스크립트
 *
 * 실행: npx tsx scripts/seed-new-quizzes.ts
 *
 * 다양한 카테고리/난이도의 퀴즈를 Supabase DB에 삽입합니다.
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jjfhmpqgljancosvlibm.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZmhtcHFnbGphbmNvc3ZsaWJtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTQ4NjIxNCwiZXhwIjoyMDg1MDYyMjE0fQ.ghXMh6gbbD-GOjJ6U0GRDPe-28XZm7jSUxmav38F-c8';

interface QuestionData {
    question_type: 'multiple' | 'ox';
    question_text: string;
    correct_answer: string;
    options: string[];
    hint: string;
}

interface QuizData {
    title: string;
    description: string;
    category: string;
    grade_level: number;
    difficulty: 'seedling' | 'leaf' | 'tree' | 'king';
    questions: QuestionData[];
}

const newQuizzes: QuizData[] = [];

async function seedQuizzes(): Promise<void> {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 시스템 사용자 조회
    const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
        .single();

    if (userError || !user) {
        console.error('❌ 시스템 사용자 조회 실패:', userError?.message);
        process.exit(1);
    }

    const systemUserId: string = user.id;
    console.log(`✅ 시스템 사용자: ${systemUserId}`);
    console.log(`📝 생성할 퀴즈: ${newQuizzes.length}개\n`);

    let successCount = 0;
    let failCount = 0;

    for (const quizData of newQuizzes) {
        try {
            // 중복 체크 (동일 제목 퀴즈가 이미 있는지)
            const { data: existing } = await supabase
                .from('quizzes')
                .select('id')
                .eq('title', quizData.title)
                .limit(1);

            if (existing && existing.length > 0) {
                console.log(`  ⏭️  [${quizData.difficulty}] ${quizData.title} — 이미 존재, 건너뜀`);
                continue;
            }

            // 퀴즈 생성
            const { data: quiz, error: quizError } = await supabase
                .from('quizzes')
                .insert({
                    created_by: systemUserId,
                    title: quizData.title,
                    description: quizData.description,
                    category: quizData.category,
                    grade_level: quizData.grade_level,
                    difficulty: quizData.difficulty,
                    is_public: true,
                })
                .select('id, title')
                .single();

            if (quizError) {
                throw new Error(`퀴즈 INSERT 실패: ${quizError.message}`);
            }

            // 질문 생성
            const questions = quizData.questions.map((q, index) => ({
                quiz_id: quiz.id,
                question_type: q.question_type,
                question_text: q.question_text,
                correct_answer: q.correct_answer,
                options: q.options,
                hint: q.hint,
                order_index: index,
            }));

            const { error: questionsError } = await supabase
                .from('quiz_questions')
                .insert(questions);

            if (questionsError) {
                throw new Error(`질문 INSERT 실패: ${questionsError.message}`);
            }

            successCount++;
            console.log(
                `  ✅ [${quizData.difficulty}] ${quiz.title} (${quizData.questions.length}문제)`,
            );
        } catch (error) {
            failCount++;
            const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
            console.error(`  ❌ [${quizData.difficulty}] ${quizData.title}: ${errorMessage}`);
        }
    }

    console.log('\n========================================');
    console.log(`📊 결과: 성공 ${successCount}개 / 실패 ${failCount}개`);
    console.log('========================================');
}

seedQuizzes().catch(console.error);

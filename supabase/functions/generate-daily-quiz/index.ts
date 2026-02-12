import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

interface QuizTemplate {
  title: string;
  description: string;
  category: string;
  grade_level: number;
  difficulty: 'seedling' | 'sprout' | 'tree' | 'king';
  questions: Question[];
}

interface Question {
  question_type: 'multiple' | 'ox';
  question_text: string;
  correct_answer: string;
  options: string[];
  hint: string;
}

const quizTemplates: QuizTemplate[] = [
  {
    title: '🌍 세계 여행',
    description: '세계 여러 나라에 대해 알아봐요!',
    category: 'social',
    grade_level: 3,
    difficulty: 'sprout',
    questions: [
      {
        question_type: 'multiple',
        question_text: '프랑스의 수도는 어디일까요?',
        correct_answer: '파리',
        options: ['파리', '런던', '로마', '베를린'],
        hint: '에펠탑이 있는 도시예요!'
      },
      {
        question_type: 'multiple',
        question_text: '이탈리아에서 유명한 탑은?',
        correct_answer: '피사의 사탑',
        options: ['피사의 사탑', '에펠탑', '자유의 여신상', '빅벤'],
        hint: '기울어진 탑이에요!'
      },
      {
        question_type: 'ox',
        question_text: '일본의 수도는 도쿄다. O일까요 X일까요?',
        correct_answer: 'O',
        options: ['O', 'X'],
        hint: '우리나라와 가까운 나라예요.'
      },
      {
        question_type: 'multiple',
        question_text: '만리장성은 어느 나라에 있을까요?',
        correct_answer: '중국',
        options: ['중국', '일본', '한국', '몽골'],
        hint: '아주 긴 성벽이에요!'
      },
      {
        question_type: 'multiple',
        question_text: '자유의 여신상은 어느 나라에 있을까요?',
        correct_answer: '미국',
        options: ['미국', '영국', '프랑스', '독일'],
        hint: '뉴욕에 있어요!'
      }
    ]
  },
  {
    title: '🦕 공룡 세계',
    description: '재미있는 공룡 이야기!',
    category: 'science',
    grade_level: 2,
    difficulty: 'seedling',
    questions: [
      {
        question_type: 'multiple',
        question_text: '가장 큰 공룡은 무엇일까요?',
        correct_answer: '브라키오사우루스',
        options: ['브라키오사우루스', '티라노사우루스', '벨로시랩터', '트리케라톱스'],
        hint: '목이 아주 긴 공룡이에요!'
      },
      {
        question_type: 'ox',
        question_text: '티라노사우루스는 육식 공룡이다. O일까요 X일까요?',
        correct_answer: 'O',
        options: ['O', 'X'],
        hint: '고기를 먹는 무서운 공룡이에요.'
      },
      {
        question_type: 'multiple',
        question_text: '뿔이 3개인 공룡은?',
        correct_answer: '트리케라톱스',
        options: ['트리케라톱스', '스테고사우루스', '티라노사우루스', '벨로시랩터'],
        hint: '"트리"는 3을 의미해요!'
      },
      {
        question_type: 'ox',
        question_text: '공룡은 지금도 살아있다. O일까요 X일까요?',
        correct_answer: 'X',
        options: ['O', 'X'],
        hint: '아주 오래전에 사라졌어요.'
      },
      {
        question_type: 'multiple',
        question_text: '등에 판이 있는 공룡은?',
        correct_answer: '스테고사우루스',
        options: ['스테고사우루스', '트리케라톱스', '티라노사우루스', '프테라노돈'],
        hint: '등판이 특징이에요!'
      }
    ]
  },
  {
    title: '⚽ 스포츠 상식',
    description: '다양한 스포츠에 대해 알아봐요!',
    category: 'physical',
    grade_level: 4,
    difficulty: 'tree',
    questions: [
      {
        question_type: 'multiple',
        question_text: '축구 한 팀은 몇 명일까요?',
        correct_answer: '11명',
        options: ['11명', '9명', '10명', '12명'],
        hint: '골키퍼 포함이에요!'
      },
      {
        question_type: 'multiple',
        question_text: '올림픽은 몇 년마다 열릴까요?',
        correct_answer: '4년',
        options: ['4년', '2년', '5년', '3년'],
        hint: '월드컵과 같아요!'
      },
      {
        question_type: 'ox',
        question_text: '야구에서 홈런은 4점이다. O일까요 X일까요?',
        correct_answer: 'X',
        options: ['O', 'X'],
        hint: '주자 수에 따라 달라요!'
      },
      {
        question_type: 'multiple',
        question_text: '배구는 몇 세트를 먼저 이기면 승리할까요?',
        correct_answer: '3세트',
        options: ['3세트', '2세트', '4세트', '5세트'],
        hint: '5세트 중에 먼저!'
      },
      {
        question_type: 'multiple',
        question_text: '테니스에서 0점을 뭐라고 부를까요?',
        correct_answer: '러브',
        options: ['러브', '제로', '포인트', '듀스'],
        hint: '사랑을 의미해요!'
      }
    ]
  }
];

Deno.serve(async (req: Request) => {
  try {
    // CORS 헤더
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    // Supabase 클라이언트 생성
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 시스템 사용자 가져오기 (첫 번째 사용자)
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
      .single();

    if (userError || !users) {
      throw new Error('시스템 사용자를 찾을 수 없습니다.');
    }

    const systemUserId = users.id;

    // 오늘 날짜 기준으로 퀴즈 선택 (순환)
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    const templateIndex = dayOfYear % quizTemplates.length;
    const template = quizTemplates[templateIndex];

    // 퀴즈 생성
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        created_by: systemUserId,
        title: `${template.title} (${today.toLocaleDateString('ko-KR')})`,
        description: template.description,
        category: template.category,
        grade_level: template.grade_level,
        difficulty: template.difficulty,
        is_public: true
      })
      .select()
      .single();

    if (quizError) {
      throw quizError;
    }

    // 질문들 생성
    const questions = template.questions.map((q, index) => ({
      quiz_id: quiz.id,
      question_type: q.question_type,
      question_text: q.question_text,
      correct_answer: q.correct_answer,
      options: q.options,
      hint: q.hint,
      order_index: index
    }));

    const { error: questionsError } = await supabase
      .from('quiz_questions')
      .insert(questions);

    if (questionsError) {
      throw questionsError;
    }

    // 생성 이력 기록
    const { error: historyError } = await supabase
      .from('quiz_generation_history')
      .insert({
        quiz_id: quiz.id,
        template_name: template.title,
        generated_at: new Date().toISOString()
      });

    if (historyError) {
      console.error('히스토리 기록 실패:', historyError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        quiz_id: quiz.id,
        title: quiz.title,
        questions_count: questions.length,
        message: '퀴즈가 성공적으로 생성되었습니다!'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('퀴즈 생성 오류:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

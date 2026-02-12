-- ============================================
-- GoGoQuizKing 추가 퀴즈 시드 데이터
-- 각 난이도별 퀴즈 10개씩 (총 40개)
-- ============================================

DO $$
DECLARE
    system_user_id UUID;
    quiz_id UUID;
BEGIN
    -- 첫 번째 사용자를 시스템 사용자로 사용
    SELECT id INTO system_user_id FROM auth.users LIMIT 1;
    
    IF system_user_id IS NULL THEN
        RAISE EXCEPTION '시드 데이터를 생성하려면 최소 1명의 사용자가 필요합니다.';
    END IF;

    -- ============================================
    -- 새싹 (seedling) - 1~2학년 수준 (10개)
    -- ============================================

    -- 새싹 1: 과일 친구들
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🍎 맛있는 과일 친구들', '여러 가지 과일에 대해 알아봐요!', 'science', 1, 'seedling', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '빨간색이고 동그란 과일은 무엇일까요?', '사과', '["사과", "바나나", "포도", "수박"]', '아침에 먹으면 좋은 과일이에요!', 0),
    (quiz_id, 'ox', '바나나는 노란색이다. O일까요 X일까요?', 'O', '["O", "X"]', '원숭이가 좋아하는 과일이에요.', 1),
    (quiz_id, 'multiple', '여름에 먹는 초록색 줄무늬 과일은?', '수박', '["수박", "참외", "딸기", "귤"]', '빨간 속살이 있고 씨가 있어요.', 2),
    (quiz_id, 'multiple', '포도는 어떤 색일까요?', '보라색', '["보라색", "파란색", "흰색", "검은색"]', '알갱이가 송이로 달려있어요.', 3),
    (quiz_id, 'ox', '딸기는 겨울에만 먹을 수 있다. O일까요 X일까요?', 'X', '["O", "X"]', '봄에도 많이 먹어요!', 4);

    -- 새싹 2: 색깔 나라
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🌈 알록달록 색깔 나라', '여러 가지 색깔을 알아봐요!', 'art', 1, 'seedling', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '하늘은 무슨 색일까요?', '파란색', '["파란색", "빨간색", "노란색", "초록색"]', '맑은 날 위를 봐요!', 0),
    (quiz_id, 'multiple', '빨간색과 노란색을 섞으면?', '주황색', '["주황색", "보라색", "초록색", "분홍색"]', '당근 색이에요!', 1),
    (quiz_id, 'ox', '바나나는 파란색이다. O일까요 X일까요?', 'X', '["O", "X"]', '바나나를 잘 생각해보세요.', 2),
    (quiz_id, 'multiple', '나뭇잎은 무슨 색일까요?', '초록색', '["초록색", "파란색", "빨간색", "노란색"]', '공원에서 볼 수 있어요.', 3),
    (quiz_id, 'multiple', '눈은 무슨 색일까요?', '흰색', '["흰색", "파란색", "노란색", "회색"]', '겨울에 내려요!', 4);

    -- 새싹 3: 숫자 놀이
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🔢 재미있는 숫자 놀이', '숫자를 세어봐요!', 'math', 1, 'seedling', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '1 더하기 1은 얼마일까요?', '2', '["2", "1", "3", "4"]', '손가락 하나와 하나를 합쳐요!', 0),
    (quiz_id, 'multiple', '사과 3개와 사과 2개를 합치면?', '5개', '["5개", "4개", "6개", "3개"]', '3+2를 계산해요!', 1),
    (quiz_id, 'ox', '5는 3보다 크다. O일까요 X일까요?', 'O', '["O", "X"]', '숫자의 크기를 비교해요.', 2),
    (quiz_id, 'multiple', '10에서 5를 빼면?', '5', '["5", "10", "15", "0"]', '열 개에서 다섯 개를 빼요.', 3),
    (quiz_id, 'multiple', '2, 4, 6 다음에 오는 숫자는?', '8', '["8", "7", "9", "10"]', '2씩 커져요!', 4);

    -- 새싹 4: 우리 가족
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '👨‍👩‍👧‍👦 우리 가족 이야기', '가족에 대해 알아봐요!', 'social', 2, 'seedling', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '아빠의 아빠는 누구일까요?', '할아버지', '["할아버지", "삼촌", "형", "아저씨"]', '명절에 세배하는 분이에요!', 0),
    (quiz_id, 'multiple', '엄마의 엄마는 누구일까요?', '할머니', '["할머니", "이모", "고모", "언니"]', '맛있는 음식을 만들어주세요!', 1),
    (quiz_id, 'ox', '형은 나보다 나이가 많다. O일까요 X일까요?', 'O', '["O", "X"]', '형은 먼저 태어났어요.', 2),
    (quiz_id, 'multiple', '아빠의 여동생은 누구일까요?', '고모', '["고모", "이모", "삼촌", "할머니"]', '아빠 쪽 여자 친척이에요.', 3),
    (quiz_id, 'multiple', '엄마의 남동생은 누구일까요?', '외삼촌', '["외삼촌", "삼촌", "고모부", "이모부"]', '엄마 쪽 남자 친척이에요.', 4);

    -- 새싹 5: 계절 이야기
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🌸 사계절 이야기', '봄, 여름, 가을, 겨울을 알아봐요!', 'science', 2, 'seedling', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '꽃이 피는 계절은 언제일까요?', '봄', '["봄", "여름", "가을", "겨울"]', '날씨가 따뜻해져요!', 0),
    (quiz_id, 'multiple', '눈이 내리는 계절은 언제일까요?', '겨울', '["겨울", "봄", "여름", "가을"]', '아주 추워요!', 1),
    (quiz_id, 'ox', '여름에는 수박을 먹어요. O일까요 X일까요?', 'O', '["O", "X"]', '더울 때 시원한 과일이에요.', 2),
    (quiz_id, 'multiple', '단풍이 드는 계절은 언제일까요?', '가을', '["가을", "봄", "여름", "겨울"]', '나뭇잎이 빨갛고 노랗게 변해요.', 3),
    (quiz_id, 'multiple', '바다에서 수영하기 좋은 계절은?', '여름', '["여름", "봄", "가을", "겨울"]', '방학에 많이 가요!', 4);

    -- 새싹 6: 탈것 친구들
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🚗 씽씽 탈것 친구들', '여러 가지 탈것을 알아봐요!', 'social', 1, 'seedling', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '하늘을 나는 탈것은 무엇일까요?', '비행기', '["비행기", "자동차", "배", "기차"]', '공항에서 타요!', 0),
    (quiz_id, 'multiple', '바다 위를 다니는 탈것은?', '배', '["배", "버스", "자전거", "오토바이"]', '물 위에 떠다녀요.', 1),
    (quiz_id, 'ox', '자전거는 페달을 밟아서 움직인다. O일까요 X일까요?', 'O', '["O", "X"]', '다리 힘으로 움직여요.', 2),
    (quiz_id, 'multiple', '레일 위를 달리는 탈것은?', '기차', '["기차", "버스", "트럭", "택시"]', '역에서 타요!', 3),
    (quiz_id, 'multiple', '소방관 아저씨가 타는 빨간 차는?', '소방차', '["소방차", "경찰차", "택시", "버스"]', '불을 끄러 가요!', 4);

    -- 새싹 7: 몸 이야기
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🖐️ 우리 몸을 알아봐요', '우리 몸의 부분을 알아봐요!', 'science', 1, 'seedling', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '우리가 보는 데 사용하는 것은?', '눈', '["눈", "코", "귀", "입"]', '책을 읽을 때 사용해요!', 0),
    (quiz_id, 'multiple', '소리를 듣는 곳은 어디일까요?', '귀', '["귀", "눈", "코", "입"]', '음악을 들을 때 사용해요.', 1),
    (quiz_id, 'ox', '손가락은 10개이다. O일까요 X일까요?', 'O', '["O", "X"]', '양손을 세어보세요.', 2),
    (quiz_id, 'multiple', '냄새를 맡는 곳은 어디일까요?', '코', '["코", "입", "귀", "눈"]', '꽃 냄새를 맡아요.', 3),
    (quiz_id, 'multiple', '음식을 먹을 때 사용하는 곳은?', '입', '["입", "코", "눈", "귀"]', '밥을 먹을 때 사용해요.', 4);

    -- 새싹 8: 날씨 이야기
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '☀️ 오늘 날씨는?', '여러 가지 날씨를 알아봐요!', 'science', 2, 'seedling', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '비가 올 때 쓰는 것은 무엇일까요?', '우산', '["우산", "모자", "장갑", "목도리"]', '비를 막아줘요!', 0),
    (quiz_id, 'ox', '해가 뜨면 밝아진다. O일까요 X일까요?', 'O', '["O", "X"]', '아침에 해가 떠요.', 1),
    (quiz_id, 'multiple', '하늘에서 물이 떨어지는 것은?', '비', '["비", "눈", "바람", "구름"]', '우산을 쓰게 해요.', 2),
    (quiz_id, 'multiple', '춥지 않고 시원한 날씨는?', '선선하다', '["선선하다", "덥다", "춥다", "무덥다"]', '가을 날씨예요.', 3),
    (quiz_id, 'multiple', '하늘에 떠다니는 하얀 것은?', '구름', '["구름", "비행기", "새", "연"]', '비가 올 때 많아져요.', 4);

    -- 새싹 9: 직업 이야기
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '👩‍⚕️ 여러 가지 직업', '다양한 직업을 알아봐요!', 'social', 2, 'seedling', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '아픈 사람을 치료하는 사람은?', '의사', '["의사", "경찰관", "소방관", "요리사"]', '병원에서 일해요!', 0),
    (quiz_id, 'multiple', '맛있는 음식을 만드는 사람은?', '요리사', '["요리사", "의사", "선생님", "가수"]', '식당에서 일해요.', 1),
    (quiz_id, 'ox', '선생님은 학생들을 가르친다. O일까요 X일까요?', 'O', '["O", "X"]', '학교에서 일해요.', 2),
    (quiz_id, 'multiple', '도둑을 잡는 사람은 누구일까요?', '경찰관', '["경찰관", "소방관", "의사", "가수"]', '나쁜 사람을 잡아요.', 3),
    (quiz_id, 'multiple', '비행기를 조종하는 사람은?', '조종사', '["조종사", "운전사", "선장", "기관사"]', '하늘을 날아요.', 4);

    -- 새싹 10: 음식 이야기
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🍚 맛있는 음식', '여러 가지 음식을 알아봐요!', 'social', 1, 'seedling', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '한국 사람이 매일 먹는 것은?', '밥', '["밥", "빵", "피자", "햄버거"]', '쌀로 만들어요!', 0),
    (quiz_id, 'ox', '김치는 매운 음식이다. O일까요 X일까요?', 'O', '["O", "X"]', '빨간색이에요.', 1),
    (quiz_id, 'multiple', '생일에 먹는 달콤한 것은?', '케이크', '["케이크", "국", "밥", "김치"]', '촛불을 꽂아요.', 2),
    (quiz_id, 'multiple', '닭으로 만든 튀김 음식은?', '치킨', '["치킨", "피자", "햄버거", "라면"]', '바삭바삭해요.', 3),
    (quiz_id, 'multiple', '뜨거운 물에 면을 넣어 만드는 것은?', '라면', '["라면", "밥", "빵", "과자"]', '냄비에 끓여요.', 4);

    -- ============================================
    -- 풀잎 (leaf) - 3~4학년 수준 (10개)
    -- ============================================

    -- 풀잎 1: 세계 여러 나라
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🌍 세계 여러 나라', '다양한 나라에 대해 알아봐요!', 'social', 3, 'leaf', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '에펠탑이 있는 나라는 어디일까요?', '프랑스', '["프랑스", "영국", "독일", "이탈리아"]', '파리에 있어요!', 0),
    (quiz_id, 'multiple', '만리장성이 있는 나라는?', '중국', '["중국", "일본", "한국", "베트남"]', '세계에서 가장 긴 성이에요.', 1),
    (quiz_id, 'ox', '피자는 이탈리아 음식이다. O일까요 X일까요?', 'O', '["O", "X"]', '로마가 있는 나라예요.', 2),
    (quiz_id, 'multiple', '피라미드가 있는 나라는?', '이집트', '["이집트", "인도", "터키", "이란"]', '사막에 있어요.', 3),
    (quiz_id, 'multiple', '자유의 여신상이 있는 나라는?', '미국', '["미국", "영국", "프랑스", "캐나다"]', '뉴욕에 있어요.', 4);

    -- 풀잎 2: 식물의 세계
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🌻 식물의 세계', '식물에 대해 알아봐요!', 'science', 3, 'leaf', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '식물이 자라는데 필요한 것이 아닌 것은?', '설탕', '["설탕", "물", "햇빛", "공기"]', '식물은 스스로 양분을 만들어요.', 0),
    (quiz_id, 'multiple', '식물의 뿌리가 하는 일은?', '물을 흡수한다', '["물을 흡수한다", "꽃을 피운다", "씨앗을 만든다", "광합성을 한다"]', '땅 속에 있어요.', 1),
    (quiz_id, 'ox', '모든 식물은 꽃을 피운다. O일까요 X일까요?', 'X', '["O", "X"]', '소나무를 생각해보세요.', 2),
    (quiz_id, 'multiple', '잎에서 일어나는 것은?', '광합성', '["광합성", "뿌리내리기", "꽃피우기", "열매맺기"]', '햇빛을 이용해 양분을 만들어요.', 3),
    (quiz_id, 'multiple', '해바라기가 하루 중 따라다니는 것은?', '해', '["해", "달", "구름", "바람"]', '이름에 힌트가 있어요!', 4);

    -- 풀잎 3: 곱셈과 나눗셈
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '✖️ 곱셈과 나눗셈', '곱셈과 나눗셈을 연습해요!', 'math', 3, 'leaf', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '7 × 8 = ?', '56', '["56", "48", "54", "64"]', '7을 8번 더해요.', 0),
    (quiz_id, 'multiple', '63 ÷ 9 = ?', '7', '["7", "8", "6", "9"]', '63을 9로 나눠요.', 1),
    (quiz_id, 'ox', '12 × 0 = 12 이다. O일까요 X일까요?', 'X', '["O", "X"]', '0을 곱하면 어떻게 될까요?', 2),
    (quiz_id, 'multiple', '144 ÷ 12 = ?', '12', '["12", "11", "13", "14"]', '12의 제곱은 144예요.', 3),
    (quiz_id, 'multiple', '9 × 9 = ?', '81', '["81", "72", "90", "79"]', '구구단을 생각해요.', 4);

    -- 풀잎 4: 우리나라 지리
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🗺️ 우리나라 지리', '우리나라 지역을 알아봐요!', 'social', 4, 'leaf', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '우리나라에서 가장 큰 섬은?', '제주도', '["제주도", "울릉도", "독도", "강화도"]', '한라산이 있어요!', 0),
    (quiz_id, 'multiple', '우리나라에서 가장 긴 강은?', '낙동강', '["낙동강", "한강", "금강", "영산강"]', '경상도를 흘러요.', 1),
    (quiz_id, 'ox', '독도는 울릉도보다 크다. O일까요 X일까요?', 'X', '["O", "X"]', '독도는 아주 작은 섬이에요.', 2),
    (quiz_id, 'multiple', '우리나라에서 가장 높은 산은?', '한라산', '["한라산", "지리산", "설악산", "북한산"]', '제주도에 있어요.', 3),
    (quiz_id, 'multiple', '부산은 어느 방향에 있을까요?', '동남쪽', '["동남쪽", "서북쪽", "동북쪽", "서남쪽"]', '바다와 접해있어요.', 4);

    -- 풀잎 5: 한국 위인
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '👤 한국의 위인들', '우리나라 위인을 알아봐요!', 'social', 4, 'leaf', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '거북선을 만든 장군은 누구일까요?', '이순신', '["이순신", "김유신", "을지문덕", "강감찬"]', '임진왜란 때 활약했어요.', 0),
    (quiz_id, 'multiple', '신사임당의 아들로 유명한 학자는?', '이이', '["이이", "이황", "정약용", "세종"]', '율곡이라고도 불려요.', 1),
    (quiz_id, 'ox', '안중근 의사는 일본 총리를 처단했다. O일까요 X일까요?', 'O', '["O", "X"]', '하얼빈역에서 있었던 일이에요.', 2),
    (quiz_id, 'multiple', '여성 독립운동가로 유명한 분은?', '유관순', '["유관순", "신사임당", "허난설헌", "황진이"]', '만세 운동을 이끌었어요.', 3),
    (quiz_id, 'multiple', '측우기를 발명한 왕은?', '세종대왕', '["세종대왕", "영조", "정조", "태종"]', '한글도 만드셨어요.', 4);

    -- 풀잎 6: 분수
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🔢 분수의 세계', '분수를 알아봐요!', 'math', 4, 'leaf', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '1/2 + 1/2 = ?', '1', '["1", "2", "1/4", "2/4"]', '반 더하기 반이에요.', 0),
    (quiz_id, 'multiple', '3/4는 몇 퍼센트일까요?', '75%', '["75%", "50%", "25%", "80%"]', '3을 4로 나눠요.', 1),
    (quiz_id, 'ox', '1/3은 1/4보다 크다. O일까요 X일까요?', 'O', '["O", "X"]', '분모가 작을수록 커요.', 2),
    (quiz_id, 'multiple', '2/5를 소수로 나타내면?', '0.4', '["0.4", "0.5", "0.2", "0.25"]', '2÷5를 계산해요.', 3),
    (quiz_id, 'multiple', '1/4 + 2/4 = ?', '3/4', '["3/4", "3/8", "1/2", "1"]', '분모가 같으면 분자만 더해요.', 4);

    -- 풀잎 7: 동물의 한살이
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🦋 동물의 한살이', '동물의 성장과정을 알아봐요!', 'science', 3, 'leaf', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '나비의 애벌레를 무엇이라고 할까요?', '배추벌레', '["배추벌레", "굼벵이", "송충이", "지렁이"]', '배추를 먹어요.', 0),
    (quiz_id, 'multiple', '개구리의 아기 때 모습은?', '올챙이', '["올챙이", "애벌레", "번데기", "알"]', '물속에서 살아요.', 1),
    (quiz_id, 'ox', '모든 동물은 알에서 태어난다. O일까요 X일까요?', 'X', '["O", "X"]', '포유류를 생각해보세요.', 2),
    (quiz_id, 'multiple', '나비가 되기 전 단계는?', '번데기', '["번데기", "알", "애벌레", "성충"]', '움직이지 않고 변해요.', 3),
    (quiz_id, 'multiple', '곤충의 몸은 몇 부분으로 나뉠까요?', '3부분', '["3부분", "2부분", "4부분", "5부분"]', '머리, 가슴, 배예요.', 4);

    -- 풀잎 8: 받아쓰기
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '✍️ 맞춤법 테스트', '올바른 맞춤법을 알아봐요!', 'korean', 3, 'leaf', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '올바른 표현은 무엇일까요?', '다르다', '["다르다", "틀리다", "둘 다 맞음", "없음"]', '"같지 않다"의 뜻일 때 써요.', 0),
    (quiz_id, 'multiple', '"안녕하세요"의 올바른 높임말은?', '안녕하십니까', '["안녕하십니까", "안녕하세여", "안녕하시오", "안녕함니다"]', '가장 공손한 표현이에요.', 1),
    (quiz_id, 'ox', '"왠지"와 "웬지" 중 "왠지"가 맞다. O일까요 X일까요?', 'O', '["O", "X"]', '"왜인지"의 줄임말이에요.', 2),
    (quiz_id, 'multiple', '"되"와 "돼" 중 빈칸에 알맞은 것은? "집에 가도 ___?"', '돼', '["돼", "되", "대", "데"]', '"되어"를 줄인 것이에요.', 3),
    (quiz_id, 'multiple', '올바른 표현은?', '어떡해', '["어떡해", "어떻게", "어떻해", "어떡게"]', '"어떻게 해"를 줄인 말이에요.', 4);

    -- 풀잎 9: 지구와 달
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🌍 지구와 달', '지구와 달에 대해 알아봐요!', 'science', 4, 'leaf', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '지구가 태양을 한 바퀴 도는데 걸리는 시간은?', '1년', '["1년", "1달", "1일", "1주"]', '계절이 바뀌는 주기예요.', 0),
    (quiz_id, 'multiple', '달이 지구를 한 바퀴 도는데 걸리는 시간은?', '약 한 달', '["약 한 달", "약 일주일", "약 하루", "약 1년"]', '달의 모양이 변하는 주기예요.', 1),
    (quiz_id, 'ox', '달에는 공기가 있다. O일까요 X일까요?', 'X', '["O", "X"]', '우주비행사는 산소통을 가져가요.', 2),
    (quiz_id, 'multiple', '낮과 밤이 생기는 이유는?', '지구의 자전', '["지구의 자전", "지구의 공전", "달의 공전", "태양의 자전"]', '지구가 스스로 도는 것이에요.', 3),
    (quiz_id, 'multiple', '보름달 다음에 오는 달의 모양은?', '하현달', '["하현달", "상현달", "초승달", "그믐달"]', '오른쪽이 볼록해요.', 4);

    -- 풀잎 10: 옛날 이야기
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '📖 전래동화 이야기', '옛날이야기를 알아봐요!', 'korean', 3, 'leaf', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '콩쥐팥쥐에서 콩쥐를 도와준 동물은?', '두꺼비', '["두꺼비", "토끼", "거북이", "여우"]', '논에 사는 동물이에요.', 0),
    (quiz_id, 'multiple', '흥부가 제비 다리를 고쳐주고 받은 것은?', '박씨', '["박씨", "금", "쌀", "옷"]', '박을 타니 보물이 나왔어요.', 1),
    (quiz_id, 'ox', '해와 달이 된 오누이에서 호랑이는 착한 동물이다. O일까요 X일까요?', 'X', '["O", "X"]', '호랑이가 엄마를 잡아먹었어요.', 2),
    (quiz_id, 'multiple', '견우와 직녀가 만나는 날은?', '칠월 칠석', '["칠월 칠석", "팔월 한가위", "정월 대보름", "단오"]', '오작교를 건너요.', 3),
    (quiz_id, 'multiple', '금도끼 은도끼에서 산신령이 먼저 보여준 것은?', '금도끼', '["금도끼", "은도끼", "나무도끼", "돌도끼"]', '가장 비싼 것부터 보여줬어요.', 4);

    -- ============================================
    -- 나무 (tree) - 5~6학년 수준 (10개)
    -- ============================================

    -- 나무 1: 분수와 소수 연산
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🔢 분수와 소수 연산', '분수와 소수의 연산을 해봐요!', 'math', 5, 'tree', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '2/3 × 3/4 = ?', '1/2', '["1/2", "6/7", "5/12", "6/12"]', '분자끼리, 분모끼리 곱해요.', 0),
    (quiz_id, 'multiple', '0.25를 분수로 나타내면?', '1/4', '["1/4", "1/5", "2/5", "1/25"]', '25/100을 약분해요.', 1),
    (quiz_id, 'ox', '0.333...은 1/3과 같다. O일까요 X일까요?', 'O', '["O", "X"]', '1을 3으로 나눠보세요.', 2),
    (quiz_id, 'multiple', '5/6 ÷ 2/3 = ?', '5/4', '["5/4", "5/9", "10/18", "3/4"]', '나누기는 뒤집어서 곱해요.', 3),
    (quiz_id, 'multiple', '0.6 + 2/5 = ?', '1', '["1", "0.8", "1.1", "0.65"]', '2/5 = 0.4예요.', 4);

    -- 나무 2: 한국 근현대사
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '📚 한국 근현대사', '한국의 근현대 역사를 알아봐요!', 'social', 6, 'tree', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '3.1 운동이 일어난 해는?', '1919년', '["1919년", "1910년", "1945년", "1950년"]', '3월 1일에 시작됐어요.', 0),
    (quiz_id, 'multiple', '대한민국 정부가 수립된 해는?', '1948년', '["1948년", "1945년", "1950년", "1953년"]', '광복 후 3년 뒤예요.', 1),
    (quiz_id, 'ox', '한국전쟁은 1950년에 시작되었다. O일까요 X일까요?', 'O', '["O", "X"]', '6월 25일이에요.', 2),
    (quiz_id, 'multiple', '일제강점기는 몇 년간 지속되었나요?', '35년', '["35년", "25년", "40년", "30년"]', '1910년부터 1945년까지예요.', 3),
    (quiz_id, 'multiple', '4.19 혁명이 일어난 해는?', '1960년', '["1960년", "1961년", "1979년", "1980년"]', '이승만 대통령이 물러났어요.', 4);

    -- 나무 3: 인체의 구조
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🫀 인체의 구조', '우리 몸의 구조를 알아봐요!', 'science', 5, 'tree', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '혈액을 온몸으로 보내는 기관은?', '심장', '["심장", "폐", "간", "신장"]', '왼쪽 가슴에 있어요.', 0),
    (quiz_id, 'multiple', '음식물을 소화시키는 기관이 아닌 것은?', '폐', '["폐", "위", "소장", "대장"]', '폐는 호흡을 담당해요.', 1),
    (quiz_id, 'ox', '뼈는 몸을 지탱하고 보호하는 역할을 한다. O일까요 X일까요?', 'O', '["O", "X"]', '골격의 역할을 생각해요.', 2),
    (quiz_id, 'multiple', '사람의 뼈 개수는 약 몇 개일까요?', '206개', '["206개", "100개", "300개", "150개"]', '어른 기준이에요.', 3),
    (quiz_id, 'multiple', '혈액 속 산소를 운반하는 것은?', '적혈구', '["적혈구", "백혈구", "혈소판", "혈장"]', '빨간색 피의 원인이에요.', 4);

    -- 나무 4: 도형과 측정
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '📐 도형과 측정', '도형의 넓이와 부피를 구해봐요!', 'math', 5, 'tree', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '한 변이 5cm인 정사각형의 넓이는?', '25cm²', '["25cm²", "20cm²", "10cm²", "30cm²"]', '변×변이에요.', 0),
    (quiz_id, 'multiple', '밑변 6cm, 높이 4cm인 삼각형의 넓이는?', '12cm²', '["12cm²", "24cm²", "10cm²", "8cm²"]', '(밑변×높이)÷2예요.', 1),
    (quiz_id, 'ox', '원주율 π는 약 3.14이다. O일까요 X일까요?', 'O', '["O", "X"]', '원의 둘레÷지름이에요.', 2),
    (quiz_id, 'multiple', '한 모서리가 3cm인 정육면체의 부피는?', '27cm³', '["27cm³", "9cm³", "18cm³", "36cm³"]', '변×변×변이에요.', 3),
    (quiz_id, 'multiple', '반지름이 7cm인 원의 넓이는? (π=22/7)', '154cm²', '["154cm²", "44cm²", "77cm²", "308cm²"]', 'πr²이에요.', 4);

    -- 나무 5: 날씨와 기후
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🌦️ 날씨와 기후', '날씨와 기후의 차이를 알아봐요!', 'science', 5, 'tree', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '기압이 낮은 곳의 날씨는 어떨까요?', '흐리고 비', '["흐리고 비", "맑음", "안개", "눈"]', '저기압은 날씨가 안 좋아요.', 0),
    (quiz_id, 'multiple', '우리나라 여름철에 부는 바람의 방향은?', '남동풍', '["남동풍", "북서풍", "동풍", "서풍"]', '해양에서 대륙으로 불어요.', 1),
    (quiz_id, 'ox', '태풍의 눈에서는 바람이 거의 불지 않는다. O일까요 X일까요?', 'O', '["O", "X"]', '태풍의 중심부예요.', 2),
    (quiz_id, 'multiple', '이슬점 온도란 무엇일까요?', '수증기가 물로 변하는 온도', '["수증기가 물로 변하는 온도", "물이 끓는 온도", "물이 어는 온도", "공기가 따뜻해지는 온도"]', '이슬이 맺히기 시작해요.', 3),
    (quiz_id, 'multiple', '위도가 높아질수록 기온은?', '낮아진다', '["낮아진다", "높아진다", "변하지 않는다", "불규칙하다"]', '북극과 적도를 비교해요.', 4);

    -- 나무 6: 비와 비율
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '📊 비와 비율', '비와 비율을 알아봐요!', 'math', 6, 'tree', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '3:4를 백분율로 나타내면?', '75%', '["75%", "80%", "70%", "60%"]', '3÷4×100이에요.', 0),
    (quiz_id, 'multiple', '비 2:5와 같은 비는?', '4:10', '["4:10", "4:8", "3:7", "6:12"]', '2와 5에 각각 2를 곱해요.', 1),
    (quiz_id, 'ox', '비율 0.4는 40%와 같다. O일까요 X일까요?', 'O', '["O", "X"]', '0.4에 100을 곱해요.', 2),
    (quiz_id, 'multiple', '20의 25%는 얼마일까요?', '5', '["5", "4", "6", "10"]', '20×0.25예요.', 3),
    (quiz_id, 'multiple', '8:12를 가장 간단한 자연수의 비로 나타내면?', '2:3', '["2:3", "4:6", "1:2", "3:4"]', '최대공약수로 나눠요.', 4);

    -- 나무 7: 전기와 자기
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '⚡ 전기와 자기', '전기와 자석에 대해 알아봐요!', 'science', 6, 'tree', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '전류의 단위는 무엇일까요?', '암페어(A)', '["암페어(A)", "볼트(V)", "와트(W)", "옴(Ω)"]', '전류계로 측정해요.', 0),
    (quiz_id, 'multiple', '전압의 단위는 무엇일까요?', '볼트(V)', '["볼트(V)", "암페어(A)", "와트(W)", "옴(Ω)"]', '전압계로 측정해요.', 1),
    (quiz_id, 'ox', '같은 극끼리는 서로 밀어낸다. O일까요 X일까요?', 'O', '["O", "X"]', 'N극과 N극을 가까이 해보세요.', 2),
    (quiz_id, 'multiple', '전기 회로에서 저항의 단위는?', '옴(Ω)', '["옴(Ω)", "볼트(V)", "암페어(A)", "와트(W)"]', '전류 흐름을 방해해요.', 3),
    (quiz_id, 'multiple', '전자석의 세기를 강하게 하는 방법이 아닌 것은?', '코일 감은 수 줄이기', '["코일 감은 수 줄이기", "전류 세기 높이기", "철심 넣기", "코일 감은 수 늘리기"]', '코일을 많이 감을수록 강해요.', 4);

    -- 나무 8: 문학 감상
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '📚 문학 감상', '문학 작품을 알아봐요!', 'korean', 6, 'tree', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '시에서 말하는 이를 무엇이라고 할까요?', '화자', '["화자", "작가", "시인", "독자"]', '시 속에서 말하는 사람이에요.', 0),
    (quiz_id, 'multiple', '소설의 3요소가 아닌 것은?', '율격', '["율격", "주제", "구성", "문체"]', '율격은 시의 요소예요.', 1),
    (quiz_id, 'ox', '수필은 작가의 경험이나 생각을 자유롭게 쓴 글이다. O일까요 X일까요?', 'O', '["O", "X"]', '형식이 자유로워요.', 2),
    (quiz_id, 'multiple', '"흥부전"은 어떤 갈래의 문학인가요?', '고전소설', '["고전소설", "현대소설", "수필", "시"]', '옛날에 쓰인 이야기예요.', 3),
    (quiz_id, 'multiple', '희곡에서 배우의 동작을 지시하는 것을?', '지문', '["지문", "대사", "해설", "독백"]', '괄호 안에 써요.', 4);

    -- 나무 9: 생태계
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🌿 생태계', '생태계의 구성을 알아봐요!', 'science', 5, 'tree', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '생태계에서 양분을 만드는 생물은?', '생산자', '["생산자", "소비자", "분해자", "포식자"]', '광합성을 해요.', 0),
    (quiz_id, 'multiple', '먹이사슬의 가장 아래에 있는 것은?', '식물', '["식물", "초식동물", "육식동물", "분해자"]', '다른 것을 먹지 않아요.', 1),
    (quiz_id, 'ox', '먹이그물은 먹이사슬보다 복잡하다. O일까요 X일까요?', 'O', '["O", "X"]', '여러 먹이사슬이 연결돼요.', 2),
    (quiz_id, 'multiple', '죽은 생물을 분해하는 것은?', '분해자', '["분해자", "생산자", "소비자", "기생자"]', '버섯, 세균 등이에요.', 3),
    (quiz_id, 'multiple', '생태계 평형이 깨지는 원인이 아닌 것은?', '식물의 광합성', '["식물의 광합성", "환경오염", "외래종 유입", "서식지 파괴"]', '광합성은 자연스러운 과정이에요.', 4);

    -- 나무 10: 세계 지리
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🌐 세계 지리', '세계의 지리를 알아봐요!', 'social', 6, 'tree', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '세계에서 가장 긴 강은?', '나일강', '["나일강", "아마존강", "양쯔강", "미시시피강"]', '아프리카에 있어요.', 0),
    (quiz_id, 'multiple', '세계에서 가장 높은 산은?', '에베레스트산', '["에베레스트산", "K2", "몽블랑", "후지산"]', '히말라야 산맥에 있어요.', 1),
    (quiz_id, 'ox', '적도를 지나는 나라는 1년 내내 덥다. O일까요 X일까요?', 'O', '["O", "X"]', '적도는 태양과 가까워요.', 2),
    (quiz_id, 'multiple', '사막이 가장 많은 대륙은?', '아프리카', '["아프리카", "아시아", "오세아니아", "남아메리카"]', '사하라 사막이 있어요.', 3),
    (quiz_id, 'multiple', '세계에서 가장 넓은 나라는?', '러시아', '["러시아", "캐나다", "중국", "미국"]', '유럽과 아시아에 걸쳐있어요.', 4);

    -- ============================================
    -- 킹왕짱 (king) - 도전 수준 (10개)
    -- ============================================

    -- 킹왕짱 1: 원소 주기율표
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '⚛️ 원소 주기율표', '화학 원소에 대해 알아봐요!', 'science', 6, 'king', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '원소 기호 Na는 무엇을 나타낼까요?', '나트륨', '["나트륨", "질소", "니켈", "네온"]', '소금에 들어있어요.', 0),
    (quiz_id, 'multiple', '공기 중에 가장 많은 기체는?', '질소', '["질소", "산소", "이산화탄소", "수소"]', '약 78%를 차지해요.', 1),
    (quiz_id, 'ox', '금의 원소 기호는 Go이다. O일까요 X일까요?', 'X', '["O", "X"]', '라틴어 Aurum에서 왔어요.', 2),
    (quiz_id, 'multiple', '원자번호 6번 원소는?', '탄소', '["탄소", "질소", "산소", "붕소"]', '생명체의 기본 원소예요.', 3),
    (quiz_id, 'multiple', '비활성 기체가 아닌 것은?', '수소', '["수소", "헬륨", "네온", "아르곤"]', '비활성 기체는 18족이에요.', 4);

    -- 킹왕짱 2: 세계사
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🏛️ 세계사 도전', '세계 역사를 알아봐요!', 'social', 6, 'king', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '프랑스 혁명이 일어난 해는?', '1789년', '["1789년", "1776년", "1815년", "1848년"]', '바스티유 감옥이 함락됐어요.', 0),
    (quiz_id, 'multiple', '제1차 세계대전이 시작된 해는?', '1914년', '["1914년", "1918년", "1939년", "1945년"]', '사라예보 사건이 계기였어요.', 1),
    (quiz_id, 'ox', '르네상스는 이탈리아에서 시작되었다. O일까요 X일까요?', 'O', '["O", "X"]', '피렌체가 중심이었어요.', 2),
    (quiz_id, 'multiple', '콜럼버스가 아메리카에 도착한 해는?', '1492년', '["1492년", "1500년", "1453년", "1519년"]', '스페인 왕실의 지원을 받았어요.', 3),
    (quiz_id, 'multiple', '산업혁명이 처음 시작된 나라는?', '영국', '["영국", "프랑스", "독일", "미국"]', '증기기관이 발명됐어요.', 4);

    -- 킹왕짱 3: 고급 수학
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🔢 고급 수학 도전', '어려운 수학 문제에 도전!', 'math', 6, 'king', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '√144 = ?', '12', '["12", "11", "13", "14"]', '12×12를 생각해요.', 0),
    (quiz_id, 'multiple', '2의 10제곱은 얼마일까요?', '1024', '["1024", "512", "2048", "256"]', '2를 10번 곱해요.', 1),
    (quiz_id, 'ox', 'π(파이)는 무리수이다. O일까요 X일까요?', 'O', '["O", "X"]', '순환하지 않는 무한소수예요.', 2),
    (quiz_id, 'multiple', '1부터 100까지 자연수의 합은?', '5050', '["5050", "5000", "5100", "4950"]', 'n(n+1)/2 공식을 써요.', 3),
    (quiz_id, 'multiple', '3! (3 팩토리얼)은 얼마일까요?', '6', '["6", "3", "9", "27"]', '3×2×1이에요.', 4);

    -- 킹왕짱 4: 우주 과학
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🚀 우주 과학 도전', '우주에 대해 알아봐요!', 'science', 6, 'king', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '태양계에서 고리가 가장 뚜렷한 행성은?', '토성', '["토성", "목성", "천왕성", "해왕성"]', '아름다운 고리로 유명해요.', 0),
    (quiz_id, 'multiple', '빛이 태양에서 지구까지 오는 데 걸리는 시간은?', '약 8분', '["약 8분", "약 1분", "약 1시간", "약 1초"]', '약 1억 5천만 km 거리예요.', 1),
    (quiz_id, 'ox', '블랙홀은 빛도 빠져나올 수 없다. O일까요 X일까요?', 'O', '["O", "X"]', '중력이 매우 강해요.', 2),
    (quiz_id, 'multiple', '태양의 표면 온도는 약 몇 도일까요?', '6000도', '["6000도", "1000도", "10000도", "3000도"]', '매우 뜨거워요.', 3),
    (quiz_id, 'multiple', '지구에서 가장 가까운 항성은?', '태양', '["태양", "알파 센타우리", "시리우스", "베텔게우스"]', '우리 태양계의 중심이에요.', 4);

    -- 킹왕짱 5: 고급 문법
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '📝 고급 국어 문법', '어려운 문법에 도전!', 'korean', 6, 'king', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '"먹다"의 사동형은?', '먹이다', '["먹이다", "먹히다", "먹게하다", "먹음"]', '다른 사람이 먹게 해요.', 0),
    (quiz_id, 'multiple', '"잡다"의 피동형은?', '잡히다', '["잡히다", "잡이다", "잡기다", "잡아지다"]', '누군가에게 잡혀요.', 1),
    (quiz_id, 'ox', '"높이다"는 사동사이다. O일까요 X일까요?', 'O', '["O", "X"]', '높게 만들어요.', 2),
    (quiz_id, 'multiple', '다음 중 불규칙 활용 용언은?', '듣다', '["듣다", "먹다", "보다", "가다"]', '"들어요"로 변해요.', 3),
    (quiz_id, 'multiple', '"예쁘다"의 어간은?', '예쁘', '["예쁘", "예쁘다", "예", "쁘다"]', '활용에서 변하지 않는 부분이에요.', 4);

    -- 킹왕짱 6: 물리 법칙
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '⚙️ 물리 법칙 도전', '물리 법칙을 알아봐요!', 'science', 6, 'king', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', 'F=ma는 누구의 법칙일까요?', '뉴턴', '["뉴턴", "아인슈타인", "갈릴레이", "케플러"]', '운동의 제2법칙이에요.', 0),
    (quiz_id, 'multiple', '물체가 떨어지는 가속도는 약?', '9.8m/s²', '["9.8m/s²", "10m/s²", "8m/s²", "15m/s²"]', '중력 가속도예요.', 1),
    (quiz_id, 'ox', '작용-반작용 법칙에서 두 힘의 크기는 같다. O일까요 X일까요?', 'O', '["O", "X"]', '방향만 반대예요.', 2),
    (quiz_id, 'multiple', '에너지 보존 법칙이란?', '에너지의 총량은 변하지 않는다', '["에너지의 총량은 변하지 않는다", "에너지는 항상 증가한다", "에너지는 사라진다", "에너지는 창조된다"]', '전환만 될 뿐이에요.', 3),
    (quiz_id, 'multiple', '소리의 속도는 공기 중에서 약?', '340m/s', '["340m/s", "300m/s", "400m/s", "3×10⁸m/s"]', '빛보다 훨씬 느려요.', 4);

    -- 킹왕짱 7: 경제 상식
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '💰 경제 상식 도전', '경제 개념을 알아봐요!', 'social', 6, 'king', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '물가가 지속적으로 오르는 현상은?', '인플레이션', '["인플레이션", "디플레이션", "스태그플레이션", "리세션"]', '화폐 가치가 떨어져요.', 0),
    (quiz_id, 'multiple', 'GDP란 무엇의 약자일까요?', '국내총생산', '["국내총생산", "국민총생산", "국제통화기금", "국내총소비"]', '한 나라의 경제 규모예요.', 1),
    (quiz_id, 'ox', '수요가 증가하면 가격이 오른다. O일까요 X일까요?', 'O', '["O", "X"]', '수요-공급 법칙이에요.', 2),
    (quiz_id, 'multiple', '우리나라의 중앙은행은?', '한국은행', '["한국은행", "국민은행", "신한은행", "우리은행"]', '화폐를 발행해요.', 3),
    (quiz_id, 'multiple', '세금 중 소득에 부과되는 것은?', '소득세', '["소득세", "부가가치세", "재산세", "관세"]', '월급에서 빠져요.', 4);

    -- 킹왕짱 8: 생명 과학
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🧬 생명 과학 도전', '생명 과학에 도전!', 'science', 6, 'king', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', 'DNA의 이중나선 구조를 발견한 과학자는?', '왓슨과 크릭', '["왓슨과 크릭", "다윈", "멘델", "파스퇴르"]', '1953년에 발견했어요.', 0),
    (quiz_id, 'multiple', '세포 분열 시 염색체가 복제되는 단계는?', 'S기', '["S기", "G1기", "G2기", "M기"]', 'DNA 합성 단계예요.', 1),
    (quiz_id, 'ox', '엽록체에서 광합성이 일어난다. O일까요 X일까요?', 'O', '["O", "X"]', '녹색 색소가 있어요.', 2),
    (quiz_id, 'multiple', '멘델이 연구한 생물은?', '완두콩', '["완두콩", "초파리", "옥수수", "쥐"]', '유전 법칙을 발견했어요.', 3),
    (quiz_id, 'multiple', 'ATP는 무엇의 약자일까요?', '아데노신 삼인산', '["아데노신 삼인산", "아데닌 삼인산", "아미노산 삼인산", "알라닌 삼인산"]', '에너지 화폐예요.', 4);

    -- 킹왕짱 9: 논리 퍼즐
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🧩 논리 퍼즐 도전', '논리적 사고에 도전!', 'math', 6, 'king', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '1, 1, 2, 3, 5, 8, ? 다음에 올 수는?', '13', '["13", "10", "11", "12"]', '피보나치 수열이에요.', 0),
    (quiz_id, 'multiple', '모든 사과는 과일이다. 모든 과일은 식물이다. 따라서?', '모든 사과는 식물이다', '["모든 사과는 식물이다", "모든 식물은 사과다", "일부 과일은 사과다", "모든 사과는 과일이 아니다"]', '삼단논법이에요.', 1),
    (quiz_id, 'ox', '2+2=5 이면 지구는 평평하다. 이 명제는 항상 참이다. O일까요 X일까요?', 'O', '["O", "X"]', '거짓에서 출발하면 항상 참이에요.', 2),
    (quiz_id, 'multiple', 'A가 B보다 크고, B가 C보다 크면?', 'A가 가장 크다', '["A가 가장 크다", "C가 가장 크다", "B가 가장 크다", "알 수 없다"]', '추이적 관계예요.', 3),
    (quiz_id, 'multiple', '100을 1/4로 나누면?', '400', '["400", "25", "75", "50"]', '1/4로 나누는 건 4를 곱하는 것과 같아요.', 4);

    -- 킹왕짱 10: 한자 상식
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🈶 한자 상식 도전', '한자에 도전!', 'korean', 6, 'king', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '"學校(학교)"에서 "校"의 뜻은?', '학교', '["학교", "배우다", "교육", "가르치다"]', '학교를 뜻하는 글자예요.', 0),
    (quiz_id, 'multiple', '"山川(산천)"의 뜻은?', '산과 내', '["산과 내", "높은 산", "강과 바다", "산과 바다"]', '자연 경관을 말해요.', 1),
    (quiz_id, 'ox', '"日(일)"은 해를 뜻한다. O일까요 X일까요?', 'O', '["O", "X"]', '날을 세는 데도 써요.', 2),
    (quiz_id, 'multiple', '"敎育(교육)"에서 "育"의 뜻은?', '기르다', '["기르다", "가르치다", "배우다", "알다"]', '아이를 기르는 것이에요.', 3),
    (quiz_id, 'multiple', '"父母(부모)"의 反意語(반의어)는?', '子女(자녀)', '["子女(자녀)", "兄弟(형제)", "親戚(친척)", "祖父(조부)"]', '부모의 반대예요.', 4);

    RAISE NOTICE '추가 퀴즈 시드 데이터가 성공적으로 생성되었습니다! (각 난이도별 10개, 총 40개)';
END $$;

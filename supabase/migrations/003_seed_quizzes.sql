-- ============================================
-- GoGoQuizKing 퀴즈 시드 데이터
-- 각 난이도별 퀴즈 1개씩 (총 4개)
-- ============================================

-- 시스템 사용자 ID (서비스 계정 또는 첫 번째 관리자)
-- 실제 환경에서는 유효한 auth.users ID로 교체 필요
DO $$
DECLARE
    system_user_id UUID;
    quiz_seedling_id UUID;
    quiz_leaf_id UUID;
    quiz_tree_id UUID;
    quiz_king_id UUID;
BEGIN
    -- 첫 번째 사용자를 시스템 사용자로 사용 (없으면 에러)
    SELECT id INTO system_user_id FROM auth.users LIMIT 1;
    
    IF system_user_id IS NULL THEN
        RAISE EXCEPTION '시드 데이터를 생성하려면 최소 1명의 사용자가 필요합니다.';
    END IF;

    -- profiles 테이블에 해당 사용자가 없으면 추가
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (system_user_id, 'GoGoQuizKing 관리자', NULL)
    ON CONFLICT (id) DO NOTHING;

    -- ============================================
    -- 1. 새싹 (seedling) - 1~2학년 수준
    -- ============================================
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (
        gen_random_uuid(),
        system_user_id,
        '🌱 동물 친구들을 알아보아요!',
        '귀여운 동물들에 대해 알아보는 새싹 레벨 퀴즈입니다.',
        'science',
        1,
        'seedling',
        true
    ) RETURNING id INTO quiz_seedling_id;

    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_seedling_id, 'multiple', '강아지는 어떤 소리를 낼까요?', '멍멍', '["멍멍", "야옹", "음메", "꿀꿀"]', '강아지가 짖을 때 내는 소리예요!', 0),
    (quiz_seedling_id, 'ox', '고양이는 날개가 있다. O일까요 X일까요?', 'X', '["O", "X"]', '고양이는 어떻게 생겼는지 생각해보세요.', 1),
    (quiz_seedling_id, 'multiple', '토끼가 좋아하는 음식은 무엇일까요?', '당근', '["당근", "고기", "생선", "과자"]', '주황색이고 길쭉한 채소예요!', 2),
    (quiz_seedling_id, 'multiple', '다리가 4개인 동물은 누구일까요?', '강아지', '["강아지", "닭", "뱀", "물고기"]', '우리 집에서 키우는 반려동물이에요.', 3),
    (quiz_seedling_id, 'ox', '물고기는 물속에서 살아요. O일까요 X일까요?', 'O', '["O", "X"]', '물고기는 어디에서 수영할까요?', 4);

    -- ============================================
    -- 2. 풀잎 (leaf) - 3~4학년 수준
    -- ============================================
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (
        gen_random_uuid(),
        system_user_id,
        '🍃 우리나라 역사 이야기',
        '대한민국의 역사와 문화를 배워보는 풀잎 레벨 퀴즈입니다.',
        'social',
        3,
        'leaf',
        true
    ) RETURNING id INTO quiz_leaf_id;

    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_leaf_id, 'multiple', '우리나라의 수도는 어디일까요?', '서울', '["서울", "부산", "대구", "인천"]', '한강이 흐르는 도시예요.', 0),
    (quiz_leaf_id, 'multiple', '한글을 만든 왕은 누구일까요?', '세종대왕', '["세종대왕", "태조", "영조", "정조"]', '훈민정음을 창제한 조선의 왕이에요.', 1),
    (quiz_leaf_id, 'ox', '태극기에는 4개의 괘가 있다. O일까요 X일까요?', 'O', '["O", "X"]', '태극기의 네 모서리를 살펴보세요.', 2),
    (quiz_leaf_id, 'multiple', '우리나라의 국화(나라꽃)는 무엇일까요?', '무궁화', '["무궁화", "장미", "튤립", "해바라기"]', '여름에 피는 분홍색 꽃이에요.', 3),
    (quiz_leaf_id, 'multiple', '광복절은 몇 월 며칠일까요?', '8월 15일', '["8월 15일", "3월 1일", "10월 3일", "6월 6일"]', '일본으로부터 독립한 날이에요.', 4);

    -- ============================================
    -- 3. 나무 (tree) - 5~6학년 수준
    -- ============================================
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (
        gen_random_uuid(),
        system_user_id,
        '🌳 수학의 세계로!',
        '수학 개념을 테스트하는 나무 레벨 퀴즈입니다.',
        'math',
        5,
        'tree',
        true
    ) RETURNING id INTO quiz_tree_id;

    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_tree_id, 'multiple', '1부터 10까지 모두 더하면 얼마일까요?', '55', '["55", "45", "50", "60"]', '1+2+3+...+10을 계산해보세요.', 0),
    (quiz_tree_id, 'multiple', '삼각형의 내각의 합은 몇 도일까요?', '180도', '["180도", "90도", "360도", "270도"]', '세 각을 모두 더해보세요.', 1),
    (quiz_tree_id, 'ox', '원의 넓이 공식은 π × 반지름² 이다. O일까요 X일까요?', 'O', '["O", "X"]', '파이(π)와 반지름을 사용해요.', 2),
    (quiz_tree_id, 'multiple', '12의 약수의 개수는 몇 개일까요?', '6개', '["6개", "4개", "5개", "8개"]', '12를 나누어 떨어지게 하는 수를 찾아보세요.', 3),
    (quiz_tree_id, 'multiple', '분수 3/4를 소수로 나타내면?', '0.75', '["0.75", "0.34", "0.5", "0.25"]', '3을 4로 나눠보세요.', 4);

    -- ============================================
    -- 4. 킹왕짱 (king) - 도전 수준
    -- ============================================
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (
        gen_random_uuid(),
        system_user_id,
        '👑 과학 천재에 도전!',
        '어려운 과학 문제들! 킹왕짱만 풀 수 있어요!',
        'science',
        6,
        'king',
        true
    ) RETURNING id INTO quiz_king_id;

    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_king_id, 'multiple', '물의 화학식은 무엇일까요?', 'H2O', '["H2O", "CO2", "NaCl", "O2"]', '수소(H)와 산소(O)로 이루어져 있어요.', 0),
    (quiz_king_id, 'multiple', '태양계에서 가장 큰 행성은?', '목성', '["목성", "토성", "지구", "화성"]', '거대한 가스 행성이에요.', 1),
    (quiz_king_id, 'ox', 'DNA는 이중나선 구조이다. O일까요 X일까요?', 'O', '["O", "X"]', '왓슨과 크릭이 발견한 구조예요.', 2),
    (quiz_king_id, 'multiple', '빛의 속도는 초당 약 몇 km일까요?', '30만 km', '["30만 km", "3만 km", "300만 km", "3천 km"]', '1초에 지구를 7바퀴 반 돌 수 있어요.', 3),
    (quiz_king_id, 'multiple', '원소 주기율표에서 첫 번째 원소는?', '수소', '["수소", "헬륨", "산소", "탄소"]', '가장 가벼운 원소예요.', 4);

    RAISE NOTICE '퀴즈 시드 데이터가 성공적으로 생성되었습니다!';
    RAISE NOTICE '- 새싹 퀴즈 ID: %', quiz_seedling_id;
    RAISE NOTICE '- 풀잎 퀴즈 ID: %', quiz_leaf_id;
    RAISE NOTICE '- 나무 퀴즈 ID: %', quiz_tree_id;
    RAISE NOTICE '- 킹왕짱 퀴즈 ID: %', quiz_king_id;
END $$;

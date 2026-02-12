-- ============================================
-- GoGoQuizKing 추가 퀴즈 시드 데이터 2
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

    -- 새싹 1: 곤충 친구들
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🐛 곤충 친구들', '여러 가지 곤충에 대해 알아봐요!', 'science', 1, 'seedling', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '꿀을 만드는 곤충은 무엇일까요?', '벌', '["벌", "개미", "나비", "잠자리"]', '꽃에서 꿀을 모아요!', 0),
    (quiz_id, 'ox', '개미는 다리가 6개이다. O일까요 X일까요?', 'O', '["O", "X"]', '곤충은 다리가 6개예요.', 1),
    (quiz_id, 'multiple', '반딧불이는 어디서 빛을 낼까요?', '배', '["배", "머리", "날개", "다리"]', '밤에 반짝반짝 빛나요.', 2),
    (quiz_id, 'multiple', '매미가 내는 소리는?', '맴맴', '["맴맴", "꿀꿀", "멍멍", "야옹"]', '여름에 나무에서 울어요.', 3),
    (quiz_id, 'ox', '잠자리는 하늘을 날 수 있다. O일까요 X일까요?', 'O', '["O", "X"]', '투명한 날개가 있어요.', 4);

    -- 새싹 2: 바다 동물
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🐠 바다 동물 친구들', '바다에 사는 동물을 알아봐요!', 'science', 1, 'seedling', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '등에서 물을 뿜는 바다 동물은?', '고래', '["고래", "상어", "물고기", "조개"]', '포유류예요!', 0),
    (quiz_id, 'multiple', '집게를 가진 바다 동물은?', '게', '["게", "문어", "해파리", "불가사리"]', '옆으로 걸어요.', 1),
    (quiz_id, 'ox', '문어는 다리가 8개이다. O일까요 X일까요?', 'O', '["O", "X"]', '팔처럼 생긴 다리가 있어요.', 2),
    (quiz_id, 'multiple', '뾰족한 이빨을 가진 무서운 물고기는?', '상어', '["상어", "고래", "돌고래", "참치"]', '바다의 왕이에요.', 3),
    (quiz_id, 'multiple', '거북이가 등에 지고 다니는 것은?', '껍데기', '["껍데기", "날개", "꼬리", "다리"]', '딱딱하게 보호해줘요.', 4);

    -- 새싹 3: 모양 알기
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '⭐ 여러 가지 모양', '모양의 이름을 알아봐요!', 'math', 1, 'seedling', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '공은 어떤 모양일까요?', '동그라미', '["동그라미", "세모", "네모", "별"]', '굴러가는 모양이에요!', 0),
    (quiz_id, 'multiple', '피자 한 조각은 어떤 모양일까요?', '세모', '["세모", "동그라미", "네모", "하트"]', '꼭짓점이 3개예요.', 1),
    (quiz_id, 'ox', '창문은 네모 모양이다. O일까요 X일까요?', 'O', '["O", "X"]', '모서리가 4개예요.', 2),
    (quiz_id, 'multiple', '네모의 꼭짓점은 몇 개일까요?', '4개', '["4개", "3개", "5개", "6개"]', '각 모서리에 하나씩 있어요.', 3),
    (quiz_id, 'multiple', '꼭짓점이 5개인 모양은?', '별', '["별", "세모", "네모", "동그라미"]', '밤하늘에서 반짝여요.', 4);

    -- 새싹 4: 시간 알기
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '⏰ 시간을 알아봐요', '시계 보는 법을 배워요!', 'math', 2, 'seedling', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '하루는 몇 시간일까요?', '24시간', '["24시간", "12시간", "10시간", "30시간"]', '아침부터 다음 아침까지예요.', 0),
    (quiz_id, 'multiple', '1시간은 몇 분일까요?', '60분', '["60분", "30분", "100분", "50분"]', '분침이 한 바퀴 도는 시간이에요.', 1),
    (quiz_id, 'ox', '점심시간은 낮 12시이다. O일까요 X일까요?', 'O', '["O", "X"]', '밥 먹는 시간이에요.', 2),
    (quiz_id, 'multiple', '아침에 해가 뜨는 방향은?', '동쪽', '["동쪽", "서쪽", "남쪽", "북쪽"]', '해가 뜨는 곳이에요.', 3),
    (quiz_id, 'multiple', '일주일은 며칠일까요?', '7일', '["7일", "5일", "10일", "30일"]', '월화수목금토일이에요.', 4);

    -- 새싹 5: 채소 친구들
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🥕 채소 친구들', '건강한 채소를 알아봐요!', 'science', 1, 'seedling', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '주황색이고 토끼가 좋아하는 채소는?', '당근', '["당근", "오이", "배추", "무"]', '눈에 좋아요!', 0),
    (quiz_id, 'multiple', '김치를 만드는 채소는?', '배추', '["배추", "호박", "고구마", "감자"]', '초록색 잎이 많아요.', 1),
    (quiz_id, 'ox', '고구마는 땅속에서 자란다. O일까요 X일까요?', 'O', '["O", "X"]', '뿌리 채소예요.', 2),
    (quiz_id, 'multiple', '초록색이고 긴 채소는 무엇일까요?', '오이', '["오이", "토마토", "가지", "양파"]', '아삭아삭해요.', 3),
    (quiz_id, 'multiple', '자주색 채소는 무엇일까요?', '가지', '["가지", "당근", "무", "파"]', '길쭉하게 생겼어요.', 4);

    -- 새싹 6: 악기 이야기
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🎵 악기 이야기', '여러 가지 악기를 알아봐요!', 'art', 2, 'seedling', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '건반을 눌러서 연주하는 악기는?', '피아노', '["피아노", "기타", "드럼", "플루트"]', '검은색과 흰색 건반이 있어요.', 0),
    (quiz_id, 'multiple', '막대기로 두드려 연주하는 악기는?', '드럼', '["드럼", "피아노", "바이올린", "하프"]', '쿵쿵 소리가 나요.', 1),
    (quiz_id, 'ox', '바이올린은 줄을 튕겨서 연주한다. O일까요 X일까요?', 'X', '["O", "X"]', '활로 줄을 그어요.', 2),
    (quiz_id, 'multiple', '입으로 불어서 연주하는 악기는?', '리코더', '["리코더", "기타", "드럼", "피아노"]', '학교에서 배워요.', 3),
    (quiz_id, 'multiple', '삼각형 모양의 악기는?', '트라이앵글', '["트라이앵글", "탬버린", "캐스터네츠", "마라카스"]', '딩딩 소리가 나요.', 4);

    -- 새싹 7: 꽃 이야기
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🌷 예쁜 꽃 이야기', '여러 가지 꽃을 알아봐요!', 'science', 1, 'seedling', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '우리나라 국화는 무엇일까요?', '무궁화', '["무궁화", "장미", "튤립", "해바라기"]', '여름에 피어요.', 0),
    (quiz_id, 'multiple', '해를 따라다니는 꽃은?', '해바라기', '["해바라기", "장미", "백합", "국화"]', '노란색이고 커요.', 1),
    (quiz_id, 'ox', '장미에는 가시가 있다. O일까요 X일까요?', 'O', '["O", "X"]', '조심해서 만져야 해요.', 2),
    (quiz_id, 'multiple', '봄에 피는 노란 꽃은?', '개나리', '["개나리", "국화", "해바라기", "장미"]', '울타리에서 자주 봐요.', 3),
    (quiz_id, 'multiple', '흰색이고 향기로운 꽃은?', '백합', '["백합", "해바라기", "장미", "코스모스"]', '결혼식에서 많이 써요.', 4);

    -- 새싹 8: 동물의 집
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🏠 동물의 집', '동물들이 사는 곳을 알아봐요!', 'science', 2, 'seedling', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '새가 사는 곳은 어디일까요?', '둥지', '["둥지", "굴", "집", "연못"]', '나뭇가지로 만들어요.', 0),
    (quiz_id, 'multiple', '물고기가 사는 곳은?', '물속', '["물속", "나무 위", "땅속", "하늘"]', '아가미로 숨을 쉬어요.', 1),
    (quiz_id, 'ox', '개미는 땅속에 집을 짓는다. O일까요 X일까요?', 'O', '["O", "X"]', '개미굴이라고 해요.', 2),
    (quiz_id, 'multiple', '곰이 겨울잠을 자는 곳은?', '동굴', '["동굴", "나무 위", "연못", "사막"]', '어둡고 따뜻해요.', 3),
    (quiz_id, 'multiple', '거미가 만드는 것은?', '거미줄', '["거미줄", "둥지", "굴", "벌집"]', '먹이를 잡아요.', 4);

    -- 새싹 9: 우리 학교
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🏫 우리 학교', '학교에 대해 알아봐요!', 'social', 1, 'seedling', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '학교에서 공부하는 곳은?', '교실', '["교실", "운동장", "급식실", "화장실"]', '책상과 의자가 있어요.', 0),
    (quiz_id, 'multiple', '뛰어노는 곳은 어디일까요?', '운동장', '["운동장", "도서관", "교실", "급식실"]', '넓고 밖에 있어요.', 1),
    (quiz_id, 'ox', '도서관에서는 조용히 해야 한다. O일까요 X일까요?', 'O', '["O", "X"]', '책을 읽는 곳이에요.', 2),
    (quiz_id, 'multiple', '점심을 먹는 곳은?', '급식실', '["급식실", "교실", "운동장", "강당"]', '맛있는 밥을 먹어요.', 3),
    (quiz_id, 'multiple', '학교에서 가르치는 분은?', '선생님', '["선생님", "의사", "경찰관", "소방관"]', '공부를 도와주세요.', 4);

    -- 새싹 10: 감정 표현
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '😊 내 마음 표현하기', '여러 가지 감정을 알아봐요!', 'social', 2, 'seedling', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '기분이 좋을 때 하는 표정은?', '웃음', '["웃음", "울음", "화남", "무서움"]', '입꼬리가 올라가요.', 0),
    (quiz_id, 'multiple', '슬플 때 흘리는 것은?', '눈물', '["눈물", "웃음", "땀", "침"]', '눈에서 나와요.', 1),
    (quiz_id, 'ox', '화가 나면 얼굴이 빨개진다. O일까요 X일까요?', 'O', '["O", "X"]', '열이 올라요.', 2),
    (quiz_id, 'multiple', '무서울 때 몸이 어떻게 될까요?', '떨린다', '["떨린다", "웃는다", "노래한다", "춤춘다"]', '긴장이 되어요.', 3),
    (quiz_id, 'multiple', '친구가 아플 때 느끼는 감정은?', '걱정', '["걱정", "기쁨", "화남", "부러움"]', '친구가 괜찮은지 생각해요.', 4);

    -- ============================================
    -- 풀잎 (leaf) - 3~4학년 수준 (10개)
    -- ============================================

    -- 풀잎 1: 우리나라 전통
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🎎 우리나라 전통', '전통 문화를 알아봐요!', 'social', 3, 'leaf', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '설날에 어른께 하는 인사는?', '세배', '["세배", "악수", "포옹", "하이파이브"]', '무릎을 꿇고 해요.', 0),
    (quiz_id, 'multiple', '추석에 먹는 음식은?', '송편', '["송편", "떡국", "팥죽", "냉면"]', '반달 모양이에요.', 1),
    (quiz_id, 'ox', '한복은 우리나라 전통 옷이다. O일까요 X일까요?', 'O', '["O", "X"]', '명절에 입어요.', 2),
    (quiz_id, 'multiple', '단오에 하는 놀이는?', '그네뛰기', '["그네뛰기", "연날리기", "팽이치기", "윷놀이"]', '하늘 높이 올라가요.', 3),
    (quiz_id, 'multiple', '설날에 먹는 음식은?', '떡국', '["떡국", "송편", "삼계탕", "팥빙수"]', '한 살 더 먹어요.', 4);

    -- 풀잎 2: 단위와 측정
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '📏 단위와 측정', '여러 가지 단위를 알아봐요!', 'math', 3, 'leaf', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '1km는 몇 m일까요?', '1000m', '["1000m", "100m", "10m", "10000m"]', '킬로는 1000을 뜻해요.', 0),
    (quiz_id, 'multiple', '1kg은 몇 g일까요?', '1000g', '["1000g", "100g", "10g", "10000g"]', '킬로그램이에요.', 1),
    (quiz_id, 'ox', '1L는 1000mL이다. O일까요 X일까요?', 'O', '["O", "X"]', '리터와 밀리리터예요.', 2),
    (quiz_id, 'multiple', '길이를 재는 도구는?', '자', '["자", "저울", "온도계", "시계"]', 'cm, m를 재요.', 3),
    (quiz_id, 'multiple', '무게를 재는 도구는?', '저울', '["저울", "자", "온도계", "컵"]', 'kg, g을 재요.', 4);

    -- 풀잎 3: 교통 안전
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🚦 교통 안전', '교통 규칙을 알아봐요!', 'social', 3, 'leaf', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '빨간 신호등일 때 해야 할 것은?', '멈추기', '["멈추기", "건너기", "뛰기", "걷기"]', '위험해요!', 0),
    (quiz_id, 'multiple', '횡단보도를 건널 때 먼저 해야 할 것은?', '좌우 살피기', '["좌우 살피기", "뛰어가기", "친구와 장난치기", "휴대폰 보기"]', '차가 오는지 확인해요.', 1),
    (quiz_id, 'ox', '초록 신호등일 때 건너도 된다. O일까요 X일까요?', 'O', '["O", "X"]', '안전한 신호예요.', 2),
    (quiz_id, 'multiple', '자전거를 탈 때 써야 하는 것은?', '헬멧', '["헬멧", "모자", "귀마개", "안경"]', '머리를 보호해요.', 3),
    (quiz_id, 'multiple', '노란 신호등의 의미는?', '조심', '["조심", "가기", "멈추기", "뛰기"]', '신호가 바뀌려고 해요.', 4);

    -- 풀잎 4: 소수 알기
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🔢 소수 알기', '소수에 대해 알아봐요!', 'math', 4, 'leaf', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '0.5는 분수로 얼마일까요?', '1/2', '["1/2", "1/5", "5/10", "1/10"]', '반이에요.', 0),
    (quiz_id, 'multiple', '0.25 + 0.75 = ?', '1', '["1", "0.5", "1.25", "0.1"]', '소수점 아래를 맞춰요.', 1),
    (quiz_id, 'ox', '0.3은 0.30과 같다. O일까요 X일까요?', 'O', '["O", "X"]', '0은 값에 영향 없어요.', 2),
    (quiz_id, 'multiple', '1.5 × 2 = ?', '3', '["3", "2.5", "3.5", "2"]', '1.5를 두 번 더해요.', 3),
    (quiz_id, 'multiple', '3.6 ÷ 3 = ?', '1.2', '["1.2", "1.3", "0.12", "12"]', '36÷3=12를 활용해요.', 4);

    -- 풀잎 5: 환경 보호
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🌍 환경 보호', '환경을 지키는 방법을 알아봐요!', 'science', 4, 'leaf', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '플라스틱 병은 어떤 쓰레기통에 버릴까요?', '재활용', '["재활용", "일반쓰레기", "음식물", "유리"]', '다시 사용할 수 있어요.', 0),
    (quiz_id, 'multiple', '지구 온난화의 원인은?', '이산화탄소', '["이산화탄소", "산소", "질소", "수소"]', '온실가스예요.', 1),
    (quiz_id, 'ox', '물을 아껴 쓰면 환경에 좋다. O일까요 X일까요?', 'O', '["O", "X"]', '자원을 아껴요.', 2),
    (quiz_id, 'multiple', '나무가 하는 좋은 일이 아닌 것은?', '오염물질 배출', '["오염물질 배출", "산소 생산", "그늘 제공", "홍수 방지"]', '나무는 환경에 좋아요.', 3),
    (quiz_id, 'multiple', '북극의 빙하가 녹는 이유는?', '지구 온난화', '["지구 온난화", "지구 냉각화", "오존층 증가", "비가 많이 와서"]', '기온이 올라가요.', 4);

    -- 풀잎 6: 한국의 음식
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🍲 한국의 음식', '우리나라 음식을 알아봐요!', 'social', 3, 'leaf', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '비빔밥에 넣는 빨간 양념은?', '고추장', '["고추장", "간장", "된장", "소금"]', '매콤해요.', 0),
    (quiz_id, 'multiple', '여름에 먹는 차가운 면 요리는?', '냉면', '["냉면", "칼국수", "라면", "잔치국수"]', '시원해요.', 1),
    (quiz_id, 'ox', '불고기는 쇠고기로 만든다. O일까요 X일까요?', 'O', '["O", "X"]', '달콤한 양념이에요.', 2),
    (quiz_id, 'multiple', '삼계탕에 들어가는 것은?', '닭', '["닭", "소", "돼지", "생선"]', '여름 보양식이에요.', 3),
    (quiz_id, 'multiple', '떡볶이에 들어가는 떡은?', '가래떡', '["가래떡", "송편", "인절미", "절편"]', '길쭉해요.', 4);

    -- 풀잎 7: 물질의 상태
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🧊 물질의 상태', '고체, 액체, 기체를 알아봐요!', 'science', 4, 'leaf', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '얼음은 어떤 상태일까요?', '고체', '["고체", "액체", "기체", "플라즈마"]', '딱딱해요.', 0),
    (quiz_id, 'multiple', '물이 끓으면 무엇이 될까요?', '수증기', '["수증기", "얼음", "눈", "서리"]', '기체 상태예요.', 1),
    (quiz_id, 'ox', '공기는 기체이다. O일까요 X일까요?', 'O', '["O", "X"]', '눈에 보이지 않아요.', 2),
    (quiz_id, 'multiple', '물이 어는 온도는?', '0도', '["0도", "100도", "-10도", "50도"]', '영하가 되면 얼어요.', 3),
    (quiz_id, 'multiple', '물이 끓는 온도는?', '100도', '["100도", "0도", "50도", "200도"]', '섭씨 기준이에요.', 4);

    -- 풀잎 8: 도형의 성질
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '📐 도형의 성질', '도형의 특징을 알아봐요!', 'math', 4, 'leaf', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '정삼각형의 세 변의 길이는?', '모두 같다', '["모두 같다", "모두 다르다", "두 개만 같다", "알 수 없다"]', '"정"은 똑같다는 뜻이에요.', 0),
    (quiz_id, 'multiple', '직사각형의 네 각은 모두 몇 도일까요?', '90도', '["90도", "60도", "45도", "180도"]', '직각이에요.', 1),
    (quiz_id, 'ox', '정사각형은 네 변의 길이가 모두 같다. O일까요 X일까요?', 'O', '["O", "X"]', '직사각형의 특별한 경우예요.', 2),
    (quiz_id, 'multiple', '원에는 꼭짓점이 몇 개 있을까요?', '0개', '["0개", "1개", "2개", "무한개"]', '둥글어요.', 3),
    (quiz_id, 'multiple', '평행사변형의 마주보는 변은?', '평행하다', '["평행하다", "수직이다", "비스듬하다", "굽어있다"]', '평행선이에요.', 4);

    -- 풀잎 9: 태양계 행성
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🪐 태양계 행성', '태양계의 행성을 알아봐요!', 'science', 4, 'leaf', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '태양에서 가장 가까운 행성은?', '수성', '["수성", "금성", "지구", "화성"]', '첫 번째 행성이에요.', 0),
    (quiz_id, 'multiple', '지구와 가장 비슷한 크기의 행성은?', '금성', '["금성", "화성", "수성", "목성"]', '지구의 쌍둥이라고 해요.', 1),
    (quiz_id, 'ox', '화성은 붉은색이다. O일까요 X일까요?', 'O', '["O", "X"]', '붉은 행성이라고 불려요.', 2),
    (quiz_id, 'multiple', '태양계에서 두 번째로 큰 행성은?', '토성', '["토성", "목성", "천왕성", "해왕성"]', '고리가 유명해요.', 3),
    (quiz_id, 'multiple', '태양계 행성의 개수는?', '8개', '["8개", "9개", "7개", "10개"]', '명왕성은 제외됐어요.', 4);

    -- 풀잎 10: 사자성어
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '📚 사자성어', '사자성어의 뜻을 알아봐요!', 'korean', 4, 'leaf', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '"일석이조"의 뜻은?', '한 가지 일로 두 가지 이익', '["한 가지 일로 두 가지 이익", "열심히 공부하기", "친구와 싸우지 않기", "일찍 일어나기"]', '돌 하나로 새 두 마리를 잡아요.', 0),
    (quiz_id, 'multiple', '"백문불여일견"의 뜻은?', '백 번 듣는 것보다 한 번 보는 게 낫다', '["백 번 듣는 것보다 한 번 보는 게 낫다", "백 번 보는 게 좋다", "질문을 많이 해야 한다", "말보다 행동이 중요하다"]', '직접 보는 게 좋아요.', 1),
    (quiz_id, 'ox', '"유비무환"은 미리 준비하면 걱정이 없다는 뜻이다. O일까요 X일까요?', 'O', '["O", "X"]', '대비하면 근심이 없어요.', 2),
    (quiz_id, 'multiple', '"우공이산"이 뜻하는 것은?', '끈기 있게 노력하면 이룬다', '["끈기 있게 노력하면 이룬다", "산을 좋아한다", "공부를 열심히 한다", "친구를 도와준다"]', '산을 옮긴 우공 이야기예요.', 3),
    (quiz_id, 'multiple', '"십시일반"의 뜻은?', '여럿이 힘을 합치면 쉽다', '["여럿이 힘을 합치면 쉽다", "열 번 시험을 본다", "혼자 노력한다", "빨리 먹는다"]', '열 사람이 한 술씩 보태면 한 그릇이에요.', 4);

    -- ============================================
    -- 나무 (tree) - 5~6학년 수준 (10개)
    -- ============================================

    -- 나무 1: 대한민국 정치
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🏛️ 대한민국 정치', '우리나라 정치를 알아봐요!', 'social', 6, 'tree', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '대한민국 대통령의 임기는?', '5년', '["5년", "4년", "6년", "7년"]', '단임제예요.', 0),
    (quiz_id, 'multiple', '법을 만드는 기관은?', '국회', '["국회", "법원", "정부", "검찰"]', '국회의원이 있어요.', 1),
    (quiz_id, 'ox', '대한민국은 민주공화국이다. O일까요 X일까요?', 'O', '["O", "X"]', '헌법 제1조예요.', 2),
    (quiz_id, 'multiple', '재판을 하는 기관은?', '법원', '["법원", "국회", "청와대", "경찰서"]', '판사가 있어요.', 3),
    (quiz_id, 'multiple', '국회의원 선거 연령은?', '만 18세', '["만 18세", "만 19세", "만 20세", "만 21세"]', '2020년에 변경됐어요.', 4);

    -- 나무 2: 통계와 확률
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '📊 통계와 확률', '통계와 확률을 알아봐요!', 'math', 6, 'tree', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '1, 2, 3, 4, 5의 평균은?', '3', '["3", "2", "4", "2.5"]', '합을 개수로 나눠요.', 0),
    (quiz_id, 'multiple', '동전을 던져 앞면이 나올 확률은?', '1/2', '["1/2", "1/4", "1/3", "2/3"]', '50%예요.', 1),
    (quiz_id, 'ox', '주사위를 던져 6이 나올 확률은 1/6이다. O일까요 X일까요?', 'O', '["O", "X"]', '6개 중 1개예요.', 2),
    (quiz_id, 'multiple', '2, 4, 4, 6, 8의 최빈값은?', '4', '["4", "2", "6", "8"]', '가장 많이 나온 수예요.', 3),
    (quiz_id, 'multiple', '1, 3, 5, 7, 9의 중앙값은?', '5', '["5", "3", "7", "4"]', '가운데 있는 수예요.', 4);

    -- 나무 3: 물질과 에너지
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '⚡ 물질과 에너지', '에너지에 대해 알아봐요!', 'science', 5, 'tree', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '움직이는 물체가 가진 에너지는?', '운동 에너지', '["운동 에너지", "위치 에너지", "열에너지", "빛에너지"]', '속도와 관련있어요.', 0),
    (quiz_id, 'multiple', '높은 곳에 있는 물체가 가진 에너지는?', '위치 에너지', '["위치 에너지", "운동 에너지", "전기 에너지", "화학 에너지"]', '높이와 관련있어요.', 1),
    (quiz_id, 'ox', '에너지는 형태가 바뀔 수 있다. O일까요 X일까요?', 'O', '["O", "X"]', '에너지 전환이에요.', 2),
    (quiz_id, 'multiple', '전기를 만드는 발전소가 아닌 것은?', '정수장', '["정수장", "화력발전소", "수력발전소", "원자력발전소"]', '정수장은 물을 깨끗이 해요.', 3),
    (quiz_id, 'multiple', '태양 에너지를 이용하는 것은?', '태양광 패널', '["태양광 패널", "석탄", "석유", "천연가스"]', '친환경 에너지예요.', 4);

    -- 나무 4: 문장 성분
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '📝 문장 성분', '문장의 성분을 알아봐요!', 'korean', 5, 'tree', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '"철수가 밥을 먹었다"에서 주어는?', '철수가', '["철수가", "밥을", "먹었다", "철수"]', '누가? 에 해당해요.', 0),
    (quiz_id, 'multiple', '"나는 예쁜 꽃을 보았다"에서 목적어는?', '꽃을', '["꽃을", "나는", "예쁜", "보았다"]', '무엇을? 에 해당해요.', 1),
    (quiz_id, 'ox', '서술어는 문장에서 동작이나 상태를 나타낸다. O일까요 X일까요?', 'O', '["O", "X"]', '어찌한다? 에 해당해요.', 2),
    (quiz_id, 'multiple', '"아주 빠르게 달렸다"에서 부사어는?', '아주 빠르게', '["아주 빠르게", "달렸다", "아주", "빠르게"]', '어떻게? 에 해당해요.', 3),
    (quiz_id, 'multiple', '관형어가 꾸며주는 것은?', '체언(명사)', '["체언(명사)", "용언(동사)", "부사", "조사"]', '예쁜 꽃의 "예쁜"이에요.', 4);

    -- 나무 5: 세계 문화
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🌏 세계 문화', '세계 문화를 알아봐요!', 'social', 5, 'tree', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '일본의 전통 옷은?', '기모노', '["기모노", "한복", "치파오", "사리"]', '벚꽃 축제 때 입어요.', 0),
    (quiz_id, 'multiple', '인도에서 소를 신성하게 여기는 종교는?', '힌두교', '["힌두교", "불교", "이슬람교", "기독교"]', '소를 먹지 않아요.', 1),
    (quiz_id, 'ox', '스페인어는 남미에서 많이 사용된다. O일까요 X일까요?', 'O', '["O", "X"]', '브라질을 제외하고요.', 2),
    (quiz_id, 'multiple', '이슬람교에서 금지하는 음식은?', '돼지고기', '["돼지고기", "닭고기", "쇠고기", "양고기"]', '할랄 음식을 먹어요.', 3),
    (quiz_id, 'multiple', '프랑스의 유명한 빵은?', '바게트', '["바게트", "난", "포카치아", "베이글"]', '길쭉해요.', 4);

    -- 나무 6: 방정식
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🔢 방정식 기초', '간단한 방정식을 풀어봐요!', 'math', 6, 'tree', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', 'x + 5 = 12 일 때 x는?', '7', '["7", "5", "12", "17"]', '12에서 5를 빼요.', 0),
    (quiz_id, 'multiple', '3x = 15 일 때 x는?', '5', '["5", "3", "15", "45"]', '15를 3으로 나눠요.', 1),
    (quiz_id, 'ox', 'x - 4 = 10 일 때 x = 14이다. O일까요 X일까요?', 'O', '["O", "X"]', '10에 4를 더해요.', 2),
    (quiz_id, 'multiple', '2x + 3 = 11 일 때 x는?', '4', '["4", "3", "5", "7"]', '먼저 3을 빼고 2로 나눠요.', 3),
    (quiz_id, 'multiple', 'x ÷ 4 = 3 일 때 x는?', '12', '["12", "4", "7", "1"]', '3에 4를 곱해요.', 4);

    -- 나무 7: 역사 시대 구분
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '📜 역사 시대 구분', '역사 시대를 알아봐요!', 'social', 5, 'tree', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '청동기 시대 다음 시대는?', '철기 시대', '["철기 시대", "신석기 시대", "구석기 시대", "중세 시대"]', '더 단단한 금속을 사용했어요.', 0),
    (quiz_id, 'multiple', '고조선을 세운 사람은?', '단군왕검', '["단군왕검", "주몽", "온조", "박혁거세"]', '우리나라 최초의 국가예요.', 1),
    (quiz_id, 'ox', '삼국시대에는 고구려, 백제, 신라가 있었다. O일까요 X일까요?', 'O', '["O", "X"]', '세 나라가 경쟁했어요.', 2),
    (quiz_id, 'multiple', '고려를 세운 사람은?', '왕건', '["왕건", "이성계", "궁예", "견훤"]', '개성을 수도로 했어요.', 3),
    (quiz_id, 'multiple', '조선을 세운 사람은?', '이성계', '["이성계", "왕건", "세종", "정도전"]', '한양을 수도로 했어요.', 4);

    -- 나무 8: 호흡과 순환
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🫁 호흡과 순환', '호흡과 혈액순환을 알아봐요!', 'science', 6, 'tree', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '숨을 쉴 때 산소와 이산화탄소를 교환하는 곳은?', '폐포', '["폐포", "기관", "기관지", "코"]', '폐 속의 작은 주머니예요.', 0),
    (quiz_id, 'multiple', '온몸에 혈액을 보내는 심장 부분은?', '좌심실', '["좌심실", "우심실", "좌심방", "우심방"]', '가장 두꺼운 벽이에요.', 1),
    (quiz_id, 'ox', '동맥은 심장에서 나가는 혈관이다. O일까요 X일까요?', 'O', '["O", "X"]', '정맥은 심장으로 들어와요.', 2),
    (quiz_id, 'multiple', '혈액이 온몸을 한 바퀴 도는 것을?', '혈액순환', '["혈액순환", "호흡", "소화", "배설"]', '심장이 펌프 역할을 해요.', 3),
    (quiz_id, 'multiple', '코로 들이마신 공기가 가는 순서로 맞는 것은?', '코→기관→폐', '["코→기관→폐", "코→폐→기관", "폐→기관→코", "기관→코→폐"]', '위에서 아래로 내려가요.', 4);

    -- 나무 9: 시의 표현
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '📝 시의 표현', '시의 표현 방법을 알아봐요!', 'korean', 5, 'tree', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '"내 마음은 호수"와 같은 표현법은?', '은유', '["은유", "직유", "의인", "과장"]', 'A는 B이다 형태예요.', 0),
    (quiz_id, 'multiple', '"구름처럼 가벼운"과 같은 표현법은?', '직유', '["직유", "은유", "의인", "반복"]', '~처럼, ~같이가 들어가요.', 1),
    (quiz_id, 'ox', '의인법은 사람이 아닌 것을 사람처럼 표현하는 것이다. O일까요 X일까요?', 'O', '["O", "X"]', '꽃이 웃는다 같은 표현이에요.', 2),
    (quiz_id, 'multiple', '"배가 산만 해요"와 같은 표현법은?', '과장', '["과장", "은유", "직유", "의인"]', '크게 부풀려요.', 3),
    (quiz_id, 'multiple', '"졸졸졸 흐르는 시냇물"에서 사용된 표현법은?', '의성어', '["의성어", "의태어", "은유", "직유"]', '소리를 흉내내요.', 4);

    -- 나무 10: 지도 읽기
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🗺️ 지도 읽기', '지도를 읽는 방법을 알아봐요!', 'social', 5, 'tree', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '지도에서 위쪽은 어느 방향일까요?', '북', '["북", "남", "동", "서"]', '나침반을 생각해요.', 0),
    (quiz_id, 'multiple', '축척 1:50000의 뜻은?', '지도 1cm가 실제 500m', '["지도 1cm가 실제 500m", "지도 1cm가 실제 50m", "지도 1cm가 실제 5km", "지도 1cm가 실제 50km"]', '50000cm를 m로 바꿔요.', 1),
    (quiz_id, 'ox', '등고선이 촘촘하면 경사가 급하다. O일까요 X일까요?', 'O', '["O", "X"]', '높이 차이가 많아요.', 2),
    (quiz_id, 'multiple', '지도의 범례는 무엇을 설명하나요?', '기호의 의미', '["기호의 의미", "방향", "축척", "제작자"]', '지도에 쓰인 기호예요.', 3),
    (quiz_id, 'multiple', '위도 0도는 무엇이라고 부를까요?', '적도', '["적도", "본초자오선", "북극", "남극"]', '지구의 허리예요.', 4);

    -- ============================================
    -- 킹왕짱 (king) - 도전 수준 (10개)
    -- ============================================

    -- 킹왕짱 1: 화학 반응
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🧪 화학 반응', '화학 반응을 알아봐요!', 'science', 6, 'king', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '물의 전기분해로 생기는 기체는?', '수소와 산소', '["수소와 산소", "질소와 산소", "이산화탄소와 수소", "헬륨과 네온"]', 'H2O를 분해해요.', 0),
    (quiz_id, 'multiple', '산과 염기가 만나면 생기는 것은?', '물과 염', '["물과 염", "기체", "산", "염기"]', '중화 반응이에요.', 1),
    (quiz_id, 'ox', '녹는 것은 화학 변화이다. O일까요 X일까요?', 'X', '["O", "X"]', '물질 자체는 변하지 않아요.', 2),
    (quiz_id, 'multiple', 'pH 7은 어떤 성질일까요?', '중성', '["중성", "산성", "염기성", "알칼리성"]', '순수한 물이에요.', 3),
    (quiz_id, 'multiple', '철이 녹스는 것은?', '산화', '["산화", "환원", "중화", "분해"]', '산소와 결합해요.', 4);

    -- 킹왕짱 2: 세계 경제
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '💹 세계 경제', '세계 경제를 알아봐요!', 'social', 6, 'king', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '미국의 화폐 단위는?', '달러', '["달러", "유로", "엔", "파운드"]', 'USD예요.', 0),
    (quiz_id, 'multiple', '유럽연합에서 사용하는 화폐는?', '유로', '["유로", "달러", "파운드", "마르크"]', 'EU 국가들이 사용해요.', 1),
    (quiz_id, 'ox', 'FTA는 자유무역협정이다. O일까요 X일까요?', 'O', '["O", "X"]', 'Free Trade Agreement예요.', 2),
    (quiz_id, 'multiple', '환율이 오르면 수출에 어떤 영향이 있을까요?', '유리하다', '["유리하다", "불리하다", "영향 없다", "수출이 중단된다"]', '원화 가치가 낮아져요.', 3),
    (quiz_id, 'multiple', 'WTO는 무엇의 약자일까요?', '세계무역기구', '["세계무역기구", "세계보건기구", "국제연합", "국제통화기금"]', 'World Trade Organization이에요.', 4);

    -- 킹왕짱 3: 고급 도형
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '📐 고급 도형', '어려운 도형 문제에 도전!', 'math', 6, 'king', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '정육면체의 면의 개수는?', '6개', '["6개", "4개", "8개", "12개"]', '주사위를 생각해요.', 0),
    (quiz_id, 'multiple', '원기둥의 전개도에서 옆면의 모양은?', '직사각형', '["직사각형", "원", "삼각형", "사다리꼴"]', '둥글게 말면 원기둥이에요.', 1),
    (quiz_id, 'ox', '구의 부피 공식은 4/3πr³이다. O일까요 X일까요?', 'O', '["O", "X"]', '반지름의 세제곱이에요.', 2),
    (quiz_id, 'multiple', '정이십면체의 면의 모양은?', '정삼각형', '["정삼각형", "정사각형", "정오각형", "정육각형"]', '축구공과 비슷해요.', 3),
    (quiz_id, 'multiple', '원뿔의 꼭짓점 개수는?', '1개', '["1개", "0개", "2개", "3개"]', '뾰족한 곳이에요.', 4);

    -- 킹왕짱 4: 유전과 진화
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🧬 유전과 진화', '유전과 진화를 알아봐요!', 'science', 6, 'king', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '유전 정보를 담고 있는 물질은?', 'DNA', '["DNA", "RNA", "단백질", "지방"]', '이중나선 구조예요.', 0),
    (quiz_id, 'multiple', '진화론을 주장한 과학자는?', '다윈', '["다윈", "뉴턴", "아인슈타인", "멘델"]', '종의 기원을 썼어요.', 1),
    (quiz_id, 'ox', '자연선택은 환경에 적응한 개체가 살아남는 것이다. O일까요 X일까요?', 'O', '["O", "X"]', '적자생존이에요.', 2),
    (quiz_id, 'multiple', '부모에게서 자식에게 형질이 전달되는 것을?', '유전', '["유전", "돌연변이", "진화", "적응"]', '닮는 이유예요.', 3),
    (quiz_id, 'multiple', '염색체는 어디에 있을까요?', '세포핵', '["세포핵", "세포막", "세포질", "미토콘드리아"]', 'DNA가 들어있어요.', 4);

    -- 킹왕짱 5: 철학과 사상
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🤔 철학과 사상', '철학에 대해 알아봐요!', 'social', 6, 'king', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '"나는 생각한다, 고로 존재한다"를 말한 철학자는?', '데카르트', '["데카르트", "소크라테스", "플라톤", "칸트"]', '근대 철학의 아버지예요.', 0),
    (quiz_id, 'multiple', '유교의 핵심 덕목 중 하나로 "어버이를 공경하는 것"은?', '효', '["효", "충", "인", "의"]', '부모님을 섬기는 것이에요.', 1),
    (quiz_id, 'ox', '민주주의는 국민이 주권을 가진 정치 형태이다. O일까요 X일까요?', 'O', '["O", "X"]', '국민의, 국민에 의한, 국민을 위한이에요.', 2),
    (quiz_id, 'multiple', '불교에서 깨달음의 상태를?', '열반', '["열반", "윤회", "업보", "해탈"]', '고통에서 벗어나는 것이에요.', 3),
    (quiz_id, 'multiple', '"인간은 만물의 척도"라고 한 철학자는?', '프로타고라스', '["프로타고라스", "아리스토텔레스", "플라톤", "헤라클레이토스"]', '소피스트였어요.', 4);

    -- 킹왕짱 6: 확률과 조합
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🎲 확률과 조합', '확률과 조합에 도전!', 'math', 6, 'king', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '5명 중 2명을 뽑는 경우의 수는?', '10', '["10", "20", "5", "25"]', '5C2 = 10이에요.', 0),
    (quiz_id, 'multiple', '동전 3개를 던질 때 모두 앞면이 나올 확률은?', '1/8', '["1/8", "1/4", "1/2", "1/6"]', '1/2 × 1/2 × 1/2예요.', 1),
    (quiz_id, 'ox', '4!은 24이다. O일까요 X일까요?', 'O', '["O", "X"]', '4×3×2×1이에요.', 2),
    (quiz_id, 'multiple', 'A, B, C 3개를 나열하는 방법의 수는?', '6가지', '["6가지", "3가지", "9가지", "12가지"]', '3! = 6이에요.', 3),
    (quiz_id, 'multiple', '서로 다른 5개 중 3개를 순서대로 뽑는 경우의 수는?', '60', '["60", "30", "120", "10"]', '5P3 = 60이에요.', 4);

    -- 킹왕짱 7: 현대 과학
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🔬 현대 과학', '현대 과학에 도전!', 'science', 6, 'king', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '상대성이론을 발표한 과학자는?', '아인슈타인', '["아인슈타인", "뉴턴", "보어", "호킹"]', 'E=mc²를 발표했어요.', 0),
    (quiz_id, 'multiple', '원자의 중심에 있는 것은?', '원자핵', '["원자핵", "전자", "중성자", "양성자"]', '양성자와 중성자가 있어요.', 1),
    (quiz_id, 'ox', '양성자는 양의 전하를 띤다. O일까요 X일까요?', 'O', '["O", "X"]', '전자는 음의 전하예요.', 2),
    (quiz_id, 'multiple', '양자역학의 불확정성 원리를 발표한 사람은?', '하이젠베르크', '["하이젠베르크", "슈뢰딩거", "보어", "플랑크"]', '위치와 운동량을 동시에 알 수 없어요.', 3),
    (quiz_id, 'multiple', '빅뱅 이론은 무엇을 설명하나요?', '우주의 시작', '["우주의 시작", "지구의 형성", "생명의 기원", "은하의 구조"]', '우주가 팽창하고 있어요.', 4);

    -- 킹왕짱 8: 고급 영문법
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '📖 고급 국문법', '고급 국문법에 도전!', 'korean', 6, 'king', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '"먹다"의 명사형은?', '먹음, 먹기', '["먹음, 먹기", "먹는", "먹고", "먹어"]', '-음, -기가 붙어요.', 0),
    (quiz_id, 'multiple', '"달리다"의 관형형(현재)은?', '달리는', '["달리는", "달린", "달릴", "달리던"]', '-는이 붙어요.', 1),
    (quiz_id, 'ox', '"높이"는 명사이면서 부사이다. O일까요 X일까요?', 'O', '["O", "X"]', '품사 통용이에요.', 2),
    (quiz_id, 'multiple', '합성어가 아닌 것은?', '아름답다', '["아름답다", "눈사람", "밤낮", "손발"]', '단일어예요.', 3),
    (quiz_id, 'multiple', '"시원하다"의 반의어는?', '답답하다', '["답답하다", "따뜻하다", "뜨겁다", "차갑다"]', '기분이 좋지 않아요.', 4);

    -- 킹왕짱 9: 기후와 환경 문제
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🌡️ 기후와 환경 문제', '환경 문제에 도전!', 'science', 6, 'king', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '오존층 파괴의 주 원인 물질은?', '프레온 가스', '["프레온 가스", "이산화탄소", "메탄", "질소"]', 'CFC라고도 해요.', 0),
    (quiz_id, 'multiple', '온실가스가 아닌 것은?', '산소', '["산소", "이산화탄소", "메탄", "수증기"]', '산소는 생명에 필수예요.', 1),
    (quiz_id, 'ox', '파리 협정은 기후변화 대응을 위한 국제 협약이다. O일까요 X일까요?', 'O', '["O", "X"]', '2015년에 채택됐어요.', 2),
    (quiz_id, 'multiple', '미세먼지의 주요 발생 원인이 아닌 것은?', '식물의 광합성', '["식물의 광합성", "자동차 배기가스", "공장 매연", "화력발전"]', '광합성은 공기를 정화해요.', 3),
    (quiz_id, 'multiple', '열대우림 파괴의 주요 원인은?', '농경지 확대', '["농경지 확대", "자연재해", "지진", "화산"]', '팜유 생산 등이에요.', 4);

    -- 킹왕짱 10: 음악 이론
    INSERT INTO public.quizzes (id, created_by, title, description, category, grade_level, difficulty, is_public)
    VALUES (gen_random_uuid(), system_user_id, '🎼 음악 이론', '음악 이론에 도전!', 'art', 6, 'king', true)
    RETURNING id INTO quiz_id;
    INSERT INTO public.quiz_questions (quiz_id, question_type, question_text, correct_answer, options, hint, order_index) VALUES
    (quiz_id, 'multiple', '4분음표 2개와 같은 길이의 음표는?', '2분음표', '["2분음표", "온음표", "8분음표", "16분음표"]', '4분음표의 2배예요.', 0),
    (quiz_id, 'multiple', '♯(샤프) 기호의 의미는?', '반음 올림', '["반음 올림", "반음 내림", "한음 올림", "한음 내림"]', '♭의 반대예요.', 1),
    (quiz_id, 'ox', '다장조(C Major)의 조표에는 ♯이나 ♭이 없다. O일까요 X일까요?', 'O', '["O", "X"]', '기본 음계예요.', 2),
    (quiz_id, 'multiple', '4/4 박자에서 한 마디에 4분음표가 몇 개 들어갈까요?', '4개', '["4개", "3개", "2개", "6개"]', '분모가 4분음표예요.', 3),
    (quiz_id, 'multiple', '화음에서 도, 미, 솔을 함께 연주하는 것을?', '다장조 화음', '["다장조 화음", "단조 화음", "불협화음", "증화음"]', 'C Major chord예요.', 4);

    RAISE NOTICE '추가 퀴즈 시드 데이터 2가 성공적으로 생성되었습니다! (각 난이도별 10개, 총 40개)';
END $$;

# 🚀 퀴즈 자동 생성 빠른 시작 가이드

## 📋 준비사항

- Supabase 프로젝트
- Supabase CLI 설치 (`npm install -g supabase`)
- 최소 1명 이상의 등록된 사용자

## 🎯 5분 안에 설정하기

### 1️⃣ 데이터베이스 설정 (1분)

Supabase Dashboard > SQL Editor에서 실행:

```sql
-- supabase/migrations/006_setup_quiz_automation.sql 파일 내용 복사 & 실행
```

또는 Supabase CLI 사용:

```bash
supabase db push
```

### 2️⃣ Extension 활성화 (30초)

1. Supabase Dashboard > Database > Extensions
2. `pg_cron` 검색
3. Enable 버튼 클릭
4. `pg_net` 검색
5. Enable 버튼 클릭

### 3️⃣ Edge Function 배포 (1분)

```bash
# 프로젝트 루트에서
./scripts/deploy-quiz-automation.sh
```

또는 수동으로:

```bash
supabase functions deploy generate-daily-quiz
```

### 4️⃣ 환경 변수 설정 (1분)

Supabase Dashboard > Edge Functions > Settings:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key
```

Supabase Dashboard > SQL Editor에서 DB 설정값 등록:

```sql
INSERT INTO public.quiz_automation_settings (setting_key, setting_value)
VALUES
  ('supabase_url', 'https://your-project.supabase.co'),
  ('supabase_anon_key', 'your-anon-key')
ON CONFLICT (setting_key) DO UPDATE
SET setting_value = EXCLUDED.setting_value,
    updated_at = TIMEZONE('utc'::text, NOW());
```

### 5️⃣ 테스트 (30초)

```bash
# 환경 변수 설정
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_KEY="your-anon-key"

# 테스트 실행
./scripts/test-quiz-generation.sh
```

또는 웹 인터페이스에서:

- `/admin/quiz-automation` 접속
- "지금 퀴즈 생성하기" 클릭

## 🎉 완료!

이제 매시간 정각에 AI가 학년별/과목별 퀴즈를 자동 생성합니다!

## 🔍 확인하기

### 퀴즈 생성 확인

```sql
SELECT * FROM quizzes
ORDER BY created_at DESC
LIMIT 5;
```

### 생성 이력 확인

```sql
SELECT * FROM quiz_generation_history
ORDER BY generated_at DESC
LIMIT 5;
```

### 스케줄러 확인

```sql
SELECT * FROM cron.job
WHERE jobname = 'daily-quiz-generation';
```

## ⚙️ 커스터마이징

### 수동 생성 퀴즈 템플릿 추가

자동 실행은 AI로 생성합니다. `quizTemplates` 배열은 `all`, `single`, `batch` 수동 생성 모드에서만 사용하며 자동 생성 실패 시 fallback으로 사용하지 않습니다.

`supabase/functions/generate-daily-quiz/index.ts`의 `quizTemplates` 배열에 추가:

```typescript
{
  title: '🎨 나만의 퀴즈',
  description: '재미있는 퀴즈!',
  category: 'art',
  grade_level: 3,
  difficulty: 'leaf',
  questions: [
    {
      question_type: 'multiple',
      question_text: '질문 내용',
      correct_answer: '정답',
      options: ['선택지1', '선택지2', '선택지3', '정답'],
      hint: '힌트'
    }
  ]
}
```

### 실행 시간 변경

마이그레이션 파일에서 cron 스케줄 수정:

```sql
SELECT cron.schedule(
    'daily-quiz-generation',
    '0 * * * *',  -- 매시간 정각
    $$SELECT public.trigger_daily_quiz_generation();$$
);
```

## 🆘 문제 해결

### "시스템 사용자를 찾을 수 없습니다" 오류

→ 최소 1명의 사용자가 등록되어 있어야 합니다.

### Edge Function이 실행되지 않음

→ `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`가 올바르게 설정되었는지 확인하세요.

### 스케줄러가 작동하지 않음

→ pg_cron, pg_net extension이 활성화되었는지 확인하세요.

### 더 많은 도움이 필요하신가요?

→ [QUIZ_AUTOMATION.md](./QUIZ_AUTOMATION.md) 문서를 참고하세요.

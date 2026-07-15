# 퀴즈 자동 생성 시스템

이 시스템은 매시간 자동으로 새로운 퀴즈를 생성합니다.

## 🏗️ 아키텍처

### 1. Edge Function (`supabase/functions/generate-daily-quiz`)

- Deno 런타임에서 실행되는 서버리스 함수
- Gemini API를 호출해 매시간 새로운 학년별/과목별 퀴즈 생성
- 사전 정의된 퀴즈 템플릿은 수동 생성 모드와 AI 실패 fallback 용도로 유지

### 2. 데이터베이스 스케줄러 (pg_cron)

- PostgreSQL의 cron extension 사용
- 매시간 정각에 자동 실행

### 3. 이력 추적 (`quiz_generation_history` 테이블)

- 생성된 퀴즈의 이력 저장
- 성공/실패 상태 추적
- 오류 메시지 로깅

## 📋 설정 방법

### 1. 마이그레이션 실행

```bash
# Supabase CLI 사용
supabase db push

# 또는 Supabase Dashboard에서 SQL 직접 실행
# migrations/006_setup_quiz_automation.sql 내용 실행
```

### 2. Edge Function 배포

```bash
supabase functions deploy generate-daily-quiz
```

### 3. 환경 변수 설정

Supabase Dashboard > Project Settings > Edge Functions에서:

- `SUPABASE_URL`: 프로젝트 URL
- `SUPABASE_SERVICE_ROLE_KEY`: 서비스 역할 키
- `GEMINI_API_KEY`: Gemini API 키
- `ENABLE_DAILY_AI_TEMPLATE_FALLBACK`: 선택값. `true`이면 모든 AI 실패 시 기존 템플릿으로 대체 생성

### 4. pg_cron 활성화

Supabase Dashboard > Database > Extensions에서:

- `pg_cron` extension 활성화
- `pg_net` extension 활성화

### 5. DB 설정값 등록

Supabase Dashboard > SQL Editor에서 프로젝트 URL과 anon key를 등록하세요.

```sql
INSERT INTO public.quiz_automation_settings (setting_key, setting_value)
VALUES
  ('supabase_url', 'https://YOUR_PROJECT_REF.supabase.co'),
  ('supabase_anon_key', 'YOUR_ANON_KEY')
ON CONFLICT (setting_key) DO UPDATE
SET setting_value = EXCLUDED.setting_value,
    updated_at = TIMEZONE('utc'::text, NOW());
```

## 🚀 사용 방법

### 자동 실행

- 매시간 정각에 자동으로 실행됩니다
- `daily` 모드는 Gemini API로 1~6학년별 새 퀴즈를 최대 6개 생성합니다
- 과목/주제는 날짜 기준으로 학년별 로테이션됩니다

### 수동 실행

1. **API 호출**

```bash
curl -X POST https://your-project.supabase.co/functions/v1/generate-daily-quiz \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

2. **관리 페이지 사용**

- `/admin/quiz-automation` 페이지 접속
- "지금 퀴즈 생성하기" 버튼 클릭

3. **SQL 함수 호출**

```sql
SELECT public.generate_quiz_now();
```

## 📊 AI 자동 생성과 템플릿

자동 실행(`daily`)은 아래 학년별 주제 풀에서 날짜 기준으로 주제를 고른 뒤 Gemini API로 새 퀴즈를 생성합니다:

1. **1학년**: 국어, 수학, 과학, 생활
2. **2학년**: 수학, 국어, 과학, 영어
3. **3학년**: 사회, 수학, 과학, 국어
4. **4학년**: 과학, 수학, 사회, 영어
5. **5학년**: 과학, 수학, 사회, 국어
6. **6학년**: 수학, 영어, 과학, 사회

`quizTemplates` 배열은 `all`, `single`, `batch` 수동 모드와 대체 생성에 사용됩니다. Gemini 429/5xx 같은 일시 장애는 3회 재시도 후 자동으로 템플릿 대체 생성되며, `ENABLE_DAILY_AI_TEMPLATE_FALLBACK=true`이면 응답 형식 오류 같은 일반 AI 실패도 대체 생성됩니다.

### fallback 템플릿 추가 방법

`supabase/functions/generate-daily-quiz/index.ts` 파일의 `quizTemplates` 배열에 새로운 템플릿을 추가하세요.

```typescript
{
  title: '🎨 새로운 퀴즈',
  description: '설명',
  category: 'art',
  grade_level: 3,
  difficulty: 'leaf',
  questions: [
    // 질문들...
  ]
}
```

## 🔍 모니터링

### 생성 이력 확인

```sql
SELECT
  h.*,
  q.title,
  q.category,
  q.difficulty
FROM quiz_generation_history h
LEFT JOIN quizzes q ON h.quiz_id = q.id
ORDER BY h.generated_at DESC
LIMIT 10;
```

### 관리 페이지

`/admin/quiz-automation` 페이지에서:

- 생성 이력 조회
- 수동 생성 트리거
- 상태 모니터링

## 🔧 문제 해결

### Edge Function이 실행되지 않는 경우

1. 환경 변수가 올바르게 설정되었는지 확인
2. Supabase Functions 로그 확인
3. 서비스 역할 키 권한 확인

### 스케줄러가 작동하지 않는 경우

1. pg_cron extension이 활성화되었는지 확인
2. pg_net extension이 활성화되었는지 확인
3. cron 작업 목록 확인:

```sql
SELECT * FROM cron.job;
```

4. cron 실행 이력 확인:

```sql
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

5. Edge Function HTTP 요청 이력 확인:

```sql
SELECT * FROM net._http_response ORDER BY created DESC LIMIT 10;
```

### 퀴즈 생성 실패 시

1. `quiz_generation_history` 테이블의 `error_message` 확인
2. Edge Function 로그 확인
3. 데이터베이스 연결 상태 확인
4. Gemini 503/429가 반복되면 Edge Function은 3회 재시도 후 템플릿 대체 생성으로 진행합니다

## 🔐 보안

- Edge Function은 서비스 역할 키를 사용하여 RLS를 우회합니다
- 수동 트리거 API는 인증된 사용자만 접근 가능하도록 설정하세요
- 프로덕션 환경에서는 관리자 권한 확인을 추가하세요

## 📝 향후 개선 사항

- [ ] AI를 활용한 동적 퀴즈 생성 (OpenAI, Claude API)
- [ ] 사용자 정의 템플릿 지원
- [ ] 난이도별 자동 조절
- [ ] 카테고리별 생성 빈도 조절
- [ ] 이메일 알림 기능
- [ ] 생성 실패 시 재시도 로직

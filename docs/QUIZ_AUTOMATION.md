# 퀴즈 자동 생성 시스템

이 시스템은 매일 자동으로 새로운 퀴즈를 생성합니다.

## 🏗️ 아키텍처

### 1. Edge Function (`supabase/functions/generate-daily-quiz`)
- Deno 런타임에서 실행되는 서버리스 함수
- 사전 정의된 퀴즈 템플릿을 사용하여 퀴즈 생성
- 일별 순환 방식으로 다양한 퀴즈 제공

### 2. 데이터베이스 스케줄러 (pg_cron)
- PostgreSQL의 cron extension 사용
- 매일 자정(UTC 기준)에 자동 실행
- 한국 시간 기준: 오전 9시

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

### 4. pg_cron 활성화
Supabase Dashboard > Database > Extensions에서:
- `pg_cron` extension 활성화

## 🚀 사용 방법

### 자동 실행
- 매일 자정(UTC 기준)에 자동으로 실행됩니다
- 한국 시간 기준: 매일 오전 9시

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

## 📊 퀴즈 템플릿

현재 3개의 템플릿이 순환되며 실행됩니다:

1. **🌍 세계 여행** (sprout, 3학년, 사회)
   - 세계 여러 나라의 수도와 명소
   
2. **🦕 공룡 세계** (seedling, 2학년, 과학)
   - 공룡의 종류와 특징
   
3. **⚽ 스포츠 상식** (tree, 4학년, 체육)
   - 다양한 스포츠 규칙과 상식

### 템플릿 추가 방법
`supabase/functions/generate-daily-quiz/index.ts` 파일의 `quizTemplates` 배열에 새로운 템플릿을 추가하세요.

```typescript
{
  title: '🎨 새로운 퀴즈',
  description: '설명',
  category: 'art',
  grade_level: 3,
  difficulty: 'sprout',
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
2. cron 작업 목록 확인:
```sql
SELECT * FROM cron.job;
```
3. cron 실행 이력 확인:
```sql
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

### 퀴즈 생성 실패 시
1. `quiz_generation_history` 테이블의 `error_message` 확인
2. Edge Function 로그 확인
3. 데이터베이스 연결 상태 확인

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

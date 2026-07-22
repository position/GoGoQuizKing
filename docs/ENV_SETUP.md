# 퀴즈 자동 생성 환경 변수 설정

## Supabase Project 설정

1. Supabase Dashboard > Settings > API에서 다음 정보 확인:

    - Project URL
    - Anon (public) key
    - Service role key

2. .env 파일에 추가:

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key

## Edge Function 환경 변수

Supabase Dashboard > Edge Functions > Settings에서:

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key

## pg_cron 설정

Supabase Dashboard > Database > Extensions에서 `pg_cron`, `pg_net`을 활성화한 뒤 SQL Editor에서 설정합니다.

```sql
INSERT INTO public.quiz_automation_settings (setting_key, setting_value)
VALUES
  ('supabase_url', 'https://your-project.supabase.co'),
  ('supabase_anon_key', 'your-anon-key')
ON CONFLICT (setting_key) DO UPDATE
SET setting_value = EXCLUDED.setting_value,
    updated_at = TIMEZONE('utc'::text, NOW());
```

매시간 정각에 실행하려면 아래처럼 등록합니다.

```sql
SELECT cron.schedule(
  'daily-quiz-generation',
  '0 * * * *',
  $$SELECT public.trigger_daily_quiz_generation();$$
);
```

## 보안 주의사항

- Service Role Key는 절대 클라이언트에 노출하지 마세요
- 프로덕션 환경에서는 적절한 권한 관리가 필요합니다
- .env 파일은 반드시 .gitignore에 포함시키세요

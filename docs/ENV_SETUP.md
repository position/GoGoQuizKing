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

## Edge Function 환경 변수

Supabase Dashboard > Edge Functions > Settings에서:

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

## pg_cron 설정 (선택사항)

database 설정에 추가 (postgresql.conf 또는 SQL):

SELECT cron.schedule(
  'daily-quiz-generation',
  '0 0 * * *',
  $$SELECT public.trigger_daily_quiz_generation();$$
);

## 보안 주의사항

- Service Role Key는 절대 클라이언트에 노출하지 마세요
- 프로덕션 환경에서는 적절한 권한 관리가 필요합니다
- .env 파일은 반드시 .gitignore에 포함시키세요

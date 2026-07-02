#!/bin/bash

# 퀴즈 자동 생성 시스템 배포 스크립트

set -e

echo "🚀 퀴즈 자동 생성 시스템 배포 시작..."

# 1. Supabase 로그인 확인
echo "📋 Supabase 로그인 확인 중..."
supabase status || {
  echo "❌ Supabase에 로그인되어 있지 않습니다."
  echo "   supabase login 명령을 실행하세요."
  exit 1
}

# 2. Edge Function 배포
echo "📦 Edge Function 배포 중..."
supabase functions deploy generate-daily-quiz --no-verify-jwt

echo "✅ Edge Function 배포 완료!"

# 3. 환경 변수 설정 안내
echo ""
echo "⚙️  환경 변수를 설정해주세요:"
echo "   1. Supabase Dashboard > Edge Functions > Settings"
echo "   2. 다음 환경 변수 추가:"
echo "      - SUPABASE_URL"
echo "      - SUPABASE_SERVICE_ROLE_KEY"
echo "      - GEMINI_API_KEY"
echo "      - ENABLE_DAILY_AI_TEMPLATE_FALLBACK (선택, true이면 AI 실패 시 템플릿 대체)"

# 4. 마이그레이션 안내
echo ""
echo "📊 데이터베이스 마이그레이션:"
echo "   Supabase Dashboard > SQL Editor에서"
echo "   supabase/migrations/006_setup_quiz_automation.sql 실행"
echo "   실행 전 또는 후에 DB 설정값 등록:"
echo "   ALTER DATABASE postgres SET app.supabase_url = 'https://your-project.supabase.co';"
echo "   ALTER DATABASE postgres SET app.supabase_anon_key = 'your-anon-key';"

# 5. pg_cron 활성화 안내
echo ""
echo "⏰ pg_cron / pg_net Extension 활성화:"
echo "   Supabase Dashboard > Database > Extensions"
echo "   'pg_cron' 검색 후 활성화"
echo "   'pg_net' 검색 후 활성화"

echo ""
echo "🎉 배포 완료!"
echo "   관리 페이지: /admin/quiz-automation"

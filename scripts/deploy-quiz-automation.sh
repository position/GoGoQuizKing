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

# 4. 마이그레이션 안내
echo ""
echo "📊 데이터베이스 마이그레이션:"
echo "   Supabase Dashboard > SQL Editor에서"
echo "   supabase/migrations/006_setup_quiz_automation.sql 실행"

# 5. pg_cron 활성화 안내
echo ""
echo "⏰ pg_cron Extension 활성화:"
echo "   Supabase Dashboard > Database > Extensions"
echo "   'pg_cron' 검색 후 활성화"

echo ""
echo "🎉 배포 완료!"
echo "   관리 페이지: /admin/quiz-automation"

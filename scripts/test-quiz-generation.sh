#!/bin/bash

# 퀴즈 자동 생성 테스트 스크립트

set -e

echo "🧪 퀴즈 자동 생성 테스트 시작..."

# Supabase 프로젝트 URL과 Anon Key를 환경 변수에서 가져오기
SUPABASE_URL=${SUPABASE_URL:-""}
SUPABASE_ANON_KEY=${SUPABASE_KEY:-""}

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
  echo "❌ 환경 변수를 설정해주세요:"
  echo "   export SUPABASE_URL='https://your-project.supabase.co'"
  echo "   export SUPABASE_KEY='your-anon-key'"
  exit 1
fi

echo "📡 Edge Function 호출 중..."
echo "   URL: $SUPABASE_URL/functions/v1/generate-daily-quiz"

RESPONSE=$(curl -s -X POST \
  "$SUPABASE_URL/functions/v1/generate-daily-quiz" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"trigger":"test"}')

echo ""
echo "📦 응답:"
echo "$RESPONSE" | jq '.' || echo "$RESPONSE"

# 성공 여부 확인
if echo "$RESPONSE" | grep -q '"success":true'; then
  echo ""
  echo "✅ 퀴즈 생성 테스트 성공!"
else
  echo ""
  echo "❌ 퀴즈 생성 테스트 실패"
  exit 1
fi

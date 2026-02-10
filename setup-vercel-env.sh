#!/bin/bash

# Vercel 환경 변수 설정 스크립트
# 사용법: ./setup-vercel-env.sh

echo "🚀 Vercel 환경 변수 설정 시작..."

# Production 환경에 환경 변수 추가
vercel env add NUXT_PUBLIC_API_TIMEOUT production <<< "10000"
vercel env add NUXT_PUBLIC_SUPABASE_URL production <<< "https://jjfhmpqgljancosvlibm.supabase.co"
vercel env add NUXT_PUBLIC_SUPABASE_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZmhtcHFnbGphbmNvc3ZsaWJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0ODYyMTQsImV4cCI6MjA4NTA2MjIxNH0.WVjhZfRgwkqnlmAsKg6lRacdbAjTnAsEgofrn4huJZc"
vercel env add NUXT_PUBLIC_TRIVIA_API production <<< "https://the-trivia-api.com/api"
vercel env add NUXT_PUBLIC_SUPABASE_STORAGE production <<< "https://jjfhmpqgljancosvlibm.supabase.co/storage/v1/object/public/assets"

# Preview 환경에도 동일하게 추가 (선택사항)
vercel env add NUXT_PUBLIC_API_TIMEOUT preview <<< "10000"
vercel env add NUXT_PUBLIC_SUPABASE_URL preview <<< "https://jjfhmpqgljancosvlibm.supabase.co"
vercel env add NUXT_PUBLIC_SUPABASE_KEY preview <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZmhtcHFnbGphbmNvc3ZsaWJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0ODYyMTQsImV4cCI6MjA4NTA2MjIxNH0.WVjhZfRgwkqnlmAsKg6lRacdbAjTnAsEgofrn4huJZc"
vercel env add NUXT_PUBLIC_TRIVIA_API preview <<< "https://the-trivia-api.com/api"
vercel env add NUXT_PUBLIC_SUPABASE_STORAGE preview <<< "https://jjfhmpqgljancosvlibm.supabase.co/storage/v1/object/public/assets"

echo "✅ 환경 변수 설정 완료!"
echo "💡 현재 설정된 환경 변수 확인: vercel env ls"

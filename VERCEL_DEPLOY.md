# Vercel 배포 가이드

## 환경 변수 설정

`.env.local` 파일의 환경 변수는 Git에 포함되지 않으므로, Vercel에서 별도로 설정해야 합니다.

### 방법 1: Vercel 대시보드 (추천)

1. **Vercel 대시보드 접속**
   - https://vercel.com 에서 로그인
   - 배포할 프로젝트 선택

2. **Settings → Environment Variables 메뉴로 이동**

3. **다음 환경 변수를 하나씩 추가:**

   | Name | Value |
   |------|-------|
   | `NUXT_PUBLIC_API_TIMEOUT` | `10000` |
   | `NUXT_PUBLIC_SUPABASE_URL` | `https://jjfhmpqgljancosvlibm.supabase.co` |
   | `NUXT_PUBLIC_SUPABASE_KEY` | `eyJhbGci...` (전체 키 값 복사) |
   | `NUXT_PUBLIC_TRIVIA_API` | `https://the-trivia-api.com/api` |
   | `NUXT_PUBLIC_SUPABASE_STORAGE` | `https://jjfhmpqgljancosvlibm.supabase.co/storage/v1/object/public/assets` |

4. **환경 선택**
   - Production: 프로덕션 배포
   - Preview: PR 미리보기
   - Development: 로컬 개발 (선택사항)

5. **Save 버튼 클릭**

### 방법 2: Vercel CLI 사용

#### CLI 설치 (아직 설치하지 않은 경우)
```bash
npm i -g vercel
```

#### 로그인
```bash
vercel login
```

#### 프로젝트 연결
```bash
vercel link
```

#### 자동 설정 스크립트 실행
```bash
./setup-vercel-env.sh
```

또는 수동으로 하나씩 추가:
```bash
vercel env add NUXT_PUBLIC_API_TIMEOUT production
# 프롬프트에서 값 입력: 10000

vercel env add NUXT_PUBLIC_SUPABASE_URL production
# 프롬프트에서 값 입력: https://jjfhmpqgljancosvlibm.supabase.co

# ... 나머지 환경 변수도 동일하게 추가
```

#### 설정된 환경 변수 확인
```bash
vercel env ls
```

## 배포하기

### GitHub/GitLab/Bitbucket 연동 (추천)
1. Vercel 대시보드에서 "Import Project" 클릭
2. Git 저장소 연결
3. 프로젝트 설정 확인 (Nuxt.js 자동 감지됨)
4. Deploy 클릭
5. 이후 Git에 push하면 자동 배포됨

### CLI로 배포
```bash
# Production 배포
vercel --prod

# Preview 배포
vercel
```

## 배포 후 확인사항

- ✅ 환경 변수가 올바르게 설정되었는지 확인
- ✅ Supabase 연결 테스트
- ✅ 로그인/로그아웃 기능 테스트
- ✅ Quiz API 호출 테스트

## 주의사항

⚠️ **보안**
- `.env.local` 파일은 절대 Git에 커밋하지 마세요
- Supabase 키는 공개 키(anon key)지만, Service Key는 노출 금지
- 민감한 정보는 Vercel Environment Variables에만 저장

⚠️ **빌드 설정**
- Nuxt.js는 자동으로 감지되지만, 필요시 Build Command 확인:
  - Build Command: `npm run build`
  - Output Directory: `.output/public`
  - Install Command: `npm install`

## 트러블슈팅

### 환경 변수가 적용되지 않는 경우
1. Vercel 대시보드에서 환경 변수 재확인
2. Redeploy 클릭하여 재배포
3. 환경 변수 이름이 정확한지 확인 (`NUXT_PUBLIC_` 접두사 필수)

### 빌드 실패 시
1. 로컬에서 `npm run build` 테스트
2. Node.js 버전 확인 (Vercel 설정에서 변경 가능)
3. 빌드 로그 확인

### localStorage 오류 발생 시
- 이미 수정되었으나, SSR 환경에서 `process.client` 체크 필수

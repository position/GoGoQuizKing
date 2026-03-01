---
applyTo: "**/*"
---

# 프로젝트 아키텍처 (Project Architecture)

## TL;DR

- [ ] Nuxt 3 프로젝트 구조 숙지했는가?
- [ ] 기술 스택 이해했는가?
- [ ] 파일 기반 라우팅 이해했는가?
- [ ] Supabase 연동 방식 파악했는가?

---

## 기술 스택

| 분류 | 기술 | 버전/설명 |
|------|------|-----------|
| **Framework** | Nuxt 3 | Vue 3 기반 메타 프레임워크 |
| **Language** | TypeScript | Strict mode |
| **State Management** | Pinia | with persistedstate plugin |
| **UI Framework** | Quasar | Material Design 기반 |
| **Backend/DB** | Supabase | PostgreSQL, Auth, Edge Functions |
| **Chart** | Chart.js | 데이터 시각화 |
| **Date** | Day.js | 날짜/시간 처리 |
| **Linting** | ESLint, Prettier | 코드 품질 도구 |

---

## 프로젝트 구조

```
GoGoQuizKing/
├── .github/
│   ├── copilot-instructions.md    # AI 협업 진입점
│   ├── instructions/              # 선언적 규칙
│   ├── skills/                    # 스킬 (절차적 가이드)
│   └── docs/                      # 문서
│
├── app.vue                        # 앱 진입점
├── app.config.ts                  # 앱 설정
├── nuxt.config.ts                 # Nuxt 설정
│
├── pages/                         # 파일 기반 라우팅
│   ├── index.vue                  # / (홈)
│   ├── login.vue                  # /login
│   ├── quiz/                      # /quiz/*
│   ├── ranking/                   # /ranking/*
│   └── profile/                   # /profile/*
│
├── components/                    # Vue 컴포넌트 (자동 import)
│   ├── auth/                      # 인증 관련
│   ├── layout/                    # 레이아웃
│   ├── quiz/                      # 퀴즈 도메인
│   ├── ranking/                   # 랭킹 도메인
│   ├── badge/                     # 뱃지 도메인
│   ├── point/                     # 포인트 도메인
│   ├── stats/                     # 통계 도메인
│   └── notice/                    # 공지사항 도메인
│
├── composables/                   # Composables (자동 import)
│   └── use-supabase.ts
│
├── store/                         # Pinia stores
│   ├── auth.store.ts
│   ├── quiz.store.ts
│   ├── ranking.store.ts
│   ├── point.store.ts
│   └── badge.store.ts
│
├── models/                        # TypeScript 타입 정의
│   ├── quiz.ts
│   ├── ranking.ts
│   ├── point.ts
│   └── badge.ts
│
├── helper/                        # 유틸리티 함수
│   ├── common.ts
│   ├── filters.ts
│   ├── float.ts
│   └── message.ts
│
├── api/                           # API 클라이언트
│
├── server/                        # Nuxt Server (API Routes)
│   └── api/
│
├── middleware/                    # Nuxt 미들웨어
│   ├── auth-guard.global.ts
│   └── admin-guard.global.ts
│
├── plugins/                       # Nuxt 플러그인
│
├── assets/                        # 정적 자산
│   └── scss/
│
├── public/                        # Public 파일
│
└── supabase/                      # Supabase 설정
    ├── functions/                 # Edge Functions
    └── migrations/                # DB 마이그레이션
```

---

## Nuxt 3 핵심 개념

### 파일 기반 라우팅

| 파일 경로 | URL |
|----------|-----|
| `pages/index.vue` | `/` |
| `pages/quiz/index.vue` | `/quiz` |
| `pages/quiz/[id].vue` | `/quiz/:id` |
| `pages/profile/stats.vue` | `/profile/stats` |

### 자동 Import

Nuxt 3는 다음을 자동으로 import합니다:
- Vue Composition API (`ref`, `computed`, `watch` 등)
- Nuxt Composables (`useRoute`, `useRouter`, `useFetch` 등)
- `components/` 폴더의 컴포넌트
- `composables/` 폴더의 composable

### 미들웨어

```
middleware/
├── auth-guard.global.ts      # 인증 필요 페이지 보호
└── admin-guard.global.ts     # 관리자 페이지 보호
```

---

## 디렉토리별 역할

| 디렉토리 | 역할 | 예시 |
|----------|------|------|
| `pages/` | 파일 기반 라우팅 페이지 | `index.vue`, `quiz/[id].vue` |
| `components/` | 재사용 가능한 UI 컴포넌트 | `QuizCard.vue`, `Leaderboard.vue` |
| `composables/` | 로직 재사용 훅 | `use-supabase.ts` |
| `store/` | Pinia 상태 관리 | `quiz.store.ts` |
| `models/` | TypeScript 타입 정의 | `IQuiz`, `IRankingEntry` |
| `helper/` | 순수 유틸리티 함수 | `formatDate`, `Filters` |
| `server/api/` | Nuxt Server API Routes | `/api/quiz` |
| `middleware/` | 라우트 미들웨어 | `auth-guard` |
| `plugins/` | Nuxt 플러그인 | 전역 설정 |

---

## 환경 설정

### 개발 서버

```bash
npm run dev
```

### 빌드

```bash
npm run build
npm run generate  # 정적 생성
```

### 환경 변수

- `.env` - 공통
- `nuxt.config.ts` - runtimeConfig로 환경 변수 접근

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
    runtimeConfig: {
        // 서버 전용
        supabaseServiceKey: '',
        // 클라이언트 공개
        public: {
            supabaseUrl: '',
            supabaseAnonKey: '',
        }
    }
});
```

---

## 주요 설정 파일

| 파일 | 역할 |
|------|------|
| `nuxt.config.ts` | Nuxt 빌드/런타임 설정 |
| `app.config.ts` | 앱 레벨 설정 |
| `tsconfig.json` | TypeScript 설정 |
| `eslint.config.mjs` | ESLint 규칙 |

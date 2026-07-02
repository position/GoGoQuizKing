# 🎯 GoGoQuizKing

실시간 퀴즈 애플리케이션 with Nuxt.js & Supabase

## ✨ 주요 기능

- 🔐 사용자 인증 (OAuth, Email)
- 📝 공지사항 게시판
- 🎮 실시간 퀴즈 시스템
- 🤖 **자동 퀴즈 생성** (매시간)
- 📊 퀴즈 결과 추적
- 👑 난이도별 퀴즈 (새싹 → 새순 → 나무 → 킹왕짱)

## 📚 문서

- [퀴즈 자동 생성 시스템](./docs/QUIZ_AUTOMATION.md)
- [환경 변수 설정](./docs/ENV_SETUP.md)

## 🛠️ 기술 스택

- **프레임워크**: Nuxt.js v3
- **언어**: TypeScript
- **UI**: Quasar Framework
- **상태 관리**: Pinia
- **백엔드**: Supabase (PostgreSQL, Edge Functions)
- **스타일링**: SCSS/Sass

## 📦 Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## 🤖 퀴즈 자동 생성

### 빠른 시작

1. **마이그레이션 실행**

```bash
# Supabase Dashboard에서 SQL 실행
# supabase/migrations/006_setup_quiz_automation.sql
```

2. **Edge Function 배포**

```bash
supabase functions deploy generate-daily-quiz
```

3. **환경 변수 설정**

- Supabase Dashboard > Edge Functions > Settings
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY` 추가

4. **pg_cron Extension 활성화**

- Supabase Dashboard > Database > Extensions
- `pg_cron` 활성화
- `pg_net` 활성화

### 사용 방법

- **자동**: 매시간 정각에 AI가 학년별 퀴즈 생성
- **수동**: `/admin/quiz-automation` 페이지에서 "지금 퀴즈 생성하기"
- **API**: `POST /api/quiz/generate`

자세한 내용은 [QUIZ_AUTOMATION.md](./docs/QUIZ_AUTOMATION.md)를 참고하세요.

## 📂 프로젝트 구조

```
GoGoQuizKing/
├── supabase/
│   ├── functions/
│   │   └── generate-daily-quiz/    # 퀴즈 자동 생성 Edge Function
│   └── migrations/                  # 데이터베이스 마이그레이션
├── pages/
│   ├── admin/
│   │   └── quiz-automation.vue     # 퀴즈 생성 관리 페이지
│   └── ...
├── server/
│   └── api/
│       └── quiz/                    # 퀴즈 관련 API
├── components/                      # Vue 컴포넌트
├── composables/                     # Vue Composables
├── store/                           # Pinia 스토어
└── docs/                            # 문서
```

## 🔒 환경 변수

`.env` 파일 생성:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key
```

## 📝 라이센스

MIT

---
applyTo: "**/*"
---

# Git 커밋 규칙 (Commit Guidelines)

## TL;DR

- [ ] 이 커밋만으로 빌드가 성공하는가?
- [ ] 이 커밋만으로 테스트가 통과하는가?
- [ ] 하나의 목적만 담고 있는가?
- [ ] 커밋 메시지가 "무엇을 왜" 설명하는가?
- [ ] Conventional Commits 형식을 따르는가?

---

## AI 커밋 메시지 생성 규칙

커밋 메시지 생성 요청 시 다음 규칙을 따릅니다:

### 분석 대상

- **Staged 파일만 분석**: `git add`된 파일만 커밋 메시지 생성 대상
- **Unstaged 파일 제외**: 아직 add되지 않은 변경 사항은 무시

### 확인 방법

```bash
# Staged 파일 확인
git diff --cached --name-only

# Staged 파일의 변경 내용 확인
git diff --cached
```

### 생성 프로세스

1. `git diff --cached`로 staged 변경 사항 확인
2. 변경된 파일과 내용 분석
3. 브랜치명에서 Prefix 추출 (`git branch --show-current`)
   - Jira Key (예: `PV-1234`) 우선
   - 없으면 브랜치 타입 (예: `hotfix`, `release`)
4. 커밋 메시지 형식에 맞게 생성

### 예시

```bash
# Unstaged 파일이 있는 경우
$ git status
Changes to be committed:
  modified:   src/components/UserCard.vue    # ← 분석 대상
  
Changes not staged for commit:
  modified:   src/services/userService.ts    # ← 제외

# AI는 UserCard.vue 변경 사항만 분석하여 커밋 메시지 생성
```

---

## 커밋 메시지 형식

```
<jira-key> :: [<type>] <subject>

<body>

<footer>
```

### 구조 설명

| 부분 | 필수 | 설명 |
|------|------|------|
| `jira-key` | ❌ | Jira 이슈 키 (브랜치명에서 추출, 없으면 생략) |
| `type` | ✅ | 변경 유형 (대괄호로 감싸기) |
| `subject` | ✅ | 변경 요약 (50자 이내) |
| `body` | ❌ | 상세 설명 (72자 줄바꿈) |
| `footer` | ❌ | 이슈 참조, Breaking Changes |

### Prefix 추출 규칙

브랜치명에서 Prefix를 추출하여 커밋 메시지 앞에 추가합니다.

**추출 우선순위:**
1. **Jira Key가 있는 경우** → Jira Key 사용 (예: `PV-1234`)
2. **Jira Key가 없는 경우** → 브랜치 타입 사용 (예: `hotfix`, `release`)
3. **둘 다 없는 경우** → Prefix 생략

```bash
# 브랜치명 예시
feature/PV-1234-Update-Player  → PV-1234 추출
bugfix/PV-5678-fix-login       → PV-5678 추출
PV-6451-Email-copy             → PV-6451 추출
hotfix/security-patch          → hotfix 추출
release/v1.2.0                 → release 추출
main                           → Prefix 없음 (생략)
```

### 커밋 메시지 예시

```bash
# Jira Key가 있는 경우
PV-1234 :: [Feat] User Profile 페이지 추가

# hotfix 브랜치 (Jira Key 없음)
hotfix :: [Fix] 보안 취약점 패치

# release 브랜치 (Jira Key 없음)
release :: [Chore] v1.2.0 Release 준비

# Prefix 없는 경우 (main, develop 등)
[Fix] Date Format Grid 컴포넌트 버그 수정
```

---

## Type 종류

| Type | 설명 | 커밋 예시 |
|------|------|-----------|
| `[Feat]` | 새로운 기능 추가 | `[Feat] Login Validation 추가` |
| `[Fix]` | 버그 수정 | `[Fix] Date Format 오류 수정` |
| `[Docs]` | 문서 수정 | `[Docs] README 업데이트` |
| `[Style]` | 코드 포맷팅 (기능 변경 없음) | `[Style] 들여쓰기 수정` |
| `[Refactor]` | 리팩토링 (기능 변경 없음) | `[Refactor] Helper 함수 분리` |
| `[Perf]` | 성능 개선 | `[Perf] List 렌더링 최적화` |
| `[Test]` | 테스트 추가/수정 | `[Test] Auth Unit Test 추가` |
| `[Chore]` | 빌드/설정 변경 | `[Chore] Dependencies 업데이트` |
| `[Revert]` | 이전 커밋 되돌리기 | `[Revert] [Feat] Login 추가` |

---

## Scope (선택)

프로젝트 내 영향 범위를 명시합니다.

### 모듈 레벨
- `staff` - Staff 앱
- `sysop` - Sysop 앱
- `shared` - 공유 모듈

### 기능 레벨
- `auth` - 인증/인가
- `player` - 플레이어 관리
- `tournament` - 토너먼트
- `report` - 리포트
- `grid` - 데이터 그리드

### 기술 레벨
- `api` - API 서비스
- `store` - Pinia 스토어
- `router` - 라우터
- `ui` - UI 컴포넌트

---

## Subject 작성 규칙

1. **한글 기반 + 고유명사 영문 유지**
   - 기능명, 컴포넌트명, 함수명, DTO, 변수명 등은 **영문 유지**
   - 설명/동작은 **한글**로 작성
   - ✅ "User Detail Info 수정 및 미사용 코드 정리"
   - ✅ "Wallet 잔액 조회 기능 추가"
   - ✅ "PlayerCard 컴포넌트 리팩토링"
   - ❌ "사용자 상세 정보 수정" (User → 사용자 번역 금지)
   - ❌ "지갑 잔액 조회" (Wallet → 지갑 번역 금지)

2. **영문 유지 대상**
   - 컴포넌트명: `UserCard`, `LoginForm`
   - 함수명: `fetchUserData`, `handleSubmit`
   - DTO/Model: `UserDto`, `IPlayerInfo`
   - API 엔드포인트: `/api/users`, `/wallet/balance`
   - 도메인 용어: `Player`, `Tournament`, `Wallet`

3. **마침표 없음**
   - ✅ "Player 목록 정렬 버그 수정"
   - ❌ "Player 목록 정렬 버그 수정."

4. **50자 이내**
   - 간결하게 핵심만 전달


---

## Body 작성 규칙

- **무엇을, 왜** 변경했는지 설명
- 72자마다 줄바꿈
- 빈 줄로 subject와 분리
- 구현 방법보다 변경 이유에 집중
- **고유명사는 영문 유지**, 설명은 한글

```
PV-234 :: [Feat] Password 강도 표시 기능 추가

- 비밀번호 입력 시 실시간 강도 표시
- zxcvbn 라이브러리로 강도 계산
- 약한 Password 입력 시 경고 메시지 표시

보안 정책 강화 요청에 따른 구현
```

---

## Footer 작성 규칙

### 이슈 참조

```
Closes #123
Fixes #456
Resolves #789
```

### Breaking Changes

```
BREAKING CHANGE: API 응답 구조 변경

기존:
{ success: true, data: {...} }

변경:
{ status: 'success', result: {...} }
```

---

## 예시

### 기능 추가

```
PV-123 :: [Feat] User Profile 페이지 추가

- Profile 정보 조회/수정 기능 추가
- Password 변경 Modal 구현
- Profile 이미지 업로드 기능
```

### 버그 수정

```
PV-456 :: [Fix] Date Column 정렬 버그 수정

날짜 컬럼 정렬 시 문자열로 비교되던 문제 수정
Date 객체로 변환 후 비교하도록 변경
```

### 리팩토링

```
PV-789 :: [Refactor] useTablePagination Composable 분리

DataGrid에서 반복되던 Pagination 로직을
재사용 가능한 Composable로 분리
```

### 성능 개선

```
PV-101 :: [Perf] Player 목록 렌더링 최적화

- v-for에 고유 key 사용으로 불필요한 리렌더 방지
- shallowRef로 대용량 데이터 반응성 최적화
- Virtual Scroll 적용으로 DOM 노드 수 감소

목록 렌더링 시간 60% 개선
```

### Breaking Change

```
PV-202 :: [Feat] API Response 구조 변경

API 응답 구조를 표준화하여 일관성 확보

BREAKING CHANGE: 모든 API 응답이 새로운 형식을 따름

기존: { success: boolean, data: T }
변경: { status: string, result: T, error?: string }

마이그레이션:
1. response.data → response.result
2. response.success → response.status === 'success'
```

### Jira Key 없는 경우

```
[Fix] Error Message 오타 수정

오타 수정 (recieve → receive)
```

---

## 원자적 커밋 (Atomic Commits)

### 원칙

1. **하나의 논리적 변경**만 포함
2. 커밋 단독으로 **빌드 성공**
3. 커밋 단독으로 **테스트 통과**
4. **되돌리기 용이**

### 좋은 예

```
PV-1234 :: [Feat] LoginForm Component 추가
PV-1234 :: [Feat] Login API Service 추가
PV-1234 :: [Feat] Login Store Action 추가
PV-1234 :: [Feat] LoginForm과 API 연동
```

### 나쁜 예

```
PV-1234 :: [Feat] Login 기능 전체 구현 (Form, API, Store, Test 포함)
```

---

## 커밋 전 체크리스트

```bash
# 1. 코드 포맷팅
npm run format

# 2. 린트 검사
npm run lint

# 3. 타입 체크
npm run type-check

# 4. 단위 테스트
npm run test:unit

# 5. 빌드 확인 (선택)
npm run build
```

---

## Git Hooks (권장)

### pre-commit

```bash
#!/bin/sh
npm run lint
npm run type-check
```

### commit-msg

```bash
#!/bin/sh
# Conventional Commits 형식 검증
npx commitlint --edit $1
```

---

## 브랜치 전략과 커밋

### 브랜치 네이밍

```
feature/JIRA-123-add-user-profile
bugfix/JIRA-456-fix-date-format
hotfix/JIRA-789-security-patch
refactor/improve-auth-flow
```

### Merge vs Rebase

- **feature → develop**: Squash merge 권장
- **develop → main**: Merge commit 사용
- **개인 브랜치 정리**: Interactive rebase 활용


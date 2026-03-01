# AI Instruction

이 프로젝트의 AI 협업 룰 및 지침입니다.

## TL;DR (작업 전 빠른 체크)

### TL;DR 작성 (`.instructions.md` 파일에만 적용)
- [ ] 본문의 체크리스트를 그대로 복사했는가?
- [ ] 요약/축약하지 않았는가?

### SSOT (Single Source of Truth)
- [ ] 이 정보가 다른 곳에 이미 있는가? → 있으면 링크
- [ ] 원본 위치가 명확한가?
- [ ] 모든 링크가 실제로 동작하는가?

### MECE (Mutually Exclusive, Collectively Exhaustive)
- [ ] 기존 분류와 겹치는가? → 겹치면 병합 또는 경계 명시
- [ ] 빠진 케이스가 있는가?

### SoC (Separation of Concerns)
- [ ] 이 모듈이 하나의 책임만 갖는가?
- [ ] 500줄 초과 시 분할 검토했는가?

### 원자적 커밋
- [ ] 이 커밋만으로 빌드가 성공하는가?
- [ ] 이 커밋만으로 테스트가 통과하는가?
- [ ] 하나의 목적만 담고 있는가?
- [ ] 커밋 메시지가 "무엇을 왜" 설명하는가?

### 점진적 진행
- [ ] 작업을 작은 단계로 분할했는가?
- [ ] 각 단계마다 검증했는가?
- [ ] 다음 단계 전에 현재 단계를 완료했는가?

### Success Criteria First
- [ ] 성공 기준을 먼저 작성했는가?
- [ ] 성공 기준이 측정 가능한가?
- [ ] 성공 기준을 문서에 기록했는가?

### 머메이드 차트
- [ ] 복잡한 관계/흐름을 텍스트로만 설명하고 있는가? → 머메이드 차트 사용
- [ ] 노드 라벨에 `1.`, `2.` 등 숫자를 사용하지 않았는가?

### 파괴적 작업 확인
- [ ] 파일 삭제 전 사용자에게 확인받았는가?
- [ ] 코드 블록 제거 전 사용자에게 확인받았는가?
- [ ] 영향 범위를 안내했는가?

### 작업 완료 후
- [ ] 변경 사항을 요약했는가?
- [ ] "커밋할까요?" 질문했는가?

---

## 핵심 원칙

→ [core-principles.instructions.md](instructions/core-principles.instructions.md)

---

## 구조

```
.github/
├── copilot-instructions.md    # 이 파일 (진입점)
├── instructions/              # 룰 (선언적 규칙)
│   ├── core-principles.instructions.md
│   ├── project-architecture.instructions.md
│   ├── basic-coding.instructions.md
│   ├── commit.instructions.md
│   └── code-reviewer.instructions.md
├── skills/                    # 스킬 (절차적 가이드)
│   ├── code-cleaner/          # 파일 내부 미사용 코드 정리
│   ├── code-generator/        # Nuxt 3 코드 생성 (컴포넌트, 페이지, Composable 등)
│   ├── code-refactorer/       # 코드 리팩토링 (구조/패턴/타입 개선)
│   ├── code-reorderer/        # 파일 내 코드 순서 재배치
│   ├── file-cleaner/          # 프로젝트 고립 파일 삭제
│   ├── rule-creator/          # 룰 파일 생성/수정
│   └── skill-creator/         # 스킬 파일 생성/수정
├── docs/                      # 문서 (분석 결과, 가이드 등)
│   └── PLANNING.md            # 프로젝트 기획서
└── prompts/                   # 프롬프트 (생성 템플릿)
    └── p-verify-output.prompt.md  # AI 출력물 품질 검증
```

### 문서 작성 규칙

- **위치**: 모든 문서는 `.github/docs/` 폴더에 `*.md` 파일로 작성
- **네이밍**: `UPPER_SNAKE_CASE.md` 또는 `kebab-case.md`
- **용도**: 분석 결과, 가이드, 회의록, 설계 문서 등

---

## Instructions 목록

### Core
- [core-principles.instructions.md](instructions/core-principles.instructions.md) - 핵심 원칙

### Project
- [project-architecture.instructions.md](instructions/project-architecture.instructions.md) - 프로젝트 구조 및 기술 스택

### Development
- [basic-coding.instructions.md](instructions/basic-coding.instructions.md) - Vue/TypeScript 코딩 표준 (컴포넌트, Composable, Store, API 패턴 포함)
- [commit.instructions.md](instructions/commit.instructions.md) - Git 커밋 규칙
- [code-reviewer.instructions.md](instructions/code-reviewer.instructions.md) - 코드 리뷰 규칙 (리뷰 모드, 체크리스트, 출력 형식)

---

## Skills 목록

| 스킬 | 용도 | 트리거 |
|------|------|--------|
| [code-cleaner](skills/code-cleaner/SKILL.md) | 파일 내부 미사용 코드 정리 (함수, 변수, import, console.log) | "console.log 정리", "미사용 import 제거", "안쓰는 함수 정리", "미사용 변수 제거", "코드 내부 정리" |
| [code-generator](skills/code-generator/SKILL.md) | Nuxt 3 코드 생성 (컴포넌트, 모달, 셀렉터, 페이지, Composable, Helper) | "컴포넌트 만들어줘", "페이지 생성", "Composable 생성", "헬퍼 함수 추가", "셀렉터 컴포넌트", "모달 만들어줘" |
| [code-refactorer](skills/code-refactorer/SKILL.md) | 코드 리팩토링 (구조 분리, 패턴 교정, 타입 강화, 헬퍼 활용) | "코드 리팩토링해줘", "컨벤션에 맞게 수정", "패턴 개선", "타입 안전성 강화", "컴포넌트 분리해줘", "로직 추출해줘" |
| [code-reorderer](skills/code-reorderer/SKILL.md) | 파일 내 코드 순서 재배치 (.vue, .ts, .js) | "코드 순서 정리", "import 정리", "attribute 순서 맞춰줘", "생명주기 함수 순서", "코드 재배치" |
| [file-cleaner](skills/file-cleaner/SKILL.md) | 프로젝트에서 고립된 파일 삭제 (전체 파일 단위) | "안쓰는 파일 정리", "사용 안하는 파일 찾아줘", "데드 코드 제거", "미사용 파일 찾기" |
| [rule-creator](skills/rule-creator/SKILL.md) | `.instructions.md` 룰 파일 생성/수정 | "룰 만들어줘", "룰 수정해줘", ".instructions.md 작성", "룰 파일 구조 질문" |
| [skill-creator](skills/skill-creator/SKILL.md) | `SKILL.md` 스킬 파일 생성/수정 | "스킬 만들어줘", "스킬 수정해줘", "SKILL.md 작성" |

---

## Prompts 목록

| 프롬프트 | 용도 | 실행 조건 |
|----------|------|-----------|
| [p-verify-output](prompts/p-verify-output.prompt.md) | AI 출력물(코드, 문서, 설계) 품질 검증 | 복잡한 로직 구현 후, 보안 코드 작성 후, PR 제출 전 |

---


## 금지 사항 (빠른 참조)

> 상세 규칙: [basic-coding.instructions.md](instructions/basic-coding.instructions.md#금지-사항)

| 항목 | 대안 |
|------|------|
| `any` 타입 | `unknown` + 타입 가드 |
| 인라인 스타일 | scoped CSS, Quasar 클래스 |
| 하드코딩 문자열 | 상수, i18n |
| console.log 커밋 | 커밋 전 제거 |
| props 직접 변경 | emit 사용 |
| POST/PUT 버튼 권한 미체크 | `canWrite` 체크 필수 |
| DELETE 버튼 권한 미체크 | `canDelete` 체크 필수 |
| `v-html` 미sanitize | `xssKeeper()` 적용 |
| 민감 정보 하드코딩 | `.env` 환경 변수 |

---

## AI 협업 워크플로우

### 1. 작업 시작 전
1. 관련 파일 컨텍스트 확인
2. 기존 패턴/컨벤션 파악
3. 성공 기준 정의

### 2. 코드 작성 시
1. 기존 컴포넌트/composable 재사용 우선
2. 타입 안전성 확보
3. 점진적 구현 (작은 단위로)

### 3. 작업 완료 후
1. 린트/타입 체크 통과 확인
2. 변경 사항 요약
3. 커밋 메시지 제안

### 4. 질문 시
- 모호한 요구사항은 구체화 요청
- 여러 접근 방식이 있으면 장단점과 함께 제시
- 기존 코드 스타일 우선 따름

---

## 참고 자료

- [Vue 3 공식 문서](https://vuejs.org/)
- [Pinia 공식 문서](https://pinia.vuejs.org/)
- [Quasar 공식 문서](https://quasar.dev/)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/handbook/)
- [AG Grid Vue 3](https://www.ag-grid.com/vue-data-grid/)

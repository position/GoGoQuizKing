---
name: skill-creator
description: |
  SKILL.md 파일 전용 생성/수정 가이드. 새 스킬을 만들거나 기존 스킬을 개선할 때 사용합니다.
  다음 상황에서 사용: (1) "스킬 만들어줘", (2) "스킬 수정해줘", (3) "SKILL.md 작성".
  ※ .instructions.md 룰 파일은 rule-creator 사용.
---

# Skill Creator

스킬 생성 및 수정 가이드.

## 핵심 원칙

### 1. 컨텍스트 절약

Claude는 이미 똑똑함. **모델이 모르는 것만 추가.**

- 모든 정보에 질문: "Claude가 정말 이 설명이 필요한가?"
- 장황한 설명보다 간결한 예시 선호

### 2. SSOT (Single Source of Truth)

**중복 금지. 기존 문서는 링크로 참조.**

```markdown
# ❌ Bad: 내용 복사
## 커밋 메시지 규칙
JIRA-KEY :: [Type] Subject 형식... (instructions에 이미 있는 내용 반복)

# ✅ Good: 링크 참조
## 커밋 메시지 규칙
→ [commit.instructions.md](../../instructions/commit.instructions.md)
```

### 3. 200줄 제한

SKILL.md는 **200줄 이내**. 초과 시 references/로 분리.

- 200줄이면 전체가 간결 → **TL;DR 불필요**
- 핵심 워크플로우만 SKILL.md에
- 상세 가이드, 템플릿, 예시는 references/로

### 4. 자유도 설정

작업 특성에 맞게 지침의 구체성 조절:

| 자유도 | 사용 시점 | 형태 |
|--------|----------|------|
| 높음 | 여러 접근법 가능 | 텍스트 지침 |
| 중간 | 선호 패턴 존재, 일부 변형 허용 | 의사코드/파라미터화된 스크립트 |
| 낮음 | 정확한 순서 필수, 오류 위험 | 구체적 스크립트 |

## 스킬 구조

```
skill-name/
├── SKILL.md (필수, 200줄 이내)
│   ├── YAML frontmatter (name, description 필수)
│   └── Markdown 본문
└── Bundled Resources (선택)
    ├── scripts/      # 실행 코드
    ├── references/   # 상세 문서 (필요시 로드)
    └── assets/       # 출력에 사용되는 파일 (템플릿)
```

### Frontmatter (필수)

```yaml
---
name: my-skill          # 소문자, 숫자, 하이픈만 (64자 이내)
description: |          # 1024자 이내. 트리거 조건 포함 필수!
  무엇을 하는지 + 언제 사용하는지.
  Use when (1) 조건A, (2) 조건B, (3) 조건C.
---
```

### Bundled Resources

| 폴더 | 용도 | 예시 |
|------|------|------|
| `scripts/` | 반복 코드, 결정적 실행 | `generate_component.ts` |
| `references/` | 필요시 로드되는 문서 | `patterns.md` |
| `assets/` | 출력에 사용되는 파일 | `template.vue` |

### 금지 파일

- README.md, CHANGELOG.md 등 보조 문서 생성 금지
- 스킬은 AI 에이전트용. 사용자용 문서 불필요.

## 생성 프로세스

```mermaid
flowchart LR
    A[이해] --> B[계획]
    B --> C[초기화]
    C --> D[편집]
    D --> E[검증]
```

### Step 1: 이해

구체적 사용 예시 수집. 사용자에게 질문:

- "이 스킬이 어떤 기능을 지원해야 하나요?"
- "어떤 상황에서 이 스킬이 트리거되나요?"

### Step 2: 계획

각 예시 분석 → 재사용 가능한 리소스 식별:

- 반복되는 코드 → `scripts/`
- 참조 문서 → `references/`
- 출력 템플릿 → `assets/`

### Step 3: 초기화

`.github/skills/<skill-name>/SKILL.md` 생성

### Step 4: 편집

1. **references/ 먼저**: 상세 내용 분리
2. **SKILL.md 작성**: 핵심만, 200줄 이내

**작성 시 체크**:
- [ ] 기존 instructions/ 내용과 중복 없는가? → 링크로 대체
- [ ] 200줄 이내인가?
- [ ] TL;DR 섹션이 없는가? (200줄이면 불필요)

### Step 5: 검증

- 실제 사용 → 문제 발견 → 개선

## Progressive Disclosure

SKILL.md가 200줄을 초과하면 분리:

| SKILL.md에 유지 | references/로 분리 |
|----------------|-------------------|
| 핵심 워크플로우 | 상세 템플릿 |
| 트리거 조건 | 긴 예시 |
| 폴더 구조 | 옵션별 가이드 |

## 상세 가이드

- **Frontmatter 필드**: [references/frontmatter-fields.md](references/frontmatter-fields.md)
- **워크플로우 패턴**: [references/workflows.md](references/workflows.md)
- **출력 패턴**: [references/output-patterns.md](references/output-patterns.md)

## 현재 프로젝트 스킬 목록

```
.github/skills/
├── code-cleaner/      # 파일 내부 미사용 코드 정리 (함수, 변수, import, console.log)
├── code-generator/    # Vue 코드 생성 (컴포넌트, 페이지, Composable, Helper, 라우터)
├── code-refactorer/   # 코드 리팩토링 (구조/패턴/타입 개선)
├── code-reorderer/    # 파일 내 코드 순서 재배치 (.vue, .ts, .js)
├── file-cleaner/      # 프로젝트에서 고립된 파일 삭제 (전체 파일 단위)
├── rule-creator/      # 룰 파일 생성/수정 (.instructions.md)
├── skill-creator/     # 스킬 파일 생성/수정 (SKILL.md, 이 파일)
└── swagger-sync/      # Swagger JSON 기반 DTO/API 서비스 동기화
```

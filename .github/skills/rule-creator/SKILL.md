---
name: rule-creator
description: |
  .instructions.md 룰 파일 전용 생성/수정 가이드.
  다음 상황에서 사용: (1) "룰 파일 만들어줘", (2) "룰 수정해줘", (3) ".instructions.md 작성", (4) "룰 파일 구조/형식 질문".
  ※ SKILL.md 스킬 파일은 skill-creator 사용.
---

# Rule Creator

`.instructions.md` 룰 파일 생성 및 수정 스킬.

## 핵심 원칙

1. **선언적**: "어떻게" 보다 "무엇을" 중심. "~해야 한다" 형태.
2. **적용 범위**: 구체적 파일/언어 패턴 명시 (예: `**/*.vue`, `**/*.ts`).
3. **검증 가능**: 준수 여부를 객관적으로 판단 가능한 기준.
4. **SSOT**: 중복 정의 금지. 하나의 룰을 참조.
5. **예외 명시**: "항상", "절대" 금지. 예외 상황 명시.

## 룰 vs 스킬

| 특성 | 룰 (Instructions) | 스킬 (Skill) |
|------|-------------------|-------------|
| 적용 | 자동/상시 | 트리거 시 |
| 성격 | 선언적 (what) | 절차적 (how) |
| 예시 | 코딩 표준, 네이밍 | 컴포넌트 생성, 커밋 메시지 생성 |

## 파일 구조

**위치**: `.github/instructions/<이름>.instructions.md`

```markdown
---
applyTo: "**/*.vue"
---
# [룰 제목]

## TL;DR (핵심 5가지)

**반드시 지켜야 할 원칙**:

1. **[원칙1]**: [설명]
2. **[원칙2]**: [설명]
...

## MUST (필수)

- [규칙]

## MUST NOT (금지)

- [금지 사항]

## SHOULD (권장)

- [권장 사항]
```

## applyTo 패턴 (Nuxt 3 프로젝트)

| 패턴 | 설명 |
|------|------|
| `**/*` | 모든 파일 |
| `**/*.vue` | 모든 Vue 파일 |
| `**/*.ts` | 모든 TypeScript 파일 |
| `pages/**/*` | 페이지 파일 |
| `components/**/*` | 컴포넌트 파일 |
| `composables/**/*` | Composables |
| `store/**/*` | Pinia stores |
| `server/**/*` | Nuxt Server API |

## 생성 프로세스

```mermaid
flowchart LR
    A[요구사항 파악] --> B[기존 룰 확인]
    B --> C[파일 생성]
    C --> D[copilot-instructions.md 업데이트]
```

### Step 1: 요구사항 파악

- 어떤 규칙이 필요한가?
- 적용 범위는? (특정 파일/폴더/언어)
- 기존 룰과 중복되는가?

### Step 2: 기존 룰 확인

`.github/instructions/` 내 기존 파일 확인:
- 중복 시 → 기존 룰 수정
- 신규 시 → 새 파일 생성

### Step 3: 파일 생성

1. `.github/instructions/<이름>.instructions.md` 생성
2. frontmatter에 `applyTo` 패턴 설정
3. TL;DR 섹션 포함 (핵심 5가지)
4. MUST / MUST NOT / SHOULD 구조 권장

### Step 4: copilot-instructions.md 업데이트

```markdown
## Instructions 목록

### Development
- [basic-coding.instructions.md](instructions/basic-coding.instructions.md)
- [새로운-룰.instructions.md](instructions/새로운-룰.instructions.md)  ← 추가
```

## 체크리스트

### 생성 시
- [ ] `.github/instructions/`에 파일 생성
- [ ] applyTo 패턴 설정
- [ ] TL;DR 포함 (핵심 5가지)
- [ ] `copilot-instructions.md` 목록 업데이트

### 수정 시
- [ ] 해당 룰을 참조하는 다른 룰 확인
- [ ] SSOT 원칙 준수 (중복 제거)

### 삭제 시
- [ ] `copilot-instructions.md`에서 제거
- [ ] 참조하는 다른 룰에서 링크 제거

## 현재 프로젝트 룰 목록

→ [copilot-instructions.md](../../copilot-instructions.md) 참조

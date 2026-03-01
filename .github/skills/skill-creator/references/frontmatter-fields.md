# Frontmatter 필드 가이드

SKILL.md의 YAML frontmatter에서 사용할 수 있는 필드입니다.

## 필수 필드

### name
스킬의 고유 식별자.

```yaml
name: my-skill-name
```

**규칙**:
- 소문자, 숫자, 하이픈만 사용
- 64자 이내
- 폴더명과 일치 권장

### description
스킬의 목적과 트리거 조건.

```yaml
description: |
  무엇을 하는 스킬인지 설명.
  다음 상황에서 사용: (1) 조건A, (2) 조건B, (3) 조건C.
```

**규칙**:
- 1024자 이내
- **트리거 조건 필수 포함**
- 멀티라인은 `|` 사용

## 선택 필드

### allowed-tools
스킬이 사용할 수 있는 도구 제한.

```yaml
allowed-tools:
  - read_file
  - insert_edit_into_file
  - run_in_terminal
```

### context
스킬 실행 시 자동으로 로드할 파일.

```yaml
context:
  - path: references/patterns.md
    required: true
  - path: assets/template.vue
    required: false
```

### user-invocable
사용자가 직접 호출 가능 여부 (기본값: true).

```yaml
user-invocable: true
```

## Vue 프로젝트 예시

```yaml
---
name: vue-component
description: |
  Vue 3 컴포넌트 생성 스킬.
  다음 상황에서 사용: (1) "컴포넌트 만들어줘", (2) "Vue 파일 생성", (3) "새 화면 추가".
allowed-tools:
  - read_file
  - create_file
  - insert_edit_into_file
context:
  - path: ../../instructions/basic-coding.instructions.md
    required: true
---
```

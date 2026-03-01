# 워크플로우 패턴

스킬에서 자주 사용되는 워크플로우 패턴입니다.

## 1. 생성 워크플로우 (Creation)

새로운 파일/리소스를 생성하는 패턴.

```mermaid
flowchart LR
    A[입력 수집] --> B[유효성 검증]
    B --> C[템플릿 적용]
    C --> D[파일 생성]
    D --> E[후처리]
```

### 예시: Vue 컴포넌트 생성

1. **입력 수집**: 컴포넌트명, 위치, props 등
2. **유효성 검증**: 이름 규칙 확인, 중복 파일 체크
3. **템플릿 적용**: 기본 구조 생성
4. **파일 생성**: `.vue` 파일 작성
5. **후처리**: index.ts export 추가 (필요시)

## 2. 수정 워크플로우 (Modification)

기존 파일을 수정하는 패턴.

```mermaid
flowchart LR
    A[파일 읽기] --> B[변경점 분석]
    B --> C[수정 적용]
    C --> D[검증]
```

### 예시: Pinia Store 액션 추가

1. **파일 읽기**: 기존 store 파일 로드
2. **변경점 분석**: 새 액션이 들어갈 위치 파악
3. **수정 적용**: actions 섹션에 추가
4. **검증**: 타입 체크 통과 확인

## 3. 분석 워크플로우 (Analysis)

코드를 분석하고 정보를 추출하는 패턴.

```mermaid
flowchart LR
    A[대상 수집] --> B[파싱]
    B --> C[분석]
    C --> D[결과 출력]
```

### 예시: 컴포넌트 의존성 분석

1. **대상 수집**: 분석할 컴포넌트 파일들
2. **파싱**: import 문 추출
3. **분석**: 의존성 그래프 생성
4. **결과 출력**: 머메이드 차트 또는 테이블

## 4. 검증 워크플로우 (Validation)

코드가 규칙을 준수하는지 검증하는 패턴.

```mermaid
flowchart LR
    A[규칙 로드] --> B[대상 수집]
    B --> C[규칙 적용]
    C --> D[결과 리포트]
```

### 예시: 커밋 메시지 검증

1. **규칙 로드**: commit.instructions.md 참조
2. **대상 수집**: 커밋 메시지 텍스트
3. **규칙 적용**: 형식, Jira Key 등 체크
4. **결과 리포트**: 통과/실패 및 수정 제안

## 5. 변환 워크플로우 (Transformation)

한 형태를 다른 형태로 변환하는 패턴.

```mermaid
flowchart LR
    A[입력] --> B[파싱]
    B --> C[변환]
    C --> D[출력]
```

### 예시: Options API → Composition API

1. **입력**: Options API 컴포넌트
2. **파싱**: data, methods, computed 추출
3. **변환**: ref, function, computed로 변환
4. **출력**: `<script setup>` 형태

## 패턴 선택 가이드

| 작업 유형 | 패턴 | 예시 스킬 |
|----------|------|----------|
| 새 파일 생성 | Creation | vue-component, composable |
| 기존 파일 편집 | Modification | add-store-action |
| 코드 이해 | Analysis | dependency-graph |
| 규칙 준수 확인 | Validation | commit-message |
| 형태 변경 | Transformation | options-to-composition |

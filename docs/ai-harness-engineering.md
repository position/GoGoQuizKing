# AI Harness Engineering Guide

## 1. Overview

AI Harness Engineering은 AI 모델을 실제 서비스에서 안정적으로 활용하기 위해 설계, 제어, 테스트, 운영하는 전반적인 엔지니어링 영역이다.

**GoGoQuizKing에서는 퀴즈 자동 생성 기능에 AI Harness Engineering을 적용하였다.**

---

## 2. Core Components

### 2.1 Prompt Engineering

* 역할(Role) 정의
* 입력/출력 포맷 설계
* 시스템 메시지 설계
* Few-shot / Zero-shot 전략

### 2.2 Flow Orchestration

* 사용자 입력 → 처리 → AI 호출 → 후처리
* 멀티 스텝 파이프라인 구성
* 상태 관리 (state management)

### 2.3 Input / Output Validation

* 입력값 필터링
* 출력 포맷 검증 (JSON schema 등)
* 비정상 응답 감지

### 2.4 Guardrails (안전장치)

* 금지어 필터링
* 정책 기반 응답 제어
* 위험한 요청 차단

### 2.5 Evaluation & Testing

* 테스트 케이스 정의
* 자동 평가 시스템 구축
* 정답 기반 비교 (ground truth)
* 회귀 테스트 (regression test)

### 2.6 Logging & Monitoring

* 요청/응답 로그 저장
* 실패 케이스 수집
* 사용자 행동 분석

### 2.7 Feedback Loop

* 사용자 피드백 수집
* 오류 데이터 재학습 활용
* 프롬프트 개선

### 2.8 Model Routing

* 상황에 따른 모델 선택
* 비용 vs 성능 최적화

### 2.9 Caching

* 동일 요청 결과 캐싱
* 비용 절감 및 속도 개선

### 2.10 Tool / API Integration

* 외부 API 연결
* DB 연동
* Function calling

---

## 3. Architecture Pattern

```
[User Input]
     ↓
[Pre-processing]
     ↓
[Guardrails]
     ↓
[Prompt Builder]
     ↓
[AI Model]
     ↓
[Output Validation]
     ↓
[Post-processing]
     ↓
[Response]
```

---

## 4. Best Practices

* 출력은 항상 구조화(JSON) 시도
* 실패 케이스를 중심으로 개선
* 프롬프트는 버전 관리
* 로그 기반 개선 루프 구축
* 테스트 자동화 필수

---

## 5. Common Tools

* OpenAI API
* LangChain
* LlamaIndex
* Supabase / Firebase
* Vector DB (Pinecone, Weaviate)

---

## 6. Use Cases

### 6.1 Quiz Generation

* 문제 자동 생성
* 난이도 조절
* 중복 문제 필터링

### 6.2 Customer Support Bot

* FAQ 자동 응답
* 상담 분류

### 6.3 Content Generation

* 블로그 작성
* 요약

### 6.4 Data Extraction

* 문서 → 구조화 데이터 변환

---

## 7. Key Metrics

* 정확도 (Accuracy)
* 실패율 (Failure Rate)
* 응답 시간 (Latency)
* 비용 (Cost per request)
* 사용자 만족도

---

## 8. Summary

AI Harness Engineering은 단순히 AI를 호출하는 것을 넘어,
AI를 안정적이고 예측 가능하게 서비스에 통합하는 핵심 기술이다.

"AI를 잘 쓰는 것"이 아니라
"AI를 제대로 통제하는 것"이 핵심이다.

---

## 9. GoGoQuizKing 적용 가이드

### 9.1 구조

```
server/ai-harness/
├── index.ts                    # 메인 엔트리포인트
├── types.ts                    # 타입 정의
├── core/
│   ├── prompt-builder.ts       # 프롬프트 빌더 & 버전 관리
│   ├── output-validator.ts     # 출력 검증 & JSON 파싱
│   ├── guardrails.ts           # 입력 필터링 & 안전장치
│   └── ai-logger.ts            # 로깅 & 모니터링
└── quiz/
    ├── quiz-generator.ts       # 퀴즈 생성 통합 파이프라인
    ├── quiz-prompts.ts         # 퀴즈 전용 프롬프트 템플릿
    └── quiz-validator.ts       # 퀴즈 품질 평가
```

### 9.2 핵심 모듈 설명

| 모듈 | 역할 | 파일 |
|------|------|------|
| **Prompt Builder** | 프롬프트 템플릿 관리, 버전 관리, 변수 치환 | `core/prompt-builder.ts` |
| **Guardrails** | 금지어 필터, 프롬프트 인젝션 방지, 입력 정제 | `core/guardrails.ts` |
| **Output Validator** | JSON 파싱, 스키마 검증, 데이터 정규화 | `core/output-validator.ts` |
| **AI Logger** | 요청/응답 로깅, 통계, 실패 추적 | `core/ai-logger.ts` |
| **Quiz Generator** | 통합 파이프라인 (모든 컴포넌트 조합) | `quiz/quiz-generator.ts` |
| **Quiz Validator** | 퀴즈 품질 평가 (점수, 이슈, 제안) | `quiz/quiz-validator.ts` |

### 9.3 사용법

```typescript
import { QuizGenerator } from '~/server/ai-harness/quiz/quiz-generator';

// 퀴즈 생성기 인스턴스 생성
const generator = new QuizGenerator({
    apiKey: 'your-gemini-api-key',
    model: 'gemini-2.5-flash',
    promptVersion: '1.1',
    enableQualityCheck: true,
    maxRetries: 2,
});

// 퀴즈 생성 요청
const result = await generator.generate({
    topic: '공룡',
    category: 'science',
    difficulty: 'seedling',
    gradeLevel: 2,
    questionCount: 5,
    questionTypes: ['multiple', 'ox'],
});

if (result.success) {
    console.log('퀴즈:', result.quiz);
    console.log('품질 점수:', result.quality?.score);
} else {
    console.error('에러:', result.error);
}
```

### 9.4 Guardrails 상세

**초등학생 대상 서비스**이므로 다음이 차단됨:

- 욕설/비속어
- 폭력적 표현
- 성인 콘텐츠
- 약물/도박 관련
- 프롬프트 인젝션 시도

```typescript
import { runQuizTopicGuardrails } from '~/server/ai-harness/core/guardrails';

const result = runQuizTopicGuardrails('나쁜단어가포함된주제');

if (!result.passed) {
    // 위반 항목 확인
    console.log(result.violations);
}
```

### 9.5 프롬프트 버전 관리

```typescript
import { registerPrompt, getPromptVersions } from '~/server/ai-harness/core/prompt-builder';

// 새 버전 등록
registerPrompt(
    'quiz-generate',
    '1.2',
    '새로운 템플릿 내용...',
    '힌트 품질 개선 버전'
);

// 버전 목록 조회
const versions = getPromptVersions('quiz-generate');
// [{ version: '1.0', isActive: false, ... }, { version: '1.1', isActive: false, ... }, { version: '1.2', isActive: true, ... }]
```

### 9.6 품질 평가 메트릭

| 메트릭 | 설명 | 가중치 |
|--------|------|--------|
| formatCorrectness | 형식 정확도 (JSON, 필수 필드) | 25% |
| contentRelevance | 주제 관련성 | 25% |
| difficultyMatch | 학년/난이도 적합성 | 20% |
| grammarScore | 문법/맞춤법 | 15% |
| uniqueness | 문제 고유성 (중복 검사) | 15% |

**최소 통과 기준**: 60점 이상 + 심각한 이슈 없음

### 9.7 API 엔드포인트

| 버전 | 엔드포인트 | 설명 |
|------|-----------|------|
| v1 (레거시) | `POST /api/quiz/ai-generate` | 기존 API (하드코딩 프롬프트) |
| v2 (AI Harness) | `POST /api/quiz/ai-generate-v2` | AI Harness 적용 버전 |

### 9.8 향후 개선 계획

- [ ] Redis 기반 응답 캐싱
- [ ] 다중 모델 라우팅 (Gemini/GPT-4 선택)
- [ ] 사용자 피드백 기반 품질 개선 루프
- [ ] A/B 테스트 프레임워크
- [ ] 비용 모니터링 대시보드


# Helper 함수 생성 및 활용 가이드

## ⚠️ 기존 헬퍼 확인 필수

새 코드를 생성할 때 **먼저 기존 헬퍼에 필요한 함수가 있는지 확인**할 것.
중복 구현 금지. 이미 있는 기능은 import하여 사용.

---

## 기존 헬퍼 맵 (GoGoQuizKing)

| 파일 | import 경로 | 주요 함수/객체 | 용도 |
|------|-------------|---------------|------|
| `common.ts` | `@/helper/common` | `delay`, 공통 유틸리티 | 딜레이, 공통 함수 |
| `filters.ts` | `@/helper/filters` | `Filters.currency`, `Filters.numberFormat` | 통화 포맷, 숫자 포맷 |
| `float.ts` | `@/helper/float` | `floorTo`, `ceilTo`, `calc` | 부동소수점 정밀 계산 |
| `list.ts` | `@/helper/list` | `enumToArray` | enum → 배열 변환 |
| `message.ts` | `@/helper/message` | `ToastMessage`, `ConfirmMessage`, `AlertMessage` | 알림, 확인 다이얼로그 |
| `utc-date.ts` | `@/helper/utc-date` | `getDisplayTime`, `formatDate` | UTC 날짜/시간 변환 |

---

## 위치

```
helper/{name}.ts
```

예시:
- `helper/formatDate.ts`
- `helper/validation.ts`

## 기본 템플릿

```typescript
/**
 * 날짜를 포맷팅합니다.
 * @param date - 포맷할 날짜
 * @param format - 포맷 문자열
 * @returns 포맷된 날짜 문자열
 */
export function formatDate(date: Date | string, format: string = 'YYYY-MM-DD'): string {
    // 구현
    return '';
}
```

## 헬퍼 작성 원칙

1. **순수 함수**: 부작용 없이 입력에 따른 출력만 반환
2. **단일 책임**: 하나의 함수는 하나의 역할만
3. **JSDoc 필수**: 함수 설명, 파라미터, 반환값 문서화
4. **타입 명시**: 모든 파라미터와 반환값에 타입 명시

## 활용 예시

```typescript
// 컴포넌트에서 사용
import { formatDate } from '@/helper/utc-date';
import { ToastMessage } from '@/helper/message';
import { Filters } from '@/helper/filters';

// 날짜 포맷
const displayDate = formatDate(item.createdAt);

// 토스트 메시지
ToastMessage.success('저장되었습니다');

// 숫자 포맷
const formattedPoints = Filters.numberFormat(1000); // "1,000"
```

## 새 헬퍼 추가 시

1. `helper/` 폴더에 파일 생성
2. 함수 구현 및 export
3. **이 문서의 "기존 헬퍼 맵" 테이블에 추가**
4. 필요시 `helper/index.ts`에 re-export 추가

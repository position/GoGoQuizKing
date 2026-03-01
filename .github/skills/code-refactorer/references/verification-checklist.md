# 검증 체크리스트

리팩토링 적용 후 확인해야 할 항목.

## 1. 빌드 검증

```bash
# 타입 체크
npm run type-check

# 린트
npm run lint

# 빌드 (선택)
npm run build
```

**기준**: 리팩토링 전과 동일한 수준의 에러/경고. 새로운 에러 0건.

## 2. 기능 검증

| 체크 항목 | 확인 방법 |
|-----------|----------|
| 기존 동작 유지 | 동일 입/출력 결과 |
| Props 전달 | 부모 → 자식 데이터 흐름 |
| Emits 동작 | 자식 → 부모 이벤트 |
| 라우팅 | 페이지 이동, 파라미터 전달 |
| API 연동 | 요청/응답 정상 처리 |

## 3. 코딩 표준 검증

→ [basic-coding.instructions.md](../../../instructions/basic-coding.instructions.md)

| 체크 항목 | 기준 |
|-----------|------|
| `any` 타입 | 0건 |
| 인라인 스타일 | 0건 (Quasar 클래스 또는 scoped CSS) |
| console.log | 0건 (디버그용 제거) |
| 하드코딩 문자열 | 상수 또는 i18n 사용 |
| Props 직접 변경 | 0건 (emit 또는 defineModel 사용) |
| 함수 길이 | 20줄 이내 |
| 파일 길이 | 500줄 이내 |

## 4. 보안 검증 (필수)

→ 보안 관련 항목은 **필수** 통과해야 함

| 체크 항목 | 기준 |
|-----------|------|
| POST/PUT 버튼 권한 | `canWrite` 체크 필수 |
| DELETE 버튼 권한 | `canDelete` 체크 필수 |
| `v-html` 사용 | `xssKeeper()` 또는 `xssKeeperEscape()` 적용 필수 |
| 민감 정보 하드코딩 | 0건 (API Key, Secret, Password 등) |
| 환경 변수 | URL, Key 등 `.env` 사용 |

**권한 체크 패턴 확인**:

```vue
<!-- 생성/수정 (POST/PUT) -->
<q-btn v-if="canWrite" @click="save">Save</q-btn>

<!-- 삭제 (DELETE) -->
<q-btn v-if="canDelete" @click="remove">Delete</q-btn>
```

**XSS 방지 패턴 확인**:

```vue
<!-- import 확인 -->
import { xssKeeper } from '@/helper/common';

<!-- 사용 확인 -->
<div v-html="xssKeeper(userContent)"></div>
```

## 6. 네이밍 검증

→ [basic-coding.instructions.md](../../../instructions/basic-coding.instructions.md#네이밍-규칙)

| 대상 | 규칙 | 확인 |
|------|------|------|
| 컴포넌트 파일 | PascalCase | `UserCard.vue` ✅ |
| Composable 파일 | `use-` 접두사, kebab-case | `use-auth.ts` ✅ |
| 변수/함수 | camelCase | `getUserData` ✅ |
| 인터페이스 | `I` 접두사, PascalCase | `IUserData` ✅ |
| 상수 | UPPER_SNAKE_CASE | `MAX_RETRY` ✅ |

## 7. 구조 검증

| 체크 항목 | 기준 |
|-----------|------|
| Script 내부 순서 | imports → props/emits → router/store → composables → state → computed → watch → methods → lifecycle |
| Import 그룹 순서 | Vue core → ecosystem → external → types → internal |
| Template attribute 순서 | directives → events → dynamic bindings → static → boolean → Quasar modifiers |

→ 상세: [code-reorderer SKILL.md](../../code-reorderer/SKILL.md)

## 8. 영향 범위 검증

리팩토링 후 관련 파일들이 정상 동작하는지 확인:

```bash
# 변경 파일에서 export된 것을 import하는 파일 검색
grep_search(query="from '변경파일경로'", includePattern="**/*.{ts,vue}")

# 변경된 컴포넌트를 사용하는 파일 검색
grep_search(query="<ComponentName", includePattern="**/*.vue")
```

## 9. 최종 체크리스트

```markdown
## 리팩토링 완료 체크

- [ ] `npm run type-check` 통과
- [ ] `npm run lint` 통과
- [ ] 기존 동작 유지 확인
- [ ] 새로운 에러/경고 없음
- [ ] 네이밍 규칙 준수
- [ ] 코드 순서 규칙 준수
- [ ] 영향받는 파일 확인 완료
- [ ] **보안: 권한 체크 적용** (canWrite/canDelete)
- [ ] **보안: v-html XSS 방지** (xssKeeper 적용)
- [ ] **보안: 민감 정보 노출 없음**
```

## 10. 변경 요약 형식

리팩토링 완료 후 다음 형식으로 요약:

```markdown
## 리팩토링 완료

**대상**: `src/components/player/PlayerCard.vue`

### 변경 사항

| # | 항목 | Before | After |
|---|------|--------|-------|
| 1 | API 로직 | 컴포넌트 내 인라인 | `use-player-data.ts` Composable |
| 2 | `any` 타입 3건 | `any` | `IPlayer`, `unknown` |
| 3 | Props 직접 변경 | `props.value = x` | `emit('update:value', x)` |

### 새로 생성된 파일

- `src/composables/use-player-data.ts`

### 검증 결과

- ✅ `npm run type-check` 통과
- ✅ `npm run lint` 통과
- ✅ 영향받는 파일 2건 확인 완료

커밋할까요?
```


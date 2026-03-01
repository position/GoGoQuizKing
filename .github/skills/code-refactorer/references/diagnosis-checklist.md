# 진단 체크리스트

리팩토링 대상 파일을 분석할 때 사용하는 체크리스트.

## 1. 구조 진단

### 파일 크기

```bash
# 파일 줄 수 확인
wc -l target-file.vue
```

| 줄 수 | 판정 | 액션 |
|-------|------|------|
| ~200줄 | 양호 | - |
| 200~500줄 | 주의 | 로직 추출 검토 |
| 500줄+ | 분할 필수 | 컴포넌트/Composable 분리 |

### 책임 분석

파일이 가진 책임을 나열한다:

```markdown
## 책임 분석: PlayerDetail.vue

1. ✅ 플레이어 정보 표시 (UI)
2. ⚠️ API 호출 (→ Composable로 분리 가능)
3. ⚠️ 데이터 변환 로직 (→ Helper로 분리 가능)
4. ⚠️ 폼 유효성 검증 (→ Composable로 분리 가능)
```

책임이 3개 이상이면 분리 검토.

### 재사용성 분석

```markdown
## 재사용 가능 로직

| 로직 | 현재 위치 | 다른 곳 사용 여부 | 추천 |
|------|----------|------------------|------|
| 날짜 포맷 | 인라인 | 여러 파일 | Helper 분리 |
| API 호출 패턴 | 컴포넌트 내 | 2+ 컴포넌트 | Composable 분리 |
| 유효성 검증 | 컴포넌트 내 | 이 파일만 | 유지 |
```

## 2. 패턴 진단

### Vue 패턴

| 체크 항목 | 확인 방법 | 문제 시 |
|-----------|----------|--------|
| `<script setup>` 사용 | `<script>` vs `<script setup>` | Composition API로 전환 |
| Props 타입 정의 | `defineProps<{...}>()` 여부 | TypeScript 제네릭 적용 |
| Emits 타입 정의 | `defineEmits<{...}>()` 여부 | TypeScript 제네릭 적용 |
| v-model 패턴 | `defineModel()` 여부 | defineModel로 전환 |
| Props 직접 변경 | `props.xxx = yyy` 패턴 | emit 패턴으로 수정 |
| **DialogWithButton 사용** | 버튼+모달 패턴 확인 | `DialogWithButton`으로 전환 |

### ⚠️ DialogWithButton 미사용 패턴 탐지

버튼 클릭으로 Dialog/Modal을 여는 경우 **반드시 `DialogWithButton` 컴포넌트를 사용**해야 한다.

**문제 패턴 (비권장)**:
```vue
<!-- ❌ 비권장: ref 상태 + q-btn + Dialog 분리 패턴 -->
<q-btn @click="isShowModal = true" label="Open" />
<MyDialog v-model:is-show-modal="isShowModal" />

<script setup>
const isShowModal = ref(false);  // 불필요한 상태 관리
</script>
```

**올바른 패턴**:
```vue
<!-- ✅ 권장: DialogWithButton 사용 -->
<DialogWithButton label="Open" color="primary" unelevated no-caps>
    <template #dialog="{ model }">
        <MyDialog
            v-if="model.visible"
            v-model:is-show-modal="model.visible"
        />
    </template>
</DialogWithButton>
```

**탐지 방법**:
```bash
# 버튼 클릭으로 모달 상태 변경하는 패턴 탐지
grep_search(query="@click.*=.*true", includePattern="**/*.vue")

# isShowModal, isShow, showModal 등 모달 상태 변수 패턴
grep_search(query="isShowModal\\|isShow\\|showModal", isRegexp=true, includePattern="대상파일.vue")

# DialogWithButton 사용 여부 확인
grep_search(query="DialogWithButton", includePattern="대상파일.vue")
```

**예외 케이스** (DialogWithButton 불필요):
- 프로그래밍 방식 호출 (`$q.dialog()`)
- 조건부 모달 (여러 조건에 따라 다른 모달 표시)
- 외부 이벤트에 의한 모달 열기 (WebSocket 메시지 등)

### 탐지 정규식

```bash
# Options API 사용 여부
grep_search(query="export default {", includePattern="**/*.vue")

# any 타입 사용
grep_search(query=": any", includePattern="**/*.{ts,vue}")
grep_search(query="as any", includePattern="**/*.{ts,vue}")

# Props 직접 변경
grep_search(query="props\\.\\w+ =", isRegexp=true, includePattern="**/*.vue")

# 인라인 스타일
grep_search(query="style=\"", includePattern="**/*.vue")

# 하드코딩 문자열 (API URL 등)
grep_search(query="http://\\|https://", isRegexp=true, includePattern="**/*.{ts,vue}")
```

## 3. 타입 안전성 진단

| 체크 항목 | 탐지 방법 | 심각도 |
|-----------|----------|--------|
| `any` 사용 | `grep ": any"`, `grep "as any"` | 🔴 높음 |
| 미정의 API 응답 타입 | API 호출 결과 타입 확인 | 🟡 중간 |
| 함수 반환 타입 미명시 | 복잡한 함수의 반환 타입 | 🟢 낮음 |
| 타입 단언 남용 | `as SomeType` 빈도 | 🟡 중간 |

## 4. 기존 헬퍼 미활용 진단

인라인으로 구현된 코드 중 기존 헬퍼로 대체 가능한 패턴:

```bash
# enum을 직접 변환하는 코드 (enumToArray 미사용)
grep_search(query="Object.keys(", includePattern="**/*.{ts,vue}")

# 날짜를 직접 포맷하는 코드 (getDisplayTime 미사용)
grep_search(query="toLocaleDateString\\|toLocaleString\\|toISOString", isRegexp=true)

# 수동 통화 포맷 (Filters.currency 미사용)
grep_search(query="toFixed(", includePattern="**/*.{ts,vue}")

# window.confirm/alert 사용 (ConfirmMessage/AlertMessage 미사용)
grep_search(query="window.confirm\\|window.alert", isRegexp=true)
```

## 5. 보안 진단

### 권한 체크 누락

API 호출 버튼에 권한 체크가 있는지 확인:

```bash
# v-if="canWrite" 또는 :disable="!canWrite" 패턴 확인
grep_search(query="canWrite", includePattern="대상파일.vue")
grep_search(query="canDelete", includePattern="대상파일.vue")
```

| 체크 항목 | 확인 방법 | 심각도 |
|-----------|----------|--------|
| POST/PUT 버튼에 `canWrite` 체크 | 생성/수정 버튼의 `v-if` 또는 `:disable` | 🔴 높음 |
| DELETE 버튼에 `canDelete` 체크 | 삭제 버튼의 `v-if` 또는 `:disable` | 🔴 높음 |

### v-html XSS 방지

```bash
# v-html 사용 여부 확인
grep_search(query="v-html=", includePattern="대상파일.vue")

# xssKeeper/xssKeeperEscape 사용 여부 확인
grep_search(query="xssKeeper\\|xssKeeperEscape", isRegexp=true, includePattern="대상파일.vue")
```

| 체크 항목 | 확인 방법 | 심각도 |
|-----------|----------|--------|
| `v-html` 사용 시 sanitize 적용 | `xssKeeper()` 또는 `xssKeeperEscape()` 래핑 | 🔴 높음 |

### 민감 정보 노출

```bash
# 민감 정보 하드코딩 확인
grep_search(query="apiKey\\|API_KEY\\|secret\\|SECRET", isRegexp=true, includePattern="**/*.{ts,vue}")
grep_search(query="password.*=.*['\"]", isRegexp=true, includePattern="**/*.{ts,vue}")
```

| 금지 패턴 | 대안 | 심각도 |
|----------|------|--------|
| API Key 하드코딩 | `import.meta.env.VITE_*` | 🔴 높음 |
| Secret 하드코딩 | 환경 변수 | 🔴 높음 |
| 내부 URL 하드코딩 | 환경 변수 또는 설정 파일 | 🟡 중간 |

---

## 6. 진단 결과 형식

분석 후 다음 형식으로 결과를 정리:

```markdown
## 진단 결과: `{파일 경로}`

**파일 정보**: {줄 수}줄, {타입}

### 발견된 문제

| # | 카테고리 | 문제 | 심각도 | 위치 (줄) |
|---|---------|------|--------|----------|
| 1 | 타입 안전성 | `any` 타입 사용 | 🔴 | L45, L78 |
| 2 | 구조 | 500줄 초과, 다중 책임 | 🔴 | 전체 |
| 3 | 패턴 | Props 직접 변경 | 🟡 | L123 |
| 4 | 헬퍼 미활용 | `Object.keys(Enum)` 직접 사용 | 🟢 | L67 |

### 추천 리팩토링 순서

1. 🔴 `any` → 구체적 타입 (빠르게 적용 가능)
2. 🔴 컴포넌트 분리 (구조 개선)
3. 🟡 Props 직접 변경 → emit 패턴
4. 🟢 기존 헬퍼 활용
```


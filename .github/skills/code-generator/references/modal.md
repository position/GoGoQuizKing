# Modal/Dialog 생성 가이드

프로젝트에서 사용하는 두 가지 모달 패턴.

## ⚠️ 필수 규칙 (TL;DR)

| 항목 | 필수 사항 |
|------|----------|
| **파일명** | `Dialog` 접두사 우선 사용 (`Dialog{도메인}{동작}.vue`) |
| **모달 열기/닫기** | `v-model` + `defineModel` 우선 사용 |
| **닫기 버튼** | `v-close-popup` 디렉티브 우선 사용 |
| **패턴** | 패턴 A (v-model 방식) 우선 사용 |
| **버튼→Dialog** | 버튼 클릭으로 Dialog 열기 시 **`DialogWithButton` 필수** |
| **UI 컬러** | 버튼, 체크박스 등 기본 컬러는 `primary` |
| **스타일 클래스** | 아래 CSS 클래스 규칙 필수 준수 |

### CSS 클래스 규칙

| 요소 | 필수 클래스 | 설명 |
|------|------------|------|
| `<q-dialog>` | `class="custom-modal no-bg"` | 모달 기본 스타일 + 배경 제거 |
| `<q-bar>` | `class="header"` | 모달 헤더 스타일 |
| 타이틀 | `<div class="title">` | 헤더 내 타이틀 (다른 태그 사용 금지) |
| `<q-card-section>` (본문) | `class="custom-modal-body"` | 모달 본문 스타일 |

> ⚠️ 클래스 누락 또는 다른 마크업 사용 시 스타일 불일치 발생. 반드시 위 규칙 준수.

## 위치

```
components/{domain}/Dialog{Name}.vue
```

예시:
- `components/quiz/QuizCreateDialog.vue`
- `components/profile/ProfileEditDialog.vue`

## 네이밍 규칙

- **`Dialog` 접두사 우선 사용** (권장): `DialogConfirm.vue`, `QuizCreateDialog.vue`
- `Modal` 접미사 (레거시/허용): `PlayerInfoModal.vue`

> ⚠️ 신규 생성 시 `Dialog` 접두사를 우선 사용할 것.

---

## 패턴 A: v-model 방식 (기본, 주류) ✅ 권장

프로젝트에서 가장 많이 사용되는 패턴. `DialogWithButton` 래퍼 또는 부모의 `v-model`로 제어.

### 핵심 규칙

1. **`defineModel`로 모달 상태 관리**: `const isShowModal = defineModel<boolean>('isShowModal', { default: false });`
2. **`v-close-popup` 디렉티브로 닫기**: 닫기 버튼, Cancel 버튼에 사용
3. **`persistent` 속성**: 외부 클릭으로 닫히지 않도록 설정 (필요시)

### 기본 템플릿

```vue
<template>
    <q-dialog v-model="isShowModal" class="custom-modal no-bg" persistent>
        <q-card style="min-width: 400px">
            <q-bar class="header">
                <div class="title">{{ props.title }}</div>
                <q-space />
                <q-btn icon="close" flat round dense v-close-popup />
            </q-bar>

            <q-card-section class="custom-modal-body">
                <!-- 모달 내용 -->
            </q-card-section>

            <q-card-actions align="right">
                <q-btn
                    label="Cancel"
                    color="grey"
                    unelevated
                    no-caps
                    v-close-popup
                />
                <q-btn
                    label="Confirm"
                    color="primary"
                    unelevated
                    no-caps
                    @click="handleConfirm"
                />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
    title?: string;
}>(), {
    title: 'Confirm',
});

const emit = defineEmits<{
    (e: 'confirmed', data: unknown): void;
}>();

const isShowModal = defineModel<boolean>('isShowModal', { default: false });

function handleConfirm() {
    emit('confirmed', { /* result */ });
    isShowModal.value = false;
}
</script>
```

### 호출 방법 1: DialogWithButton 래퍼 ⚠️ 필수

버튼 클릭으로 Dialog를 열 때는 **반드시 `DialogWithButton` 컴포넌트를 사용**한다.

```vue
<script setup lang="ts">
import DialogWithButton from '@fatima/shared/components/button/DialogWithButton.vue';
import MyDialog from './MyDialog.vue';
</script>

<template>
    <DialogWithButton label="Open" color="primary" unelevated no-caps>
        <template #dialog="{ model }">
            <MyDialog
                v-if="model.visible"
                v-model:is-show-modal="model.visible"
                @confirmed="handleResult"
            />
        </template>
    </DialogWithButton>
</template>
```

`DialogWithButton`은 `shared/components/button/DialogWithButton.vue`에 위치.
버튼 클릭 시 `model.visible = true` → 모달 열림.

**장점**:
- 버튼과 Dialog 상태 관리가 캡슐화됨
- `ref` 없이 `model.visible`로 상태 제어
- 일관된 패턴으로 코드 가독성 향상

> ⚠️ `<q-btn @click="showModal = true">` + `<MyDialog v-model:is-show-modal="showModal" />` 패턴은 **비권장**. DialogWithButton을 사용할 것.

### 호출 방법 2: 직접 v-model

```vue
<template>
    <q-btn @click="isShowModal = true" label="Open" />
    <MyDialog
        v-if="isShowModal"
        v-model:is-show-modal="isShowModal"
        @confirmed="handleResult"
    />
</template>

<script setup lang="ts">
const isShowModal = ref(false);
</script>
```

---

## 패턴 B: useDialogPluginComponent 방식

`$q.dialog()`로 프로그래밍 방식 호출. 간단한 확인/취소 다이얼로그에 적합.

### 기본 템플릿

```vue
<template>
    <q-dialog ref="dialogRef" @hide="onDialogHide" class="custom-modal no-bg" persistent>
        <q-card style="min-width: 400px">
            <q-bar class="header">
                <div class="title">{{ props.title }}</div>
                <q-space />
                <q-btn dense flat icon="close" @click="onDialogCancel" />
            </q-bar>

            <q-card-section class="custom-modal-body">
                <!-- 모달 내용 -->
            </q-card-section>

            <q-card-actions align="right">
                <q-btn label="Cancel" color="grey" unelevated no-caps @click="onDialogCancel" />
                <q-btn label="Confirm" color="primary" unelevated no-caps @click="handleConfirm" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar';

const props = withDefaults(defineProps<{
    title?: string;
    message?: string;
}>(), {
    title: 'Confirm',
    message: 'Are you sure?',
});

defineEmits([...useDialogPluginComponent.emits]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

function handleConfirm() {
    onDialogOK({ /* result */ });
}
</script>
```

### 호출

```typescript
import { useQuasar } from 'quasar';
import MyDialog from '@/components/MyDialog.vue';

const $q = useQuasar();

$q.dialog({
    component: MyDialog,
    componentProps: { title: 'Confirm Action' },
}).onOk((result) => {
    // 확인 시 처리
}).onCancel(() => {
    // 취소 시 처리
});
```

---

## 패턴 선택 기준

| 기준 | v-model 방식 (패턴 A) | useDialogPlugin 방식 (패턴 B) |
|------|----------------------|-------------------------------|
| 사용 빈도 | **주류** (프로젝트 대부분) | 소수 |
| 적합한 경우 | 복잡한 폼, 리스트, 데이터 조회 | 간단한 확인/취소 |
| 상태 관리 | 부모가 v-model로 제어 | `$q.dialog()`가 제어 |
| 데이터 반환 | emit 이벤트 | `onDialogOK(data)` |
| DialogWithButton | ✅ 호환 | ❌ 비호환 |

**기본 선택: 패턴 A (v-model)**를 사용하되, 간단한 확인 다이얼로그는 패턴 B 사용 가능.

---

## 체크리스트

### 필수 (MUST)
- [ ] **`Dialog` 접두사** 사용 (신규 생성 시)
- [ ] **`defineModel`**로 모달 상태 관리
- [ ] **`v-close-popup`** 디렉티브로 닫기 버튼 구현
- [ ] Cancel/Close 수단 제공 (X 버튼, Cancel 버튼)
- [ ] `<q-dialog>`에 `class="custom-modal no-bg"` 적용
- [ ] `<q-bar>`에 `class="header"` 적용
- [ ] 타이틀은 `<div class="title">` 사용 (h1, span 등 금지)
- [ ] 본문 `<q-card-section>`에 `class="custom-modal-body"` 적용
- [ ] 버튼 클릭으로 Dialog 열기 시 **`DialogWithButton`** 사용
- [ ] 버튼 기본 컬러 `primary` 적용 (Cancel은 `grey`, Delete는 `negative`)

### 권장 (SHOULD)
- [ ] 패턴 A (v-model 방식) 우선 사용
- [ ] `persistent` 속성으로 외부 클릭 방지 (필요시)
- [ ] 로딩 상태 처리 (비동기 작업 있는 경우)


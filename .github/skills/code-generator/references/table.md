# Q-Table 생성 가이드

프로젝트에서 `q-table`을 사용할 때 준수해야 할 규칙.

## ⚠️ 필수 규칙 (TL;DR)

| 항목 | 필수 사항 |
|------|----------|
| **기본 속성** | `flat`, `bordered`, `virtual-scroll`, `hide-pagination` 필수 |
| **페이지네이션** | `:rows-per-page-options="[0]"` 추가 (전체 표시) |
| **헤더** | `<tr class="sticky">` 사용하여 헤더 고정 |
| **셀 태그** | `<td>` 사용 (`<q-td>` 사용 금지) |
| **row-key** | 고유 식별자 지정 필수 |

---

## 기본 템플릿

```vue
<template>
    <q-table
        flat
        bordered
        :rows="dataList"
        row-key="id"
        virtual-scroll
        hide-pagination
        :rows-per-page-options="[0]"
        class="virtual-scroll-table"
    >
        <template v-slot:header>
            <tr class="sticky">
                <th class="text-center">No.</th>
                <th class="text-left">Name</th>
                <th class="text-center">Status</th>
                <th class="text-right">Actions</th>
            </tr>
        </template>

        <template v-slot:body="props">
            <tr>
                <td class="text-center">{{ props.rowIndex + 1 }}</td>
                <td class="text-left">{{ props.row.name }}</td>
                <td class="text-center">
                    <q-badge :color="getStatusColor(props.row.status)">
                        {{ props.row.status }}
                    </q-badge>
                </td>
                <td class="text-right">
                    <q-btn
                        icon="sym_o_edit"
                        color="primary"
                        flat
                        round
                        dense
                        @click="handleEdit(props.row)"
                    />
                </td>
            </tr>
        </template>

        <template v-slot:no-data>
            <div class="no-data">No Result</div>
        </template>
    </q-table>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface DataItem {
    id: number;
    name: string;
    status: string;
}

const dataList = ref<DataItem[]>([]);

function getStatusColor(status: string): string {
    // 상태별 색상 반환
    return 'primary';
}

function handleEdit(row: DataItem) {
    // 편집 처리
}
</script>
```

> **스타일 참고**: `virtual-scroll-table` 클래스는 `shared/assets/scss/_custom.scss`에 공통 정의되어 있음.
> 추가 스타일이 필요한 경우에만 scoped style 작성.

---

## 속성 설명

| 속성 | 필수 | 설명 |
|------|------|------|
| `flat` | ✅ | 그림자 제거 |
| `bordered` | ✅ | 테두리 표시 |
| `virtual-scroll` | ✅ | 대용량 데이터 가상 스크롤 |
| `hide-pagination` | ✅ | 페이지네이션 숨김 |
| `:rows-per-page-options="[0]"` | ✅ | 전체 행 표시 |
| `row-key` | ✅ | 행 고유 키 (id, playerId 등) |
| `:rows` | ✅ | 데이터 배열 |

---

## 헤더 (sticky)

헤더는 **반드시 `class="sticky"`**를 사용하여 스크롤 시 고정되도록 한다.

```vue
<template v-slot:header>
    <tr class="sticky">
        <th class="text-center">No.</th>
        <th class="text-left">Name</th>
    </tr>
</template>
```

### 헤더 아래 추가 행 (예: 액션 버튼)

```vue
<template v-slot:header>
    <tr class="sticky">
        <th class="text-center">No.</th>
        <th class="text-left">Players</th>
    </tr>
    <tr v-if="dataList.length">
        <td colspan="100%" class="text-center">
            <q-btn
                @click="handleAction"
                label="Action Button"
                color="primary"
                unelevated
                no-caps
                dense
                outline
            />
        </td>
    </tr>
</template>
```

---

## Body 슬롯

**`<q-td>` 사용 금지** - 일반 `<td>` 태그를 사용한다.

```vue
<!-- ✅ 올바른 사용 -->
<template v-slot:body="props">
    <tr @click="handleRowClick(props.row)">
        <td class="text-center">{{ props.row.no }}</td>
        <td class="text-left">{{ props.row.name }}</td>
    </tr>
</template>

<!-- ❌ 잘못된 사용 -->
<template v-slot:body="props">
    <q-tr>
        <q-td class="text-center">{{ props.row.no }}</q-td>
        <q-td class="text-left">{{ props.row.name }}</q-td>
    </q-tr>
</template>
```

### Body 슬롯 변수

| 변수 | 설명 |
|------|------|
| `props.row` | 현재 행 데이터 |
| `props.rowIndex` | 현재 행 인덱스 (0부터) |

---

## No Data 슬롯

데이터가 없을 때 표시할 내용:

```vue
<template v-slot:no-data>
    <div class="no-data">No Result</div>
</template>
```

---

## 스타일링

`virtual-scroll-table` 클래스는 `shared/assets/scss/_custom.scss`에 공통 정의되어 있다.
기본 스타일(border, 스크롤바, sticky 헤더, no-data 등)이 포함되어 있으므로 별도 정의 불필요.

### 추가 스타일이 필요한 경우

컴포넌트별 추가 스타일만 scoped로 작성:

```scss
<style scoped lang="scss">
// 컬럼 너비 지정 (필요시)
:deep(thead tr th) {
    &:first-child {
        width: 90px; // No. 컬럼
    }
    &:last-child {
        width: 120px; // Actions 컬럼
    }
}

// max-height 조정 (필요시)
.virtual-scroll-table {
    max-height: 400px;
}
</style>
```

---

## 체크리스트

### 필수 (MUST)
- [ ] `flat`, `bordered`, `virtual-scroll`, `hide-pagination` 속성 적용
- [ ] `:rows-per-page-options="[0]"` 추가
- [ ] `row-key`에 고유 식별자 지정
- [ ] 헤더에 `<tr class="sticky">` 사용
- [ ] Body에서 `<td>` 사용 (`<q-td>` 금지)
- [ ] `no-data` 슬롯 구현

### 권장 (SHOULD)
- [ ] `class="virtual-scroll-table"` 적용
- [ ] `max-height` 지정하여 스크롤 영역 제한
- [ ] 클릭 가능한 행은 `cursor: pointer` 스타일 적용

---

## 참고 파일

- `staff/src/components/tournament/tables/waiting/EventTableWaitingPlayerList.vue`


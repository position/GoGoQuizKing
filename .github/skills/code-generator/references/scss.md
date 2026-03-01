# SCSS 작성 가이드

Nuxt 3 + Quasar 프로젝트의 SCSS 표준 작성 가이드.

## ⚠️ 필수 규칙 (TL;DR)

| 항목 | 필수 사항 |
|------|----------|
| **CSS 변수 사용** | 하드코딩 색상 금지, `var(--xxx)` 사용 |
| **다크모드 지원** | `.dark-mode &` 선택자로 다크모드 스타일 정의 |
| **Scoped 스타일** | 컴포넌트는 `<style scoped lang="scss">` 사용 |
| **SCSS Nesting 활용** | 중첩 문법으로 구조화 (최대 3단계) |
| **Quasar 클래스 활용** | 가능하면 Quasar 유틸리티 클래스 우선 사용 |

---

## SCSS Nesting 활용 (필수)

### 기본 Nesting 패턴

```scss
// ❌ 금지: 플랫한 CSS (반복되는 선택자)
.card {
    background: var(--bg-card);
}
.card .card-header {
    display: flex;
}
.card .card-header .card-title {
    font-size: 18px;
}
.card .card-content {
    padding: 16px;
}
.card:hover {
    transform: translateY(-2px);
}

// ✅ 권장: SCSS Nesting 활용
.card {
    background: var(--bg-card);

    .card-header {
        display: flex;

        .card-title {
            font-size: 18px;
        }
    }

    .card-content {
        padding: 16px;
    }

    &:hover {
        transform: translateY(-2px);
    }
}
```

### & (Parent Selector) 활용

```scss
.button {
    background: var(--color-primary);
    transition: all 0.2s;

    // 상태 (hover, active, focus, disabled)
    &:hover {
        background: darken(#FF8200, 10%);
    }

    &:active {
        transform: scale(0.98);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    // 변형 클래스
    &.is-loading {
        pointer-events: none;
        opacity: 0.7;
    }

    &.is-small {
        padding: 4px 8px;
        font-size: 12px;
    }

    &.is-large {
        padding: 12px 24px;
        font-size: 18px;
    }

    // 다크모드
    .dark-mode & {
        background: lighten(#FF8200, 5%);
    }

    // 인접 형제 선택자
    & + & {
        margin-left: 8px;
    }
}
```

### 미디어 쿼리 Nesting

```scss
// ❌ 금지: 미디어 쿼리 분리
.page-title {
    font-size: 28px;
}

@media (max-width: 768px) {
    .page-title {
        font-size: 24px;
    }
}

@media (max-width: 480px) {
    .page-title {
        font-size: 20px;
    }
}

// ✅ 권장: 미디어 쿼리 Nesting
.page-title {
    font-size: 28px;

    @media (max-width: 768px) {
        font-size: 24px;
    }

    @media (max-width: 480px) {
        font-size: 20px;
    }
}
```

### 중첩 깊이 규칙 (최대 3단계)

```scss
// ✅ 권장: 최대 3단계 중첩
.card {                          // 1단계
    .card-header {               // 2단계
        .card-title {            // 3단계
            font-size: 18px;
        }
    }
}

// ❌ 금지: 4단계 이상 중첩 (가독성 저하)
.page {                          // 1단계
    .section {                   // 2단계
        .card {                  // 3단계
            .card-header {       // 4단계 ❌
                .card-title {    // 5단계 ❌
                    font-size: 18px;
                }
            }
        }
    }
}

// ✅ 해결: 클래스 분리
.page {
    .section {
        // section 스타일
    }
}

.card {
    .card-header {
        .card-title {
            font-size: 18px;
        }
    }
}
```

---

## CSS 변수 (필수)

### 사용 가능한 변수

```scss
// 배경색
--bg-primary      // 메인 배경
--bg-secondary    // 보조 배경
--bg-card         // 카드 배경
--bg-surface      // 표면 배경
--bg-input        // 입력 필드 배경

// 텍스트
--text-primary    // 주요 텍스트
--text-secondary  // 보조 텍스트
--text-light      // 연한 텍스트

// 테두리/그림자
--border-color    // 테두리
--shadow-color    // 그림자
--hover-overlay   // 호버 오버레이

// 컬러
--color-primary   // 메인 컬러 (#FF8200)
--color-secondary // 보조 컬러 (#9ACD32)
--color-accent    // 강조 컬러 (#FDEE00)
--color-success   // 성공 (#95e77e)
--color-warning   // 경고 (#f7b32b)
--color-negative  // 오류 (#ff6b6b)
--color-info      // 정보 (#45b7d1)
```

### 사용 예시

```scss
// ❌ 금지: 하드코딩
.card {
    background: white;
    color: #212121;
    border: 1px solid #e0e0e0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

// ✅ 권장: CSS 변수 + Nesting
.card {
    background: var(--bg-card);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    box-shadow: 0 2px 8px var(--shadow-color);

    &:hover {
        box-shadow: 0 4px 16px var(--shadow-color);
    }
}
```

---

## 다크모드 지원 (필수)

### 기본 패턴

```scss
.my-component {
    background: var(--bg-card);
    color: var(--text-primary);
    
    // 다크모드에서 추가 스타일이 필요한 경우
    .dark-mode & {
        border-color: rgba(255, 255, 255, 0.1);
    }
}
```

### 색상별 다크모드 처리

```scss
.status-badge {
    &.success {
        background: rgba(76, 175, 80, 0.15);
        color: #2e7d32;

        .dark-mode & {
            background: rgba(129, 199, 132, 0.2);
            color: #81c784;
        }
    }

    &.error {
        background: rgba(198, 40, 40, 0.15);
        color: #c62828;

        .dark-mode & {
            background: rgba(239, 83, 80, 0.2);
            color: #ef5350;
        }
    }

    &.warning {
        background: rgba(255, 152, 0, 0.15);
        color: #ff9800;

        .dark-mode & {
            background: rgba(255, 183, 77, 0.2);
            color: #ffb74d;
        }
    }
}
```

### 그라데이션 다크모드

```scss
.gradient-section {
    background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);

    .dark-mode & {
        background: linear-gradient(135deg, rgba(92, 107, 192, 0.2) 0%, rgba(121, 134, 203, 0.2) 100%);
    }
}
```

---

## 컴포넌트 스타일 구조

### Vue 컴포넌트 템플릿 (Nesting 활용)

```vue
<style scoped lang="scss">
.component-name {
    // 1. 레이아웃
    display: flex;
    flex-direction: column;
    
    // 2. 박스 모델
    padding: 16px;
    margin-bottom: 24px;
    border-radius: 16px;
    
    // 3. 배경/색상
    background: var(--bg-card);
    color: var(--text-primary);
    box-shadow: 0 2px 8px var(--shadow-color);
    
    // 4. 트랜지션
    transition: background-color 0.3s ease;
    
    // 5. 중첩 요소 (Nesting)
    .header {
        display: flex;
        align-items: center;
        margin-bottom: 12px;

        .icon {
            margin-right: 8px;
            color: var(--color-primary);
        }

        .title {
            font-size: 18px;
            font-weight: 700;
            color: var(--text-primary);
        }

        .subtitle {
            font-size: 14px;
            color: var(--text-secondary);
            margin-top: 4px;
        }
    }
    
    .content {
        padding-top: 12px;
        color: var(--text-secondary);
        line-height: 1.6;
    }

    .footer {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 16px;
        padding-top: 12px;
        border-top: 1px solid var(--border-color);
    }
    
    // 6. 상태/변형 (& 활용)
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px var(--shadow-color);
    }
    
    &.is-active {
        border: 2px solid var(--color-primary);
    }

    &.is-loading {
        opacity: 0.7;
        pointer-events: none;
    }
    
    // 7. 다크모드
    .dark-mode & {
        border-color: rgba(255, 255, 255, 0.1);
    }

    // 8. 반응형 (미디어 쿼리 Nesting)
    @media (max-width: 768px) {
        padding: 12px;

        .header {
            .title {
                font-size: 16px;
            }
        }
    }

    @media (max-width: 480px) {
        padding: 8px;

        .footer {
            flex-direction: column;
        }
    }
}
</style>
```

---

## 페이지 스타일 구조

### 페이지 템플릿 (Nesting 활용)

```scss
.page-name {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px 16px 100px;

    // 페이지 헤더
    .page-header {
        text-align: center;
        margin-bottom: 24px;

        .page-title {
            font-size: 28px;
            font-weight: 800;
            color: var(--text-primary);
            margin: 0 0 8px 0;
        }

        .page-description {
            font-size: 14px;
            color: var(--text-secondary);
            margin: 0;
        }
    }

    // 로딩 상태
    .loading-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 400px;
        color: var(--text-secondary);

        p {
            margin-top: 16px;
        }
    }

    // 빈 상태
    .empty-state {
        text-align: center;
        padding: 48px 24px;
        color: var(--text-secondary);

        .empty-icon {
            margin-bottom: 16px;
        }

        .empty-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 8px;
        }

        .empty-text {
            font-size: 14px;
            color: var(--text-light);
        }
    }

    // 섹션
    .section {
        margin-bottom: 24px;

        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }

        .section-title {
            font-size: 18px;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0;
        }
    }

    // 반응형
    @media (max-width: 600px) {
        padding: 16px 12px 100px;

        .page-header {
            .page-title {
                font-size: 24px;
            }
        }
    }
}
```

---

## 카드 스타일 패턴

```scss
.card {
    background: var(--bg-card);
    border-radius: 16px;
    padding: 16px;
    box-shadow: 0 2px 8px var(--shadow-color);
    transition: transform 0.2s, box-shadow 0.2s;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px var(--shadow-color);
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .card-icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-surface);
        }
    }

    .card-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--text-primary);
        margin: 0;
    }

    .card-subtitle {
        font-size: 13px;
        color: var(--text-light);
        margin-top: 4px;
    }

    .card-content {
        color: var(--text-secondary);
        font-size: 14px;
        line-height: 1.5;
    }

    .card-footer {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 16px;
        padding-top: 12px;
        border-top: 1px solid var(--border-color);
    }

    // 카드 변형
    &.is-clickable {
        cursor: pointer;

        &:active {
            transform: scale(0.98);
        }
    }

    &.is-highlighted {
        border: 2px solid var(--color-primary);
    }
}
```

---

## 폼 요소 스타일

```scss
.form-group {
    margin-bottom: 16px;

    .form-label {
        display: block;
        font-size: 14px;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 8px;

        .required {
            color: var(--color-negative);
            margin-left: 2px;
        }
    }

    .form-hint {
        font-size: 12px;
        color: var(--text-light);
        margin-top: 4px;
    }

    .form-error {
        font-size: 12px;
        color: var(--color-negative);
        margin-top: 4px;
    }

    // 상태
    &.has-error {
        .form-label {
            color: var(--color-negative);
        }
    }
}

// Quasar Input 오버라이드
.q-input {
    .q-field__control {
        background: var(--bg-input);
        border-radius: 8px;
    }

    .q-field__native {
        color: var(--text-primary);
    }

    &.q-field--focused {
        .q-field__control {
            border-color: var(--color-primary);
        }
    }
}
```

---

## 리스트/그리드 패턴

### 그리드

```scss
.grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;

    @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
    }

    @media (max-width: 480px) {
        grid-template-columns: 1fr;
    }

    .grid-item {
        // 그리드 아이템 공통 스타일
    }
}
```

### 리스트

```scss
.list {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .list-item {
        display: flex;
        align-items: center;
        padding: 12px 16px;
        background: var(--bg-surface);
        border-radius: 12px;
        transition: background-color 0.2s;

        &:hover {
            background: var(--hover-overlay);
        }

        &.is-active {
            background: rgba(92, 107, 192, 0.1);
            border-left: 3px solid var(--color-primary);
        }

        .list-item-icon {
            margin-right: 12px;
            color: var(--text-light);
        }

        .list-item-content {
            flex: 1;

            .list-item-title {
                font-size: 14px;
                font-weight: 600;
                color: var(--text-primary);
            }

            .list-item-subtitle {
                font-size: 12px;
                color: var(--text-light);
                margin-top: 2px;
            }
        }

        .list-item-action {
            margin-left: auto;
        }
    }
}
```

---

## 버튼/뱃지 스타일

### 상태 뱃지

```scss
.status-badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;

    .badge-icon {
        margin-right: 4px;
    }

    &.success {
        background: rgba(76, 175, 80, 0.15);
        color: #4caf50;

        .dark-mode & {
            background: rgba(129, 199, 132, 0.2);
            color: #81c784;
        }
    }

    &.warning {
        background: rgba(255, 152, 0, 0.15);
        color: #ff9800;

        .dark-mode & {
            background: rgba(255, 183, 77, 0.2);
            color: #ffb74d;
        }
    }

    &.error {
        background: rgba(244, 67, 54, 0.15);
        color: #f44336;

        .dark-mode & {
            background: rgba(239, 83, 80, 0.2);
            color: #ef5350;
        }
    }

    &.info {
        background: rgba(33, 150, 243, 0.15);
        color: #2196f3;

        .dark-mode & {
            background: rgba(100, 181, 246, 0.2);
            color: #64b5f6;
        }
    }
}
```

---

## 금지 사항

| 항목 | 문제점 | 대안 |
|------|--------|------|
| `color: #212121` | 다크모드 미지원 | `color: var(--text-primary)` |
| `background: white` | 다크모드 미지원 | `background: var(--bg-card)` |
| `background: #f5f5f5` | 다크모드 미지원 | `background: var(--bg-surface)` |
| `border: 1px solid #e0e0e0` | 다크모드 미지원 | `border: 1px solid var(--border-color)` |
| 플랫한 CSS (반복 선택자) | 가독성 저하 | SCSS Nesting 활용 |
| 4단계 이상 중첩 | 가독성 저하 | 클래스 분리 |
| 인라인 스타일 | 유지보수 어려움 | scoped CSS 사용 |
| `!important` | 우선순위 문제 | specificity로 해결 |

---

## 전역 스타일 vs Scoped 스타일

### 전역 스타일 (assets/scss/)

```
assets/scss/
├── _variables.scss     # SCSS 변수 (컬러, 간격 등)
├── styles.scss         # 전역 스타일, CSS 변수 정의
└── quasar-variables.scss # Quasar 변수 오버라이드
```

**전역 스타일에 넣을 것**:
- CSS 커스텀 프로퍼티 (CSS 변수)
- 리셋/베이스 스타일
- h1~h6 기본 스타일
- 공통 유틸리티 클래스

### Scoped 스타일 (컴포넌트 내)

**컴포넌트에 넣을 것**:
- 컴포넌트 전용 스타일
- 레이아웃
- 상태별 스타일 (.is-active, .is-loading 등)

---

## 참고

- [Quasar Spacing Classes](https://quasar.dev/style/spacing)
- [Quasar Color Palette](https://quasar.dev/style/color-palette)
- [CSS Variables (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [SCSS Nesting (Sass Docs)](https://sass-lang.com/documentation/style-rules#nesting)


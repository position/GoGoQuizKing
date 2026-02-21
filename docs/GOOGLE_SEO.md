# 🔍 Google 검색 노출 가이드

## 📋 체크리스트

### ✅ 완료된 항목
- [x] `robots.txt` 설정
- [x] 메타 태그 (title, description, keywords)
- [x] Open Graph 태그 (og:title, og:description, og:image)
- [x] Twitter Card 태그
- [x] `@nuxtjs/seo` 모듈 (자동 sitemap 생성)
- [x] Canonical URL 설정
- [x] 한국어 설정 (lang="ko")

### ⏳ 필요한 작업
- [ ] Google Search Console 등록
- [ ] 네이버 서치어드바이저 등록
- [ ] Google Analytics 연동
- [ ] google-site-verification 메타 태그 추가

---

## 1️⃣ Google Search Console 등록

### Step 1: Search Console 접속
1. [Google Search Console](https://search.google.com/search-console) 접속
2. Google 계정으로 로그인

### Step 2: 속성 추가
1. 왼쪽 상단 "속성 추가" 클릭
2. **URL 접두어** 선택
3. `https://gogoquizking.com` 입력

### Step 3: 소유권 확인 (HTML 태그 방식)
1. "HTML 태그" 방식 선택
2. 제공된 메타 태그 복사:
   ```html
   <meta name="google-site-verification" content="여기에_인증코드" />
   ```
3. `nuxt.config.ts`에서 아래 부분 수정:
   ```typescript
   { name: 'google-site-verification', content: '여기에_인증코드_붙여넣기' },
   ```
4. 배포 후 "확인" 버튼 클릭

### Step 4: Sitemap 제출
1. Search Console → "Sitemaps" 메뉴
2. 사이트맵 URL 입력: `sitemap.xml`
3. "제출" 클릭

---

## 2️⃣ 네이버 서치어드바이저 등록

### Step 1: 서치어드바이저 접속
1. [네이버 서치어드바이저](https://searchadvisor.naver.com) 접속
2. 네이버 계정으로 로그인

### Step 2: 사이트 등록
1. "웹마스터 도구" → "사이트 관리"
2. `https://gogoquizking.com` 입력

### Step 3: 소유권 확인
1. "HTML 태그" 방식 선택
2. 제공된 메타 태그의 content 값 복사
3. `nuxt.config.ts`에서 아래 부분 수정:
   ```typescript
   { name: 'naver-site-verification', content: '여기에_인증코드_붙여넣기' },
   ```

### Step 4: 사이트맵 제출
1. "요청" → "사이트맵 제출"
2. URL 입력: `https://gogoquizking.com/sitemap.xml`

---

## 3️⃣ Google Analytics 설정 (선택)

### Step 1: GA4 계정 생성
1. [Google Analytics](https://analytics.google.com) 접속
2. 새 속성 생성
3. 측정 ID 복사 (G-XXXXXXXXXX)

### Step 2: Nuxt에 GA 추가
```bash
npm install vue-gtag-next
```

`nuxt.config.ts`에 추가:
```typescript
// app.head.script에 추가
script: [
    {
        src: 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX',
        async: true,
    },
    {
        innerHTML: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
        `,
    },
],
```

---

## 4️⃣ SEO 최적화 팁

### 콘텐츠 최적화
- **고유한 제목**: 각 페이지마다 다른 title 설정
- **메타 설명**: 150-160자 내로 작성
- **키워드**: 자연스럽게 본문에 포함

### 기술적 SEO
- **빠른 로딩 속도**: 이미지 최적화, 코드 압축
- **모바일 친화적**: 반응형 디자인
- **HTTPS**: SSL 인증서 적용
- **구조화된 데이터**: JSON-LD 스키마

### 링크 전략
- **내부 링크**: 페이지 간 연결
- **외부 링크**: 신뢰할 수 있는 사이트에서 백링크 확보

---

## 5️⃣ 검색 노출 확인

### Google에서 확인
```
site:gogoquizking.com
```
위 검색어로 인덱싱 여부 확인 (등록 후 1-2주 소요)

### Search Console에서 확인
1. "URL 검사" 도구 사용
2. 특정 URL 입력하여 인덱싱 상태 확인
3. "색인 생성 요청"으로 빠른 인덱싱 요청

---

## 📊 예상 일정

| 단계 | 예상 소요 시간 |
|------|---------------|
| Search Console 등록 | 10분 |
| 소유권 확인 | 1-24시간 |
| Sitemap 제출 | 5분 |
| 첫 인덱싱 | 1-7일 |
| 검색 결과 노출 | 1-4주 |

---

*마지막 업데이트: 2026년 2월 21일*


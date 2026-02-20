# PWA 설정 가이드

## 1. 아이콘 생성

PWA를 위해 다음 아이콘 파일들을 `/public/icons/` 폴더에 추가해야 합니다:

### 필수 아이콘 크기
- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-144x144.png`
- `icon-152x152.png`
- `icon-192x192.png` (maskable)
- `icon-384x384.png`
- `icon-512x512.png` (maskable)
- `apple-touch-icon.png` (180x180)

### 아이콘 생성 도구
1. **PWA Asset Generator** (추천)
   ```bash
   npx pwa-asset-generator ./public/img/quizking-character.png ./public/icons --icon-only --favicon
   ```

2. **온라인 도구**
   - [RealFaviconGenerator](https://realfavicongenerator.net/)
   - [PWA Builder](https://www.pwabuilder.com/imageGenerator)

## 2. 기능 설명

### 설치 프롬프트
사용자가 사이트를 방문하면 "홈 화면에 추가" 프롬프트가 표시됩니다.

### 오프라인 지원
Service Worker가 정적 자산을 캐시하여 오프라인에서도 앱 사용 가능.

### 캐싱 전략
- **Supabase API**: NetworkFirst (네트워크 우선, 1일 캐시)
- **카카오 CDN 이미지**: CacheFirst (캐시 우선, 7일 캐시)
- **Google Fonts**: CacheFirst (캐시 우선, 1년 캐시)

## 3. 테스트

### 개발 환경에서 테스트
```bash
npm run dev
```
개발 모드에서도 Service Worker가 활성화됩니다.

### 프로덕션 빌드 테스트
```bash
npm run build
npm run preview
```

### Chrome DevTools에서 확인
1. F12 → Application 탭
2. Service Workers 섹션에서 등록 확인
3. Manifest 섹션에서 PWA 정보 확인

## 4. 설정 파일 위치

- **nuxt.config.ts**: PWA 모듈 설정
- **public/icons/**: 앱 아이콘
- **자동 생성**: `manifest.webmanifest`, `sw.js`

## 5. iOS Safari 지원

iOS Safari에서 "홈 화면에 추가"를 지원하기 위해 다음이 설정되어 있습니다:
- `apple-touch-icon` 링크 태그
- `theme-color` 메타 태그
- `display: standalone` 설정


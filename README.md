# 근무 시간 계산기

주간 근무시간 계산기 웹앱. 드래그로 출퇴근 시간을 입력하고, 점심시간 자동 제외와 주간 합계를 한눈에 확인할 수 있습니다.

## Tech Stack

- Expo SDK 54 (React Native Web)
- React 19 + React Native 0.81
- AsyncStorage (로컬 데이터 저장)
- NotoSansKR (웹폰트)
- PWA (Service Worker, manifest)
- Vercel (배포)

## Getting Started

```bash
npm install
npm run web
```

## Build & Deploy

```bash
npm run build
vercel --prod
```

빌드 시 `scripts/postbuild-seo.js`가 자동 실행되어 SEO 메타태그, GA4, 모바일 UX CSS를 주입합니다.

## Features

- 드래그로 출퇴근 시간 입력
- 점심시간 자동 제외
- 주간 근무시간 합계 계산
- 프리셋 (9-6, 10-7, 8-5 등)
- 주간 기록 히스토리
- 스케줄 공유 URL
- PWA 오프라인 지원

## License

MIT

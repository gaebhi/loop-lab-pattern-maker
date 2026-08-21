# LOOP LAB — Pattern Maker

반복 패턴을 만들고 1920×1080 배경 이미지로 내보내는 브라우저 기반 패턴 메이커입니다.

## 기능

- 도트, 투톤 도트, 체크, 스트라이프, 다이아, 별, 웨이브, 격자, 하트 등 12가지 패턴
- 0° / 45° / 90° / 135° 회전, 타일 크기, 도형 크기, 가장자리 번짐 조절
- 배경·도형 색상과 그라데이션 방향 설정
- 1920×1080 전체 프레임 기준 미리보기
- Shape Grid: 1/4원, 절반 삼각형, 나비형 삼각 페어, 마주 보는 반원 페어를 랜덤 조합
- PNG (720p, 1080p, 4K), SVG, CSS 배경 코드 내보내기

## 시작하기

Node.js 22.13 이상이 필요합니다.

```bash
npm install
npm run dev
```

브라우저에서 표시되는 로컬 주소를 열면 됩니다.

## 검증 및 프로덕션 빌드

```bash
npm run build
npm run start
```

## 주요 파일

- `app/PatternStudio.tsx` — 패턴 생성, 미리보기, 랜덤 조합, 내보내기 로직
- `app/globals.css` — 스튜디오 UI 스타일
- `app/layout.tsx` — 페이지 메타데이터

## 기술 구성

- React 19
- Vinext / Vite
- TypeScript

## 라이선스

개인 프로젝트 용도로 제작되었습니다.

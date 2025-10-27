# SVG 집 정리 게임 - React 버전

## 현재 상태
- ✅ React 프로젝트 생성 완료
- ✅ GSAP 라이브러리 설치 완료
- ✅ 게임 로직 구현 완료 (HouseGame.tsx)
- ⚠️ SVG 마크업 부분 완성 필요 (HouseSVG.tsx)

## 남은 작업

### 1. SVG 완성하기 ⚠️ 필수
`src/components/HouseSVG.tsx` 파일에 누락된 가구 항목들을 추가해야 합니다.

**home1.html**의 모든 가구 `<g class="item">` 요소들을 복사해 `HouseSVG.tsx`에 추가하세요.

어떻게 하는지:
1. `home1.html` 파일을 열기
2. 라인 45 (첫번째 item)부터 라인 230까지 (모든 item 요소들) 찾기
3. 각 `<g class="item item-...">` 블록을 복사
4. `HouseSVG.tsx`의 `{/* Furniture items continue... */}` 주석 뒤에 붙여넣기

**참고**: 
- 총 21개의 가구 항목이 있음 (kitchen-chair-2, kitchen-chair-1, kitchen-table, kitchen-lamp, bedroom-table-2, bedroom-table-1, bed, bedroom-lamp, bookcase, cabinet-chair, laptop, locker, dressingroom-table, mirror, livingroom-table, tv, sofa, painting, bath, toilet, bathroom-table)
- 각 항목의 `className`과 `data-item`, `data-room` 속성은 수정하지 마세요

### 2. 실행 방법

```bash
cd house-game
npm start
```

브라우저가 자동으로 열리고 게임이 실행됩니다.

## 파일 구조

```
house-game/
├── src/
│   ├── components/
│   │   ├── HouseGame.tsx    # 메인 게임 로직 (GSAP Draggable)
│   │   ├── HouseGame.css    # 게임 스타일
│   │   └── HouseSVG.tsx     # SVG 마크업 (완성 필요)
│   ├── App.tsx              # 메인 앱
│   └── App.css              # 앱 스타일
└── package.json
```

## 주요 기능

- ✅ 가구 드래그 앤 드롭
- ✅ 방 영역 감지
- ✅ 가구를 올바른 방에 놓으면 점수 증가
- ✅ 모든 가구를 올바르게 배치하면 완료

## 의존성

- React 18
- TypeScript
- GSAP 3
- GSAP Draggable Plugin

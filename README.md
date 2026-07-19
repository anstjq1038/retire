# 🌱 적립 — 노후준비 주식 트래커

매달 25일, 한 주씩 쌓아서 55세에 15억 만들기.
수동으로 매수를 기록하면 쌓이는 재미를 차트로 보여주는 모바일 PWA.

**공개 주소**: https://anstjq1038.github.io/retire/

## 사용법 (휴대폰)

1. 위 주소를 폰 브라우저로 열고 **Google 로그인**
2. 브라우저 메뉴 → **"홈 화면에 추가"** → 앱처럼 아이콘으로 실행
3. 매수할 때마다 가운데 **+ 버튼**으로 종목·수량·단가 기록
4. 현재가는 종목 상세에서 수동 갱신 (없으면 평단가로 평가)

## 구조

| 경로 | 역할 |
|---|---|
| `app/src/pages/` | 홈·포트폴리오·종목상세·기록·목표·설정 |
| `app/src/components/charts/` | 누적 영역·도넛·계단 차트 (Recharts) |
| `app/src/lib/store.tsx` | Firestore 실시간 동기화 (`retirement/{uid}/...`) |
| `app/src/lib/calc.ts` | 평단가·D-day·스트릭·복리 시뮬레이션 계산 |
| `tools/make-icons.mjs` | PWA 아이콘 생성 (`node tools/make-icons.mjs`) |
| `.github/workflows/deploy.yml` | push하면 GitHub Pages 자동 배포 |

- **데이터**: 여행플래너와 같은 Firebase 프로젝트(travelplanner-a4a1c)의 Firestore를 재사용.
  `retirement/{uid}` 경로는 본인 계정만 읽기/쓰기 가능 (규칙은 여행플래너 저장소의 `firestore.rules`에서 관리·배포).
- **기술**: React 18 + Vite + TypeScript + Tailwind 4 + Recharts + Framer Motion + PWA

## 로컬 개발

```bash
cd app
npm install
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드 (dist/)
```

## 배포

master에 push하면 GitHub Actions가 자동으로 빌드해서 Pages에 올린다.

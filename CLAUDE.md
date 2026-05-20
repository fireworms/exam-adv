# 9급 공무원 5과목 통합 학습 웹앱

> 가이드 원본: `data/학습페이지_제작가이드_파트1-2.md` (섹션 1~6) + `파트3.md` (섹션 7~16)  
> 메모리 압축본: `.claude/projects/.../memory/` — **가이드 재독 전 메모리 먼저 확인**

## 핵심 제약 (변경 불가)
- **4지선다 문제풀이 앱은 이미 별도 존재** → 본 앱에 `/practice`, `/review`, `/simulation` 라우트 없음
- `set1~3.json`은 DB 적재 금지, 기출 메타 추출 전용
- `questions`/`choices`/`user_attempts` 테이블 생성 금지

## 기술 스택
- **Next.js 15** (App Router) + TypeScript + Tailwind CSS + **shadcn/ui**
- **Supabase** (PostgreSQL + Auth + Storage)
- react-markdown, KaTeX, Prism.js, Recharts, Leaflet, vis-timeline, react-force-graph, Framer Motion, react-pdf, next-themes

## 데이터 디렉토리
```
data/{korean,english,korean_history,computer_general,infosec}/
  요약노트_JSON.json    ← DB 적재 (메인 소스)
  요약노트_마스터.md/.pdf  ← Supabase Storage 서빙
  요약노트_표중심.md/.pdf
  트렌드분석.md        ← 한국사/컴일/정보보호론만 존재
  set1~3.json          ← 메타 추출 전용
```

## 환경변수 (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...  (대시보드 "Publishable key")
SUPABASE_SECRET_KEY=...                   (대시보드 "Secret key", 시드 스크립트 전용)
EXAM_DATE=2026-06-20
NEXT_PUBLIC_QUIZ_APP_URL=...             (없으면 딥링크 비활성)
```

## 시험일
`EXAM_DATE=2026-06-20` (D-7부터 시험 직전 모드 자동 활성화)

## 구현 로드맵
| 주차 | 내용 |
|-----|------|
| Week 1 | Next.js 초기화, Supabase 설정, DB 스키마 전체, 공통 레이아웃, 대시보드 뼈대 |
| Week 2 | MarkdownViewer, 한국사 (연표·인물사전·사료·지도) |
| Week 3 | 영어 (어휘 카드·관용구·문법 패턴) + SM-2 구현 |
| Week 4 | 컴퓨터일반 (플래시카드·코드트레이싱) + 정보보호론 (암호실습·법규·ISMS-P·접근통제) |
| Week 5 | 국어 + 전 과목 함정 패턴 + 통합 검색 + 기출 메타 주입 |
| Week 6 | D-7 시험 직전 모드, QA, Vercel 배포 |

## 현재 git 상태
- `master` 브랜치: 초기 커밋 (data 파일 전체 포함)
- 앱 코드 아직 없음 → Week 1 작업 시작 전

## 과목별 주의사항 요약
- **국어/영어**: 트렌드분석.md 없음 → 해당 페이지 "준비 중" 처리
- **한국사**: BC 연대 = 음수 저장, 지도 GeoJSON = 공개 데이터만
- **컴일**: KaTeX formula 필드는 raw LaTeX ($$래핑 없음), SVG 애니메이션은 핵심 5~6개만
- **정보보호론**: RSA BigInt API 사용, ISMS-P 총 102개 항목

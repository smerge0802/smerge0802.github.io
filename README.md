# Seungmin Kim — personal site

AI 연구자 포트폴리오 사이트. [Eleventy(11ty)](https://www.11ty.dev/) 기반 정적 사이트로,
글은 markdown 파일 하나로 관리됩니다.

## 구조

```
src/
├── _data/
│   ├── site.json          # 사이트 제목·이름·이메일·Scholar·CV PDF 경로
│   └── cv.js              # about(홈)에 보여줄 핵심 데이터 (국제 컨퍼런스 출판 + 주요 경력)
├── _includes/
│   ├── base.njk           # 공통 레이아웃 (상단 nav, footer)
│   └── post.njk           # 글 상세 레이아웃
├── assets/
│   └── CV_ksm.pdf         # ★ 전체 CV — 상단 "cv" 메뉴가 이 PDF로 연결됨
├── css/style.css          # 디자인 전체 (CSS 변수 기반, 다크모드 자동)
├── writings/              # ★ 글은 여기에 md 파일로
│   └── 2026-06-12-writing-on-this-site.md
├── index.njk              # about = 홈 (핵심 요약본)
└── writings.njk           # 글 목록
```

## 글 쓰기

`src/writings/`에 `YYYY-MM-DD-슬러그.md` 파일을 만들면 끝입니다.

```markdown
---
title: 글 제목
description: 한 줄 요약 (선택)
---

본문은 그냥 markdown으로.
```

- 날짜는 파일명에서, URL은 슬러그에서 나옵니다 → `/writings/슬러그/`
- 코드블록 신택스 하이라이팅은 빌드 타임에 적용 (브라우저 JS 없음)
- md 파일은 템플릿 엔진을 타지 않으므로 `{{ }}` 같은 코드도 안전하게 붙여넣기 가능

## CV / about 수정

- **전체 CV**: `src/assets/CV_ksm.pdf` 파일을 교체하면 됩니다 (같은 파일명 유지).
  상단 `cv` 메뉴와 홈 하단 `Full CV (PDF)` 링크가 이 PDF로 연결됩니다.
  파일명을 바꾸려면 `src/_data/site.json`의 `author.cvPath`도 함께 수정하세요.
- **about(홈) 요약본**: `src/_data/cv.js` — 한 줄 소개(`lede`), 국제 컨퍼런스 출판
  (`publications`), 주요 경력(`experience`), 연구 과제(`projects`), 학력(`education`).
  출판 항목의 저자 문자열에 `Seungmin Kim`이 있으면 자동으로 굵게 표시됩니다.
- **이름·이메일·Scholar 링크**: `src/_data/site.json`
- **상단 연락처 아이콘**(ORCID·Scholar·LinkedIn·Email): `src/index.njk`의 `.contact-links`

## 로컬 개발

```bash
npm install
npm run serve      # http://localhost:8088
```

## 배포 (GitHub Pages)

1. GitHub에 레포 생성 후 push (`main` 브랜치)
2. 레포 Settings → Pages → Source를 **GitHub Actions**로 설정
3. 이후 push할 때마다 자동 배포

레포 이름이 `smerge0802.github.io`면 루트로, 다른 이름이면
`smerge0802.github.io/<레포명>/` 경로로 자동 배포됩니다 (워크플로우가 prefix를 알아서 처리).

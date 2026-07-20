# Detailed Research Writings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 두 연구 글을 상세한 논문체 케이스 스터디로 확장하고, 한국어 단어가 어색하게 끊기지 않는 반응형 Writing 화면을 만든다.

**Architecture:** 기존 Eleventy Markdown 글과 공통 CSS 구조를 유지한다. 연구별 수치와 설명은 각 Markdown에 두고, 재사용 가능한 callout·장 번호·줄바꿈 규칙은 `style.css`에 둔다. 새 시각자료는 외부 스크립트가 필요 없는 접근 가능한 SVG로 작성한다.

**Tech Stack:** Eleventy 3, Markdown, HTML, CSS, SVG.

## Global Constraints

- 본문 종결어미는 `~했다`, `~다`로 통일한다.
- 한국어 단어를 음절 중간에서 강제로 나누지 않는다.
- 제공된 위탁과제 보고서와 게재 논문의 수치만 사용한다.
- 원본 통화음성, 대화 내용, 화자·참가자 개인정보를 공개하지 않는다.
- 기존 흑백 중심 스타일과 Pretendard를 유지한다.
- 모든 그림에 대체 텍스트와 출처를 알 수 있는 캡션을 제공한다.

---

### Task 1: Korean line-break and long-title behavior

**Files:**
- Modify: `src/css/style.css`
- Test: generated `_site/writings/index.html` and both generated post pages

**Interfaces:**
- Consumes: existing `.post-item`, `.post-link`, `.post-title`, `.prose` selectors
- Produces: reusable Korean wrapping behavior for Writing lists and articles

- [x] **Step 1: Record the failing static checks**

Run:

```bash
! rg -n "word-break: keep-all|text-wrap: pretty|text-wrap: balance" src/css/style.css
```

Expected: PASS because the required rules are absent, confirming the current regression condition.

- [x] **Step 2: Add Korean-aware wrapping rules**

Add the following behavior in `src/css/style.css`:

```css
.post-link,
.post-title,
.prose {
  word-break: keep-all;
  overflow-wrap: break-word;
}

.post-link,
.prose p,
.prose li {
  text-wrap: pretty;
}

.post-title,
.prose h2,
.prose h3 {
  text-wrap: balance;
}
```

At `max-width: 560px`, change `.post-item` to one column with a small vertical gap so the period no longer consumes title width.

- [x] **Step 3: Verify the wrapping rules are present**

Run:

```bash
rg -n "word-break: keep-all|text-wrap: pretty|text-wrap: balance|grid-template-columns: 1fr" src/css/style.css
```

Expected: all four responsive behaviors are reported.

### Task 2: Expand the speech anonymization case study

**Files:**
- Modify: `src/writings/2023-03-31-korean-speech-anonymization.md`
- Create: `src/assets/writings/speech-anonymization/source-corpus.svg`

**Interfaces:**
- Consumes: supplied delegated-project report and KCI paper, existing research figure/card classes
- Produces: a detailed anonymization narrative and an institution-level corpus chart

- [x] **Step 1: Capture missing-content and tone failures**

Run:

```bash
rg -n "했습니다|입니다|됩니다|있습니다|CLOVA|받아쓰기|78,114|10,430|8,741" src/writings/2023-03-31-korean-speech-anonymization.md
```

Expected: formal polite endings are present while the detailed utility-evaluation and institution breakdown are incomplete.

- [x] **Step 2: Add the source corpus visual**

Create `source-corpus.svg` with three horizontal bars and exact labels:

- 창원시 — 78,114 recordings, 81.93 GB
- 한국우편사업진흥원 — 10,430 recordings, 27.95 GB
- 한국소비자원 — 8,741 recordings, 70.1 GB

The chart must state that bar length represents recording count, while capacity is printed as a separate label.

- [x] **Step 3: Rewrite and expand the article in research prose**

Keep the period and publication metadata. Reorganize the body in this order:

1. 문제와 비교 기준
2. 후보 기법 선별: AI Hub 3,000명·7,000시간, 100명×30개, Modspec 제외
3. 원천 통화 코퍼스: institution table, 9 domains, `source-corpus.svg`
4. JSON label preprocessing and 2–6 second segment criteria
5. four methods and Korean parameters: McAdams 0.80, Resampling 0.85, VTLN 0.175
6. human evaluation: 50 participants, ten per age group, 5×300 questions, 142 speakers
7. automatic evaluation: 1,677 unique clips, ECAPA-TDNN, EER
8. utility evaluation: CSR limitation and human dictation CER below 20%
9. result interpretation: VTLN best for listeners, Resampling highest EER, privacy/utility trade-off
10. limitations and next experiment: restoration attack evaluation

Every sentence must end in research prose such as `확인했다`, `사용했다`, `나타났다`, or `~다`.

- [x] **Step 4: Verify content and tone**

Run:

```bash
! rg -n "했습니다|입니다|됩니다|있습니다|보였습니다" src/writings/2023-03-31-korean-speech-anonymization.md
rg -n "78,114|10,430|8,741|CLOVA|받아쓰기|20%|1,677|Resampling.*46.39" src/writings/2023-03-31-korean-speech-anonymization.md
```

Expected: the first command returns no matches; the second reports every required detail.

### Task 3: Expand the voice synthesis detection case study

**Files:**
- Modify: `src/writings/2024-05-29-voice-synthesis-detection.md`
- Create: `src/assets/writings/voice-synthesis-detection/two-stage-experiment.svg`

**Interfaces:**
- Consumes: supplied KIISEC paper, existing Encodec-BERT and result figures
- Produces: a detailed two-stage experiment narrative and accessible experiment-flow SVG

- [x] **Step 1: Capture missing-content and tone failures**

Run:

```bash
rg -n "했습니다|입니다|됩니다|있습니다|1단계|2단계|Class 0|Class 1|ASSD" src/writings/2024-05-29-voice-synthesis-detection.md
```

Expected: polite endings are present and the two-stage design/comparison context is incomplete.

- [x] **Step 2: Add the two-stage experiment visual**

Create `two-stage-experiment.svg` with this data flow:

```text
ASVspoof 2019 LA
  → FC-layer / Transformer / ResNet-18 / ResNet2
  → select FC-layer / ResNet-18 / ResNet2
  → ASVspoof 2021 LA and ASVspoof 2021 DF
```

The visual must show that the same Encodec-BERT feature extractor feeds every classifier.

- [x] **Step 3: Rewrite and expand the article in research prose**

Reorganize the body in this order:

1. generated-speech detection problem and feature-design question
2. contrast with spectrum, waveform, and speech-pretraining approaches
3. Encodec RVQ to BERT pipeline, second quantization layer, `[2, 512]`
4. BERT-Base configuration: 12 layers, 768 hidden dimensions, 12 heads
5. balanced ASVspoof split table with bona fide, spoof, and total counts
6. two-stage classifier experiment and ASSD comparison rationale
7. metrics: class accuracy, balanced accuracy, overall accuracy, EER
8. 2019 LA, 2021 LA, and 2021 DF exact results
9. comparison against 15.64% DF EER baseline
10. class imbalance, attack-condition shift, and generalization limits

Every sentence must use research prose `~했다/~다`.

- [x] **Step 4: Verify content and tone**

Run:

```bash
! rg -n "했습니다|입니다|됩니다|있습니다|보였습니다" src/writings/2024-05-29-voice-synthesis-detection.md
rg -n "ASSD|Class 0|Class 1|2,580|10,784|11.79%|15.64%|two-stage-experiment" src/writings/2024-05-29-voice-synthesis-detection.md
```

Expected: the first command returns no matches; the second reports every required detail.

### Task 4: Add long-form research navigation and callouts

**Files:**
- Modify: `src/css/style.css`
- Modify: both research Markdown files

**Interfaces:**
- Consumes: `.prose`, `.research-table`, `.research-figure`, `.research-metrics`
- Produces: `.section-label`, `.research-callout`, `.research-callout-title`

- [x] **Step 1: Confirm the components do not yet exist**

Run:

```bash
! rg -n "section-label|research-callout" src/css/style.css src/writings/*.md
```

Expected: PASS because the selectors are absent.

- [x] **Step 2: Add restrained research components**

Implement mono section labels above major sections and bordered callouts for `자료 구성`, `핵심 관찰`, and `평가상의 한계`. Keep backgrounds on `var(--panel)`, borders on `var(--line)`, and body text at or above `0.88rem`.

- [x] **Step 3: Verify component use and mobile behavior**

Run:

```bash
rg -n "section-label|research-callout" src/css/style.css src/writings/2023-03-31-korean-speech-anonymization.md src/writings/2024-05-29-voice-synthesis-detection.md
```

Expected: both component classes appear in CSS and both articles.

### Task 5: Full build and publication verification

**Files:**
- Verify: all modified source files and generated `_site` pages

**Interfaces:**
- Consumes: Tasks 1–4
- Produces: deployable Eleventy output

- [x] **Step 1: Build the complete site**

Run:

```bash
npm run build
```

Expected: Eleventy writes 6 HTML files with no errors.

- [x] **Step 2: Check generated copy, figures, and raw Markdown artifacts**

Run:

```bash
! rg -n "\*\*|했습니다|입니다|됩니다|있습니다" _site/writings/korean-speech-anonymization/index.html _site/writings/voice-synthesis-detection/index.html
rg -n "source-corpus.svg|two-stage-experiment.svg|CLOVA|ASSD|46.39%|11.79%" _site/writings/korean-speech-anonymization/index.html _site/writings/voice-synthesis-detection/index.html
```

Expected: no raw Markdown or polite endings; every new figure and required result appears.

- [x] **Step 3: Check repository integrity**

Run:

```bash
git diff --check
git status --short
```

Expected: no whitespace errors and only the planned research content, SVG, CSS, spec, and plan files are changed.

- [ ] **Step 4: Commit and push**

```bash
git add src/css/style.css src/writings/2023-03-31-korean-speech-anonymization.md src/writings/2024-05-29-voice-synthesis-detection.md src/assets/writings/speech-anonymization/source-corpus.svg src/assets/writings/voice-synthesis-detection/two-stage-experiment.svg docs/superpowers/specs/2026-07-20-detailed-research-writings-design.md docs/superpowers/plans/2026-07-20-detailed-research-writings.md
git commit -m "Expand detailed research case studies"
git push origin main
```

Expected: the new commit is pushed to `origin/main`.

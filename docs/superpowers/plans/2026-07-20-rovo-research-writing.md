# RoVo Research Writing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a detailed 2024–2025 RoVo research case study based on the supplied current manuscript and supplementary material, with optimized paper figures, explicit under-review status, and a separate arXiv v1 link.

**Architecture:** The article is a single Eleventy Markdown entry that reuses the existing research-writing components in `style.css`. Six optimized image assets live under a dedicated `rovo` folder. The existing writing checker becomes the regression boundary for article structure, tone, version disclosure, and required assets.

**Tech Stack:** Eleventy 3, Markdown/Nunjucks, HTML/CSS, Node.js assertions, Poppler `pdfimages`, ImageMagick, headless Chrome

## Global Constraints

- Use the supplied current manuscript and supplementary PDF as the factual source for the article body.
- Present the research period as `2024 – 2025` and the current status as `Manuscript under review`.
- Present arXiv:2505.12686 only as the May 2025 public v1; do not imply that it contains every current experiment.
- Do not expose confidential venue, submission, or anonymous-review metadata in the repository or generated HTML.
- Use Korean paper style `~했다`, `~다`; reject `~습니다`, `~합니다`, `~입니다`, `~됩니다`, and `~있습니다`.
- Every H2 must have a sequential English section label immediately before it.
- Use the existing monochrome/Pretendard research-writing visual system; add no independent RoVo theme.
- Every figure needs Korean alt text and a caption identifying the current manuscript or supplementary material as its source.
- Do not publish the supplied manuscript PDFs or audio samples.

---

## File Map

- Create `src/writings/2025-05-19-rovo-robust-voice-protection.md`: complete Korean RoVo case study and manuscript/preprint links.
- Create `src/assets/writings/rovo/threat-overview.png`: current manuscript Figure 1.
- Create `src/assets/writings/rovo/rovo-framework.png`: current manuscript Figure 2.
- Create `src/assets/writings/rovo/spectrogram-comparison.png`: current manuscript Figure 3.
- Create `src/assets/writings/rovo/alternating-optimization.png`: current manuscript Figure 4.
- Create `src/assets/writings/rovo/target-gender-embedding.png`: supplementary Figure 1 panels combined horizontally.
- Create `src/assets/writings/rovo/user-study.png`: current manuscript Figure 5.
- Modify `scripts/check-research-writings.mjs`: include RoVo and enforce its version/status/assets/privacy invariants.
- Modify `docs/superpowers/plans/2026-07-20-rovo-research-writing.md`: check off completed steps during execution.
- Generated only, do not commit: `_site/writings/rovo-robust-voice-protection/index.html`.

---

### Task 1: Add a Failing RoVo Content Contract

**Files:**
- Modify: `scripts/check-research-writings.mjs`
- Test: `scripts/check-research-writings.mjs`

**Interfaces:**
- Consumes: repository paths resolved from `import.meta.url`.
- Produces: exit code 0 only when all research writings and RoVo-specific public-content invariants hold.

- [ ] **Step 1: Extend the checker with RoVo article and asset requirements**

Add `existsSync` to the Node import and define the RoVo path and asset list:

```js
import { existsSync, readFileSync } from "node:fs";

const rovoPath = "src/writings/2025-05-19-rovo-robust-voice-protection.md";
const articlePaths = [
  "src/writings/2023-03-31-korean-speech-anonymization.md",
  "src/writings/2024-05-29-voice-synthesis-detection.md",
  rovoPath,
];

const rovoAssets = [
  "src/assets/writings/rovo/threat-overview.png",
  "src/assets/writings/rovo/rovo-framework.png",
  "src/assets/writings/rovo/spectrogram-comparison.png",
  "src/assets/writings/rovo/alternating-optimization.png",
  "src/assets/writings/rovo/target-gender-embedding.png",
];
```

Before each article read, assert that the file exists. After the common article loop, add exact RoVo assertions:

```js
assert.equal(existsSync(new URL(rovoPath, root)), true, `${rovoPath}가 필요하다.`);
const rovo = readFileSync(new URL(rovoPath, root), "utf8");
assert.match(rovo, /period:\s*"2024 – 2025"/);
assert.match(rovo, /Manuscript under review/);
assert.match(rovo, /https:\/\/arxiv\.org\/abs\/2505\.12686/);
assert.match(rovo, /Public preprint · arXiv v1 · May 2025/);
assert.equal((rovo.match(/class="section-label"/g) ?? []).length, 13);

for (const assetPath of rovoAssets) {
  assert.equal(existsSync(new URL(assetPath, root)), true, `${assetPath}가 필요하다.`);
  assert.match(rovo, new RegExp(assetPath.replace("src", "").replaceAll("/", "\\/")));
}
```

- [ ] **Step 2: Run the checker and verify RED**

Run: `npm run check:writings`

Expected: FAIL with `src/writings/2025-05-19-rovo-robust-voice-protection.md가 필요하다.`

- [ ] **Step 3: Commit the failing contract**

```bash
git add scripts/check-research-writings.mjs
git commit -m "Test RoVo research writing contract"
```

---

### Task 2: Extract and Optimize the Six Paper Figures

**Files:**
- Create: `src/assets/writings/rovo/threat-overview.png`
- Create: `src/assets/writings/rovo/rovo-framework.png`
- Create: `src/assets/writings/rovo/spectrogram-comparison.png`
- Create: `src/assets/writings/rovo/alternating-optimization.png`
- Create: `src/assets/writings/rovo/target-gender-embedding.png`
- Create: `src/assets/writings/rovo/user-study.png`

**Interfaces:**
- Consumes: supplied current manuscript and supplementary PDFs.
- Produces: six display-ready PNGs referenced by the article using `/assets/writings/rovo/<name>.png`.

- [ ] **Step 1: Extract raster objects from both PDFs into temporary directories**

Run:

```bash
mkdir -p /tmp/rovo-main-images /tmp/rovo-supp-images src/assets/writings/rovo
pdfimages -png "/home/seungmin/.codex/attachments/1a8c7a68-7120-4e4e-9ebe-1884567aa0e9/RoVo_Robust Voice Protection.pdf" /tmp/rovo-main-images/img
pdfimages -png "/home/seungmin/.codex/attachments/7bf5f8db-890e-4a07-b44f-80736b322484/Supplementary Materials  RoVo_Robust Voice Protection .pdf" /tmp/rovo-supp-images/img
```

Expected source mapping:

- main `img-000.png`: threat overview
- main `img-002.png`: RoVo framework
- main `img-004.png`: spectrogram comparison
- main `img-006.png`: alternating optimization
- main `img-008.png` with `img-009.png` soft mask: user study
- supplementary `img-000.png` and `img-002.png`: target-gender embedding panels

- [ ] **Step 2: Resize and optimize figures for the site**

Use `magick` if available, otherwise use `convert` with the same arguments:

```bash
convert /tmp/rovo-main-images/img-000.png -resize '1800x1800>' -strip -define png:compression-level=9 src/assets/writings/rovo/threat-overview.png
convert /tmp/rovo-main-images/img-002.png -resize '1800x1800>' -strip -define png:compression-level=9 src/assets/writings/rovo/rovo-framework.png
convert /tmp/rovo-main-images/img-004.png -resize '1800x1800>' -strip -define png:compression-level=9 src/assets/writings/rovo/spectrogram-comparison.png
convert /tmp/rovo-main-images/img-006.png -resize '1600x1600>' -strip -define png:compression-level=9 src/assets/writings/rovo/alternating-optimization.png
convert /tmp/rovo-main-images/img-008.png /tmp/rovo-main-images/img-009.png -alpha off -compose CopyOpacity -composite -background white -alpha remove -alpha off -resize '1800x1800>' -strip -define png:compression-level=9 src/assets/writings/rovo/user-study.png
convert /tmp/rovo-supp-images/img-000.png /tmp/rovo-supp-images/img-002.png +append -resize '1800x1800>' -strip -define png:compression-level=9 src/assets/writings/rovo/target-gender-embedding.png
```

- [ ] **Step 3: Verify image dimensions and appearance**

Run: `identify src/assets/writings/rovo/*.png`

Expected: all six files exist, no width exceeds 1800 px, and every file has non-zero dimensions.

Open every image with the image viewer. Confirm that the framework labels, spectrogram labels, optimization axes, and both t-SNE legends are readable and no alpha mask is missing.

- [ ] **Step 4: Commit figure assets**

```bash
git add src/assets/writings/rovo
git commit -m "Add RoVo research figures"
```

---

### Task 3: Write the Detailed RoVo Case Study

**Files:**
- Create: `src/writings/2025-05-19-rovo-robust-voice-protection.md`
- Test: `scripts/check-research-writings.mjs`

**Interfaces:**
- Consumes: the six `/assets/writings/rovo/*.png` files and existing CSS classes `project-meta`, `section-label`, `research-callout`, `research-metrics`, `research-table`, `research-figure`, and `publication-card`.
- Produces: `/writings/rovo-robust-voice-protection/` and a `2024 – 2025` entry on `/writings/`.

- [ ] **Step 1: Create front matter, introduction, and research metadata**

Use this exact front matter and metadata values:

```markdown
---
title: "RoVo: 잠재공간 교란으로 음성 복제 방어를 견고하게 만들기"
description: "신경 오디오 코덱의 잠재공간에서 적대적 교란을 최적화하고 약·중·강 적응형 공격과 black-box 조건에서 검증한 2024–2025 음성 보호 연구."
lang: ko
period: "2024 – 2025"
---
```

The opening must distinguish proactive protection from post-generation detection, state that the research ran from 2024 to 2025, and disclose that the expanded manuscript is under review. Add:

```html
<div class="project-meta" aria-label="연구 개요">
  <div><span>Period</span><strong>2024 – 2025</strong></div>
  <div><span>Task</span><strong>Proactive voice protection</strong></div>
  <div><span>Status</span><strong>Manuscript under review</strong></div>
</div>
```

- [ ] **Step 2: Write sections 01–05 on question, threat model, latent space, framework, and PerC-AL**

Use these exact labels and H2 headings:

```markdown
<p class="section-label">01 · Research question</p>
## 음성 복제 전에 막는 방어가 왜 필요한가
<p class="section-label">02 · Threat model</p>
## 공격자의 능력을 약·중·강 세 단계로 나눴다
<p class="section-label">03 · Why latent space</p>
## 신호에 노이즈를 더하는 대신 codec embedding을 바꿨다
<p class="section-label">04 · RoVo framework</p>
## Bark와 EnCodec 표현 위에서 보호 음성을 재구성했다
<p class="section-label">05 · Optimization</p>
## 방어력과 음질을 번갈아 최적화한 PerC-AL
```

Cover the exact concepts from the design: proactive versus reactive defense; ASV-based failure definition; weak/moderate/strong and black-box attacker capability; `z = E(x)` and `x_rovo = D(z + δ_latent)`; signal-domain versus latent perturbation; Bark clean reconstruction MOS 4.53 and cosine similarity 0.96; Target-based Loss; SNR Loss; threshold-based alternation; opposite-gender target.

Insert figures in this order:

1. `threat-overview.png` after the research question.
2. `spectrogram-comparison.png` after latent-space explanation.
3. `rovo-framework.png` after the pipeline explanation.
4. `alternating-optimization.png` and `target-gender-embedding.png` in the optimization section.

- [ ] **Step 3: Write sections 06–07 on data and evaluation**

Use:

```markdown
<p class="section-label">06 · Dataset</p>
## VCTK에서 임곗값을 고르고 여섯 코퍼스로 일반화를 확인했다
<p class="section-label">07 · Evaluation protocol</p>
## 복제 모델, 검증 모델, 품질 지표를 분리했다
```

Add a dataset table with these rows:

| Role | Corpus | Sampling |
| --- | --- | --- |
| Threshold selection | VCTK | 109 speakers × 10 utterances |
| Main evaluation | FST, MCV, CSNED, CSUKIED, LibriSpeech | 70 speakers, 700 utterances total |

State 10–20 speakers per non-VCTK corpus, 10 utterances per speaker, 5–10 seconds per utterance, and no dataset-specific threshold retuning. Add separate callout lists for cloning models, verification models, baselines, and DSR/MOS/WER definitions.

- [ ] **Step 4: Write sections 08–11 with exact result conditions**

Use:

```markdown
<p class="section-label">08 · Base and weak attacks</p>
## 재튜닝 없이 평균 DSR을 크게 높였다
<p class="section-label">09 · Moderate adaptive attacks</p>
## 음성 향상 뒤에도 signal-domain baseline보다 더 많은 방어력을 남겼다
<p class="section-label">10 · Transfer and strong attacks</p>
## 보지 못한 복제 모델과 방어 구조를 아는 공격까지 평가했다
<p class="section-label">11 · Commercial verification</p>
## 상용 화자 검증 API에서도 결과를 확인했다
```

Required result blocks:

- VCTK RAW 9.6% → RoVo 82.5% average DSR.
- Moderate attacks: RoVo 82.8% average DSR and −5.2%p; AttackVC −30.8%p, AntiFake −35.5%p, VoiceGuard −49.7%p.
- RoVo unattacked MOS 2.53 → 2.68 after enhancement.
- Black-box ensemble: 81.6% overall DSR, 89.0% weak attacks, 77.3% stronger attacks, MOS 2.83 ± 0.46.
- Strong white-box reconstruction: MOS 3.38–3.76, verification acceptance 15.3% average, DSR 82.1% average.
- LLaSE-G1: 72.9% overall average DSR, 82.6% ECAPA-TDNN average.
- MS Azure RAW→RoVo: SV2TTS 68.1→99.8, YourTTS 18.0→99.5, AVC 52.3→98.6.
- MS Azure after enhancement: RoVo average 99.0% with 0.3%p average change; AntiFake average 94.1% with −5.6%p.

Use one `research-metrics` block for headline values and compact HTML tables for baseline drop, black-box summary, and Azure results. Do not copy the 36-condition paper table verbatim.

- [ ] **Step 5: Write sections 12–13 on limitations and versions**

Use:

```markdown
<p class="section-label">12 · Trade-off and limitations</p>
## 제거하기 어려운 보호와 지각 품질 사이에 trade-off가 남았다
<p class="section-label">13 · Manuscript and preprint</p>
## 심사 중인 확장 원고와 공개 arXiv v1
```

The limitations must cover perceptual degradation, enhancement-induced damage not being a usability win, evaluated-language/model/threshold scope, runtime and real-time deployment, and possible changes during review.

End with one publication card containing both statuses:

```html
<div class="publication-card">
  <p class="publication-card-kicker">Manuscript under review · Expanded experiments</p>
  <p class="publication-card-title">RoVo: Robust Voice Protection Against Voice Cloning Attacks via Embedding-Level Adversarial Perturbations</p>
  <p class="publication-card-meta">Current manuscript · Results may change during peer review</p>
  <p class="publication-card-kicker">Public preprint · arXiv v1 · May 2025</p>
  <p class="publication-card-title">RoVo: Robust Voice Protection Against Unauthorized Speech Synthesis with Embedding-Level Perturbations</p>
  <p class="publication-card-meta">Seungmin Kim, Sohee Park, Donghyun Kim, Jisu Lee, Daeseon Choi</p>
  <p class="publication-card-links"><a href="https://arxiv.org/abs/2505.12686">arXiv에서 공개본 보기</a></p>
</div>
```

- [ ] **Step 6: Run the content contract and verify GREEN**

Run: `npm run check:writings`

Expected: `Research writing typography and tone checks passed.`

- [ ] **Step 7: Commit the article**

```bash
git add src/writings/2025-05-19-rovo-robust-voice-protection.md scripts/check-research-writings.mjs
git commit -m "Add detailed RoVo research case study"
```

---

### Task 4: Build and Render-Verify the New Page

**Files:**
- Verify: `_site/writings/rovo-robust-voice-protection/index.html`
- Verify: `_site/writings/index.html`
- Modify only if evidence requires it: `src/css/style.css`

**Interfaces:**
- Consumes: article Markdown, common CSS, six RoVo image assets.
- Produces: responsive desktop/mobile HTML with no broken figures, malformed tables, or review-identifying text.

- [ ] **Step 1: Build the site**

Run: `npm run build`

Expected: Eleventy writes `/writings/rovo-robust-voice-protection/index.html` and exits 0.

- [ ] **Step 2: Verify generated content and privacy constraints**

Run:

```bash
rg -n "RoVo|2024 – 2025|Manuscript under review|2505.12686" _site/writings/rovo-robust-voice-protection/index.html _site/writings/index.html
rg -n "습니다|합니다|입니다|됩니다|있습니다" _site/writings/rovo-robust-voice-protection/index.html
```

Expected: the first command finds all required public labels and links; the second command returns no matches.

- [ ] **Step 3: Render desktop and mobile screenshots**

Serve `_site` locally and capture at least:

- Desktop: 1440 × 2200
- Mobile: 390 × 1200

Use reduced motion or wait for the page entrance animation. Inspect the introduction, section labels, wide framework figure, result tables, captions, and publication card. Confirm no Korean word is split mid-syllable and no figure/table exceeds the viewport.

- [ ] **Step 4: Apply only evidence-driven CSS adjustments if needed**

If a wide figure is unreadable, use the existing `.research-figure` and table overflow patterns before adding any new selector. If a new selector is unavoidable, scope it under `.prose` and test both existing research pages for regressions.

- [ ] **Step 5: Run final verification**

Run separately:

- `npm run check:writings`
- `npm run build`
- `git diff --check`
- `git status --short`

Expected: tests/build/diff check exit 0; status contains only intentional plan checkbox or evidence-driven CSS changes.

- [ ] **Step 6: Commit final rendering adjustments**

If no CSS or content adjustment is required, skip this commit. Otherwise:

```bash
git add src/css/style.css src/writings/2025-05-19-rovo-robust-voice-protection.md
git commit -m "Polish RoVo writing layout"
```

---

### Task 5: Publish and Confirm GitHub Pages

**Files:**
- No new source files.

**Interfaces:**
- Consumes: verified commits on `main`.
- Produces: public `/writings/rovo-robust-voice-protection/` page.

- [ ] **Step 1: Push main**

Run: `git push origin main`

Expected: remote `main` advances to the final local commit.

- [ ] **Step 2: Confirm deployed markers**

Read the public page and verify that it contains:

- `Manuscript under review`
- `2024 – 2025`
- `13 · Manuscript and preprint`
- `https://arxiv.org/abs/2505.12686`

Also request all six public image URLs and confirm HTTP success.

- [ ] **Step 3: Confirm a clean synchronized repository**

Run: `git status --short`, `git rev-parse --short HEAD`, and `git rev-parse --short origin/main`.

Expected: empty status and matching commit IDs.

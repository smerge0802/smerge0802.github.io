# NaVo Research Writing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a detailed, source-backed 2026 NaVo research article with three paper figures and an accepted-manuscript link to the portfolio.

**Architecture:** Keep the established Eleventy Markdown article pattern and reuse the existing research typography components. Store NaVo-specific media under one asset directory, extend the writing regression check before creating the article, and let the existing posts collection place the dated article at the top of 2026.

**Tech Stack:** Eleventy 3, Nunjucks, Markdown, HTML research components, Node.js assertions, Poppler/ImageMagick asset extraction

## Global Constraints

- Source all scientific claims and numbers from `NaVo.pdf`.
- Use `~했다` and `~다` Korean prose; do not use polite `~습니다` endings.
- Show `period: "2026"` and `Interspeech 2026 · Accepted`.
- Preserve the exact product capitalization `NaVo`.
- Include three paper figures, a downloadable accepted manuscript, responsive result tables, and the equal-contribution note.

---

### Task 1: Add a failing NaVo article contract

**Files:**
- Modify: `scripts/check-research-writings.mjs`

**Interfaces:**
- Consumes: existing `articlePaths` tone and heading checks
- Produces: assertions for the NaVo page and its four assets

- [ ] **Step 1: Write the failing test**

Add `navoPath`, append it to `articlePaths`, define the framework, embedding, adaptive-attack and PDF asset paths, then assert the period, accepted venue, section count, dataset split, ElevenLabs result, equal-contribution note and all asset references.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run check:writings`
Expected: FAIL because `src/writings/2026-06-15-navo-natural-voice-protection.md` does not exist.

### Task 2: Prepare manuscript assets

**Files:**
- Create: `src/assets/writings/navo/navo-framework.png`
- Create: `src/assets/writings/navo/gender-embedding.png`
- Create: `src/assets/writings/navo/adaptive-attacks.png`
- Create: `src/assets/writings/navo/navo-accepted-manuscript.pdf`

**Interfaces:**
- Consumes: Figures 1–3 and the accepted PDF supplied by the user
- Produces: stable `/assets/writings/navo/` URLs referenced by the article

- [ ] **Step 1: Render and crop the figures**

Render PDF pages 2 and 4 at 300 DPI, crop each figure with its caption excluded, trim whitespace, and optimize each PNG without changing scientific content.

- [ ] **Step 2: Copy the accepted manuscript**

Copy `NaVo.pdf` to `src/assets/writings/navo/navo-accepted-manuscript.pdf`.

- [ ] **Step 3: Inspect the outputs**

Run: `file src/assets/writings/navo/* && identify src/assets/writings/navo/*.png`
Expected: three readable PNG files and one six-page PDF.

### Task 3: Write the detailed NaVo case study

**Files:**
- Create: `src/writings/2026-06-15-navo-natural-voice-protection.md`

**Interfaces:**
- Consumes: article conventions and NaVo assets
- Produces: `/writings/navo-natural-voice-protection/`

- [ ] **Step 1: Implement the article**

Write the approved 13-section structure: motivation, UAA, framework, modular LoRA, speaker distributions, objectives, inference, data, evaluation, overall results, white-box, black-box/adaptive attacks, limitations/publication. Include `project-meta`, metrics, callouts, responsive tables, figures, author metadata, and the accepted PDF link.

- [ ] **Step 2: Run the regression check**

Run: `npm run check:writings`
Expected: PASS with `Research writing typography and tone checks passed.`

### Task 4: Build, review and publish

**Files:**
- Verify: `_site/writings/index.html`
- Verify: `_site/writings/navo-natural-voice-protection/index.html`

**Interfaces:**
- Consumes: completed article and assets
- Produces: committed and deployed GitHub Pages content

- [ ] **Step 1: Build and inspect generated HTML**

Run: `npm run build`
Expected: Eleventy writes the NaVo route and copies the four NaVo assets.

- [ ] **Step 2: Check generated content and layout**

Confirm the Writings list shows `2026`, the NaVo title and period; render desktop and mobile screenshots; check that figure links, PDF link, tables and title wrapping are readable.

- [ ] **Step 3: Verify the patch**

Run: `git diff --check && npm run check:writings && npm run build`
Expected: all commands exit 0.

- [ ] **Step 4: Commit and push**

Stage only the NaVo plan, checker, article and four assets. Commit with `Add detailed NaVo research writing`, push `main`, then verify the live list and article URLs.

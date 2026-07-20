# Expanded Korean Speech Anonymization Case Study Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the Korean speech anonymization Writing page into a detailed, readable research case study with original visual summaries and direct paper links.

**Architecture:** Keep the article as a single Markdown writing page. Add one original SVG result chart under the existing research asset folder, then use scoped prose CSS for the evidence table and publication card so the global post layout remains unchanged.

**Tech Stack:** Eleventy 3, Markdown, HTML, CSS, SVG.

## Global Constraints

- Use values verified in the supplied report and paper: 50 listeners, 142 speakers, 3,000 listening-test samples, VTLN/McAdams/Resampling/Pitch similarity values, and EER interpretation.
- Do not publish raw speech, participant identity, classroom photographs, or third-party diagrams.
- Include both the DOI and official KCI article page.

---

### Task 1: Create the result visual

**Files:**
- Create: `src/assets/writings/speech-anonymization/method-comparison.svg`

- [x] Write a file-existence check for the new visual and run it before creating the file; it must fail because the asset is absent.
- [x] Create an accessible SVG bar chart for human-rated original-to-anonymized similarity: VTLN 1.52, Pitch 1.99, McAdams 2.05, Resampling 2.49, with the 0–5 scale and the lower-is-better annotation.
- [x] Re-run the file-existence check and confirm the asset is non-empty.

### Task 2: Expand the case-study narrative

**Files:**
- Modify: `src/writings/2023-03-31-korean-speech-anonymization.md`

- [x] Add a research-context section explaining why pitch-shift reversal is insufficient for identity protection.
- [x] Add data, method, and parameter details: preprocessed single-speaker Korean call-speech segments; Pitch, McAdams (0.8), Resampling (0.85), and VTLN (0.175).
- [x] Add an evaluation-protocol section: 50 blind listeners, 142 speakers, 3,000 listening-test samples, ECAPA-TDNN EER, and CER with a Korean ASR system.
- [x] Add the SVG comparison figure and a compact method-result table.
- [x] Replace the single publication sentence with a publication card containing direct DOI and official KCI links.

### Task 3: Style and verify

**Files:**
- Modify: `src/css/style.css`

- [x] Add scoped styles for `.research-table` and `.publication-card`, including mobile behavior.
- [x] Run `npm run build` and confirm the generated writing page contains both external links and all three figure paths.
- [x] Run `git diff --check` and ensure only the expanded case-study files and planning notes are changed before commit.

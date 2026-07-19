# Korean Speech Anonymization Case Study Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a concise Korean research case study for the 2022–2023 Korean speech anonymization delegated project.

**Architecture:** A single Markdown writing page carries the research narrative and links to two local visual assets. Existing Eleventy collections discover the post automatically; scoped CSS styles the project metadata, metric cards, and figures without changing the global layout.

**Tech Stack:** Eleventy 3, Markdown, Nunjucks layout, CSS, SVG.

## Global Constraints

- Use only the verified research facts in the design document.
- Publish no raw speech, participant information, personal photographs, or third-party paper figures.
- Keep the article concise and Korean-first.

---

### Task 1: Add research visuals

**Files:**
- Create: `src/assets/writings/speech-anonymization/evaluation-flow.svg`
- Create: `src/assets/writings/speech-anonymization/human-test-interface.png`

- [x] Create an SVG with the sequence `Korean call speech → anonymization methods → human evaluation + EER`.
- [x] Copy the project-owned human-test screenshot from the supplied report and give it an explanatory filename.
- [x] Verify both files exist and are non-empty with `find src/assets/writings/speech-anonymization -type f -size +0c`.

### Task 2: Add the Writing page

**Files:**
- Create: `src/writings/2023-03-korean-speech-anonymization.md`

- [x] Add front matter with the Korean title and a one-sentence description.
- [x] Write the six sections defined in the design document, including project metadata, contribution bullets, evaluation explanation, results table, figures, and the KCI DOI link.
- [x] Use only relative site asset paths beginning with `/assets/writings/speech-anonymization/`.

### Task 3: Add scoped presentation styles and verify

**Files:**
- Modify: `src/css/style.css`

- [x] Add `.project-meta`, `.research-metrics`, and `.research-figure` styles under the existing prose section.
- [x] Run `npm run build` and confirm the generated article, asset paths, and KCI link with `rg`.
- [x] Run `git diff --check` before committing.

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const rovoPath = "src/writings/2025-05-19-rovo-robust-voice-protection.md";
const rocoPath = "src/writings/2026-05-03-roco-robust-code.md";
const articlePaths = [
  "src/writings/2023-03-31-korean-speech-anonymization.md",
  "src/writings/2024-05-29-voice-synthesis-detection.md",
  rovoPath,
  rocoPath,
];

const rovoAssets = [
  "src/assets/writings/rovo/threat-overview.png",
  "src/assets/writings/rovo/rovo-framework.png",
  "src/assets/writings/rovo/spectrogram-comparison.png",
  "src/assets/writings/rovo/alternating-optimization.png",
  "src/assets/writings/rovo/target-gender-embedding.png",
  "src/assets/writings/rovo/user-study.png",
];

const rocoAssets = [
  "src/assets/writings/roco/roco-framework.png",
  "src/assets/writings/roco/generation-time.svg",
  "src/assets/writings/roco/icassp-presentation.jpg",
];

const politeEnding = /(?:습니다|합니다|입니다|됩니다|있습니다|보였습니다|였습니다|겠습니다)/;

for (const articlePath of articlePaths) {
  assert.equal(existsSync(new URL(articlePath, root)), true, `${articlePath}가 필요하다.`);
  const article = readFileSync(new URL(articlePath, root), "utf8");
  assert.equal(
    politeEnding.test(article),
    false,
    `${articlePath}에 ~습니다/~합니다 문체가 남아 있다.`,
  );

  const sectionLabels = article.match(/class="section-label"/g) ?? [];
  const levelTwoHeadings = article.match(/^##\s+/gm) ?? [];
  assert.equal(
    sectionLabels.length,
    levelTwoHeadings.length,
    `${articlePath}의 모든 H2 앞에 장 라벨이 있어야 한다.`,
  );
}

const rovo = readFileSync(new URL(rovoPath, root), "utf8");
assert.match(rovo, /period:\s*"2024 – 2025"/);
assert.match(rovo, /Manuscript under review/);
assert.match(rovo, /https:\/\/arxiv\.org\/abs\/2505\.12686/);
assert.match(rovo, /Public preprint · arXiv v1 · May 2025/);
assert.equal((rovo.match(/class="section-label"/g) ?? []).length, 13);
assert.equal((rovo.match(/class="research-figure-scroll"/g) ?? []).length, 2);

for (const assetPath of rovoAssets) {
  assert.equal(existsSync(new URL(assetPath, root)), true, `${assetPath}가 필요하다.`);
  assert.match(rovo, new RegExp(assetPath.replace("src", "").replaceAll("/", "\\/")));
}

const roco = readFileSync(new URL(rocoPath, root), "utf8");
assert.match(roco, /period:\s*"2025 – 2026"/);
assert.match(roco, /RoVO/);
assert.match(roco, /ICASSP 2026/);
assert.match(roco, /10\.1109\/ICASSP55912\.2026\.11462176/);
assert.match(roco, /https:\/\/smerge0802\.github\.io\/RoCo\//);
assert.match(roco, /\/writings\/rovo-robust-voice-protection\//);
assert.equal((roco.match(/class="section-label"/g) ?? []).length, 11);

for (const assetPath of rocoAssets) {
  assert.equal(existsSync(new URL(assetPath, root)), true, `${assetPath}가 필요하다.`);
  assert.match(roco, new RegExp(assetPath.replace("src", "").replaceAll("/", "\\/")));
}

const css = readFileSync(new URL("src/css/style.css", root), "utf8");
assert.match(css, /\.prose\s*\{[^}]*font-size:\s*1\.02rem;[^}]*line-height:\s*1\.82;/s);
assert.match(css, /\.prose h2\s*\{[^}]*font-size:\s*1\.5rem;[^}]*font-weight:\s*650;/s);
assert.match(css, /\.prose h3\s*\{[^}]*font-size:\s*1\.12rem;[^}]*font-weight:\s*650;[^}]*font-style:\s*normal;/s);
assert.match(css, /\.prose \.section-label\s*\{[^}]*font-size:\s*0\.74rem;[^}]*font-weight:\s*650;[^}]*line-height:\s*1\.3;/s);
assert.match(css, /\.prose \.section-label \+ h2\s*\{[^}]*margin-top:\s*0\.9rem;/s);
assert.match(css, /\.research-figure-comparison \.research-figure-scroll img\s*\{[^}]*width:\s*46rem;[^}]*max-width:\s*none;/s);

const base = readFileSync(new URL("src/_includes/base.njk", root), "utf8");
assert.match(base, /href="\/css\/style\.css\?v=20260720-typography"/);

console.log("Research writing typography and tone checks passed.");

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const articlePaths = [
  "src/writings/2023-03-31-korean-speech-anonymization.md",
  "src/writings/2024-05-29-voice-synthesis-detection.md",
];

const politeEnding = /(?:습니다|합니다|입니다|됩니다|있습니다|보였습니다|였습니다|겠습니다)/;

for (const articlePath of articlePaths) {
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

const css = readFileSync(new URL("src/css/style.css", root), "utf8");
assert.match(css, /\.prose\s*\{[^}]*font-size:\s*1\.02rem;[^}]*line-height:\s*1\.82;/s);
assert.match(css, /\.prose h2\s*\{[^}]*font-size:\s*1\.5rem;[^}]*font-weight:\s*650;/s);
assert.match(css, /\.prose h3\s*\{[^}]*font-size:\s*1\.12rem;[^}]*font-weight:\s*650;[^}]*font-style:\s*normal;/s);
assert.match(css, /\.prose \.section-label\s*\{[^}]*font-size:\s*0\.74rem;[^}]*font-weight:\s*650;[^}]*line-height:\s*1\.3;/s);
assert.match(css, /\.prose \.section-label \+ h2\s*\{[^}]*margin-top:\s*0\.9rem;/s);

const base = readFileSync(new URL("src/_includes/base.njk", root), "utf8");
assert.match(base, /href="\/css\/style\.css\?v=20260720-typography"/);

console.log("Research writing typography and tone checks passed.");

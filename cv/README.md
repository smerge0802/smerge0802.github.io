# Editable CV source

`CV_ksm.tex` is the editable LaTeX source for the three-page website CV at
`../src/assets/CV_ksm.pdf`. It was reconstructed from the September 2026 PDF,
using Computer Modern fonts, monochrome moderncv banking style, and matching
section rules. Some line and page breaks differ from that original;
publication titles and authors stay together when edited.

The November 2026 update adds Korean patent application **10-2026-0220251**,
filed on **2026-11-06**, as pending. Its English title is a CV translation of
the Korean filing title. All inventors are retained, with Seungmin Kim listed
first as requested for the CV display.

## Edit and compile

Open `CV_ksm.tex` in VS Code or upload it to Overleaf. Choose **pdfLaTeX**.
The source is self-contained and does not require image files or a bibliography.
It uses `moderncv`, `fontawesome6`, `geometry`, `microtype`, and `enumitem`,
which are available in the tested TeX Live 2026 installation on this Mac.

From this directory, run:

```sh
latexmk -pdf -interaction=nonstopmode -halt-on-error -outdir=build CV_ksm.tex
```

The result is `build/CV_ksm.pdf`. Build intermediates are ignored by Git.

- Personal details: `\name`, `\phone`, `\email`, `\social` near the top.
- Education and experience: edit the corresponding `\cventry` entries.
- Publications, patents, software: edit `\record{date}{title}{details}{authors}{note}`.
- Projects: edit `\project{date}{title}{\item ...}`.
- `\me` formats the CV owner's name consistently in author lists.

Apart from the new patent entry, the source preserves the September 2026 wording,
including **M.S. in Software**, the submission statuses, and the original
`Unviersal` / `Conling` spellings in the SUPER title. These are not independently
verified current facts. Review these fields when making the next content update.

## Update the website CV

After compiling and reviewing the PDF, replace `../src/assets/CV_ksm.pdf` with
`build/CV_ksm.pdf` and commit the source and PDF together. The website PDF was
updated alongside the source for the November 2026 patent addition. Update the
version query in `../src/_data/site.json` when publishing a new PDF so that
website visitors receive the latest version.

The website summary in `../src/_data/cv.js` is maintained separately; editing
that file does not update this CV or its PDF. There is no automatic CV build
configured in GitHub Actions.

# Editable CV source

`CV_ksm.tex` is an editable LaTeX reconstruction of the three-page PDF at
`../src/assets/CV_ksm.pdf`. It is newly written source, not the recovered original.
The original text, Computer Modern fonts, monochrome moderncv banking style,
section rules, and overall layout have been reproduced. Some line breaks and
page breaks differ; publication titles and authors stay together when edited.

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

This reconstruction intentionally preserves the September 2026 PDF's wording,
including **M.S. in Software**, the submission statuses, and the original
`Unviersal` / `Conling` spellings in the SUPER title. These are not independently
verified current facts. Review these fields when making the next content update.

## Update the website CV

After compiling and reviewing the PDF, replace `../src/assets/CV_ksm.pdf` with
`build/CV_ksm.pdf` and commit the source and PDF together. The existing website
CV has not been replaced as part of this source reconstruction.

The website summary in `../src/_data/cv.js` is maintained separately; editing
that file does not update this CV or its PDF. There is no automatic CV build
configured in GitHub Actions.

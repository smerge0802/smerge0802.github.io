---
title: Writing on this site
description: How posts work here — drop a markdown file in src/writings/ and push.
hideFromWritings: true
---

This post doubles as documentation. Every piece of writing on this site is a single
markdown file in `src/writings/`. To publish something new:

1. Create a file named `YYYY-MM-DD-some-slug.md`
2. Add two lines of front matter — `title` and (optionally) `description`
3. Write markdown. Push. Done.

The date comes from the filename, the URL comes from the slug
(`2026-06-12-writing-on-this-site.md` → `/writings/writing-on-this-site/`).

## What markdown renders like

Body text is set in Pretendard at a comfortable measure. Inline `code` sits in a
small panel, and code blocks get build-time syntax highlighting — no JavaScript
shipped to the browser:

```python
import torch

def protect(waveform, epsilon=0.002):
    """Add an imperceptible adversarial perturbation to resist voice cloning."""
    delta = torch.zeros_like(waveform, requires_grad=True)
    loss = -speaker_embedding_distance(waveform + delta, target_id)
    loss.backward()
    delta = (epsilon * delta.grad.sign()).clamp(-epsilon, epsilon)
    return (waveform + delta).clamp(-1.0, 1.0)
```

> Blockquotes are for the sentences other people wrote better than you could.

Lists, tables, and horizontal rules all work as expected:

| Threat | Defense |
| --- | --- |
| Voice cloning | proactive adversarial voice protection |
| Synthetic speech | language-model-based detection |
| Talking-head exploitation | multi-level alignment uncoupling |

---

Template syntax like `{{ this }}` is safe to paste into code blocks here —
markdown files are deliberately not preprocessed by the template engine, so
writeups won't break the build.

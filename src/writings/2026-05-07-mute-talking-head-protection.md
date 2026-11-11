---
title: "MUTE: Multi-Level Alignment Uncoupling Against Talking-Head Exploitation for Voice Protection"
description: "Protecting speech from talking-head misuse by disrupting cross-modal attention and temporal audio representations, with evaluations of transferability, purification, and TTS resynthesis."
lang: en
thumbnail: "/assets/writings/mute/paper-framework.png"
period: "2026"
date: 2026-11-10
writingOrder: 1
---

MUTE extends our work on proactive voice protection to **talking-head generation**: systems that animate a portrait using an audio recording. A stolen voice can be used to produce a convincing video even when the attacker never trains a dedicated voice-cloning model. Our question was whether protecting the audio before release could weaken the audio-visual correspondence these systems need.

The paper was **accepted at NeurIPS 2026**. See the [official NeurIPS poster page](https://neurips.cc/virtual/2026/loc/sydney/poster/154813) and the public paper at [arXiv:2611.11989](https://arxiv.org/abs/2611.11989). This research story follows the public paper's experimental settings and results. The [project page](https://jindl465.github.io/website/MUTE/) includes synchronized video comparisons and an interactive version of the user-study task.

<div class="project-meta" aria-label="Study overview">
  <div><span>Period</span><strong>2026</strong></div>
  <div><span>Task</span><strong>Proactive talking-head protection</strong></div>
  <div><span>Publication</span><strong>NeurIPS 2026 · Accepted</strong></div>
</div>

<nav class="research-resource-links" aria-label="MUTE resources">
  <a href="https://neurips.cc/virtual/2026/loc/sydney/poster/154813">NeurIPS poster ↗</a>
  <a href="https://arxiv.org/abs/2611.11989">Paper ↗</a>
  <a href="https://jindl465.github.io/website/MUTE/">Project &amp; demos ↗</a>
  <a href="https://github.com/jindl465/MUTE">Code ↗</a>
  <a href="/media/#mute">Media coverage →</a>
</nav>

<p class="section-label">01 · Motivation</p>

## Protecting the connection between a voice and a moving face

A talking-head model uses a portrait and speech to generate facial motion. Audio supplies timing and phonetic cues for the lips, as well as information that influences expression and head movement. The quality of the resulting video depends on a continuing correspondence between the audio and the visual sequence.

Earlier proactive defenses largely focused on a single modality. Image protection interferes with visual features; voice protection often targets the speaker representation used by a cloning system. Talking-head misuse introduces a different target: **audio-visual alignment itself**. Weakening identity extraction alone does not necessarily prevent a model from using speech to drive plausible lip motion.

MUTE modifies only the audio before it is released. The objective is to make generated lip motion inconsistent with the speech while retaining intelligibility and perceptual audio quality. The generated video can still exist; the measured outcome is degraded synchronization, rather than a guarantee that all forms of deepfake misuse become impossible.

<div class="research-callout research-callout-finding">
  <p class="research-callout-title">The question behind MUTE</p>
  <p>Can an audio-only perturbation disrupt the alignment mechanisms shared by different talking-head models, and remain effective after an attacker filters, denoises, or otherwise processes the recording?</p>
</div>

<p class="section-label">02 · Threat model</p>

## Generating protection with one surrogate and testing unseen models

Let the original recording be `x` and the protection signal be `δ`. The released audio is `x_adv = x + δ`. In the main experiments, the waveform is in `[-1, 1]` and the perturbation is bounded by `‖δ‖∞ ≤ 0.004`. MUTE leaves the portrait unchanged.

The defender has access to the surrogate model **Hallo** and its gradients. The protected audio is then evaluated with Hallo2, Audio2Head, SadTalker, and Ditto, without using those target models to generate the perturbation. This is a transfer-based black-box setting: the defender knows the surrogate, not the attacker's eventual model.

We also consider an attacker who tries to remove the signal through resampling, spectral filtering, Demucs, WavePurifier, or optimization-based purification. A separate evaluation examines TTS resynthesis, where an attacker uses the protected audio as a voice reference to generate a new waveform.

<figure class="research-figure research-figure-comparison">
  <a class="research-figure-scroll" href="/assets/writings/mute/paper-overview.png" aria-label="Open the MUTE threat-model figure"><img src="/assets/writings/mute/paper-overview.png" alt="MUTE protects audio before talking-head generation and evaluates unseen models, post-processing, denoising, and TTS resynthesis" loading="lazy"></a>
  <figcaption>Figure 1 from the public paper. Protection is applied to the audio before it reaches a talking-head generation pipeline.</figcaption>
</figure>

<p class="section-label">03 · Multi-level design</p>

## Disrupting alignment first, then degrading temporal representations

The audio encoder converts speech into temporal embeddings. Cross-attention then connects these audio features to visual latents during generation. MUTE acts at both points, with separate objectives for the alignment structure and the representations that feed it.

The optimization runs for **200 PGD steps**. During the first **10%**, the alignment objective redirects cross-attention. During the remaining **90%**, the representation objective reduces the similarity between clean and protected audio embeddings. Both phases include the STFT robustness loss with weight `λ = 5`. The step size is `α = 0.0002`.

Separating the objectives helps manage conflicting gradient directions. It also reduces the cost of repeatedly optimizing attention across the full run. The phase ratio is an empirical balance between synchronization disruption on the surrogate, transfer to other architectures, and computation time.

<figure class="research-figure research-figure-comparison">
  <a class="research-figure-scroll" href="/assets/writings/mute/paper-framework.png" aria-label="Open the full MUTE framework"><img src="/assets/writings/mute/paper-framework.png" alt="MUTE combines target-attention KL loss, frame-wise embedding cosine loss, and an STFT-domain constraint during two-phase PGD optimization" loading="lazy"></a>
  <figcaption>Figure 2 from the public paper. The alignment and representation objectives target different parts of the audio-visual generation process.</figcaption>
</figure>

<p class="section-label">04 · Alignment-level disruption</p>

## Redirecting cross-attention toward sensitive spatial locations

In the denoising UNet, visual latents provide queries and audio embeddings provide keys and values. We treat the resulting audio-conditioned cross-attention as a proxy for the alignment structure. Instead of imposing a uniform change everywhere, MUTE emphasizes locations where a bounded perturbation can produce a larger change.

A Taylor-based sensitivity score combines first- and second-order terms, normalized by the original attention value. A softmax converts these scores into a target distribution. The **Target Attention KL Loss** then encourages the adversarial attention to follow that distribution:

`L_attn = KL(A_target ‖ A_adv)`

The purpose is to move attention away from its original cross-modal correspondence. The appendix compares the proposed score with uniform weighting, inverse-attention weighting, and a first-order-only alternative. This component is paired with temporal representation degradation rather than used as the sole protection mechanism.

<p class="section-label">05 · Representation-level degradation</p>

## Preserving temporal detail in the optimization objective

Hallo extracts audio features with wav2vec 2.0. These representations vary across time, transformer layers, and hidden dimensions. Since facial motion is generated frame by frame, comparing only a time-averaged embedding can hide local changes that cancel during aggregation.

MUTE compares the protected and clean embeddings at every time step. The **Frame-wise Embedding Cosine Loss** minimizes their average cosine similarity:

`L_emb = (1 / T) Σ_t cos(z_adv,t, z_t)`

The temporal representations are aligned to a 25 fps video rate, giving 25 frame-wise embeddings per second. This makes local disagreement contribute throughout the sequence. In the paper's ablation, the frame-wise objective produces stronger alignment degradation than a global embedding objective.

<div class="research-callout">
  <p class="research-callout-title">Why use both levels?</p>
  <ul>
    <li><strong>Alignment loss</strong> changes the cross-modal mechanism that maps audio features to visual motion.</li>
    <li><strong>Representation loss</strong> degrades the temporal audio information used by that mechanism.</li>
    <li><strong>Two-phase optimization</strong> separates their updates while retaining the same robustness constraint.</li>
  </ul>
</div>

<p class="section-label">06 · Robustness by design</p>

## Keeping protection close to the speech signal's spectral structure

Low-energy noise is often suppressed by filtering or enhancement. MUTE uses the clean speech spectrogram to construct a mask that favors high-energy time-frequency regions. The implementation focuses on the 80–7,600 Hz speech band and uses a magnitude-based mask to reduce the contribution of low-energy and out-of-band components.

The STFT loss encourages the waveform perturbation to remain close to its masked spectral reconstruction:

`L_stft = ‖δ − ISTFT(M ⊙ STFT(δ))‖²`

This makes the perturbation overlap more closely with speech structure, reducing its separability as independent noise. Both optimization phases use this loss. It improves the tested resistance to purification, although it does not imply that every future removal method will fail.

TTS resynthesis is a distinct bypass route because it produces a new waveform. For that setting, an optional speaker objective reduces cosine similarity between clean and protected speaker embeddings using an ensemble of CAM++ and a ResNet-based speaker encoder. Its weight controls a trade-off between speaker-identity protection and lip-sync disruption.

<p class="section-label">07 · Evaluation protocol</p>

## Comparing six baselines under controlled audio and video settings

We use **50 TalkingHead-1KH samples** following the Silencer preprocessing protocol and **50 CelebV-HQ samples** selected with CLIP-IQA. CelebV-HQ audio is trimmed to five seconds. During perturbation generation, the reference image is drawn from a different identity; evaluation uses image-audio pairs of the same identity.

Portraits are resized to 512 × 512 and audio is sampled at 16 kHz. The six baselines are C&amp;W, Psychoacoustic, Qin et al., ARO, SAGO, and CAF. Their perturbation budgets are chosen for comparable perceptual quality: `ε = 0.01` for SAGO, `0.006` for Qin et al., and `0.004` for MUTE and the other methods. The main experiments use three independent random seeds on a single NVIDIA RTX 4090.

<div class="research-table" role="region" aria-label="MUTE evaluation metrics" tabindex="0">
  <table>
    <thead><tr><th>Evaluation</th><th>Metrics</th><th>What they measure</th></tr></thead>
    <tbody>
      <tr><td>Audio quality</td><td>WER ↓, STOI ↑, PESQ ↑</td><td>Speech intelligibility and perceptual quality</td></tr>
      <tr><td>Audio-visual alignment</td><td>Sync ↓, M-LMD ↑</td><td>Synchronization and mouth-landmark deviation</td></tr>
      <tr><td>Visual degradation</td><td>FID ↑, FVD ↑, E-FID ↑</td><td>Changes in image, video, and expression distributions</td></tr>
      <tr><td>Human perception</td><td>Most mismatched choice</td><td>Which generated clip has the most noticeable lip-sync error</td></tr>
    </tbody>
  </table>
</div>

The arrows describe the desired direction for protection, except for the audio-quality measures, where the aim is to preserve usable speech. Tables below show the reported means; the paper includes standard deviations for the main comparisons.

<p class="section-label">08 · Main results</p>

## Stronger synchronization disruption with usable speech

On TalkingHead-1KH, MUTE obtains a Sync score of **1.332** and M-LMD of **1.627**. On CelebV-HQ, the corresponding values are **2.152** and **1.693**. These are the lowest Sync and highest M-LMD values among the evaluated protection methods on both datasets.

<div class="research-table" role="region" aria-label="Main alignment results from MUTE Table 1" tabindex="0">
  <table>
    <thead><tr><th rowspan="2">Method</th><th colspan="2">TalkingHead-1KH</th><th colspan="2">CelebV-HQ</th></tr><tr><th>Sync ↓</th><th>M-LMD ↑</th><th>Sync ↓</th><th>M-LMD ↑</th></tr></thead>
    <tbody>
      <tr><td>C&amp;W</td><td>3.740</td><td>1.096</td><td>4.039</td><td>1.108</td></tr>
      <tr><td>Psychoacoustic</td><td>3.787</td><td>1.097</td><td>3.926</td><td>1.126</td></tr>
      <tr><td>Qin et al.</td><td>4.468</td><td>0.983</td><td>4.543</td><td>1.054</td></tr>
      <tr><td>ARO</td><td>3.518</td><td>1.155</td><td>3.818</td><td>1.176</td></tr>
      <tr><td>SAGO</td><td>3.264</td><td>1.200</td><td>3.597</td><td>1.226</td></tr>
      <tr><td>CAF</td><td>2.173</td><td>1.341</td><td>2.570</td><td>1.334</td></tr>
      <tr><td><strong>MUTE</strong></td><td><strong>1.332</strong></td><td><strong>1.627</strong></td><td><strong>2.152</strong></td><td><strong>1.693</strong></td></tr>
    </tbody>
  </table>
</div>

The audio-quality results are WER **11.681%**, STOI **0.936**, and PESQ **2.522** on TalkingHead-1KH, and **10.467%**, **0.959**, and **2.940** on CelebV-HQ. MUTE has the best values among the compared protection methods in this experiment. These are relative comparisons: the protected recordings still differ from clean audio.

<figure class="research-figure research-figure-comparison">
  <a class="research-figure-scroll" href="/assets/writings/mute/paper-main-qualitative.webp" aria-label="Open the main qualitative comparison"><img src="/assets/writings/mute/paper-main-qualitative.webp" alt="Generated frames from clean audio and six baselines compared with MUTE on TalkingHead-1KH and CelebV-HQ" loading="lazy"></a>
  <figcaption>Figure 3 from the public paper. The mouth regions show the visible differences behind the alignment metrics. Full motion comparisons are available on the project page.</figcaption>
</figure>

<p class="section-label">09 · Black-box transfer</p>

## Protection transfers from Hallo to four unseen models

The perturbation is generated on Hallo once, then used with Hallo2, Audio2Head, SadTalker, and Ditto. Hallo2 is architecturally related to the surrogate, while the other targets use substantially different designs. MUTE has the lowest Sync and highest M-LMD among the tested methods on all four.

<div class="research-table" role="region" aria-label="Black-box transfer results from MUTE Table 3" tabindex="0">
  <table>
    <thead><tr><th>Target model</th><th>MUTE Sync ↓</th><th>Best baseline Sync ↓</th><th>MUTE M-LMD ↑</th><th>Best baseline M-LMD ↑</th></tr></thead>
    <tbody>
      <tr><td>Hallo2</td><td><strong>1.397</strong></td><td>2.280 (CAF)</td><td><strong>1.679</strong></td><td>1.373 (CAF)</td></tr>
      <tr><td>Audio2Head</td><td><strong>3.627</strong></td><td>4.005 (CAF)</td><td><strong>1.299</strong></td><td>1.246 (CAF)</td></tr>
      <tr><td>SadTalker</td><td><strong>4.703</strong></td><td>5.297 (ARO)</td><td><strong>0.864</strong></td><td>0.658 (ARO)</td></tr>
      <tr><td>Ditto</td><td><strong>3.457</strong></td><td>3.803 (ARO)</td><td><strong>0.884</strong></td><td>0.781 (ARO)</td></tr>
    </tbody>
  </table>
</div>

<figure class="research-figure research-figure-comparison">
  <a class="research-figure-scroll" href="/assets/writings/mute/mute-transferability.svg" aria-label="Open the black-box transferability chart"><img src="/assets/writings/mute/mute-transferability.svg" alt="MUTE has a lower Sync score than the strongest baseline on Hallo2, Audio2Head, SadTalker, and Ditto" loading="lazy"></a>
  <figcaption>Sync scores from Table 3. The baseline is selected separately for each target; lower scores mean weaker synchronization.</figcaption>
</figure>

<figure class="research-figure research-figure-comparison">
  <a class="research-figure-scroll" href="/assets/writings/mute/paper-black-box-qualitative.webp" aria-label="Open the black-box qualitative comparison"><img src="/assets/writings/mute/paper-black-box-qualitative.webp" alt="Qualitative comparison of clean audio, the six baselines, and MUTE across four unseen talking-head models" loading="lazy"></a>
  <figcaption>Black-box examples from the appendix of the public paper. Transferability varies by architecture, so the per-model results matter as well as the overall ranking.</figcaption>
</figure>

<p class="section-label">10 · Removal attacks</p>

## Evaluating filtering, denoising, and adaptive purification

Post-processing includes a 16 → 8 → 16 kHz downsampling-upsampling transformation and adaptive spectral filtering. Demucs and WavePurifier represent learned enhancement and diffusion-based purification. We also evaluate BPDA and EOT settings that account for non-differentiable or stochastic processing when constructing adaptive attacks.

<div class="research-table" role="region" aria-label="MUTE robustness results from Table 4" tabindex="0">
  <table>
    <thead><tr><th>Transformation</th><th>MUTE Sync ↓</th><th>MUTE M-LMD ↑</th><th>Best baseline Sync ↓</th></tr></thead>
    <tbody>
      <tr><td>Down/upsampling</td><td>2.914</td><td>1.254</td><td>3.533 (CAF)</td></tr>
      <tr><td>Spectral filtering</td><td>2.251</td><td>1.410</td><td>3.063 (CAF)</td></tr>
      <tr><td>Demucs</td><td>1.534</td><td>1.593</td><td>2.566 (CAF)</td></tr>
      <tr><td>WavePurifier</td><td>3.494</td><td>1.217</td><td>3.940 (CAF)</td></tr>
      <tr><td>BPDA</td><td>4.269</td><td>0.655</td><td>4.778 (ARO)</td></tr>
      <tr><td>EOT</td><td>4.298</td><td>0.647</td><td>4.794 (CAF)</td></tr>
    </tbody>
  </table>
</div>

MUTE retains the strongest alignment degradation among the methods in each tested condition. However, the higher Sync scores under BPDA and EOT show that adaptive attacks reduce the protection. The appendix additionally tests purification followed by transfer to Audio2Head and SadTalker, rather than evaluating those two difficulties only in isolation.

<figure class="research-figure research-figure-comparison">
  <a class="research-figure-scroll" href="/assets/writings/mute/paper-robustness-qualitative.webp" aria-label="Open the robustness qualitative comparison"><img src="/assets/writings/mute/paper-robustness-qualitative.webp" alt="Talking-head output after resampling, spectral filtering, Demucs, and WavePurifier for clean audio and protected audio" loading="lazy"></a>
  <figcaption>Purification comparisons from the public appendix. The reported protection is specific to these evaluated transformations and settings.</figcaption>
</figure>

<p class="section-label">11 · TTS and multimodal protection</p>

## An optional speaker objective and complementary image protection

TTS resynthesis can replace the waveform entirely. We use protected audio as the speaker reference for CosyVoice and XTTS-v2 in white-box settings and Chatterbox in a black-box setting. An independent ECAPA-TDNN verifier measures speaker similarity. Defense success rate (DSR) is the share of generated samples with cosine similarity at or below **0.25**.

With `λ_spk = 0.01`, DSR reaches **67.73%** for CosyVoice, **99.33%** for XTTS-v2, and **43.87%** for Chatterbox. Lip-sync protection remains strong in the accompanying evaluation, with Sync **1.496** and M-LMD **1.541**. Increasing the speaker-loss weight further improves DSR but weakens the primary alignment objective.

These speaker-verification measurements do not directly establish human-perceived speaker similarity or prove that lip-sync disruption survives every TTS-resynthesized waveform. They assess the identity-preservation part of this bypass route.

MUTE can also be combined with image protection because it modifies only the audio. In Table 2, adding MUTE lowers Sync from **3.039 to 0.902** with MIS and from **2.170 to 0.760** with Silencer. The image and audio defenses are combined, not jointly optimized; a unified multimodal objective remains future work.

<p class="section-label">12 · Human evaluation and ablations</p>

## Testing visible mismatch and the quality-protection trade-off

The user study compares MUTE, CAF, ARO, and SAGO across **10 samples**. **100 participants** each choose the clip with the most noticeable lip-sync mismatch, producing **1,000 responses**. MUTE is selected in **78.1% ± 2.56%** of responses, with a 95% confidence interval. This measures perceived mismatch among the presented alternatives, not a real-world deepfake-prevention rate.

<figure class="research-figure research-figure-comparison">
  <a class="research-figure-scroll" href="/assets/writings/mute/paper-user-study.png" aria-label="Open the MUTE user-study results"><img src="/assets/writings/mute/paper-user-study.png" alt="User-study selections across ten samples, with MUTE receiving 78.1 percent of the most-mismatched choices overall" loading="lazy"></a>
  <figcaption>Figure 4 from the public paper. Participants judged synchronization, complementing the objective alignment metrics.</figcaption>
</figure>

The ablations examine the attention-phase ratio `ρ`, STFT weight `λ`, perturbation budget `ε`, step size, and iteration count. The selected `ρ = 0.1` balances cost and transferability, while `λ = 5` gives a useful balance between clean-setting disruption and robustness to purification.

The perturbation budget exposes the audio-quality trade-off particularly clearly. At `ε = 0.002`, the TalkingHead-1KH Sync score is 1.898 with STOI 0.948 and PESQ 2.949. At the chosen `ε = 0.004`, these become 1.332, 0.936, and 2.522. Increasing the budget to 0.010 lowers Sync to 1.027 but also reduces STOI to 0.885 and PESQ to 1.945. The strongest disruption is therefore not automatically the most useful operating point.

<p class="section-label">13 · Takeaways and resources</p>

## Audio-visual alignment is a useful target for proactive protection

MUTE shows that a recording can be protected against talking-head misuse by targeting both cross-modal attention and temporal audio representations. Its transfer results and purification evaluations support this approach across the tested architectures and attacks. The optional speaker objective connects the work to voice-cloning defenses, while combinations with image protection suggest a path toward broader multimodal protection.

The scope still matters. The study uses limited samples, stronger future adaptive attacks may weaken the defense, and modifying a recording before release cannot protect copies that have already leaked. Low-latency deployment and joint audio-image optimization also remain open problems.

The work was carried out with **Donghyun Kim, Jin Hong, Dain Kim, Junseok Kwon, and Daeseon Choi**. Donghyun Kim, Jin Hong, and Seungmin Kim contributed equally and are listed in alphabetical order.

<div class="publication-card">
  <p class="publication-card-kicker">NeurIPS 2026 · Accepted · Public preprint</p>
  <p class="publication-card-title">MUTE: Multi-Level Alignment Uncoupling Against Talking-Head Exploitation for Voice Protection</p>
  <p class="publication-card-meta">Donghyun Kim*, Jin Hong*, Seungmin Kim*, Dain Kim, Junseok Kwon, Daeseon Choi · arXiv:2611.11989</p>
  <p class="publication-card-meta">*These authors contributed equally and are listed in alphabetical order.</p>
  <p class="publication-card-links"><a href="https://neurips.cc/virtual/2026/loc/sydney/poster/154813">NeurIPS poster</a><a href="https://arxiv.org/abs/2611.11989">Paper (arXiv)</a><a href="https://jindl465.github.io/website/MUTE/">Project &amp; demos</a><a href="https://github.com/jindl465/MUTE">Code</a><a href="/media/#mute">Media coverage</a></p>
</div>

- [Official NeurIPS 2026 poster page](https://neurips.cc/virtual/2026/loc/sydney/poster/154813)
- [Paper and full appendix — arXiv:2611.11989](https://arxiv.org/abs/2611.11989)
- [Project page, synchronized comparisons, and user-study demo](https://jindl465.github.io/website/MUTE/)
- [Source code](https://github.com/jindl465/MUTE)
- [YTN Science interview and press coverage](/media/#mute)
- Related work: [RoCo](/writings/roco-robust-code/), [RoVo](/writings/rovo-robust-voice-protection/), and [NaVo](/writings/navo-natural-voice-protection/)

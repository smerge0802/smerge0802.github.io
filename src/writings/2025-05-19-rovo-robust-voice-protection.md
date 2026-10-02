---
title: "RoVo: Robust Voice Protection Against Voice Cloning Attacks via Embedding-Level Adversarial Perturbations"
description: "Voice protection in a neural audio codec's latent space, tested against signal transforms, speech enhancement, reconstruction, and unseen cloning models."
lang: en
thumbnail: "/assets/writings/rovo/rovo-framework.png"
period: "2024 – 2025"
---

In 2024–2025, I worked on protecting recordings before they could be used for unauthorized voice cloning. This became RoVo (Robust Voice). We released an initial arXiv version in May 2025, then expanded the datasets and attack conditions. The extended manuscript is under review at IEEE Access.

RoVo perturbs the latent representation of a neural audio codec and decodes it back into speech. The idea is to make the protection part of the reconstructed audio structure, so that an attacker cannot easily remove it with speech enhancement or purification.

<div class="project-meta" aria-label="Study overview">
  <div><span>Period</span><strong>2024 – 2025</strong></div>
  <div><span>Task</span><strong>Proactive voice protection</strong></div>
  <div><span>Status</span><strong>IEEE Access · Manuscript under review</strong></div>
</div>

<p class="section-label">01 · Research question</p>

## Protecting a recording before it is cloned

Zero-shot text-to-speech and voice-conversion systems can imitate a speaker from a short reference recording. Videos, interviews, and podcasts provide reference audio without requiring access to a private account or device. That audio can be used for impersonation, voice phishing, false statements, or attempts to bypass speaker authentication.

RoVo applies protection before the recording is published. The processed audio should remain intelligible to listeners while making it difficult for a cloning model to recover the original speaker's identity.

Earlier proactive defenses also used adversarial perturbations, usually added to the waveform or spectrogram. Those perturbations could work when the attacker used the recording directly, but weaken after speech enhancement. We therefore evaluated what happens after an attacker tries to remove the protection, changes models, or uses knowledge of the defense.

<div class="research-callout research-callout-finding">
  <p class="research-callout-title">The question behind RoVo</p>
  <p>Does protection survive when an attacker cleans the recording, switches to different cloning and verification models, or attempts reconstruction with knowledge of the defense?</p>
</div>

<figure class="research-figure research-figure-comparison">
  <img src="/assets/writings/rovo/threat-overview.png" alt="Protected speech is published, then subjected to adaptive processing and voice cloning before impersonation or authentication attempts">
  <figcaption>The intended use: publish protected speech that people can listen to, while preventing clones made from it from being accepted as the original speaker. Figure 1 from the manuscript under review.</figcaption>
</figure>

<p class="section-label">02 · Threat model</p>

## Three levels of removal attacks

We assumed the attacker could collect a limited amount of the victim's published speech and use it as reference audio for zero-shot TTS or voice conversion. We judged the cloned output with automatic speaker verification (ASV). If the verifier accepted the clone as the original speaker, the defense failed; if it rejected the clone, the defense succeeded.

We grouped removal attacks by the information and models available to the attacker. We also evaluated transfer to cloning models that were not used to generate the protection.

<div class="research-table" role="region" aria-label="RoVo attack conditions" tabindex="0">
  <table>
    <thead><tr><th>Condition</th><th>Attacker's processing</th><th>What it tests</th></tr></thead>
    <tbody>
      <tr><td>Weak</td><td>Quantization, resampling, filtering, mel inversion</td><td>Resistance to simple signal transformations</td></tr>
      <tr><td>Moderate</td><td>Spectral Masking, DeepFilterNet, MP-SENet, FlowSE, De-AntiFake</td><td>Resistance to learned enhancement and purification</td></tr>
      <tr><td>Strong</td><td>Reconstruction with knowledge of the defense architecture and objective</td><td>Resistance to informed white-box reconstruction</td></tr>
      <tr><td>Black-box</td><td>Tortoise and CosyVoice, excluded from defense generation</td><td>Transfer to unseen cloning models</td></tr>
    </tbody>
  </table>
</div>

Even in the strong setting, the attacker only had the protected recording. If clean speech were also available, the attacker could bypass the protection by using it directly.

The defender was assumed to run RoVo locally before publication. Since the defender cannot control later processing, we tested several attack conditions rather than a single fixed cloning pipeline.

<p class="section-label">03 · Why latent space</p>

## Perturbing the codec representation

A signal-domain defense adds a perturbation `δ_signal` directly to the original waveform `x`, producing `x + δ_signal`. An enhancement model trained to separate speech from noise can treat that added signal as something to remove.

RoVo moves the perturbation into the codec's latent space. Encoder `E` maps the input to `z`, a trainable perturbation `δ_latent` is added, and decoder `D` reconstructs the protected waveform.

`z = E(x)`, `x_rovo = D(z + δ_latent)`

The nonlinear decoder distributes the perturbation through the reconstructed speech's time-frequency structure. Because the change is tied to that structure, separating only the protective component becomes harder.

<figure class="research-figure research-figure-comparison">
  <a class="research-figure-scroll" href="/assets/writings/rovo/spectrogram-comparison.png" aria-label="Open the full spectrogram comparison"><img src="/assets/writings/rovo/spectrogram-comparison.png" alt="Spectrograms of original speech and speech protected by AntiFake or RoVo, before and after enhancement"></a>
  <figcaption>After MP-SENet, AntiFake's signal-domain perturbation moves back toward the original spectrogram. With RoVo, enhancement also changes the speech structure rather than cleanly removing the perturbation. Figure 3 from the manuscript under review.</figcaption>
</figure>

This makes audio quality after enhancement an incomplete measure of protection. For a signal-domain defense, improved quality may mean that the protective noise has been removed. In some RoVo samples, enhancement could not separate the modification from the speech and introduced further damage instead.

<p class="section-label">04 · RoVo framework</p>

## Reconstructing protected speech with Bark and EnCodec

RoVo uses Bark's neural-codec-based generation architecture. The Neural Codec Encoder compresses the input, and the Coarse and Fine Transformers process its longer structure and acoustic detail. We optimize the perturbation in this embedding representation, then reconstruct speech through the Neural Codec Decoder.

<figure class="research-figure research-figure-comparison">
  <a class="research-figure-scroll" href="/assets/writings/rovo/rovo-framework.png" aria-label="Open the full RoVo architecture figure"><img src="/assets/writings/rovo/rovo-framework.png" alt="RoVo encodes speech, perturbs embeddings from the coarse and fine Transformers, and decodes the modified representation into protected audio"></a>
  <figcaption>Target-based Loss changes the speaker representation seen by the cloning model's encoder. SNR Loss limits the difference between the original and protected waveforms. Figure 2 from the manuscript under review.</figcaption>
</figure>

Before adding perturbations, we checked the backbone's reconstruction quality. Speech reconstructed by Bark alone had a MOS of 4.53 and cosine similarity of 0.96 to the original. This baseline helped distinguish the cost of the perturbation from errors introduced by the codec itself.

<div class="research-callout">
  <p class="research-callout-title">RoVo pipeline</p>
  <ul>
    <li><strong>Encode</strong> — map the original recording to a neural codec representation.</li>
    <li><strong>Perturb</strong> — use PGD to optimize an embedding perturbation that disrupts speaker identity.</li>
    <li><strong>Decode</strong> — reconstruct the modified embedding as playable audio.</li>
    <li><strong>Release</strong> — publish the protected version of the recording.</li>
  </ul>
</div>

<p class="section-label">05 · Optimization</p>

## Alternating between protection and quality with PerC-AL

A stronger perturbation can move speaker identity further, but also reduce naturalness and intelligibility. Optimizing quality alone leaves the speaker encoder able to recover the original identity. RoVo uses Perceptual Alternating Loss (PerC-AL) to alternate between these objectives according to a threshold.

Target-based Loss moves the protected speaker embedding away from the original speaker and toward a chosen target. SNR Loss limits the difference between the reconstructed waveform and the original. Optimization first works toward the identity-disruption objective, then switches to quality preservation when the condition is met, repeating this process.

<figure class="research-figure research-figure-comparison">
  <img src="/assets/writings/rovo/alternating-optimization.png" alt="DSR and MOS over optimization steps for joint and alternating optimization">
  <figcaption>DSR saturated early under joint optimization. Alternating optimization raised DSR during the identity-disruption stage and recovered some MOS during the quality stage. Figure 4 from the manuscript under review.</figcaption>
</figure>

We selected target speakers of the opposite gender. In t-SNE projections from two speaker encoders, male and female speakers tended to form separate clusters. An opposite-gender target was therefore more likely to lie farther from the original speaker than a same-gender target, encouraging a larger embedding shift.

<figure class="research-figure research-figure-comparison">
  <img src="/assets/writings/rovo/target-gender-embedding.png" alt="t-SNE projections showing male and female speaker clusters from two speaker encoders">
  <figcaption>Both encoders showed clustering by gender, providing an empirical basis for the target-selection rule. Figure 1 from the supplementary material.</figcaption>
</figure>

<p class="section-label">06 · Dataset</p>

## Selecting the threshold on VCTK, then testing other corpora

PerC-AL needs a threshold for switching between Target-based Loss and SNR Loss. Retuning it on every corpus would make it difficult to judge generalization. We selected it only on VCTK and reused it on five other English speech corpora.

<div class="research-table" role="region" aria-label="RoVo corpus split and sampling" tabindex="0">
  <table>
    <thead><tr><th>Role</th><th>Corpus</th><th>Samples</th><th>Use</th></tr></thead>
    <tbody>
      <tr><td>Threshold selection</td><td>VCTK</td><td>109 speakers × 10 utterances</td><td>Select the PerC-AL threshold</td></tr>
      <tr><td>Main evaluation</td><td>FST</td><td rowspan="5">70 speakers and 700 utterances in total</td><td rowspan="5">Apply the VCTK threshold without retuning</td></tr>
      <tr><td>Main evaluation</td><td>MCV</td></tr>
      <tr><td>Main evaluation</td><td>CSNED</td></tr>
      <tr><td>Main evaluation</td><td>CSUKIED</td></tr>
      <tr><td>Main evaluation</td><td>LibriSpeech</td></tr>
    </tbody>
  </table>
</div>

For the main evaluation, we selected 10–20 speakers per corpus and ten utterances of 5–10 seconds per speaker: 70 speakers and 700 original utterances overall. We protected each recording, used it to synthesize speech with three white-box cloning models, and evaluated speaker acceptance with several verification backends.

All six corpora were in English, but differed in accent, recording conditions, and speaking style. Keeping VCTK for threshold selection and the other five for evaluation tested whether the same setting worked beyond the data used to choose it.

<p class="section-label">07 · Evaluation protocol</p>

## Separating the cloning and verification models

We treated the speaker encoder used to generate protection, the cloning model used to synthesize speech, and the verifier used to judge the result as distinct parts of the evaluation. This let us test whether protection persisted across model combinations.

<div class="research-callout">
  <p class="research-callout-title">Models and baselines</p>
  <ul>
    <li><strong>White-box cloning</strong> — SV2TTS, YourTTS, AVC.</li>
    <li><strong>Black-box cloning</strong> — Tortoise, CosyVoice.</li>
    <li><strong>Speaker verification</strong> — ECAPA-TDNN, Resemblyzer, ResNet-based models.</li>
    <li><strong>Signal-domain baselines</strong> — AttackVC, AntiFake, VoiceGuard.</li>
  </ul>
</div>

Defense Success Rate (DSR) measures the fraction of clones made from protected speech that are rejected as the original speaker. Higher DSR means stronger protection. MOS assesses perceptual quality on a 1–5 scale, while word error rate (WER) measures preservation of spoken content.

Supplementary experiments used synthesis prompts involving requests for money transfers, emergencies, account verification, and suspicious transactions. These prompts brought the evaluation closer to impersonation scenarios than neutral read speech alone.

<p class="section-label">08 · Base and weak attacks</p>

## Higher DSR without retuning

On the VCTK threshold-selection set, mean DSR increased from 9.6% for unprotected (RAW) speech to 82.5% with RoVo. On the main evaluation corpora, the unchanged threshold increased mean DSR from 13.1% to 88.0%.

<div class="research-metrics" aria-label="RoVo base performance">
  <div class="research-metric"><span class="research-metric-value">82.5%</span><span class="research-metric-label">VCTK mean DSR<br>RAW 9.6%</span></div>
  <div class="research-metric"><span class="research-metric-value">88.0%</span><span class="research-metric-label">Main evaluation mean DSR<br>RAW 13.1%</span></div>
  <div class="research-metric"><span class="research-metric-value">70</span><span class="research-metric-label">Main evaluation speakers<br>700 utterances</span></div>
  <div class="research-metric"><span class="research-metric-value">16.4%</span><span class="research-metric-label">Protected speech mean WER<br>Clean 5.3%</span></div>
</div>

<div class="research-table" role="region" aria-label="RAW and RoVo DSR on the main evaluation data" tabindex="0">
  <table>
    <thead><tr><th>Verifier</th><th>SV2TTS RAW</th><th>SV2TTS RoVo</th><th>YourTTS RAW</th><th>YourTTS RoVo</th><th>AVC RAW</th><th>AVC RoVo</th></tr></thead>
    <tbody>
      <tr><td>Resemblyzer</td><td>0.8%</td><td>84.1%</td><td>0.7%</td><td>80.9%</td><td>8.9%</td><td>91.1%</td></tr>
      <tr><td>ECAPA-TDNN</td><td>23.5%</td><td>83.6%</td><td>11.3%</td><td>83.1%</td><td>33.6%</td><td>94.2%</td></tr>
      <tr><td>ResNet</td><td>13.3%</td><td>87.5%</td><td>2.6%</td><td>90.9%</td><td>23.2%</td><td>96.6%</td></tr>
    </tbody>
  </table>
</div>

Mean WER rose from 5.3% on clean speech to 16.4% on protected speech. The recordings remained intelligible, but the protection had a measurable cost.

For weak attacks, we applied quantization, resampling, filtering, and mel inversion separately. The average DSR drop across all combinations was 2.2 percentage points. AVC stayed above 88.5% across all transformations and verifiers. The lowest result was 73.0% for YourTTS–ResNet after mel inversion. In some conditions, DSR increased by up to 8.8 percentage points after transformation.

<p class="section-label">09 · Moderate adaptive attacks</p>

## Retaining protection after learned enhancement

The moderate attacks used learned enhancement methods: Spectral Masking, DeepFilterNet, and the DNS and VoiceBank versions of MP-SENet. We applied the same conditions to AttackVC, AntiFake, and VoiceGuard.

RoVo retained a mean DSR of 82.8% across 36 enhancement–cloning–verification combinations, a drop of 5.2 percentage points. AttackVC, AntiFake, and VoiceGuard dropped by 30.8, 35.5, and 49.7 points, respectively. Some signal-domain baselines started with high DSR, but lost more of it after enhancement.

<div class="research-table" role="region" aria-label="Change in protection after speech enhancement" tabindex="0">
  <table>
    <thead><tr><th>Defense</th><th>Representation</th><th>Mean DSR change</th><th>Result</th></tr></thead>
    <tbody>
      <tr><td>AttackVC</td><td>Signal domain</td><td>−30.8 pp</td><td>Reduced protection after enhancement</td></tr>
      <tr><td>AntiFake</td><td>Signal domain</td><td>−35.5 pp</td><td>Vulnerable to perturbation removal</td></tr>
      <tr><td>VoiceGuard</td><td>Signal domain</td><td>−49.7 pp</td><td>Largest mean drop</td></tr>
      <tr><td><strong>RoVo</strong></td><td><strong>Codec latent</strong></td><td><strong>−5.2 pp</strong></td><td><strong>Mean DSR of 82.8%</strong></td></tr>
    </tbody>
  </table>
</div>

On AVC, RoVo retained a mean DSR of 93.8% after enhancement. Some conditions improved by up to 4.4 percentage points. That increase does not necessarily mean the protected audio became better: if enhancement damages the speech while failing to remove the perturbation, verification can become harder for that reason too.

RoVo's mean MOS was 2.53 before attack and 2.68 after enhancement. Signal-domain baselines tended to recover more quality when their perturbations were removed. RoVo's smaller recovery reflects a remaining trade-off: harder-to-remove protection came with greater perceptual cost.

<div class="research-callout research-callout-finding">
  <p class="research-callout-title">DSR needs the quality measurements beside it</p>
  <p>A small drop in DSR after purification is useful evidence of robustness. Audio-quality measurements are also needed to establish how much of that result comes from protection and how much comes from further damage to the recording.</p>
</div>

<p class="section-label">10 · Transfer and strong attacks</p>

## Unseen cloning models and informed reconstruction

For black-box evaluation, we generated protected audio using an ensemble of the speaker encoders from SV2TTS, YourTTS, and AVC. We then tested it on Tortoise and CosyVoice, which were excluded from defense generation. The ensemble sought perturbation directions shared by several surrogate encoders to improve transfer.

<div class="research-table" role="region" aria-label="RoVo black-box and reconstruction results" tabindex="0">
  <table>
    <thead><tr><th>Condition</th><th>DSR</th><th>Quality and additional results</th></tr></thead>
    <tbody>
      <tr><td>All black-box conditions</td><td>81.6%</td><td>MOS 2.83 ± 0.46</td></tr>
      <tr><td>Black-box weak attacks</td><td>89.0%</td><td>Tortoise and CosyVoice</td></tr>
      <tr><td>Black-box enhancement and purification</td><td>77.3%</td><td>Including FlowSE and De-AntiFake</td></tr>
      <tr><td>Strong white-box reconstruction</td><td>82.1%</td><td>MOS 3.38–3.76; original-speaker acceptance 15.3%</td></tr>
      <tr><td>LLaSE-G1 reconstruction</td><td>72.9%</td><td>Mean DSR with ECAPA-TDNN: 82.6%</td></tr>
    </tbody>
  </table>
</div>

Mean DSR across the black-box attack conditions was 81.6%: 89.0% after weak transformations and 77.3% after enhancement or purification. Ensemble-protected audio had a MOS of 2.83 ± 0.46. Protection therefore persisted to a degree on architectures outside the white-box set.

For the strong attack, the attacker knew RoVo's backbone, optimization objective, and target reference. The attacker reconstructed a more natural signal from the protected recording to try to reverse the perturbation. MOS recovered to 3.38–3.76, depending on the model, but the reconstructed speech was accepted as the original speaker only 15.3% of the time on average. Cloning from those reconstructions produced DSR of 73.2–90.7%, with a mean of 82.1%.

The supplementary evaluation added LLaSE-G1 reconstruction. This attack extracts speaker-related embeddings with WavLM, converts them into speech tokens, and reconstructs audio with a LLaMA-based language model and X-Codec decoder. Mean DSR across all combinations was 72.9%. With ECAPA-TDNN verification, DSR was 82.2% for SV2TTS, 82.7% for YourTTS, 79.9% for AVC, and 85.4% for black-box Tortoise, averaging 82.6%.

<p class="section-label">11 · Commercial verification</p>

## Checking the result with a commercial verifier

We added Microsoft Azure's speaker-verification API to test whether the results depended on the open-source verifiers and their thresholds. Azure already rejected some clones from RAW audio at relatively high rates. After RoVo, DSR exceeded 98% for all three cloning models.

<div class="research-table" role="region" aria-label="RAW and RoVo DSR with Microsoft Azure speaker verification" tabindex="0">
  <table>
    <thead><tr><th>Voice cloning</th><th>RAW</th><th>RoVo</th><th>Increase</th></tr></thead>
    <tbody>
      <tr><td>SV2TTS</td><td>68.1%</td><td>99.8%</td><td>+31.7 pp</td></tr>
      <tr><td>YourTTS</td><td>18.0%</td><td>99.5%</td><td>+81.5 pp</td></tr>
      <tr><td>AVC</td><td>52.3%</td><td>98.6%</td><td>+46.3 pp</td></tr>
    </tbody>
  </table>
</div>

After enhancement, AntiFake had a mean Azure DSR of 94.1%, down 5.6 percentage points. RoVo retained 99.0%, with a mean change of just 0.3 points. Its DSR ranged from 98.2–99.9% across the enhancement–cloning combinations.

Azure and the open-source verifiers have different decision boundaries, so their absolute scores are not directly interchangeable. The useful observation is that RoVo's protection and resistance to enhancement also appeared with an external commercial backend.

<p class="section-label">12 · Trade-off and limitations</p>

## What listeners heard, and what protection cost

We also ran an IRB-approved listening study. We recruited 100 native English speakers through Prolific, and each listened to 30 audio pairs. They rated whether the voices sounded like the same speaker on a five-point scale from `Very Similar` to `Very Different`.

The conditions paired two real recordings from the same speaker (RA_RA), recordings from different speakers (RA_RB), original and protected speech (RA_DA), and original speech with a clone made from protected audio (RA_FDA). RA_DA-SE and RA_FDA-SE added enhancement to the protected and cloned conditions.

<figure class="research-figure research-figure-interface">
  <img src="/assets/writings/rovo/user-study.png" alt="Listener ratings of speaker similarity for real, protected, cloned, and enhanced speech pairs">
  <figcaption>RA_DA was closer to the same-speaker condition, while listeners mostly rated RA_FDA and RA_FDA-SE as different from the original speaker. Enhancement reduced similarity further for protected speech, indicating additional distortion. Figure 5 from the manuscript under review.</figcaption>
</figure>

The control pairs behaved as expected: RA_RA was mostly rated similar, and RA_RB mostly different. Protected speech in RA_DA sounded closer to the original speaker than the cloned conditions did. Most ratings for RA_FDA and RA_FDA-SE indicated a different speaker.

These results are consistent with protection that preserves some of the original voice for human listeners while disrupting its reproduction by a cloning model. The method does not fully anonymize the speaker. It also has a usability cost: enhanced protected speech, RA_DA-SE, sounded less like the original than RA_DA did.

<div class="research-callout research-callout-limit">
  <p class="research-callout-title">Limits of these results</p>
  <ul>
    <li><strong>Perceptual quality</strong> — latent perturbations resisted removal but introduced measurable costs in MOS and WER.</li>
    <li><strong>Enhancement damage</strong> — higher DSR after purification can partly reflect further damage to the speech.</li>
    <li><strong>Evaluation scope</strong> — English corpora and selected TTS, VC, and ASV models do not establish generalization to other languages or newer generators.</li>
    <li><strong>Deployment</strong> — iterative optimization time, mobile use, and real-time protection need further work.</li>
    <li><strong>Review status</strong> — the extended manuscript is under review; experiments and reported values may change before publication.</li>
  </ul>
</div>

<p class="section-label">13 · Manuscript and preprint</p>

## The extended manuscript and the public preprint

The May 2025 arXiv v1 reports the initial method and experiments from this 2024–2025 study. We subsequently extended the work with six corpora, graded adaptive attacks, PerC-AL, black-box transfer, a commercial verification API, and additional reconstruction attacks.

The extended manuscript is under review at IEEE Access. The arXiv link below points to the public 2025 v1, which does not contain all the expanded experiments described here.

<div class="publication-card">
  <p class="publication-card-kicker">IEEE Access · Manuscript under review · Expanded experiments</p>
  <p class="publication-card-title">RoVo: Robust Voice Protection Against Voice Cloning Attacks via Embedding-Level Adversarial Perturbations</p>
  <p class="publication-card-meta">2024–2025 research · Current manuscript · Results may change during peer review</p>
</div>

<div class="publication-card">
  <p class="publication-card-kicker">Public preprint · arXiv v1 · May 2025</p>
  <p class="publication-card-title">RoVo: Robust Voice Protection Against Unauthorized Speech Synthesis with Embedding-Level Perturbations</p>
  <p class="publication-card-meta">Seungmin Kim, Sohee Park, Donghyun Kim, Jisu Lee, Daeseon Choi</p>
  <p class="publication-card-links"><a href="https://arxiv.org/abs/2505.12686">Public preprint on arXiv</a></p>
</div>

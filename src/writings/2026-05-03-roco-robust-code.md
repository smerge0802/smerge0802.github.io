---
title: "RoCo: Robust Code for Fast and Effective Proactive Defense against Voice Cloning Attack"
description: "Following RoVo, we moved voice protection into discrete codec tokens to reduce generation time while retaining resistance to speech enhancement."
lang: en
thumbnail: "/assets/writings/roco/roco-framework.png"
period: "2025 – 2026"
---

RoCo grew out of a practical limitation of RoVo: generating protected speech took too long. In this 2025–2026 study, we replaced continuous embedding perturbations with **discrete perturbation codes**. The aim was to reduce processing time while keeping the resistance to speech enhancement that motivated our earlier work.

The paper appeared in the ICASSP 2026 proceedings, and I gave an oral presentation in Barcelona. We combined a dedicated perturbation code, a Straight-Through Estimator (STE), and two-stage loss optimization. The evaluation covered six speech corpora, three cloning models, and three speaker verifiers, with measurements of protection, audio quality, resistance to post-processing, and generation time.

<div class="project-meta" aria-label="Study overview">
  <div><span>Period</span><strong>2025 – 2026</strong></div>
  <div><span>Task</span><strong>Fast proactive voice protection</strong></div>
  <div><span>Publication</span><strong>ICASSP 2026 · Oral</strong></div>
</div>

<p class="section-label">01 · From RoVo to RoCo</p>

## Moving from continuous embeddings to discrete codes

[RoVo](/writings/rovo-robust-voice-protection/) adds perturbations to the continuous embeddings of a neural audio codec. After passing through the nonlinear decoder, the perturbation becomes part of the reconstructed speech structure, making it harder for an enhancement model to separate it as ordinary noise. But optimizing a continuous perturbation for every utterance still carries a substantial cost.

RoCo puts the protection signal in a **separate discrete codebook channel**. It keeps the original acoustic tokens, adds a perturbation code that interferes with speaker-identity extraction, and decodes them together. The design retains RoVo's use of the codec representation while narrowing what has to be optimized.

<div class="research-table" role="region" aria-label="Design differences between RoVo and RoCo" tabindex="0">
  <table>
    <thead><tr><th>Component</th><th>RoVo</th><th>RoCo</th></tr></thead>
    <tbody>
      <tr><td>Protection unit</td><td>Perturbation of continuous codec embeddings</td><td>Discrete perturbation code in an additional codebook channel</td></tr>
      <tr><td>Optimization</td><td>PGD updates in continuous latent space</td><td>STE linking quantized forward passes to gradient updates</td></tr>
      <tr><td>Loss control</td><td>Alternates between protection and perceptual quality</td><td>Target Loss before the threshold; SNR Loss afterward</td></tr>
      <tr><td>Focus</td><td>Resistance to adaptive removal attacks</td><td>Lower generation time with retained robustness</td></tr>
    </tbody>
  </table>
</div>

<p class="section-label">02 · Research problem</p>

## Protection has to survive post-processing and be affordable to generate

Proactive defenses perturb speech before it is released, so that a cloning model's speaker encoder has difficulty recovering the original identity. Small waveform perturbations, however, can resemble background noise to an enhancement or denoising model. An attacker can clean the reference audio before cloning it, reducing the protection.

Processing time is another obstacle. Signal-domain methods repeatedly update many waveform samples. If protecting a 5–10-second utterance takes tens of seconds or nearly two minutes, it is difficult to use the method for video, broadcasting, or a continuous conversation.

<div class="research-callout research-callout-finding">
  <p class="research-callout-title">The question behind RoCo</p>
  <p>Could we place protection in discrete codec tokens that survive speech enhancement, while generating the protected audio faster than existing signal-domain methods?</p>
</div>

<p class="section-label">03 · Perturbation code</p>

## A dedicated channel alongside the acoustic tokens

Neural codec models represent speech with acoustic tokens from several codebooks. A Coarse Transformer predicts the longer structure in the earlier codebooks autoregressively, and a Fine Transformer fills in acoustic details in the later ones. Let `a(q,t)` denote the original token at codebook `q` and time frame `t`. RoCo adds a perturbation code `p(t)` of the same temporal length.

`ã = [a; p]`

The concatenation `[a; p]` is along the codebook axis, not time. The original tokens continue to carry phonetic content, prosody, and timbre. The added `p` is optimized to interfere with speaker-identity extraction. This confines the updates to a dedicated channel instead of changing all the tokens that represent the utterance.

<figure class="research-figure research-figure-comparison">
  <a class="research-figure-scroll" href="/assets/writings/roco/roco-framework.png" aria-label="Open the full RoCo architecture figure"><img src="/assets/writings/roco/roco-framework.png" alt="RoCo adds a perturbation code to the original latent codes, optimizes it with STE, Target Loss, and SNR Loss, and decodes protected speech"></a>
  <figcaption>The original latent codes are retained. Target Loss shifts the speaker representation, then SNR Loss reduces the audio distortion. Figure 1 from the ICASSP 2026 paper.</figcaption>
</figure>

<p class="section-label">04 · Straight-Through Estimator</p>

## Passing gradients through discrete code selection

A perturbation code is an integer codebook index. Selecting a codebook vector through a one-hot index is not differentiable, so the Target Loss gradient cannot pass directly through that selection. We used a Straight-Through Estimator to supply a gradient path.

`z_STE = q + (e − stopgrad(e))`

Here, `q` is the discrete codebook vector selected in the forward pass, and `e` is a continuous representation from the embedding matrix. During the forward pass, `e − stopgrad(e)` evaluates to zero, leaving the quantized vector `q`. During backpropagation, `stopgrad(e)` blocks one path while the gradient through `e` remains. This allows gradient-based updates while the forward computation still uses a discrete code.

<div class="research-callout">
  <p class="research-callout-title">The role of STE</p>
  <ul>
    <li><strong>Forward</strong> — select the discrete code used by the codec.</li>
    <li><strong>Backward</strong> — approximate quantization with an identity gradient.</li>
    <li><strong>Update</strong> — optimize the dedicated perturbation code rather than the full waveform.</li>
  </ul>
</div>

<p class="section-label">05 · Two-stage optimization</p>

## Establishing protection before recovering audio quality

Target Loss and SNR Loss pull in different directions. Target Loss moves the protected speaker embedding toward a chosen target speaker, making the original identity harder to extract. SNR Loss reduces the difference between the original and protected waveforms. In our experiments, a strong SNR term could suppress the perturbation before it provided enough protection.

We separated the objectives into stages. While the embedding-space magnitude of the perturbation code, `||P||₂`, is below a threshold `τ`, the model optimizes Target Loss alone. At the threshold, it stops those updates and switches to SNR Loss.

`L = L_Target  if ||P||₂ < τ,  otherwise L_SNR`

The intention is to establish enough identity disruption first, then recover quality without largely undoing it. We selected the switching threshold on VCTK and applied it to the other five corpora without retuning.

<p class="section-label">06 · Dataset and protocol</p>

## 1,200 utterances from 120 speakers across six corpora

We used VCTK, FST, MCV, CSNED, CSUKIED, and LibriSpeech. Across these corpora, we selected 120 speakers and ten utterances per speaker, for 1,200 protected recordings. VCTK supplied the threshold-selection data; the remaining corpora tested the same threshold under different recording and speaker conditions.

<div class="research-table" role="region" aria-label="RoCo evaluation setup" tabindex="0">
  <table>
    <thead><tr><th>Component</th><th>Configuration</th><th>Purpose</th></tr></thead>
    <tbody>
      <tr><td>Speech corpora</td><td>VCTK, FST, MCV, CSNED, CSUKIED, LibriSpeech</td><td>120 speakers × 10 utterances = 1,200 samples</td></tr>
      <tr><td>Voice cloning</td><td>SV2TTS, YourTTS, AdaptVC (AVC)</td><td>Two zero-shot TTS models and one voice-conversion model</td></tr>
      <tr><td>Speaker verification</td><td>Resemblyzer, ECAPA-TDNN, ResNet</td><td>Whether a clone is accepted as the original speaker</td></tr>
      <tr><td>Enhancement</td><td>Spectral Masking, DeepFilterNet, MP-SENet DNS/VB</td><td>Change in DSR after attempted perturbation removal</td></tr>
      <tr><td>Purification</td><td>De-AntiFake</td><td>An additional attack designed to clean protected speech</td></tr>
      <tr><td>Baselines</td><td>AntiFake, AttackVC, VoiceGuard</td><td>Signal-domain proactive defenses</td></tr>
    </tbody>
  </table>
</div>

Defense Success Rate (DSR) is the fraction of clones made from protected audio that are rejected as the original speaker. Higher is better. We assessed audio quality with NISQA MOS on a 1–5 scale and measured the time needed to protect input recordings lasting 5–10 seconds.

<p class="section-label">07 · Base defense performance</p>

## Protection across three cloning models

Unprotected (RAW) recordings generally produced low DSR because the clones were accepted as the original speakers. RoCo increased DSR for every combination of the three cloning models and three verifiers. On AVC, its mean DSR was 81.5%, compared with 74.8% for AntiFake, 66.9% for VoiceGuard, and 60.1% for AttackVC.

AttackVC and AntiFake had higher averages on SV2TTS, while RoCo reached 84.6%. On YourTTS, RoCo's 75.3% was 1.8 percentage points below AntiFake's leading 77.1%. We assessed these results alongside post-processing resistance and generation time; the highest initial DSR was only one part of the comparison.

<div class="research-table" role="region" aria-label="RoCo base DSR results, in percent" tabindex="0">
  <table>
    <thead><tr><th>Cloning</th><th>Verifier</th><th>RAW</th><th>AntiFake</th><th>AttackVC</th><th>VoiceGuard</th><th>RoCo</th></tr></thead>
    <tbody>
      <tr><td rowspan="3">SV2TTS</td><td>Resemblyzer</td><td>0.8</td><td>91.3</td><td>92.7</td><td>75.4</td><td><strong>81.6</strong></td></tr>
      <tr><td>ECAPA</td><td>25.1</td><td>89.3</td><td>96.0</td><td>78.0</td><td><strong>87.2</strong></td></tr>
      <tr><td>ResNet</td><td>13.7</td><td>92.4</td><td>92.7</td><td>82.7</td><td><strong>85.0</strong></td></tr>
      <tr><td rowspan="3">YourTTS</td><td>Resemblyzer</td><td>0.7</td><td>72.2</td><td>45.2</td><td>57.3</td><td><strong>72.8</strong></td></tr>
      <tr><td>ECAPA</td><td>10.6</td><td>80.3</td><td>72.0</td><td>69.8</td><td><strong>79.0</strong></td></tr>
      <tr><td>ResNet</td><td>3.0</td><td>78.9</td><td>73.1</td><td>74.3</td><td><strong>74.1</strong></td></tr>
      <tr><td rowspan="3">AVC</td><td>Resemblyzer</td><td>6.9</td><td>73.2</td><td>37.5</td><td>63.0</td><td><strong>77.5</strong></td></tr>
      <tr><td>ECAPA</td><td>42.1</td><td>79.9</td><td>62.9</td><td>68.6</td><td><strong>82.8</strong></td></tr>
      <tr><td>ResNet</td><td>33.7</td><td>71.3</td><td>79.9</td><td>69.1</td><td><strong>84.3</strong></td></tr>
    </tbody>
  </table>
</div>

<div class="research-metrics" aria-label="RoCo mean DSR by cloning model">
  <div class="research-metric"><span class="research-metric-value">84.6%</span><span class="research-metric-label">SV2TTS mean DSR</span></div>
  <div class="research-metric"><span class="research-metric-value">75.3%</span><span class="research-metric-label">YourTTS mean DSR</span></div>
  <div class="research-metric"><span class="research-metric-value">81.5%</span><span class="research-metric-label">AVC mean DSR</span></div>
</div>

<p class="section-label">08 · Enhancement robustness</p>

## Smaller losses after speech enhancement

We applied Spectral Masking, DeepFilterNet, and the DNS and VoiceBank variants of MP-SENet before cloning. Across 36 combinations of enhancement, cloning, and verification models, the paper reported an average DSR drop of roughly 15 percentage points for RoCo, compared with about 38 points for the baselines.

The table below averages the nine cloning–verification combinations for each enhancement method in Table 2 of the paper. Some MP-SENet DNS combinations fell to 44.7%, while other conditions stayed near 80%. Protection persisted, but its strength varied substantially by condition.

<div class="research-table" role="region" aria-label="RoCo DSR after speech enhancement" tabindex="0">
  <table>
    <thead><tr><th>Enhancement</th><th>Mean DSR</th><th>Minimum–maximum</th><th>Combinations</th></tr></thead>
    <tbody>
      <tr><td>Spectral Masking</td><td>67.8%</td><td>54.8–78.6%</td><td>9</td></tr>
      <tr><td>DeepFilterNet</td><td>62.6%</td><td>49.1–76.5%</td><td>9</td></tr>
      <tr><td>MP-SENet DNS</td><td>63.6%</td><td>44.7–78.2%</td><td>9</td></tr>
      <tr><td>MP-SENet VB</td><td>64.8%</td><td>52.0–80.4%</td><td>9</td></tr>
    </tbody>
  </table>
</div>

We also tested De-AntiFake purification. On AVC, DSR remained at 77.4% with Resemblyzer, 80.3% with ECAPA, and 79.1% with ResNet. Results ranged from 63.1–79.2% on YourTTS and 49.4–70.5% on SV2TTS. The amount of remaining protection depended on the model, but purification did not remove it entirely.

<div class="research-table" role="region" aria-label="RoCo DSR after De-AntiFake purification" tabindex="0">
  <table>
    <thead><tr><th>Verifier</th><th>SV2TTS</th><th>YourTTS</th><th>AVC</th></tr></thead>
    <tbody>
      <tr><td>Resemblyzer</td><td>49.4%</td><td>63.1%</td><td>77.4%</td></tr>
      <tr><td>ECAPA</td><td>70.5%</td><td>79.2%</td><td>80.3%</td></tr>
      <tr><td>ResNet</td><td>65.2%</td><td>78.2%</td><td>79.1%</td></tr>
    </tbody>
  </table>
</div>

<p class="section-label">09 · Speed and quality</p>

## Protecting a 5–10-second recording in 13–22 seconds

The clearest improvement was generation time. In the SV2TTS setting, RoCo took 20 seconds, compared with 113 seconds for AntiFake and 122 for AttackVC. In the YourTTS setting, the corresponding times were 22, 89, and 40 seconds; for AVC, they were 13, 105, and 59 seconds. This was still slower than real time, but substantially shorter than the 1–2 minutes required by some signal-domain configurations.

<figure class="research-figure research-figure-comparison">
  <a class="research-figure-scroll" href="/assets/writings/roco/generation-time.svg" aria-label="Open the full generation-time chart"><img src="/assets/writings/roco/generation-time.svg" alt="Time required by AntiFake, AttackVC, and RoCo to protect speech in the SV2TTS, YourTTS, and AVC settings"></a>
  <figcaption>Time to protect a 5–10-second utterance. RoCo took 13–22 seconds across the three cloning settings. Chart based on Table 5 of the ICASSP 2026 paper.</figcaption>
</figure>

We also measured quality with NISQA MOS. RoCo's mean MOS was 2.42 before enhancement, rising to 3.23 with DeepFilterNet and 3.17 with MP-SENet DNS. These gains need to be read alongside DSR: enhancement can improve how the audio sounds while also weakening its protection.

<div class="research-table" role="region" aria-label="RoCo audio quality measured with NISQA MOS" tabindex="0">
  <table>
    <thead><tr><th>Enhancement</th><th>SV2TTS MOS</th><th>YourTTS MOS</th><th>AVC MOS</th><th>Mean across models</th></tr></thead>
    <tbody>
      <tr><td>None</td><td>2.72 ± 0.29</td><td>2.09 ± 0.37</td><td>2.44 ± 0.42</td><td>2.42</td></tr>
      <tr><td>Spectral Masking</td><td>2.63 ± 0.73</td><td>2.43 ± 0.64</td><td>3.02 ± 0.73</td><td>2.69</td></tr>
      <tr><td>DeepFilterNet</td><td>3.16 ± 0.73</td><td>3.30 ± 0.78</td><td>3.24 ± 0.69</td><td>3.23</td></tr>
      <tr><td>MP-SENet DNS</td><td>2.97 ± 0.83</td><td>3.42 ± 0.97</td><td>3.13 ± 0.79</td><td>3.17</td></tr>
      <tr><td>MP-SENet VB</td><td>2.11 ± 0.60</td><td>2.21 ± 0.64</td><td>2.38 ± 0.64</td><td>2.23</td></tr>
    </tbody>
  </table>
</div>

<div class="research-callout">
  <p class="research-callout-title">Remaining limits</p>
  <p>Code-level optimization reduced generation time and the average loss of protection after enhancement. The measured 13–22 seconds still falls short of real-time use. The evaluation covered three cloning models and selected enhancement and purification attacks; reconstruction by an attacker who knows the full defense, and testing on a wider range of cloning models, remain follow-up work.</p>
</div>

<p class="section-label">10 · ICASSP presentation</p>

## Presenting RoCo in Barcelona

I presented RoCo at IEEE ICASSP 2026, held in Barcelona, Spain, on May 4–8, 2026. The talk introduced the codec-based defense work that led from RoVo to RoCo, then used Figure 1 to explain how perturbation codes, STE, and two-stage optimization changed generation time and resistance to post-processing.

<figure class="research-figure research-figure-photo">
  <img src="/assets/writings/roco/icassp-presentation.jpg" alt="Presenting RoCo's perturbation code, STE, two-stage optimization, and architecture at ICASSP 2026">
  <figcaption>The ICASSP 2026 oral presentation, with the three design components shown alongside the codec-based defense pipeline. Barcelona, Spain · May 2026.</figcaption>
</figure>

The demo page lets readers hear what the DSR and MOS measurements describe. For AVC, SV2TTS, and YourTTS, it places the original recording, protected speech, cloned output, enhanced speech, and clones made after enhancement side by side.

<p class="section-label">11 · Publication and resources</p>

## Paper and audio samples

The study began in 2025 and was published as a five-page paper in the ICASSP 2026 proceedings, on pages 1671–1675. The IEEE Xplore DOI is `10.1109/ICASSP55912.2026.11462176`.

<div class="publication-card">
  <p class="publication-card-kicker">ICASSP 2026 · Oral · Published</p>
  <p class="publication-card-title">RoCo: Robust Code for Fast and Effective Proactive Defense against Voice Cloning Attack</p>
  <p class="publication-card-meta">Seungmin Kim, Dain Kim, Sohee Park, Daeseon Choi · ICASSP 2026 · pp. 1671–1675 · May 2026</p>
  <p class="publication-card-links"><a href="https://doi.org/10.1109/ICASSP55912.2026.11462176">Paper (IEEE DOI)</a><a href="https://smerge0802.github.io/RoCo/">Audio samples</a><a href="/writings/rovo-robust-voice-protection/">Earlier work: RoVo</a></p>
</div>

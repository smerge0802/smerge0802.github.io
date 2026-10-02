---
title: "NaVo: Natural Voice Protection against Voice Cloning Attacks via Generative Universal Adversarial Audio"
description: "Generating rain, babble, and other background sounds that protect voices without optimizing a new perturbation for each recording. Published at Interspeech 2026."
lang: en
thumbnail: "/assets/writings/navo/navo-framework.png"
period: "2026"
---

In 2026, we studied whether a trained generator could protect new speakers without optimizing a separate perturbation for each utterance. This work became NaVo, a method for generating **Universal Adversarial Audio (UAA)**, published at Interspeech 2026.

NaVo generates audible background sounds such as rain, babble, and music. We mix them with the original speech at a signal-to-noise ratio (SNR) of 17 dB. The generator is trained to produce plausible ambient audio that also interferes with a cloning model's extraction of speaker identity.

<div class="project-meta" aria-label="Study overview">
  <div><span>Period</span><strong>2026</strong></div>
  <div><span>Task</span><strong>Generative proactive voice protection</strong></div>
  <div><span>Publication</span><strong>Interspeech 2026</strong></div>
</div>

<p class="section-label">01 · Motivation</p>

## The cost of optimizing every recording

A voice-cloning model can extract a speaker's timbre and speaking characteristics from a few seconds of reference audio. Public videos and recordings can supply that reference for speech the person never actually said. Protecting the reference before publication offers a way to interfere with cloning before the impersonation is created.

Existing proactive defenses often optimize perturbations directly in the waveform or frequency domain. This requires repeated gradient calculations for each recording, and the output can sound like high-frequency noise or irregular distortion. The cost accumulates when protecting longer videos, broadcasts, or continuous speech.

NaVo trains a generator to produce protective background audio that can be reused across speakers and utterances. At inference, there is no per-recording gradient optimization: the system generates the audio and mixes it with the recording.

<div class="research-callout research-callout-finding">
  <p class="research-callout-title">The question behind NaVo</p>
  <p>Can generated background sounds fit a plausible acoustic scene while disrupting the identity of unseen speakers, including under black-box cloning and attempts to remove the background audio?</p>
</div>

<p class="section-label">02 · Universal adversarial audio</p>

## Making background sound carry the protection

NaVo's output is intended to be heard. It follows a text prompt describing rain, babble, music, or an office environment. The premise is that recognizable ambient sound may fit a recording or social-media clip more naturally than an irregular noise pattern.

Given original speech `x`, text prompt `p`, and an AudioLDM2-based generator `G`, we form the protected speech as:

`x_prot = x + G(z | p; Θ + ΔΘ)`

`Θ` denotes the frozen parameters of the pretrained text-to-audio model, and `ΔΘ` the LoRA parameters trained for protection. We add the generator's output to `x` rather than repeatedly updating `x` itself. A trained LoRA module can be reused for speakers and sentences absent from training.

<div class="research-callout">
  <p class="research-callout-title">What “universal” means here</p>
  <ul>
    <li><strong>Speaker-independent</strong> — no retraining or perturbation optimization for each new speaker.</li>
    <li><strong>Utterance-independent</strong> — generate audio in the selected category and mix it with a new utterance.</li>
    <li><strong>Category-controllable</strong> — choose rain, babble, or music to suit the recording's setting.</li>
  </ul>
</div>

<p class="section-label">03 · NaVo framework</p>

## Adapting AudioLDM2 with LoRA

We used AudioLDM2, a latent-diffusion text-to-audio model, as the backbone. It generates acoustic latents conditioned on a prompt, then reconstructs a waveform through a VAE and vocoder. We added LoRA to the UNet's cross-attention layers to learn protective ambient audio while keeping the rest of the model fixed.

Training used both a text prompt and source speech. The predicted ambient audio was mixed with the speech and passed through a frozen synthesis model's speaker encoder. Diffusion Loss encouraged the output to retain the structure of its acoustic category. Distributional Target Loss moved the mixed speech's embeddings away from the original speaker population.

At inference, we selected the LoRA module for the speaker's gender and the desired acoustic category, generated the background audio, and mixed it with the recording. The speaker encoder and loss calculations were only needed during training.

<figure class="research-figure research-figure-comparison">
  <a class="research-figure-scroll" href="/assets/writings/navo/navo-framework.png" aria-label="Open the full NaVo architecture figure"><img src="/assets/writings/navo/navo-framework.png" alt="NaVo trains AudioLDM2 LoRA modules with diffusion and distributional losses, then generates category-specific background audio and mixes it with speech at inference"></a>
  <figcaption>Left: training the text-to-audio UNet's LoRA modules for protection. Right: generating UAA with a selected module and mixing it with the original speech. Figure 1 from the accepted manuscript.</figcaption>
</figure>

<p class="section-label">04 · Modular LoRA</p>

## Separate adapters for gender and acoustic category

A single adapter would have to learn several speaker targets and acoustic categories at once. We separated the LoRA modules by target gender and sound category. For male source speakers, we used a module targeting the female speaker distribution; for female source speakers, we used the male distribution. Within each gender setting, separate adapters handled rain, music, babble, and related categories.

LoRA was applied only to the key and value projections of cross-attention in the UNet Transformer blocks:

`W′_K = W_K + B_K A_K`, `W′_V = W_V + B_V A_V`

Only the low-rank matrices `A` and `B` were updated. The VAE, vocoder, text encoder, and remaining UNet parameters stayed frozen. Restricting the updates to the key and value paths let us adjust how text conditions the audio while retaining the backbone's learned sound-generation behavior.

<div class="research-table" role="region" aria-label="NaVo LoRA module configuration" tabindex="0">
  <table>
    <thead><tr><th>Component</th><th>Selection</th><th>Training objective</th><th>Role at inference</th></tr></thead>
    <tbody>
      <tr><td>Target gender</td><td>Opposite to the source speaker</td><td>Move toward the opposite-gender embedding distribution</td><td>Select the adapter for the source speaker</td></tr>
      <tr><td>Acoustic category</td><td>Rain, babble, music, office sounds</td><td>Retain background audio that matches the prompt</td><td>Select a suitable sound for the setting</td></tr>
      <tr><td>Trainable weights</td><td>Cross-attention K/V LoRA</td><td>Learn protection through a small parameter set</td><td>Attach the module to the base model</td></tr>
      <tr><td>Frozen weights</td><td>VAE, vocoder, text encoder, and remaining weights</td><td>Preserve pretrained generation behavior</td><td>Reuse without further optimization</td></tr>
    </tbody>
  </table>
</div>

<p class="section-label">05 · Distributional target</p>

## Targeting a speaker distribution instead of one speaker

Targeted defenses often move a protected embedding toward one chosen speaker. A single target point does not capture the spread of a speaker population, and may be difficult to reuse across many source identities. NaVo instead models the target as a Gaussian distribution.

The speaker encoders' t-SNE projections showed separate regions for male and female speakers. We used this structure to set the mean and variance of female embeddings as the target for male source speech, and vice versa. From the target dataset `X_target`, we estimated `μ_P` and `σ²_P`. We also modeled the protected embeddings in a training batch as `Q = N(μ_Q, diag(σ²_Q))`.

<figure class="research-figure research-figure-comparison">
  <a class="research-figure-scroll" href="/assets/writings/navo/gender-embedding.png" aria-label="Open the full speaker-embedding visualization"><img src="/assets/writings/navo/gender-embedding.png" alt="t-SNE projections from two encoders, with male embeddings shown in blue and female embeddings in red"></a>
  <figcaption>Both encoders showed clusters separated by gender. This observation motivated the opposite-gender distribution used as an adversarial target. Figure 2 from the accepted manuscript.</figcaption>
</figure>

Matching only the centroid can leave the distribution too narrow or too broad. We used Bhattacharyya distance, corresponding to `α = 0.5` in the α-divergence family, to match both the mean and variance of `Q` and `P`. The objective was to shift batches of protected embeddings away from their source identities, not to reproduce a particular target person's voice.

<p class="section-label">06 · Joint objective</p>

## Keeping the sound category while disrupting speaker identity

The training objective combines Diffusion Loss and Distributional Target Loss. Diffusion Loss retains AudioLDM2's denoising objective: add noise to the clean latent of a reference ambient recording at a chosen timestep, then train the UNet to predict it. This keeps the adapted model generating recognizable sounds that match the prompt.

For Distributional Target Loss, we mixed the UNet's estimated ambient audio `â` with source speech `s`. We scaled the mixing amplitude using the two signals' RMS and kept SNR at 17 dB throughout training. This setting made the background audible while keeping the words intelligible.

The mixture passed through a frozen speaker encoder `f(·)`. Since its parameters did not change, movement in the protected embeddings had to come from the generated audio and the LoRA updates. Gradients flowed back through the encoder and mixing operation to the UNet's LoRA parameters.

`L_total = λ_diff L_diff + λ_emb I[t < t_max] D_B(Q || P)`

We applied the embedding loss only at low-noise timesteps, `t < t_max`, where the denoised estimate was more stable. This avoided using highly uncertain audio estimates to guide speaker-target optimization.

<p class="section-label">07 · Inference-time defense</p>

## Generating the background audio and mixing it with speech

At inference, the inputs are the recording, the speaker's gender condition, and the desired ambient category. NaVo attaches the selected LoRA module to AudioLDM2, generates UAA from the prompt, scales it to 17 dB SNR, and adds it to the recording.

An optimization-based defense recalculates target losses and updates the waveform for each new utterance. NaVo performs that learning in advance, so it does not need speaker-encoder gradients for a new recording. The paper's claim of real-time applicability refers to this **generation-and-mixing pipeline**, without per-utterance gradient optimization. It does not report absolute end-to-end latency on a particular device.

<div class="research-callout">
  <p class="research-callout-title">Inference path</p>
  <ul>
    <li><strong>Select</strong> — choose the LoRA module for the speaker's gender and acoustic category.</li>
    <li><strong>Generate</strong> — produce UAA in that category from a text prompt.</li>
    <li><strong>Mix</strong> — use RMS scaling to mix it with the original speech at 17 dB SNR.</li>
    <li><strong>Reuse</strong> — apply the same module to unseen speakers and new utterances without further training.</li>
  </ul>
</div>

<p class="section-label">08 · Dataset and protocol</p>

## Speech from six corpora, ambient audio from AudioSet

We used VCTK, FST, Mozilla Common Voice (MCV), CSNED, CSUKIED, and LibriSpeech. After combining the corpora, we split them by speaker: 196 for training, 42 for validation, and 42 for testing. With ten utterances per speaker, the splits contained 1,960, 420, and 420 samples. Test speakers were absent from training, allowing us to assess protection on unseen identities.

The data used to estimate target distributions was disjoint from all source splits. For ambient audio, we selected 100 AudioSet recordings per category to help retain category-consistent generation.

<div class="research-metrics" aria-label="NaVo dataset composition">
  <div class="research-metric"><span class="research-metric-value">6</span><span class="research-metric-label">Speech corpora<br>English-speaking participants</span></div>
  <div class="research-metric"><span class="research-metric-value">196 · 42 · 42</span><span class="research-metric-label">Train · validation · test speakers<br>No speaker overlap</span></div>
  <div class="research-metric"><span class="research-metric-value">2,800</span><span class="research-metric-label">Speech samples in total<br>10 per speaker</span></div>
  <div class="research-metric"><span class="research-metric-value">100 / category</span><span class="research-metric-label">Ambient recordings<br>Selected from AudioSet</span></div>
</div>

<div class="research-table" role="region" aria-label="NaVo evaluation protocol" tabindex="0">
  <table>
    <thead><tr><th>Component</th><th>Configuration</th><th>Purpose</th></tr></thead>
    <tbody>
      <tr><td>White-box cloning</td><td>SV2TTS, CosyVoice</td><td>Test against the encoder families used in training</td></tr>
      <tr><td>Black-box cloning</td><td>Tortoise, ElevenLabs</td><td>Test transfer to unseen architectures and a commercial API</td></tr>
      <tr><td>Speaker verification</td><td>Resemblyzer, ECAPA-TDNN, ResNet</td><td>Determine whether a clone is accepted as the original speaker</td></tr>
      <tr><td>Target encoder</td><td>GE2E, CAM++, white-box ensemble</td><td>Train white-box protection and support black-box transfer</td></tr>
      <tr><td>Baseline</td><td>Enkidu</td><td>Compare with a real-time universal proactive defense</td></tr>
      <tr><td>Adaptive attack</td><td>Filtering, quantization, downsampling, spectral masking</td><td>Measure DSR after attempts to remove UAA</td></tr>
    </tbody>
  </table>
</div>

Defense Success Rate (DSR) is the fraction of clones whose verification score falls below the threshold for acceptance as the original speaker. Higher DSR means more successful protection. We used CLAP score to measure semantic alignment between the generated audio and its prompt. We did not use a conventional DNN MOS estimator as the main quality measure because it can penalize speech mixed with background audio regardless of how natural that background sounds.

<p class="section-label">09 · Overall performance</p>

## Higher DSR than Enkidu on unseen speakers

On the held-out test set, DSR increased from Enkidu's 25.2% to NaVo's 78.0% with Resemblyzer, from 60.6% to 83.6% with ECAPA-TDNN, and from 45.5% to 79.8% with ResNet. The difference exceeded 20 percentage points for each verifier; with Resemblyzer, NaVo's DSR was more than three times Enkidu's.

<div class="research-metrics" aria-label="NaVo overall defense results">
  <div class="research-metric"><span class="research-metric-value">78.0%</span><span class="research-metric-label">Resemblyzer DSR<br>Enkidu 25.2%</span></div>
  <div class="research-metric"><span class="research-metric-value">83.6%</span><span class="research-metric-label">ECAPA-TDNN DSR<br>Enkidu 60.6%</span></div>
  <div class="research-metric"><span class="research-metric-value">79.8%</span><span class="research-metric-label">ResNet DSR<br>Enkidu 45.5%</span></div>
  <div class="research-metric"><span class="research-metric-value">76%</span><span class="research-metric-label">ElevenLabs mean DSR<br>Black-box commercial API</span></div>
</div>

<div class="research-table" role="region" aria-label="Overall DSR comparison between NaVo and Enkidu" tabindex="0">
  <table>
    <thead><tr><th>Method</th><th>Resemblyzer</th><th>ECAPA-TDNN</th><th>ResNet</th></tr></thead>
    <tbody>
      <tr><td>Enkidu</td><td>25.2%</td><td>60.6%</td><td>45.5%</td></tr>
      <tr><td><strong>NaVo</strong></td><td><strong>78.0%</strong></td><td><strong>83.6%</strong></td><td><strong>79.8%</strong></td></tr>
    </tbody>
  </table>
</div>

These results came from applying the trained LoRA modules directly to 42 unseen test speakers. There was no separate perturbation optimization for those identities. The comparison therefore measures how well the universal modules transfer beyond the training speakers.

<p class="section-label">10 · White-box evaluation</p>

## Strong results for rain and office sounds; lower DSR on CosyVoice

The white-box experiments targeted SV2TTS's GE2E encoder and CosyVoice's CAM++ encoder. Without UAA, CosyVoice DSR was only 0.0–2.9%, depending on the verifier. NaVo raised it to roughly 40–62%, depending on the sound category and verifier. On SV2TTS, several raindrop and office conditions reached 88–98% DSR.

<div class="research-table" role="region" aria-label="NaVo white-box DSR results, in percent" tabindex="0">
  <table>
    <thead><tr><th>Gender · Style</th><th>Resemblyzer<br>SV2TTS / CosyVoice</th><th>ECAPA-TDNN<br>SV2TTS / CosyVoice</th><th>ResNet<br>SV2TTS / CosyVoice</th></tr></thead>
    <tbody>
      <tr><td>Female · No UAA</td><td>3.7 / 1.0</td><td>22.1 / 2.9</td><td>23.0 / 0.5</td></tr>
      <tr><td>Female · Raindrop</td><td>88.4 / 57.8</td><td>89.7 / 57.4</td><td>95.1 / 51.1</td></tr>
      <tr><td>Female · Babble</td><td>68.6 / 55.1</td><td>66.4 / 52.1</td><td>79.2 / 49.3</td></tr>
      <tr><td>Female · Office</td><td>89.5 / 50.4</td><td>89.2 / 40.1</td><td>93.0 / 41.2</td></tr>
      <tr><td>Male · No UAA</td><td>1.1 / 0.2</td><td>24.9 / 1.3</td><td>19.3 / 0.0</td></tr>
      <tr><td>Male · Raindrop</td><td>69.8 / 58.3</td><td>89.4 / 62.1</td><td>93.8 / 51.1</td></tr>
      <tr><td>Male · Babble</td><td>56.4 / 41.3</td><td>74.5 / 55.7</td><td>81.1 / 50.4</td></tr>
      <tr><td>Male · Office</td><td>93.7 / 52.7</td><td>97.6 / 43.6</td><td>97.9 / 39.7</td></tr>
    </tbody>
  </table>
</div>

The sound category made a difference. Office and raindrop produced the highest SV2TTS results, while babble was generally lower. CosyVoice, a stronger zero-shot model using supervised semantic tokens, had lower DSR than SV2TTS. Even so, every tested style improved on its near-zero No UAA baseline.

CLAP measured whether the adapted generator retained the acoustic semantics of base AudioLDM2. Scores varied by encoder and gender, but the paper interpreted the overall alignment as comparable to the backbone. This supports prompt–audio consistency; it is not a direct measure of how natural the protected speech sounds to a listener.

<p class="section-label">11 · Black-box evaluation</p>

## Transfer to Tortoise and ElevenLabs

For black-box experiments, we trained NaVo with an ensemble of white-box encoders, including GE2E and CAM++, then cloned the protected speech with Tortoise and ElevenLabs. Neither cloning model participated in optimization. Raindrop and babble retained high DSR across the three verifiers, indicating that the protection was not confined to the training encoders.

<div class="research-table" role="region" aria-label="NaVo black-box DSR results, in percent" tabindex="0">
  <table>
    <thead><tr><th>Gender · Style</th><th>Resemblyzer<br>Tortoise / ElevenLabs</th><th>ECAPA-TDNN<br>Tortoise / ElevenLabs</th><th>ResNet<br>Tortoise / ElevenLabs</th></tr></thead>
    <tbody>
      <tr><td>Female · No UAA</td><td>0.5 / 0.0</td><td>11.7 / 0.0</td><td>1.3 / 0.5</td></tr>
      <tr><td>Female · Raindrop</td><td>91.1 / 97.1</td><td>93.5 / 95.2</td><td>91.0 / 96.2</td></tr>
      <tr><td>Female · Babble</td><td>88.9 / 94.8</td><td>91.1 / 90.0</td><td>90.3 / 80.5</td></tr>
      <tr><td>Female · Music</td><td>56.5 / 83.8</td><td>77.5 / 49.5</td><td>67.5 / 43.8</td></tr>
      <tr><td>Male · No UAA</td><td>3.3 / 0.0</td><td>13.6 / 0.0</td><td>5.4 / 0.0</td></tr>
      <tr><td>Male · Raindrop</td><td>77.1 / 92.9</td><td>94.4 / 95.2</td><td>89.5 / 97.1</td></tr>
      <tr><td>Male · Babble</td><td>80.8 / 84.3</td><td>84.8 / 81.9</td><td>78.9 / 67.6</td></tr>
      <tr><td>Male · Music</td><td>75.4 / 42.9</td><td>60.3 / 33.3</td><td>61.9 / 32.9</td></tr>
    </tbody>
  </table>
</div>

Averaged over the 18 gender–style–verifier combinations, ElevenLabs DSR was approximately 76%. Raindrop reached 92.9–97.1% in every combination, while music fell to 32.9–42.9% for male speakers. The commercial-model result therefore depends substantially on the chosen sound category.

On Tortoise, female raindrop and babble stayed at or above 88.9% across all three verifiers. Male raindrop reached 94.4% with ECAPA-TDNN and 89.5% with ResNet. No UAA results were mostly within 0–13.6%, so the increase cannot be explained simply by the cloning models failing on unprotected speech.

<p class="section-label">12 · Adaptive attacks and limits</p>

## Testing attempts to remove the background sound

An attacker who suspects the background audio is protective can apply filtering, quantization, downsampling, or spectral masking before cloning. We built these adaptive conditions using WaveGuard signal processing and DNN-based speech enhancement.

<figure class="research-figure research-figure-comparison">
  <a class="research-figure-scroll" href="/assets/writings/navo/adaptive-attacks.png" aria-label="Open the full adaptive-attack results"><img src="/assets/writings/navo/adaptive-attacks.png" alt="DSR after filtering, quantization, downsampling, and spectral masking of babble, rain, and music UAA"></a>
  <figcaption>DSR remained high after filtering and spectral masking. Quantization produced lower results for babble and music, though most combinations stayed above 80%. Figure 3 from the accepted manuscript.</figcaption>
</figure>

Filtering and spectral masking sometimes increased DSR relative to the unprocessed condition. The paper attributes this to purification damaging speaker cues while failing to separate the UAA cleanly from speech. An increase in DSR after attack should therefore not be read as an improvement in audio quality: retained protection and additional speech damage may both contribute.

<div class="research-callout research-callout-limit">
  <p class="research-callout-title">Limits of these results</p>
  <ul>
    <li><strong>Acoustic category</strong> — raindrop and babble were strong, but music had substantially lower DSR in some black-box conditions.</li>
    <li><strong>Gender target</strong> — we used male and female target distributions; broader representations of vocal identity were outside this study.</li>
    <li><strong>Quality metric</strong> — CLAP measures prompt–audio alignment, not listening naturalness or intelligibility directly.</li>
    <li><strong>Latency</strong> — the method removes per-utterance gradient optimization, but the paper does not provide device-specific end-to-end latency benchmarks.</li>
    <li><strong>Attack coverage</strong> — resistance to generators and separation models beyond the four cloning systems and selected purification methods needs further evaluation.</li>
  </ul>
</div>

<p class="section-label">13 · Paper and demo</p>

## Interspeech paper and listening examples

NaVo uses a distributional target and modular LoRA to generate protective ambient audio for unseen speakers. We evaluated it with SV2TTS and CosyVoice in white-box settings, Tortoise and ElevenLabs in black-box settings, and several attempts to remove the protection.

The official Interspeech 2026 paper is available through ISCA Archive. The project page includes protected and cloned speech samples, and the six-page accepted manuscript used for this write-up is also linked below. The first two authors contributed equally and are listed in the order specified by the paper's equal-contribution note.

<div class="publication-card">
  <p class="publication-card-kicker">Interspeech 2026</p>
  <p class="publication-card-title">NaVo: Natural Voice Protection against Voice Cloning Attacks via Generative Universal Adversarial Audio</p>
  <p class="publication-card-meta">Seoyoung Park*, Seungmin Kim*, Sohee Park, Dain Kim, Thien An Nguyen, Thien-Phuc Doan, Souhwan Jung**, Daeseon Choi**</p>
  <p class="publication-note">*These authors contributed equally and are listed in alphabetical order.</p>
  <p class="publication-card-links"><a href="https://www.isca-archive.org/interspeech_2026/park26g_interspeech.html">Paper (ISCA Archive)</a><a href="https://smerge0802.github.io/NaVo/">Project and audio demo</a><a href="/assets/writings/navo/navo-accepted-manuscript.pdf">Accepted manuscript (PDF)</a><a href="/writings/roco-robust-code/">RoCo</a><a href="/writings/rovo-robust-voice-protection/">RoVo</a></p>
</div>

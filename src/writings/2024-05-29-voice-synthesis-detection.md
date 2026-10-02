---
title: "Voice Synthesis Detection Using Language Model-Based Speech Feature Extraction"
description: "Using Encodec tokens and a pretrained BERT model to detect synthetic speech, with experiments on ASVspoof 2019 and 2021."
lang: en
thumbnail: "/assets/writings/voice-synthesis-detection/encodec-bert-feature-extractor.jpg"
period: "2023 – 2024"
---

This study began in 2023 and led to a paper in May 2024. As text-to-speech and voice-conversion systems improved, we wanted to look beyond local waveform and spectral cues for evidence of synthesis. We converted speech into discrete audio tokens and used a BERT model pretrained on text to extract features from their sequence.

The question was whether the codes produced by an audio codec retain temporal relationships that distinguish real speech from synthetic speech. We used Encodec as the tokenizer and BERT-Base as the sequence feature extractor.

<div class="project-meta" aria-label="Study overview">
  <div><span>Period</span><strong>2023 – 2024</strong></div>
  <div><span>Task</span><strong>Real vs. synthetic speech detection</strong></div>
  <div><span>Core idea</span><strong>Encodec + BERT</strong></div>
</div>

<p class="section-label">01 · Research question</p>

## Looking for traces of synthesis in audio-token sequences

Many synthetic-speech detectors use features taken directly from the signal: spectra, phase, filter banks, or raw waveforms. Other approaches use pretrained speech models such as HuBERT. Both can work well, though their performance may depend on cues specific to a generator or recording condition.

We represented speech as a sequence of codebook indices. Encodec produced the codes during compression, and BERT modeled their context. Our hypothesis was that relationships between codes could expose longer patterns in synthetic speech that individual code values would miss.

<div class="research-callout">
  <p class="research-callout-title">The representation</p>
  <p>Encodec maps speech to discrete codebook indices. BERT then reads those indices in sequence, allowing the detector to use relationships across time.</p>
</div>

<p class="section-label">02 · Feature extractor</p>

## Using Encodec as an audio tokenizer for BERT

Encodec consists of an encoder, residual vector quantization (RVQ), and a decoder. The encoder maps the waveform to a continuous latent representation, which RVQ quantizes into integer indices from several codebooks. We passed these codes to BERT instead of decoding them back into speech.

Based on preliminary experiments, we used the output of the second quantization layer. The codes from each recording were arranged in a `[2, 512]` tensor: the first axis described the selected code configuration, and the second was the sequence length presented to BERT. These integer codes were converted to input embeddings for feature extraction.

BERT-Base had 12 Transformer encoder layers, a 768-dimensional hidden state, and 12 self-attention heads. It learned relationships between audio codes in temporal order, using the same context-modeling mechanism it applies to tokens in text.

<figure class="research-figure">
  <img src="/assets/writings/voice-synthesis-detection/encodec-bert-feature-extractor.jpg" alt="Feature extractor passing Encodec encoder and RVQ outputs to BERT as discrete audio tokens">
  <figcaption>BERT processes the discrete codes produced by the Encodec encoder and RVQ. Figure 4 from the published paper.</figcaption>
</figure>

<div class="research-callout research-callout-finding">
  <p class="research-callout-title">Model configuration</p>
  <ul>
    <li><strong>Tokenizer</strong> — Encodec encoder + residual vector quantization.</li>
    <li><strong>Code selection</strong> — output of the second quantization layer.</li>
    <li><strong>Input shape</strong> — a `[2, 512]` discrete code sequence.</li>
    <li><strong>Context model</strong> — BERT-Base, 12 layers, 768 hidden dimensions, 12 heads.</li>
  </ul>
</div>

<p class="section-label">03 · Dataset</p>

## Balancing ASVspoof 2019 and 2021 at 1:1

We evaluated on ASVspoof 2019 and ASVspoof 2021. Logical Access (LA) covers attacks based on text-to-speech and voice conversion; DeepFake (DF) focuses more directly on synthetic-speech detection. We used 2019 LA for the initial comparison and classifier selection, then tested on 2021 LA and DF under different attack conditions.

The original challenge data contained unequal numbers of bona fide and spoof samples, with one class roughly eight times larger than the other in some conditions. Overall accuracy can be misleading under this imbalance. We therefore constructed training, validation, and test splits with a 1:1 ratio of real to synthetic speech.

<div class="research-table" role="region" aria-label="Balanced ASVspoof dataset splits" tabindex="0">
  <table>
    <thead><tr><th>Dataset</th><th>Split</th><th>Bona fide</th><th>Spoof</th><th>Total</th></tr></thead>
    <tbody>
      <tr><td rowspan="3">2019 LA</td><td>Training</td><td>2,580</td><td>2,580</td><td>5,160</td></tr>
      <tr><td>Validation</td><td>2,548</td><td>2,548</td><td>5,096</td></tr>
      <tr><td>Test</td><td>7,355</td><td>7,355</td><td>14,710</td></tr>
      <tr><td rowspan="3">2021 LA</td><td>Training</td><td>10,784</td><td>10,784</td><td>21,568</td></tr>
      <tr><td>Validation</td><td>2,704</td><td>2,704</td><td>5,408</td></tr>
      <tr><td>Test</td><td>3,376</td><td>3,376</td><td>6,752</td></tr>
      <tr><td rowspan="3">2021 DF</td><td>Training</td><td>11,824</td><td>11,824</td><td>23,648</td></tr>
      <tr><td>Validation</td><td>2,548</td><td>2,548</td><td>5,096</td></tr>
      <tr><td>Test</td><td>7,355</td><td>7,355</td><td>14,710</td></tr>
    </tbody>
  </table>
</div>

<div class="research-callout">
  <p class="research-callout-title">Why balance the splits?</p>
  <p>Equal class counts make it easier to assess whether a detector separates both classes, rather than achieving high accuracy by favoring the more common one.</p>
</div>

<p class="section-label">04 · Experiment design</p>

## Testing the features with four classifiers

We wanted to assess the Encodec-BERT representation across different classifiers. We fed the same features to an FC-layer, a Transformer, ResNet-18, and ResNet2.

- **FC-layer** tested whether a simple classifier could separate the two classes from the extracted features.
- **Transformer** added a second stage of sequence modeling.
- **ResNet-18** learned patterns in the `[512, 768]` feature tensor through a residual network.
- **ResNet2** adjusted the input and output dimensions of ResNet-18's layers for the speech features.

In stage 1, we trained and evaluated all four on ASVspoof 2019 LA and compared them with ASSD, TSSDNet, and CCT. ASSD was a useful reference because it also combined an audio codec with a Transformer. In stage 2, we took the three stronger classifiers from 2019 LA—FC-layer, ResNet-18, and ResNet2—and evaluated them on 2021 LA and DF.

<figure class="research-figure research-figure-comparison">
  <img src="/assets/writings/voice-synthesis-detection/two-stage-experiment.svg" alt="Four classifiers are compared on ASVspoof 2019 LA; three are then evaluated on ASVspoof 2021 LA and DF">
  <figcaption>The feature-extraction design stays the same while the classifiers and datasets change. Diagram redrawn from the paper's experimental procedure.</figcaption>
</figure>

<figure class="research-figure research-figure-interface">
  <img src="/assets/writings/voice-synthesis-detection/classifier-evaluation.jpg" alt="Pooled Encodec-BERT features passed to FC-layer, Transformer, ResNet-18, and ResNet2 classifiers">
  <figcaption>Four classifiers receive the same Encodec-BERT features. Figure 5 from the published paper.</figcaption>
</figure>

<p class="section-label">05 · Metrics</p>

## Per-class accuracy and equal error rate

In the paper, Class 0 denotes real speech and Class 1 denotes synthetic speech. Per-class accuracy shows which class accounts for more errors. Balanced accuracy is the mean of the two class accuracies; overall accuracy is the fraction of all samples classified correctly.

EER is the error rate at the threshold where real speech is rejected as synthetic as often as synthetic speech is accepted as real. A lower EER indicates better separation between the classes.

<div class="research-callout">
  <p class="research-callout-title">Reading the results</p>
  <ul>
    <li><strong>Class 0 Accuracy</strong> — accuracy on real speech.</li>
    <li><strong>Class 1 Accuracy</strong> — accuracy on synthetic speech.</li>
    <li><strong>Balanced Accuracy</strong> — mean of the two class accuracies.</li>
    <li><strong>EER</strong> — the point where the two error rates are equal; lower is better.</li>
  </ul>
</div>

<p class="section-label">06 · Results</p>

## An EER of 11.79% on 2021 DF

<div class="research-metrics" aria-label="Main experimental results">
  <div class="research-metric"><span class="research-metric-value">88.08%</span><span class="research-metric-label">2019 LA accuracy<br>Encodec-BERT + ResNet2</span></div>
  <div class="research-metric"><span class="research-metric-value">15.98%</span><span class="research-metric-label">2019 LA EER<br>Encodec-BERT + ResNet2</span></div>
  <div class="research-metric"><span class="research-metric-value">10.91%</span><span class="research-metric-label">2021 LA EER<br>Encodec-BERT + FC-layer</span></div>
  <div class="research-metric"><span class="research-metric-value">11.79%</span><span class="research-metric-label">2021 DF EER<br>Encodec-BERT + ResNet2</span></div>
</div>

### Stage 1: ASVspoof 2019 LA

<div class="research-table" role="region" aria-label="Proposed model results on ASVspoof 2019 LA" tabindex="0">
  <table>
    <thead><tr><th>Classifier</th><th>Class 0</th><th>Class 1</th><th>Balanced</th><th>Accuracy</th><th>EER</th></tr></thead>
    <tbody>
      <tr><td>FC-layer</td><td>80.84%</td><td>99.08%</td><td>89.96%</td><td>87.88%</td><td>17.09%</td></tr>
      <tr><td>ResNet-18</td><td>80.46%</td><td>99.04%</td><td>89.75%</td><td>87.57%</td><td>17.40%</td></tr>
      <tr><td><strong>ResNet2</strong></td><td>81.27%</td><td>98.69%</td><td><strong>89.98%</strong></td><td><strong>88.08%</strong></td><td><strong>15.98%</strong></td></tr>
      <tr><td>Transformer</td><td>81.43%</td><td>70.43%</td><td>77.00%</td><td>74.65%</td><td>23.07%</td></tr>
    </tbody>
  </table>
</div>

ResNet2 gave the best results among these four configurations, with 88.08% accuracy and 15.98% EER. The FC-layer was close at 87.88% accuracy and 17.09% EER. Its performance suggested that the extracted features contained useful information even for a simple classifier.

The Transformer classifier reached only 70.43% accuracy on Class 1. Adding another sequence model after BERT did not improve detection in this setting.

### Stage 2: ASVspoof 2021 LA and DF

<div class="research-table" role="region" aria-label="Best reported configurations for each dataset" tabindex="0">
  <table>
    <thead><tr><th>Dataset</th><th>Classifier</th><th>Balanced Accuracy</th><th>Accuracy</th><th>EER</th></tr></thead>
    <tbody>
      <tr><td>2019 LA</td><td>ResNet2</td><td>89.98%</td><td>88.08%</td><td>15.98%</td></tr>
      <tr><td>2021 LA</td><td>FC-layer</td><td>89.42%</td><td>88.67%</td><td><strong>10.91%</strong></td></tr>
      <tr><td>2021 DF</td><td>ResNet2</td><td>87.74%</td><td>87.02%</td><td><strong>11.79%</strong></td></tr>
    </tbody>
  </table>
</div>

The FC-layer performed best on 2021 LA: 84.52% Class 0 accuracy, 89.42% balanced accuracy, 88.67% overall accuracy, and 10.91% EER. On DF, ResNet2 performed best, with 91.28% Class 1 accuracy, 87.74% balanced accuracy, 87.02% overall accuracy, and 11.79% EER.

<div class="research-figure-pair">
  <figure class="research-figure research-figure-comparison">
    <img src="/assets/writings/voice-synthesis-detection/la-results.jpg" alt="Per-class accuracy and EER for FC-layer, ResNet-18, and ResNet2 on ASVspoof 2021 LA">
    <figcaption>The FC-layer reached 88.67% accuracy and 10.91% EER on 2021 LA. Figure 6 from the published paper.</figcaption>
  </figure>
  <figure class="research-figure research-figure-comparison">
    <img src="/assets/writings/voice-synthesis-detection/df-results.jpg" alt="Per-class accuracy and EER for FC-layer, ResNet-18, and ResNet2 on ASVspoof 2021 DF">
    <figcaption>ResNet2 reached 87.02% accuracy and 11.79% EER on 2021 DF. Figure 7 from the published paper.</figcaption>
  </figure>
</div>

The 11.79% EER on DF was below the 15.64% reported for the compared systems using Mel-spectrogram, SincNet, or raw-audio features with CNN or ResNet classifiers. The Fbank-based reference model had an EER of 16.05%, and the CQT-based model had 18.30%. Encodec-BERT produced fewer errors under these comparison conditions.

<div class="research-callout research-callout-finding">
  <p class="research-callout-title">Classifier choice still mattered</p>
  <p>The FC-layer had the lowest EER on LA, while ResNet2 had the lowest on DF. Even with the same feature representation, the best classifier depended on the dataset and attack types.</p>
</div>

<p class="section-label">07 · Limits</p>

## Balanced counts did not eliminate differences between classes

Class 0 and Class 1 accuracy still differed after we balanced their counts at 1:1. The splits also differed in synthesis methods and attack difficulty. Classifiers that performed well on 2019 LA did not retain the same ranking on 2021 LA and DF.

These experiments tested the representation within the attack conditions covered by ASVspoof. They do not establish generalization to new text-to-speech or voice-conversion models, other codecs, compression and retransmission, or real telephone channels. Those conditions require separate evaluation.

<div class="research-callout research-callout-limit">
  <p class="research-callout-title">What balancing does not fix</p>
  <p>Equal sample counts reduce class imbalance, but do not remove differences in attack coverage. Performance on unseen generators and transmission channels remains an open question for this model.</p>
</div>

<p class="section-label">08 · Conclusion</p>

## What we learned from audio tokens

We used Encodec RVQ codes as BERT input tokens to extract features for synthetic-speech detection. After comparing four classifiers on 2019 LA, we evaluated the stronger three on 2021 LA and DF. The best DF result was 11.79% EER, compared with 15.64% for the reference systems discussed above.

The results support using a text-pretrained model to learn discriminative relationships in discrete audio sequences. They also show how much the final classifier and evaluation data affect the outcome. Testing on new generators and real transmission conditions remains necessary before drawing broader conclusions.

<p class="section-label">09 · Publication</p>

## Paper

<div class="publication-card">
  <p class="publication-card-kicker">Publication · First author</p>
  <p class="publication-card-title">Voice Synthesis Detection Using Language Model-Based Speech Feature Extraction</p>
  <p class="publication-card-meta">Seungmin Kim, Sohee Park, Daeseon Choi · Journal of the Korea Institute of Information Security &amp; Cryptology 34(3), 439–449 · 2024</p>
  <p class="publication-card-links"><a href="https://doi.org/10.13089/JKIISC.2024.34.3.439">Paper (DOI)</a><a href="https://www.kci.go.kr/kciportal/ci/sereArticleSearch/ciSereArtiView.kci?sereArticleSearchBean.artiId=ART003089524">KCI record</a></p>
</div>

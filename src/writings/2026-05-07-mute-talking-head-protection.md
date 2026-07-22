---
title: "MUTE: 음성·영상 정렬을 끊어 Talking-Head 악용 막기"
description: "음성 표현과 cross-attention 정렬 구조를 단계적으로 교란하고, 후처리·잡음 제거·TTS 재합성까지 평가한 2026년 talking-head protection 연구."
lang: ko
period: "2026"
---

2026년에는 음성 복제 방어에서 한 걸음 더 나아가, 음성으로 얼굴을 움직이는 **talking-head generation**의 악용을 막는 연구를 수행했다. 이 연구를 바탕으로 `MUTE: Multi-Level Alignment Uncoupling Against Talking-Head Exploitation for Voice Protection`을 작성했으며, 원고는 현재 익명 심사 과정에 있다.

MUTE(Multi-level Alignment Uncoupling against Talking-head Exploitation)는 얼굴 이미지가 아니라 공개될 **음성만 보호**한다. 사람에게 들리는 발화 내용은 유지하되, 생성 모델이 음성과 입 모양을 맞추는 과정은 사용할 수 없도록 만든다. 이를 위해 시간축 음성 표현을 흐트러뜨리는 representation-level degradation과, audio-conditioned cross-attention을 직접 바꾸는 alignment-level disruption을 순서대로 적용했다.

<div class="project-meta" aria-label="연구 개요">
  <div><span>Period</span><strong>2026</strong></div>
  <div><span>Task</span><strong>Proactive talking-head protection</strong></div>
  <div><span>Status</span><strong>Manuscript · Under review</strong></div>
</div>

<p class="section-label">01 · Motivation</p>

## 음성 복제 방어만으로는 멀티모달 딥페이크를 설명하기 어려웠다

Talking-head model은 한 장의 얼굴 사진과 음성을 받아 발화하는 얼굴 영상을 만든다. 최근 모델은 입 모양뿐 아니라 표정, 고개 움직임, 장시간 temporal consistency까지 빠르게 개선됐다. 이때 음성은 단순한 배경 정보가 아니라 프레임마다 얼굴 움직임을 결정하는 핵심 제어 신호다.

기존 proactive defense는 대체로 한 modality만 다뤘다. 얼굴 이미지 보호는 identity swap이나 visual feature extraction을 방해했고, 음성 보호는 speaker encoder가 원 화자의 음색을 읽지 못하게 했다. 그러나 talking-head generation의 핵심은 두 입력을 각각 인식하는 데 있지 않고, **발음 시점과 입술 움직임을 계속 맞추는 audio–visual alignment**에 있다. 한쪽 modality의 인식만 약하게 만드는 것으로는 이 결합 구조를 직접 겨냥하기 어려웠다.

MUTE는 보호 목표를 “영상을 전혀 만들지 못하게 하는가”가 아니라 “만들어진 영상이 원 음성과 자연스럽게 동기화되는가”로 잡았다. 공격자가 다른 모델을 쓰거나 교란을 제거하려 해도 입 모양과 음성의 시간적 대응이 무너지면 합성 결과의 활용 가능성이 낮아진다는 관점이다.

<div class="research-callout research-callout-finding">
  <p class="research-callout-title">Research question</p>
  <p>사람이 듣는 음성 품질과 발화 내용은 보존하면서, 모델에 종속되지 않는 audio–visual alignment를 교란해 unseen talking-head model과 adaptive attack에서도 보호 효과를 옮길 수 있는가?</p>
</div>

<p class="section-label">02 · Threat model</p>

## 공격 모델을 모르는 transfer-based black-box 상황을 기준으로 삼았다

원 음성을 `x`, 작은 보호 교란을 `δ`라고 두면 공개되는 음성은 `x_adv = x + δ`이다. 교란은 waveform 범위 `[-1, 1]`에서 `‖δ‖∞ ≤ 0.01`로 제한했다. 얼굴 이미지는 변경하지 않으며, 공격자는 보호 음성과 임의의 얼굴 이미지를 자신의 talking-head model에 입력한다고 가정했다.

보호자는 surrogate model인 Hallo의 구조와 gradient만 사용한다. 실제 공격자가 사용할 Hallo2, Audio2Head, SadTalker, Ditto의 구조와 파라미터는 보호 음성을 만들 때 보지 않는다. 또한 공격자가 8 kHz downsampling–upsampling, spectral filtering, Demucs, WavePurifier로 교란을 약화하거나 TTS로 음성을 다시 합성하는 경우도 위협 모델에 포함했다.

<figure class="research-figure research-figure-comparison">
  <a class="research-figure-scroll" href="/assets/writings/mute/mute-threat-model.svg" aria-label="MUTE 위협 모델 도식 크게 보기"><img src="/assets/writings/mute/mute-threat-model.svg" alt="원 음성에 MUTE 보호를 적용한 뒤 black-box talking-head model과 후처리, denoiser, TTS 재합성을 거쳐도 입 모양이 어긋나는 과정을 나타낸 도식"></a>
  <figcaption>MUTE의 위협 모델이다. 공개 전에 음성만 보호하며, 공격자가 모델을 바꾸거나 교란 제거를 시도한 뒤에도 합성 영상의 lip synchronization을 무너뜨리는 것을 목표로 한다. 제출 원고 Figure 1을 홈페이지용으로 다시 구성했다.</figcaption>
</figure>

<p class="section-label">03 · Multi-level design</p>

## 표현과 정렬 구조를 서로 다른 단계에서 끊었다

Talking-head pipeline에서 음성은 먼저 wav2vec 2.0 encoder를 지나 시간축 embedding으로 바뀐다. 이 표현은 다시 visual latent와 cross-attention을 형성해 어느 음성 구간이 어느 얼굴 프레임에 영향을 줄지 결정한다. MUTE는 이 두 지점을 각각 공격 대상으로 삼았다.

첫 90%의 PGD iteration에서는 frame-wise audio embedding이 원본과 멀어지도록 `L_emb`를 최적화한다. 남은 10%에서는 cross-attention map을 민감한 위치에 집중시켜 `L_attn`을 최적화한다. 두 목적을 한 번에 더하지 않은 이유는 최적화 방향이 서로 충돌했기 때문이다. 먼저 입력 표현을 충분히 약화한 뒤 정렬 구조를 직접 흔드는 순서가 성능과 계산량의 균형이 가장 좋았다.

두 단계 모두 `L_stft`를 함께 사용한다. 교란을 speech band의 high-energy 영역에 배치해 단순 필터링이나 학습 기반 denoiser가 별도 잡음으로 찾아 지우기 어렵게 했다. TTS 재합성까지 고려할 때는 speaker identity를 흐리는 `L_spk`를 선택적으로 추가했다.

<figure class="research-figure research-figure-comparison">
  <a class="research-figure-scroll" href="/assets/writings/mute/mute-framework.svg" aria-label="MUTE multi-level framework 도식 크게 보기"><img src="/assets/writings/mute/mute-framework.svg" alt="MUTE가 frame-wise representation degradation, cross-attention alignment disruption, STFT robustness constraint를 두 단계로 결합하는 구조"></a>
  <figcaption>Representation-level과 alignment-level 목적은 역할과 최적화 방향이 달랐다. MUTE는 9:1의 two-phase schedule로 두 목적을 분리하고, STFT 제약은 전체 단계에 적용했다. 제출 원고 Figure 2와 Algorithm 1을 바탕으로 재구성했다.</figcaption>
</figure>

<p class="section-label">04 · Representation-level degradation</p>

## 시간 평균이 감추는 오차를 프레임마다 드러냈다

Hallo의 wav2vec 2.0 encoder가 추출한 표현을 `z ∈ R^(T×L×D)`라고 두었다. `T`는 시간 프레임, `L`은 transformer layer, `D`는 hidden dimension이다. Global embedding을 한 번만 비교하면 서로 다른 시점에서 생긴 변화가 시간 평균 과정에서 상쇄될 수 있다. 입 모양은 매 프레임 달라져야 하므로 전체 발화의 평균을 흔드는 것보다 각 시점의 표현을 지속적으로 흔드는 편이 직접적이다.

MUTE는 원 음성과 보호 음성의 같은 시점 embedding `z_t`, `z_t_adv` 사이 cosine similarity를 모든 프레임에서 최소화했다. 25 fps 영상에 맞춰 1초당 25개의 frame-wise embedding을 구성했고, 한 구간에서 생긴 교란이 다른 구간의 변화에 묻히지 않게 했다.

<div class="research-table" role="region" aria-label="Global embedding과 frame-wise embedding loss 비교" tabindex="0">
  <table>
    <thead><tr><th>Embedding objective</th><th>SyncNet ↓</th><th>M-LMD ↑</th><th>해석</th></tr></thead>
    <tbody>
      <tr><td>Global cosine</td><td>2.262</td><td>1.389</td><td>시간 평균에서 국소 변화가 일부 상쇄됐다</td></tr>
      <tr><td><strong>Frame-wise cosine</strong></td><td><strong>1.027</strong></td><td><strong>1.730</strong></td><td>매 시점의 표현 저하가 누적됐다</td></tr>
    </tbody>
  </table>
</div>

SyncNet은 낮을수록 음성과 입 모양의 동기화가 약하고, M-LMD는 높을수록 입술 landmark 오차가 크다. Frame-wise objective는 두 지표 모두에서 global objective보다 강한 정렬 저하를 만들었다.

<p class="section-label">05 · Alignment-level disruption</p>

## Cross-attention에서 가장 민감한 위치로 확률 질량을 옮겼다

Representation을 흐트러뜨리는 것만으로도 white-box model에서는 큰 변화가 생겼지만, 구조가 다른 모델로 옮겼을 때는 공통 정렬 메커니즘을 직접 겨냥할 필요가 있었다. MUTE는 denoising UNet의 audio-conditioned visual cross-attention을 audio–visual alignment의 proxy로 사용했다. Visual latent는 query, 보호 음성 embedding은 key와 value가 된다.

Attention map의 모든 위치를 똑같이 바꾸지 않았다. 각 위치 `n`에서 작은 `ε`-bounded perturbation이 만들 수 있는 변화를 1차·2차 Taylor sensitivity로 근사하고, 원 attention 값으로 정규화했다. 이 sensitivity score에 softmax를 적용해 `A_target`을 만든 뒤, `KL(A_target ‖ A_adv)`를 최소화했다. 결과적으로 변화시키기 쉬운 구조적 취약점 쪽으로 attention mass가 이동한다.

Appendix 비교에서는 uniform weighting, inverse-attention, first-order sensitivity보다 1차와 2차 항을 함께 쓴 target이 Hallo·Audio2Head·SadTalker에서 가장 좋은 종합 결과를 냈다. 특히 Hallo에서는 SyncNet 1.027, M-LMD 1.730을 기록했고, Audio2Head에서는 2.732와 1.469를 기록했다.

<div class="research-callout">
  <p class="research-callout-title">Why two levels</p>
  <ul>
    <li><strong>Representation loss</strong> — surrogate model에서 강한 정렬 저하를 빠르게 만든다.</li>
    <li><strong>Alignment loss</strong> — architecture가 달라도 남는 cross-modal coupling을 겨냥해 transferability를 높인다.</li>
    <li><strong>Two-phase schedule</strong> — 충돌하는 gradient를 분리해 weighted-sum보다 계산량을 줄인다.</li>
  </ul>
</div>

<p class="section-label">06 · Adaptive robustness</p>

## 교란을 음성의 강한 성분 안에 배치해 제거 공격을 견디게 했다

작은 audio perturbation은 저에너지 구간이나 가청 대역 밖에 몰리기 쉽다. 이런 성분은 downsampling, spectral filtering, source separation, diffusion purification을 거치면 먼저 사라진다. MUTE는 clean speech의 STFT에서 80–7,600 Hz 구간을 남기고, magnitude percentile 0.25를 기준으로 high-energy time–frequency bin에 더 큰 가중치를 주는 mask `M`을 만들었다.

`L_stft = ‖δ − ISTFT(M ⊙ STFT(δ))‖²`는 waveform perturbation이 이 mask를 통과한 성분과 가까워지도록 한다. 교란을 원 음성의 spectral structure에 겹치면 독립된 잡음처럼 분리하기 어려워진다. STFT weight `λ`는 0, 5, 10, 20을 비교했고, clean alignment disruption과 transformation robustness의 균형을 기준으로 5를 선택했다.

TTS 재합성은 waveform perturbation을 직접 지우는 대신 보호 음성에서 text와 speaker identity를 다시 추출해 새 파형을 만든다. 이를 위해 CAM++와 ResNet speaker encoder의 ensemble embedding을 원본과 멀어지게 하는 optional `L_spk`를 추가했다. 이 목적은 lip-sync 교란과 화자 identity 보호 사이의 trade-off를 명시적으로 조절한다.

<p class="section-label">07 · Dataset and protocol</p>

## 두 데이터셋의 5초 음성과 다섯 가지 baseline을 같은 조건에서 비교했다

실험에는 TalkingHead-1KH와 CelebV-HQ를 사용했다. TalkingHead-1KH는 기존 Silencer protocol과 동일한 50개 sample을 사용했다. CelebV-HQ에서는 CLIP-IQA로 고품질 영상 50개를 고른 뒤 각 음성을 5초로 잘랐다. 보호 음성을 생성할 때는 audio와 다른 identity의 reference image를 무작위로 짝지었고, 평가할 때는 같은 identity의 image–audio pair를 사용해 실제 합성 조건에 가깝게 맞췄다.

Baseline은 audio adversarial attack 계열인 C&W, Psychoacoustic, Qin et al., ARO, SAGO다. 모든 방법은 Hallo의 같은 wav2vec 2.0 encoder와 같은 perturbation budget을 사용했다. 입력 얼굴은 512×512, 음성은 16 kHz로 통일했고, single NVIDIA RTX 4090에서 PGD 200회, step size 0.0004로 최적화했다.

<div class="research-table" role="region" aria-label="MUTE 평가 항목" tabindex="0">
  <table>
    <thead><tr><th>평가 축</th><th>지표</th><th>판단 기준</th></tr></thead>
    <tbody>
      <tr><td>Audio quality</td><td>WER, STOI, PESQ</td><td>발화 내용과 지각 음질을 얼마나 유지했는지 확인했다</td></tr>
      <tr><td>Audio–visual alignment</td><td>SyncNet ↓, M-LMD ↑</td><td>입 모양과 음성의 동기화가 얼마나 무너졌는지 측정했다</td></tr>
      <tr><td>Visual quality</td><td>FID ↑, FVD ↑, E-FID ↑</td><td>프레임·시간·표정 분포의 부수적 저하를 확인했다</td></tr>
      <tr><td>Human perception</td><td>Most mismatched choice</td><td>사람이 실제 영상에서 lip-sync 오류를 구분하는지 평가했다</td></tr>
    </tbody>
  </table>
</div>

<p class="section-label">08 · Main results</p>

## 두 데이터셋에서 가장 큰 lip-sync 저하를 만들었다

MUTE는 TalkingHead-1KH에서 SyncNet 1.027, M-LMD 1.730을 기록했다. 비교 방법 중 가장 낮은 SyncNet은 ARO의 3.113, 가장 높은 M-LMD도 ARO의 1.240이었다. CelebV-HQ에서도 MUTE의 SyncNet은 1.682로 ARO 3.376보다 낮았고, M-LMD는 1.751로 가장 높은 baseline인 SAGO 1.256보다 높았다.

보호 강도만 높이고 발화를 알아들을 수 없게 만든 결과는 아니었다. TalkingHead-1KH에서 WER 13.30%, STOI 0.885, PESQ 1.945를 기록했고, CelebV-HQ에서는 WER 17.94%, STOI 0.890, PESQ 1.944를 기록했다. 일부 baseline보다 음질 수치가 낮은 항목은 있었지만, alignment 지표의 큰 변화와 비교하면 발화 intelligibility는 유지되는 편이었다.

<div class="research-table" role="region" aria-label="MUTE와 baseline의 핵심 결과" tabindex="0">
  <table>
    <thead><tr><th rowspan="2">Method</th><th colspan="2">TalkingHead-1KH</th><th colspan="2">CelebV-HQ</th></tr><tr><th>Sync ↓</th><th>M-LMD ↑</th><th>Sync ↓</th><th>M-LMD ↑</th></tr></thead>
    <tbody>
      <tr><td>C&amp;W</td><td>3.620</td><td>1.061</td><td>3.753</td><td>1.088</td></tr>
      <tr><td>Psychoacoustic</td><td>3.624</td><td>1.076</td><td>3.905</td><td>1.102</td></tr>
      <tr><td>Qin et al.</td><td>4.161</td><td>1.018</td><td>4.036</td><td>1.100</td></tr>
      <tr><td>ARO</td><td>3.113</td><td>1.240</td><td>3.376</td><td>1.254</td></tr>
      <tr><td>SAGO</td><td>3.147</td><td>1.195</td><td>3.614</td><td>1.256</td></tr>
      <tr><td><strong>MUTE</strong></td><td><strong>1.027</strong></td><td><strong>1.730</strong></td><td><strong>1.682</strong></td><td><strong>1.751</strong></td></tr>
    </tbody>
  </table>
</div>

MUTE는 audio-only method지만 image protection과도 결합할 수 있다. Silencer 단독의 SyncNet 1.859에 MUTE를 더하면 0.720으로 낮아졌다. 두 방법을 공동 학습한 결과는 아니지만, 얼굴과 음성의 서로 다른 공격면을 함께 보호할 수 있다는 가능성을 확인했다.

<p class="section-label">09 · Black-box transfer</p>

## Hallo에서 만든 교란이 구조가 다른 네 모델로 옮겨갔다

Transferability 평가는 보호 음성을 Hallo에서만 만든 뒤 target model을 바꾸는 방식으로 진행했다. Hallo2는 surrogate와 비교적 비슷하지만, Audio2Head는 one-shot motion generation, SadTalker는 3D motion coefficient, Ditto는 motion-space diffusion을 사용해 구조적 차이가 크다.

MUTE는 네 target 모두에서 가장 낮은 SyncNet과 가장 높은 M-LMD를 기록했다. Hallo2에서는 SyncNet 1.053, M-LMD 1.739였고, Audio2Head에서는 2.732와 1.469였다. SadTalker와 Ditto에서도 각각 4.195/0.921, 2.939/1.004로 모든 baseline보다 강한 정렬 저하를 유지했다.

<figure class="research-figure research-figure-comparison">
  <a class="research-figure-scroll" href="/assets/writings/mute/mute-transferability.svg" aria-label="MUTE black-box transferability 차트 크게 보기"><img src="/assets/writings/mute/mute-transferability.svg" alt="Hallo2, Audio2Head, SadTalker, Ditto에서 MUTE와 가장 강한 baseline의 SyncNet을 비교한 가로 막대그래프"></a>
  <figcaption>각 unseen model에서 MUTE와 가장 낮은 SyncNet을 기록한 baseline을 비교했다. 모든 target에서 MUTE의 값이 더 낮았다. 제출 원고 Table 3을 시각화했다.</figcaption>
</figure>

<div class="research-table" role="region" aria-label="MUTE black-box 모델별 결과" tabindex="0">
  <table>
    <thead><tr><th>Target model</th><th>MUTE Sync ↓</th><th>Best baseline Sync ↓</th><th>MUTE M-LMD ↑</th><th>Best baseline M-LMD ↑</th></tr></thead>
    <tbody>
      <tr><td>Hallo2</td><td><strong>1.053</strong></td><td>3.076</td><td><strong>1.739</strong></td><td>1.276</td></tr>
      <tr><td>Audio2Head</td><td><strong>2.732</strong></td><td>3.387</td><td><strong>1.469</strong></td><td>1.447</td></tr>
      <tr><td>SadTalker</td><td><strong>4.195</strong></td><td>4.712</td><td><strong>0.921</strong></td><td>0.852</td></tr>
      <tr><td>Ditto</td><td><strong>2.939</strong></td><td>3.508</td><td><strong>1.004</strong></td><td>0.928</td></tr>
    </tbody>
  </table>
</div>

<p class="section-label">10 · Transformation robustness</p>

## 후처리와 학습 기반 denoiser 뒤에도 정렬 교란이 남았다

공격자는 perturbation이 있는 음성을 발견하면 신호를 변환한 뒤 talking-head generation을 다시 시도할 수 있다. Down/upsampling은 16 kHz 음성을 8 kHz로 낮췄다가 다시 16 kHz로 올렸고, spectral filtering은 median spectral centroid를 기준으로 특정 대역을 줄였다. Demucs는 source separation, WavePurifier는 diffusion purification 기반의 강한 제거 조건이다.

MUTE는 네 transformation 모두에서 비교 방법보다 낮은 SyncNet과 높은 M-LMD를 기록했다. 특히 Demucs 뒤 SyncNet 1.074, M-LMD 1.713으로 clean 조건과 가까운 수준을 유지했다. WavePurifier는 상대적으로 가장 어려운 조건이어서 SyncNet이 3.116까지 올라갔지만, 이때도 baseline의 최저 3.683과 최고 M-LMD 1.061보다 강한 1.222를 기록했다.

<div class="research-table" role="region" aria-label="MUTE adaptive transformation 강건성" tabindex="0">
  <table>
    <thead><tr><th>Transformation</th><th>MUTE Sync ↓</th><th>Best baseline Sync ↓</th><th>MUTE M-LMD ↑</th><th>Best baseline M-LMD ↑</th></tr></thead>
    <tbody>
      <tr><td>16→8→16 kHz</td><td><strong>2.038</strong></td><td>3.185</td><td><strong>1.483</strong></td><td>1.189</td></tr>
      <tr><td>Spectral filtering</td><td><strong>1.489</strong></td><td>2.838</td><td><strong>1.585</strong></td><td>1.192</td></tr>
      <tr><td>Demucs</td><td><strong>1.074</strong></td><td>3.132</td><td><strong>1.713</strong></td><td>1.217</td></tr>
      <tr><td>WavePurifier</td><td><strong>3.116</strong></td><td>3.683</td><td><strong>1.222</strong></td><td>1.061</td></tr>
    </tbody>
  </table>
</div>

<p class="section-label">11 · TTS resynthesis</p>

## 파형을 새로 만들어 우회하는 공격에는 speaker objective를 더했다

TTS resynthesis는 보호 음성의 perturbation을 보존하지 않는다. 공격자가 transcript와 speaker embedding을 뽑아 CosyVoice, XTTS-v2, Chatterbox로 새 음성을 만들면 waveform-level defense가 사라질 수 있다. MUTE는 CAM++와 ResNet speaker encoder를 ensemble로 사용해 보호 음성의 identity embedding을 원본에서 멀어지게 했다.

50개 보호 음성과 5개 임의 문장을 조합해 TTS sample 250개를 만들고, ECAPA-TDNN verifier가 원 화자와 다른 화자로 판정한 비율을 DSR로 계산했다. `λ_spk = 0.01`에서 CosyVoice 72.0%, XTTS-v2 96.6%, unseen Chatterbox 58.8%의 DSR을 기록했다. Speaker loss를 사용하지 않았을 때의 18.4%, 14.4%, 18.8%보다 크게 높았다.

<div class="research-table" role="region" aria-label="MUTE TTS 재합성 방어 결과" tabindex="0">
  <table>
    <thead><tr><th>λspk</th><th>CosyVoice DSR ↑</th><th>XTTS-v2 DSR ↑</th><th>Chatterbox DSR ↑</th><th>Sync ↓</th><th>M-LMD ↑</th></tr></thead>
    <tbody>
      <tr><td>0</td><td>18.4%</td><td>14.4%</td><td>18.8%</td><td><strong>1.027</strong></td><td><strong>1.730</strong></td></tr>
      <tr><td><strong>0.01</strong></td><td><strong>72.0%</strong></td><td><strong>96.6%</strong></td><td><strong>58.8%</strong></td><td>1.185</td><td>1.633</td></tr>
      <tr><td>0.05</td><td>80.0%</td><td>98.2%</td><td>69.2%</td><td>1.458</td><td>1.576</td></tr>
      <tr><td>0.10</td><td>80.4%</td><td>100.0%</td><td>72.0%</td><td>1.749</td><td>1.549</td></tr>
    </tbody>
  </table>
</div>

`λ_spk`가 커질수록 voice identity 방어는 강해졌지만, 본래 목표인 lip-sync disruption은 약해졌다. 따라서 가장 높은 DSR만 고르지 않고 세 TTS model에서 50% 이상을 확보하면서 SyncNet과 M-LMD 변화가 작은 0.01을 기본 균형점으로 제시했다.

<p class="section-label">12 · Human study and ablation</p>

## 수치로 나타난 정렬 오류를 사람도 가장 뚜렷하게 구분했다

SyncNet과 M-LMD가 실제 시청 경험과 연결되는지 확인하기 위해 Prolific에서 사용자 평가를 진행했다. 참가자 100명이 TalkingHead-1KH와 CelebV-HQ에서 고른 10개 sample을 각각 보고, C&W·ARO·SAGO·MUTE 결과 중 입 모양과 음성이 가장 어긋난 영상을 선택했다. 총 **1,000개 응답**에서 MUTE가 선택된 비율은 **86.1% ± 2.2%**(95% confidence interval)였다. ARO 5.5%, C&W 4.8%, SAGO 3.6%보다 큰 차이다.

<div class="research-metrics" aria-label="MUTE 사용자 평가 핵심 수치">
  <div class="research-metric"><span class="research-metric-value">100명</span><span class="research-metric-label">Prolific participants</span></div>
  <div class="research-metric"><span class="research-metric-value">1,000개</span><span class="research-metric-label">video comparisons</span></div>
  <div class="research-metric"><span class="research-metric-value">86.1%</span><span class="research-metric-label">MUTE selected</span></div>
</div>

Ablation에서는 representation loss만 쓴 `ρ = 1.0`이 Hallo에서 강하고 계산도 4.9초로 짧았지만, Audio2Head와 SadTalker로의 전이는 약했다. Alignment loss만 쓴 `ρ = 0.0`은 79.2초가 걸리고 white-box 성능이 낮았다. `ρ = 0.9`는 Hallo 1.027/1.730, Audio2Head 2.732/1.469, SadTalker 4.195/0.921을 12.7초에 달성해 가장 좋은 종합 균형을 보였다.

PGD iteration은 50, 100, 150, 200을 비교했고 반복이 늘수록 alignment와 visual degradation이 대체로 강해졌다. Step size는 원고 본문의 실험 설정에 맞춘 0.0004를 사용했다. 최종 설정은 효과를 최대화하는 단일 수치가 아니라 transferability, robustness, 계산 시간 사이의 균형으로 결정했다.

<p class="section-label">13 · Scope and manuscript</p>

## 강한 정렬 교란을 확인했지만 실시간·대규모 검증은 남아 있다

MUTE는 음성만 수정하면서 representation, cross-attention, spectral robustness를 하나의 최적화 안에 연결했다. Hallo에서 만든 보호 음성이 네 unseen model로 옮겨갔고, 후처리·denoising·TTS resynthesis 뒤에도 방어 효과가 남았다. 사용자 평가에서도 metric 변화가 실제 lip-sync mismatch로 인식됐다.

다만 실험은 데이터셋별 50개 sample에 집중했고, 높은 talking-head generation 비용 때문에 더 큰 규모의 분포를 다루지 못했다. 200-step PGD는 기본 9:1 설정에서 sample당 약 12.7초가 걸려 통화 같은 strict real-time 환경에는 아직 무겁다. 이미 유출된 음성을 사후에 보호할 수도 없다. Audio-only MUTE와 image-based Silencer의 결합 역시 독립적으로 만든 교란을 함께 적용한 결과이며, 두 modality를 하나의 objective로 공동 최적화한 구조는 아니다.

사용자 평가는 “악용을 실제로 막았는가”가 아니라 여러 결과 중 lip-sync mismatch가 가장 큰 영상을 고르는 과제였다. 따라서 86.1%를 직접적인 misuse prevention rate로 해석하지 않았다. 더 다양한 생성 모델, 물리적 재녹음, adaptive reconstruction, low-latency generation은 후속 검증 범위로 남았다.

<div class="publication-card">
  <p class="publication-card-kicker">2026 · Manuscript · Under review</p>
  <p class="publication-card-title">MUTE: Multi-Level Alignment Uncoupling Against Talking-Head Exploitation for Voice Protection</p>
  <p class="publication-card-meta">Anonymous review in progress · Public summary excludes the confidential submission PDF</p>
</div>

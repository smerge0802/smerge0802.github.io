---
title: "NaVo: Natural Voice Protection against Voice Cloning Attacks via Generative Universal Adversarial Audio"
description: "AudioLDM2와 조건별 LoRA로 자연스러운 Universal Adversarial Audio를 생성하고, unseen speaker와 상용 음성 복제 모델까지 평가한 Interspeech 2026 accepted 연구."
lang: ko
period: "2026"
---

2026년에는 음성 복제 방어를 발화마다 다시 최적화하는 방식에서 벗어나, 한 번 학습한 생성 모델이 새로운 화자에게 곧바로 적용할 수 있는 **Universal Adversarial Audio(UAA)** 연구를 수행했다. 이 연구를 바탕으로 `NaVo: Natural Voice Protection against Voice Cloning Attacks via Generative Universal Adversarial Audio`를 작성했고, 논문은 Interspeech 2026에 채택됐다.

NaVo(Natural Voice Protection)는 귀에 거슬리는 고주파 교란 대신 빗소리, 여러 사람이 말하는 소리, 음악처럼 실제 환경에서 자연스럽게 들리는 배경음을 생성한다. 생성된 배경음은 원 음성과 17 dB SNR로 섞이며, 사람에게는 상황에 맞는 ambient audio로 들리지만 voice cloning model의 speaker encoder에는 화자 정체성을 흐리는 adversarial signal로 작동하도록 학습했다.

<div class="project-meta" aria-label="연구 개요">
  <div><span>Period</span><strong>2026</strong></div>
  <div><span>Task</span><strong>Generative proactive voice protection</strong></div>
  <div><span>Publication</span><strong>Interspeech 2026 · Accepted</strong></div>
</div>

<p class="section-label">01 · Motivation</p>

## 발화마다 교란을 다시 계산하는 방어는 실제 배포에 한계가 있었다

Voice cloning model은 몇 초 분량의 참조 음성에서도 화자의 음색과 발화 습관을 추출한다. 공개된 영상이나 통화 녹음이 reference audio로 들어가면 공격자는 원 화자가 말하지 않은 문장도 같은 목소리로 합성할 수 있다. 합성 이후 진위를 판별하는 post-detection은 이미 만들어진 사칭 음성의 유통을 막지 못하므로, 공개 전에 원 음성을 보호하는 proactive defense가 필요하다.

기존 proactive defense는 파형이나 주파수 영역에 적대적 교란을 직접 최적화했다. 이 방식은 방어 대상 발화마다 gradient를 여러 번 계산해야 했고, 생성된 교란이 고주파 잡음이나 불규칙한 waveform distortion으로 들리는 경우가 있었다. 짧은 샘플에서는 동작하더라도 영상, 방송, 통화처럼 음성이 계속 들어오는 환경에서는 per-sample optimization 비용이 누적된다.

NaVo는 문제를 “원 음성마다 새로운 교란을 찾는가”에서 “여러 화자에게 공통으로 작동하는 방어용 배경음을 생성할 수 있는가”로 바꿨다. 학습이 끝난 뒤에는 gradient-based optimization 없이 text-to-audio model의 한 번의 forward pass와 단순 mixing만 사용한다.

<div class="research-callout research-callout-finding">
  <p class="research-callout-title">Research question</p>
  <p>자연스러운 음향 환경으로 들리는 배경음을 생성하면서도, unseen speaker의 정체성 추출을 방해하고 white-box·black-box·adaptive attack에서 방어 효과를 유지할 수 있는가?</p>
</div>

<p class="section-label">02 · Universal adversarial audio</p>

## 노이즈를 숨기는 대신 자연 배경음 자체를 방어 신호로 사용했다

NaVo의 UAA는 원 음성에 거의 들리지 않는 작은 perturbation을 더하는 방식과 목적이 다르다. 생성 결과는 실제로 들리는 배경음이지만, text prompt와 일치하는 빗소리·babble·music·office ambience처럼 의미가 있는 소리다. 방어 성분을 “없어야 할 잡음”이 아니라 “원래 존재할 수 있는 환경음”으로 바꾸면 사용자는 보호 음성을 social media나 녹음 콘텐츠에 더 자연스럽게 포함할 수 있다.

원 음성을 `x`, text prompt를 `p`, AudioLDM2 기반 생성기를 `G`라고 두면 보호 음성은 다음처럼 구성했다.

`x_prot = x + G(z | p; Θ + ΔΘ)`

`Θ`는 사전학습된 text-to-audio model의 고정 파라미터이고 `ΔΘ`는 방어 목적에 맞게 학습한 LoRA 파라미터다. 파형 `x` 자체를 반복 갱신하지 않고, 생성 모델이 만든 defensive audio를 원 음성과 더한다. 같은 LoRA module은 학습에 없던 화자와 문장에도 재사용된다.

<div class="research-callout">
  <p class="research-callout-title">Why universal</p>
  <ul>
    <li><strong>Speaker-independent</strong> — 새 화자마다 모델을 재학습하거나 교란을 다시 최적화하지 않았다.</li>
    <li><strong>Utterance-independent</strong> — 입력 문장이 달라져도 선택한 음향 범주의 UAA를 생성해 바로 섞었다.</li>
    <li><strong>Category-controllable</strong> — 사용 환경에 맞춰 rain, babble, music 계열의 배경음을 고를 수 있게 했다.</li>
  </ul>
</div>

<p class="section-label">03 · NaVo framework</p>

## AudioLDM2의 생성 prior를 유지하면서 방어 목적만 LoRA로 주입했다

Backbone에는 latent diffusion 기반 text-to-audio model인 AudioLDM2를 사용했다. AudioLDM2는 text prompt를 조건으로 acoustic latent를 생성하고 VAE와 vocoder를 거쳐 파형으로 복원한다. NaVo는 전체 모델을 다시 학습하지 않고 UNet의 cross-attention에 LoRA를 붙여 방어용 ambient audio를 생성하도록 조정했다.

학습 단계에서는 text prompt와 원 음성을 함께 사용했다. UNet이 예측한 ambient audio를 원 음성과 섞고, 고정된 speech synthesis encoder로 speaker embedding을 추출했다. Diffusion Loss는 생성음이 원래 음향 범주의 구조를 유지하도록 했고, Distributional Target Loss는 혼합 음성의 embedding이 원 화자 집단에서 벗어나도록 했다.

추론 단계에서는 사용자의 성별과 원하는 acoustic category에 맞는 LoRA module을 선택했다. Text prompt에서 defensive audio를 한 번 생성한 뒤 원 음성과 합쳐 protected speech를 만들었다. 학습 때 필요했던 speaker encoder와 loss 계산은 추론 경로에 들어가지 않는다.

<figure class="research-figure research-figure-comparison">
  <a class="research-figure-scroll" href="/assets/writings/navo/navo-framework.png" aria-label="NaVo 전체 구조 그림 크게 보기"><img src="/assets/writings/navo/navo-framework.png" alt="학습 단계에서 AudioLDM2 UNet의 LoRA를 분포 목표와 diffusion loss로 학습하고 추론 단계에서 성별과 음향 범주별 LoRA가 만든 배경음을 원 음성과 섞는 NaVo 구조"></a>
  <figcaption>왼쪽은 text-to-audio UNet의 LoRA를 방어 목적으로 학습하는 과정이고, 오른쪽은 조건별 LoRA가 생성한 UAA를 원 음성과 단순 혼합하는 추론 과정이다. NaVo accepted manuscript Figure 1.</figcaption>
</figure>

<p class="section-label">04 · Modular LoRA</p>

## 성별과 음향 범주를 나눠 작은 LoRA module을 각각 학습했다

하나의 adapter가 모든 화자 특성과 acoustic category를 동시에 다루면 최적화 목표가 복잡해진다. NaVo는 target gender와 음향 범주를 기준으로 LoRA module을 분리했다. 남성 음성을 보호할 때는 여성 speaker distribution을 목표로 하는 module을, 여성 음성을 보호할 때는 남성 분포를 목표로 하는 module을 선택했다. 각 성별 안에서도 rain, music, babble 같은 범주별 adapter를 따로 구성했다.

LoRA는 UNet transformer block의 cross-attention key와 value projection에만 적용했다.

`W′_K = W_K + B_K A_K`, `W′_V = W_V + B_V A_V`

Low-rank 행렬 `A`와 `B`만 갱신하고 VAE, vocoder, text encoder와 나머지 UNet 파라미터는 고정했다. Text condition이 acoustic characteristic을 제어하는 K·V 경로를 제한적으로 조정해, AudioLDM2가 이미 학습한 자연음 생성 능력을 최대한 유지하면서 speaker defense 방향을 추가하려는 설계였다.

<div class="research-table" role="region" aria-label="NaVo 조건별 LoRA 구성" tabindex="0">
  <table>
    <thead><tr><th>조건</th><th>선택 기준</th><th>학습 목표</th><th>추론 시 역할</th></tr></thead>
    <tbody>
      <tr><td>Target gender</td><td>원 화자와 반대 성별</td><td>Opposite-gender embedding distribution으로 이동</td><td>남성용·여성용 adapter 선택</td></tr>
      <tr><td>Acoustic category</td><td>Rain, babble, music, office 계열</td><td>Prompt와 맞는 자연 배경음 유지</td><td>사용 환경과 맞는 소리 선택</td></tr>
      <tr><td>Trainable weights</td><td>Cross-attention K·V LoRA</td><td>작은 파라미터 집합에 방어 방향 학습</td><td>Base model에 module만 결합</td></tr>
      <tr><td>Frozen weights</td><td>VAE, vocoder, text encoder 등</td><td>사전학습 generative prior 보존</td><td>추가 최적화 없이 재사용</td></tr>
    </tbody>
  </table>
</div>

<p class="section-label">05 · Distributional target</p>

## 한 명의 target speaker가 아니라 반대 성별의 분포 전체를 목표로 삼았다

기존 targeted defense는 보호 음성의 embedding을 특정 target speaker 한 명에게 가깝게 이동시키는 경우가 많았다. 그러나 한 점의 centroid만 따라가면 실제 target speaker 집단이 가진 분산을 반영하지 못하고, 모든 source speaker에 공통으로 적용하기도 어렵다. NaVo는 target을 단일 화자가 아니라 Gaussian distribution으로 정의했다.

Speaker encoder의 t-SNE 결과에서는 남성과 여성 화자가 서로 다른 영역에 군집을 형성했다. 이 구조를 이용해 남성 음성에는 여성 embedding의 평균과 분산을, 여성 음성에는 남성 분포를 target으로 설정했다. Target dataset `X_target`에서 embedding을 추출해 평균 `μ_P`와 분산 `σ²_P`를 구하고, 학습 batch의 protected embedding도 `Q = N(μ_Q, diag(σ²_Q))`로 모델링했다.

<figure class="research-figure research-figure-comparison">
  <a class="research-figure-scroll" href="/assets/writings/navo/gender-embedding.png" aria-label="성별 speaker embedding t-SNE 그림 크게 보기"><img src="/assets/writings/navo/gender-embedding.png" alt="두 speaker encoder의 t-SNE 공간에서 남성 화자 embedding은 파란색, 여성 화자 embedding은 빨간색으로 분리된 분포"></a>
  <figcaption>두 speaker encoder 모두에서 성별에 따른 embedding cluster가 분리됐다. NaVo는 이 관찰을 opposite-gender distribution을 안정적인 adversarial target으로 사용하는 근거로 삼았다. NaVo accepted manuscript Figure 2.</figcaption>
</figure>

Centroid distance만 줄이면 평균은 맞아도 분포가 지나치게 좁거나 넓어질 수 있다. NaVo는 α-divergence의 `α = 0.5`에 해당하는 Bhattacharyya distance를 사용해 `Q`와 `P`의 평균과 분산을 함께 맞췄다. 목적은 특정 타인의 목소리를 재현하는 것이 아니라, 원 화자의 고유 embedding이 안정적으로 추출되지 않도록 batch 단위 분포를 반대편 영역으로 이동시키는 데 있었다.

<p class="section-label">06 · Joint objective</p>

## 자연음 생성과 화자 교란을 서로 다른 두 loss로 함께 제어했다

학습 목적은 Diffusion Loss와 Distributional Target Loss로 구성했다. Diffusion Loss는 UNet이 noise prediction을 수행하는 AudioLDM2의 원래 denoising objective다. Reference ambient audio의 clean latent에 timestep별 noise를 더하고 이를 다시 예측하게 해, LoRA를 학습한 뒤에도 prompt와 맞는 자연음을 생성하도록 했다.

Distributional Target Loss를 계산할 때는 UNet이 추정한 ambient audio `â`를 source speech `s`와 섞었다. Mixing amplitude는 두 신호의 RMS를 기준으로 조정했고 모든 학습 조건에서 SNR을 17 dB로 고정했다. 이 값은 배경음이 분명히 존재하면서 원 발화의 intelligibility를 유지하는 조건으로 사용했다.

혼합 음성은 고정된 speaker encoder `f(·)`를 통과했다. Encoder의 파라미터는 바꾸지 않았으므로 protected embedding의 이동은 생성된 ambient audio와 LoRA update에서만 발생한다. Distributional Target Loss의 gradient는 speaker encoder와 mixing 연산을 거슬러 UNet의 LoRA까지 전달됐다.

`L_total = λ_diff L_diff + λ_emb I[t < t_max] D_B(Q || P)`

Embedding loss는 denoised estimate가 비교적 안정적인 low-noise timestep `t < t_max`에서만 적용했다. Noise가 큰 구간의 불확실한 audio estimate가 speaker target optimization을 흔들지 않게 제한한 것이다.

<p class="section-label">07 · Inference-time defense</p>

## 학습 이후에는 한 번 생성하고 섞는 과정만 남겼다

사용자는 원 음성, 성별 조건, 원하는 ambient category를 입력한다. NaVo는 조건에 맞는 LoRA를 base AudioLDM2에 결합하고 prompt에서 UAA를 생성한다. 생성된 UAA의 크기를 17 dB SNR에 맞춰 조정한 뒤 원 음성과 더하면 보호 처리가 끝난다.

기존 optimization-based defense는 새 발화가 들어올 때마다 target loss를 계산하고 waveform을 반복 갱신했다. NaVo는 학습과 inference를 분리했기 때문에 새 화자에게 speaker encoder gradient를 계산하지 않는다. 논문에서 말하는 real-time applicability는 이 **single forward pass + audio mixing** 구조를 가리키며, 특정 하드웨어에서의 절대 latency 수치를 제시한 것은 아니다.

<div class="research-callout">
  <p class="research-callout-title">Inference path</p>
  <ul>
    <li><strong>Select</strong> — 화자 성별과 acoustic category에 맞는 LoRA module을 골랐다.</li>
    <li><strong>Generate</strong> — Text prompt에서 category-consistent UAA를 한 번 생성했다.</li>
    <li><strong>Mix</strong> — RMS를 기준으로 17 dB SNR을 맞춰 원 음성과 합쳤다.</li>
    <li><strong>Reuse</strong> — 같은 module을 unseen speaker와 새로운 utterance에 추가 학습 없이 적용했다.</li>
  </ul>
</div>

<p class="section-label">08 · Dataset and protocol</p>

## 여섯 음성 코퍼스와 AudioSet으로 화자 다양성과 음향 자연성을 함께 학습했다

Speech data에는 VCTK, FST, Mozilla Common Voice(MCV), CSNED, CSUKIED, LibriSpeech를 사용했다. 여섯 코퍼스를 합친 뒤 화자 단위로 train·validation·test를 분리했다. Train은 196명, validation은 42명, test는 42명이었고 화자마다 발화 10개를 사용해 각각 1,960개·420개·420개 샘플을 구성했다. Test speaker는 학습에 포함되지 않아 speaker-independent defense의 일반화를 평가하는 역할을 했다.

Target distribution을 만드는 데이터는 source train·validation·test와 겹치지 않게 분리했다. Ambient audio는 AudioSet에서 acoustic category별 100개씩 추출해 AudioLDM2의 category-consistent generation을 유지하는 데 사용했다.

<div class="research-metrics" aria-label="NaVo 데이터 구성 핵심 수치">
  <div class="research-metric"><span class="research-metric-value">6개</span><span class="research-metric-label">Speech corpora<br>다양한 영어권 화자</span></div>
  <div class="research-metric"><span class="research-metric-value">196명 · 42명 · 42명</span><span class="research-metric-label">Train · validation · test<br>화자 단위 분리</span></div>
  <div class="research-metric"><span class="research-metric-value">2,800개</span><span class="research-metric-label">전체 speech sample<br>화자당 10개</span></div>
  <div class="research-metric"><span class="research-metric-value">100개/범주</span><span class="research-metric-label">AudioSet ambient audio<br>category별 추출</span></div>
</div>

<div class="research-table" role="region" aria-label="NaVo 실험 프로토콜" tabindex="0">
  <table>
    <thead><tr><th>평가 요소</th><th>구성</th><th>목적</th></tr></thead>
    <tbody>
      <tr><td>White-box cloning</td><td>SV2TTS, CosyVoice</td><td>학습에 사용한 target encoder 계열에서 방어력 측정</td></tr>
      <tr><td>Black-box cloning</td><td>Tortoise, ElevenLabs</td><td>보지 못한 구조와 상용 API로 transfer 검증</td></tr>
      <tr><td>Speaker verification</td><td>Resemblyzer, ECAPA-TDNN, ResNet</td><td>복제 음성이 원 화자로 수용되는지 판정</td></tr>
      <tr><td>Target encoder</td><td>GE2E, CAM++, white-box ensemble</td><td>White-box 최적화와 black-box transfer에 사용</td></tr>
      <tr><td>Baseline</td><td>Enkidu</td><td>Real-time universal proactive defense 비교</td></tr>
      <tr><td>Adaptive attack</td><td>Filtering, quantization, downsampling, spectral masking</td><td>UAA 제거 시도 이후 DSR 변화 확인</td></tr>
    </tbody>
  </table>
</div>

Defense Success Rate(DSR)은 보호 음성으로 생성한 cloned speech가 speaker verification threshold 아래로 내려가 원 화자로 받아들여지지 않은 비율이다. 높을수록 방어 성공이 많다. Acoustic quality는 generated audio와 text prompt의 의미 정합성을 나타내는 CLAP score로 측정했다. 일반적인 DNN MOS estimator는 배경음이 섞인 음성을 그 자연스러움과 무관하게 낮게 평가할 수 있어 주 지표로 사용하지 않았다.

<p class="section-label">09 · Overall performance</p>

## Unseen test speaker에서 Enkidu보다 모든 verifier의 DSR이 높았다

전체 test set에서 NaVo와 real-time universal baseline Enkidu를 비교했다. Resemblyzer 기준 DSR은 Enkidu 25.2%에서 NaVo 78.0%로 증가했고, ECAPA-TDNN에서는 60.6%에서 83.6%, ResNet에서는 45.5%에서 79.8%로 증가했다. 세 verifier 모두에서 최소 20%p 이상의 차이가 났으며 Resemblyzer에서는 세 배가 넘는 DSR을 기록했다.

<div class="research-metrics" aria-label="NaVo 전체 방어 성능">
  <div class="research-metric"><span class="research-metric-value">78.0%</span><span class="research-metric-label">Resemblyzer DSR<br>Enkidu 25.2%</span></div>
  <div class="research-metric"><span class="research-metric-value">83.6%</span><span class="research-metric-label">ECAPA-TDNN DSR<br>Enkidu 60.6%</span></div>
  <div class="research-metric"><span class="research-metric-value">79.8%</span><span class="research-metric-label">ResNet DSR<br>Enkidu 45.5%</span></div>
  <div class="research-metric"><span class="research-metric-value">76%</span><span class="research-metric-label">ElevenLabs 평균 DSR<br>Black-box commercial API</span></div>
</div>

<div class="research-table" role="region" aria-label="NaVo와 Enkidu 전체 DSR 비교" tabindex="0">
  <table>
    <thead><tr><th>Method</th><th>Resemblyzer</th><th>ECAPA-TDNN</th><th>ResNet</th></tr></thead>
    <tbody>
      <tr><td>Enkidu</td><td>25.2%</td><td>60.6%</td><td>45.5%</td></tr>
      <tr><td><strong>NaVo</strong></td><td><strong>78.0%</strong></td><td><strong>83.6%</strong></td><td><strong>79.8%</strong></td></tr>
    </tbody>
  </table>
</div>

이 결과는 train speaker마다 개별 perturbation을 만든 성능이 아니다. Train과 분리된 42명의 test speaker에게 학습이 끝난 LoRA를 그대로 적용한 결과다. 따라서 전체 비교의 초점은 특정 화자에 대한 최적화 강도보다 universal module이 unseen identity에 얼마나 전이되는지에 있다.

<p class="section-label">10 · White-box evaluation</p>

## Raindrop과 office 계열에서 높은 방어력을 보였고 CosyVoice가 더 어려운 조건이었다

White-box 평가는 SV2TTS의 GE2E encoder와 CosyVoice의 CAM++ encoder를 target으로 사용했다. 보호하지 않은 No UAA 조건에서 CosyVoice의 DSR은 verifier에 따라 0.0–2.9%로 거의 방어되지 않았다. NaVo를 적용하면 acoustic style과 verifier에 따라 약 40–62%까지 증가했다. SV2TTS에서는 여러 raindrop·office 조건이 88–98% DSR을 기록했다.

<div class="research-table" role="region" aria-label="NaVo white-box DSR 상세 결과" tabindex="0">
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

방어 강도는 acoustic style에 따라 같지 않았다. White-box SV2TTS에서는 office와 raindrop이 가장 높은 구간을 만들었고 babble은 상대적으로 낮았다. CosyVoice는 supervised semantic token을 사용하는 더 강한 zero-shot model이어서 DSR이 SV2TTS보다 낮았지만, No UAA의 near-zero 조건과 비교하면 모든 style에서 방어 효과가 남았다.

CLAP score는 방어용 LoRA를 적용한 생성음이 base AudioLDM2의 category semantics를 유지하는지 확인하는 데 사용했다. 각 target encoder와 성별에 따라 값은 달라졌지만, 논문은 전체 설정에서 backbone과 비교 가능한 수준의 acoustic alignment가 유지된 것으로 해석했다. 이 지표는 사람의 청취 자연스러움 자체가 아니라 prompt–audio 의미 정합성을 측정한다는 범위를 함께 두어야 한다.

<p class="section-label">11 · Black-box evaluation</p>

## 보지 못한 Tortoise와 상용 ElevenLabs에도 방어가 전이됐다

Black-box 실험에서는 GE2E와 CAM++를 포함한 white-box encoder ensemble로 NaVo를 학습하고, 최적화에 참여하지 않은 Tortoise와 ElevenLabs에서 복제했다. 방어가 특정 encoder의 gradient에만 맞춰졌다면 이 단계에서 DSR이 크게 떨어져야 한다. 그러나 raindrop과 babble은 서로 다른 세 verifier에서 높은 전이 성능을 보였다.

<div class="research-table" role="region" aria-label="NaVo black-box DSR 상세 결과" tabindex="0">
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

ElevenLabs의 18개 성별·style·verifier 조합을 평균하면 DSR은 약 76%였다. 특히 raindrop은 모든 조합에서 92.9–97.1%를 기록했다. 반면 music은 남성 조건에서 32.9–42.9%까지 내려갔다. “상용 모델에서도 작동했다”는 결론과 함께 acoustic category 선택이 방어력을 크게 좌우했다는 차이도 결과에 포함된다.

Tortoise에서도 female raindrop·babble은 세 verifier 모두 88.9% 이상이었고, male raindrop은 ECAPA-TDNN 94.4%, ResNet 89.5%를 기록했다. 한편 No UAA는 대부분 0–13.6% 범위여서, black-box DSR 상승이 원래 복제 모델의 실패율만으로 설명되지는 않았다.

<p class="section-label">12 · Adaptive attacks and limits</p>

## UAA 제거를 시도한 후에도 대부분의 조건에서 80% 이상의 DSR이 남았다

공격자가 배경음을 방어 신호로 의심하면 filtering, quantization, downsampling, spectral masking 같은 purification을 먼저 적용할 수 있다. NaVo는 WaveGuard의 signal processing과 DNN-based speech enhancement 조건을 사용해 이러한 adaptive attack을 구성했다.

<figure class="research-figure research-figure-comparison">
  <a class="research-figure-scroll" href="/assets/writings/navo/adaptive-attacks.png" aria-label="NaVo 적응형 공격 결과 그래프 크게 보기"><img src="/assets/writings/navo/adaptive-attacks.png" alt="Babble, rain, music UAA에 filtering, quantization, downsampling, spectral masking을 적용한 뒤의 DSR 막대그래프"></a>
  <figcaption>Filtering과 spectral masking 이후에도 높은 DSR이 유지됐고, quantization은 babble과 music에서 상대적으로 낮았다. 대부분의 조합은 80% 이상이었다. NaVo accepted manuscript Figure 3.</figcaption>
</figure>

Filtering과 spectral masking은 clean 조건보다 DSR을 오히려 높이는 경우가 있었다. 논문은 UAA를 speech에서 깔끔하게 분리하지 못한 purification이 화자 특성까지 손상해 speaker embedding 추출을 더 어렵게 만든 결과로 해석했다. 따라서 공격 이후 DSR 상승을 “음질까지 좋아진 방어 개선”으로 읽을 수는 없다. 방어 성분 제거 실패와 speech degradation이 함께 작용했을 가능성이 있다.

<div class="research-callout research-callout-limit">
  <p class="research-callout-title">Limitations</p>
  <ul>
    <li><strong>Acoustic category</strong> — Raindrop과 babble은 강했지만 music은 일부 black-box 조건에서 DSR이 크게 낮았다.</li>
    <li><strong>Gender target</strong> — 남성과 여성의 두 분포를 목표로 사용했으며 더 다양한 음성 정체성 표현은 이번 범위에 포함하지 않았다.</li>
    <li><strong>Quality metric</strong> — CLAP은 prompt–audio 정합성을 보여 주지만 실제 청취 자연스러움과 speech intelligibility를 완전히 대신하지 않는다.</li>
    <li><strong>Latency claim</strong> — 반복 최적화가 없는 구조를 제안했지만 논문에는 기기별 end-to-end latency benchmark가 없다.</li>
    <li><strong>Attack scope</strong> — 네 가지 복제 모델과 선택한 purification 밖의 최신 생성·분리 모델에 대한 강건성은 추가 검증이 필요하다.</li>
  </ul>
</div>

<p class="section-label">13 · Accepted paper</p>

## 자연음을 이용한 생성형 음성 보호 연구를 Interspeech 2026 논문으로 정리했다

NaVo는 adversarial perturbation을 감추는 방식에서 벗어나, 의미가 있는 ambient audio를 직접 생성하는 proactive defense를 제안했다. Distributional target과 modular LoRA를 결합해 unseen speaker에 재사용할 수 있는 UAA를 학습했고, white-box SV2TTS·CosyVoice뿐 아니라 black-box Tortoise와 상용 ElevenLabs, adaptive purification까지 평가했다.

이 연구는 Interspeech 2026에 채택됐다. 아래 링크에서 이 글의 근거로 사용한 6쪽 accepted manuscript를 볼 수 있다. 첫 두 저자는 동등하게 기여했으며 저자명은 논문의 alphabetical equal-contribution 표기를 그대로 따랐다.

<div class="publication-card">
  <p class="publication-card-kicker">Interspeech 2026 · Accepted</p>
  <p class="publication-card-title">NaVo: Natural Voice Protection against Voice Cloning Attacks via Generative Universal Adversarial Audio</p>
  <p class="publication-card-meta">Seoyoung Park*, Seungmin Kim*, Sohee Park, Dain Kim, Thien An Nguyen, Thien-Phuc Doan, Souhwan Jung**, Daeseon Choi**</p>
  <p class="publication-note">*These authors contributed equally and are listed in alphabetical order.</p>
  <p class="publication-card-links"><a href="/assets/writings/navo/navo-accepted-manuscript.pdf">Accepted manuscript PDF 보기</a><a href="/writings/roco-robust-code/">RoCo 연구 보기</a><a href="/writings/rovo-robust-voice-protection/">RoVo 연구 보기</a></p>
</div>

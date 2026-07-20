---
title: "RoVO: 잠재공간 교란으로 음성 복제 방어를 견고하게 만들기"
description: "신경 오디오 코덱의 잠재공간에서 적대적 교란을 최적화하고 약·중·강 적응형 공격과 black-box 조건에서 검증한 2024–2025 음성 보호 연구."
lang: ko
period: "2024 – 2025"
---

2024년부터 2025년까지 공개 음성이 무단 음성 복제에 사용되는 것을 사전에 막는 연구를 수행했다. 이 연구를 바탕으로 RoVO(Robust Voice) 논문을 작성했고, 2025년 5월 arXiv v1을 공개한 뒤 데이터와 공격 조건을 확장했다. 확장 원고는 현재 심사 중이다.

RoVO는 음성 파형에 작은 노이즈를 직접 더하지 않는다. 신경 오디오 코덱이 만든 잠재 표현에 적대적 교란을 넣고, 이를 다시 음성으로 복원한다. 교란을 음성 구조와 결합해 공격자가 speech enhancement나 purification을 적용해도 보호 효과가 쉽게 사라지지 않도록 설계했다.

<div class="project-meta" aria-label="연구 개요">
  <div><span>Period</span><strong>2024 – 2025</strong></div>
  <div><span>Task</span><strong>Proactive voice protection</strong></div>
  <div><span>Status</span><strong>Manuscript under review</strong></div>
</div>

<p class="section-label">01 · Research question</p>

## 음성 복제 전에 막는 방어가 왜 필요한가

Zero-shot TTS와 voice conversion은 짧은 참조 음성만으로도 새로운 문장을 원 화자의 목소리처럼 생성한다. 온라인 영상, 인터뷰, 팟캐스트처럼 이미 공개된 음성은 별도의 침해 없이도 수집할 수 있다. 공격자는 이 음성을 화자 조건으로 넣어 보이스피싱, 사칭, 허위 정보 생성, 화자 인증 우회에 사용할 수 있다.

합성 음성이 만들어진 뒤 이를 탐지하는 방법은 피해 콘텐츠의 생성 자체를 막지 못한다. RoVO는 음성을 공개하기 전에 보호 처리를 적용하는 proactive defense를 택했다. 보호된 음성은 사람이 들을 때 발화 내용을 유지하지만, 복제 모델이 원 화자의 정체성을 추출하기는 어려워야 한다.

기존 proactive defense도 적대적 교란을 이용했지만, 대부분 파형이나 스펙트로그램에 신호 수준의 노이즈를 더했다. 공격자가 보호 음성을 그대로 복제 모델에 넣을 때는 효과가 있었지만, 음성 향상 모델로 먼저 정화하면 교란이 약해질 수 있었다. 따라서 연구 질문을 단순한 초기 방어 성공률이 아니라 다음 조건으로 바꿨다.

<div class="research-callout research-callout-finding">
  <p class="research-callout-title">Research question</p>
  <p>공격자가 보호 음성을 정화하고, 방어가 사용한 모델과 다른 복제·검증 모델로 옮겨 가며, 방어 구조까지 알고 복원을 시도해도 화자 정체성 보호가 남는가?</p>
</div>

<figure class="research-figure research-figure-comparison">
  <img src="/assets/writings/rovo/threat-overview.png" alt="피해자가 RoVO로 보호한 음성을 공개한 뒤 공격자가 적응형 공격과 음성 복제를 시도하지만 사칭과 인증 공격에 실패하는 흐름도">
  <figcaption>보호 음성은 공개 플랫폼에서 그대로 사용되지만, 공격자가 정화와 복제를 거쳐 만든 음성은 원 화자로 받아들여지지 않는 것을 목표로 했다. 최신 심사 원고 Figure 1.</figcaption>
</figure>

<p class="section-label">02 · Threat model</p>

## 공격자의 능력을 약·중·강 세 단계로 나눴다

공격자는 피해자가 공개한 제한된 음성을 수집하고, 현대적인 zero-shot TTS 또는 voice conversion 모델에 참조 음성으로 입력한다고 가정했다. 공격 결과는 청각적 인상만으로 판단하지 않았다. 보호 음성으로 만든 합성 음성이 자동 화자 검증(ASV) 시스템에서 원 화자로 받아들여지면 방어 실패, 거부되면 방어 성공으로 정의했다.

공격 강도는 보호 교란을 제거하기 위해 공격자가 활용하는 정보와 모델에 따라 세 단계로 나눴다.

<div class="research-table" role="region" aria-label="RoVO 적응형 공격 단계" tabindex="0">
  <table>
    <thead><tr><th>단계</th><th>공격자가 적용한 처리</th><th>검증 목적</th></tr></thead>
    <tbody>
      <tr><td>Weak</td><td>Quantization, resampling, filtering, mel inversion</td><td>간단한 신호 변환에 대한 안정성</td></tr>
      <tr><td>Moderate</td><td>Spectral Masking, DeepFilterNet, MP-SENet, FlowSE, De-AntiFake</td><td>학습 기반 enhancement·purification에 대한 강건성</td></tr>
      <tr><td>Strong</td><td>방어 구조와 목적함수를 아는 reconstruction</td><td>방어 정보를 이용한 white-box 복원 저항성</td></tr>
      <tr><td>Black-box</td><td>학습에 사용하지 않은 Tortoise, CosyVoice</td><td>보지 못한 복제 모델로의 전이성</td></tr>
    </tbody>
  </table>
</div>

강한 공격에서도 공격자는 공개된 보호 음성만 얻을 수 있고 원본 clean speech에는 접근할 수 없다고 두었다. 원본까지 유출되면 공격자가 보호 처리를 우회해 원본을 직접 사용하므로 proactive protection의 문제 정의 자체가 달라진다.

방어자는 자신의 음성을 공개하기 전에 로컬 환경에서 RoVO를 적용할 수 있다고 가정했다. 공개 이후 어떤 후처리가 적용될지는 통제하지 못하므로, 고정된 한 공격보다 여러 단계의 적응형 공격에서 보호가 남는지를 평가했다.

<p class="section-label">03 · Why latent space</p>

## 신호에 노이즈를 더하는 대신 codec embedding을 바꿨다

Signal-domain 방어는 원 음성 `x`에 교란 `δ_signal`을 직접 더해 `x + δ_signal`을 만든다. 이 교란은 파형에서 외부 잡음처럼 나타날 수 있다. 음성 향상 모델은 깨끗한 음성과 잡음의 통계적 차이를 학습하므로, 보호 목적으로 넣은 교란도 제거 대상으로 취급할 수 있다.

RoVO는 교란을 더하는 위치를 codec의 잠재공간으로 옮겼다. 입력 음성을 encoder `E`로 잠재 표현 `z`에 매핑하고, `z`에 학습 가능한 `δ_latent`를 더한 뒤 decoder `D`로 보호 음성을 복원했다.

`z = E(x)`, `x_rovo = D(z + δ_latent)`

교란은 비선형 decoder를 통과하면서 복원 음성의 시간·주파수 구조에 반영된다. 파형에 단순히 더한 독립 잡음과 달리 음성의 음향 구조에 더 깊게 결합되므로, enhancement가 교란만 깨끗하게 분리하기 어려워진다.

<figure class="research-figure research-figure-comparison">
  <a class="research-figure-scroll" href="/assets/writings/rovo/spectrogram-comparison.png" aria-label="스펙트로그램 비교 그림 크게 보기"><img src="/assets/writings/rovo/spectrogram-comparison.png" alt="원본, AntiFake 향상 전후, RoVO 향상 전후 음성의 스펙트로그램 비교"></a>
  <figcaption>AntiFake의 신호 수준 교란은 MP-SENet 처리 뒤 원본과 가까운 구조로 돌아오지만, RoVO는 교란만 제거되지 않고 음성 구조 자체가 크게 변한다. 최신 심사 원고 Figure 3.</figcaption>
</figure>

이 차이는 “향상 뒤 음질이 좋아졌는가”만으로 방어를 판단하면 안 되는 이유이기도 하다. Signal-domain 방어에서 향상 뒤 음질 회복은 교란이 제거됐다는 신호일 수 있다. RoVO에서는 향상 모델이 보호 변형을 잡음으로 분리하지 못해 음성 자체를 추가로 손상하는 경우가 나타났다.

<p class="section-label">04 · RoVO framework</p>

## Bark와 EnCodec 표현 위에서 보호 음성을 재구성했다

RoVO의 backbone에는 neural audio codec 기반 생성 구조인 Bark를 사용했다. 입력 음성은 Neural Codec Encoder를 거쳐 압축된 표현으로 바뀌고, Coarse Transformer와 Fine Transformer가 장기 구조와 세부 음향 정보를 처리한다. 이 embedding에 교란을 최적화한 뒤 Neural Codec Decoder가 보호 음성을 복원한다.

<figure class="research-figure research-figure-comparison">
  <a class="research-figure-scroll" href="/assets/writings/rovo/rovo-framework.png" aria-label="RoVO 구조 그림 크게 보기"><img src="/assets/writings/rovo/rovo-framework.png" alt="원본 음성을 neural codec encoder와 coarse·fine transformer로 embedding한 뒤 적대적 교란을 넣고 decoder로 보호 음성을 복원하는 RoVO 구조"></a>
  <figcaption>Target-based Loss는 복제 모델의 speaker encoder 방향에서 화자 정체성을 바꾸고, SNR Loss는 원본과 보호 음성의 차이를 제한한다. 최신 심사 원고 Figure 2.</figcaption>
</figure>

교란 실험 전에 backbone이 원 음성을 충분히 복원하는지 따로 확인했다. 교란을 넣지 않고 Bark로 재구성한 음성은 MOS 4.53, 원본과의 cosine similarity 0.96을 기록했다. 이후 성능 저하를 codec 자체의 복원 실패가 아니라 보호 교란의 영향으로 해석하기 위한 기준선이었다.

<div class="research-callout">
  <p class="research-callout-title">RoVO pipeline</p>
  <ul>
    <li><strong>Encode</strong> — 공개 전 원 음성을 neural codec 잠재 표현으로 변환했다.</li>
    <li><strong>Perturb</strong> — speaker identity를 흔드는 교란을 embedding에 PGD로 최적화했다.</li>
    <li><strong>Decode</strong> — 변형된 embedding을 다시 재생 가능한 보호 음성으로 복원했다.</li>
    <li><strong>Release</strong> — 원본 대신 보호 음성을 온라인에 공개하는 사용 시나리오를 가정했다.</li>
  </ul>
</div>

<p class="section-label">05 · Optimization</p>

## 방어력과 음질을 번갈아 최적화한 PerC-AL

강한 교란은 화자 정체성을 더 크게 바꾸지만 보호 음성의 자연스러움과 명료도를 떨어뜨린다. 반대로 품질 손실만 줄이면 speaker encoder가 원 화자를 계속 추출할 수 있다. RoVO는 이 두 목적을 한 번에 단순 합산하지 않고, 임곗값에 따라 번갈아 최적화하는 PerC-AL(Perceptual Alternating Loss)을 사용했다.

Target-based Loss는 보호 음성에서 추출한 speaker embedding을 원 화자에서 멀어지게 하고 미리 정한 target speaker 방향으로 이동시킨다. SNR Loss는 복원된 보호 음성과 원본의 차이를 제한해 교란이 과도하게 커지는 것을 막는다. 먼저 화자 정체성 교란 목표를 만족시키고, 조건이 충족되면 품질 보존 단계로 전환하는 과정을 반복했다.

<figure class="research-figure research-figure-comparison">
  <img src="/assets/writings/rovo/alternating-optimization.png" alt="공동 최적화와 교대 최적화의 단계별 DSR 및 MOS 변화를 비교한 그래프">
  <figcaption>공동 최적화는 DSR이 일찍 포화됐고, alternating optimization은 정체성 교란 단계에서 DSR을 높인 뒤 품질 단계에서 MOS를 일부 회복했다. 최신 심사 원고 Figure 4.</figcaption>
</figure>

Target speaker는 원 화자와 반대 성별에서 선택했다. 두 speaker encoder의 embedding을 t-SNE로 투영했을 때 남성과 여성 화자 군집이 분리되는 경향이 나타났기 때문이다. 반대 성별 target은 같은 성별 target보다 embedding 공간에서 더 멀리 놓일 가능성이 높아, 원 화자 표현에 더 큰 이동을 유도했다.

<figure class="research-figure research-figure-comparison">
  <img src="/assets/writings/rovo/target-gender-embedding.png" alt="두 화자 인코더에서 남성과 여성 화자 embedding이 서로 다른 영역에 군집한 t-SNE 시각화">
  <figcaption>두 speaker encoder 모두 성별에 따른 군집 분리가 나타났다. opposite-gender target을 사용한 선택의 경험적 근거다. 보충자료 Figure 1.</figcaption>
</figure>

<p class="section-label">06 · Dataset</p>

## VCTK에서 임곗값을 고르고 여섯 코퍼스로 일반화를 확인했다

PerC-AL은 Target-based Loss와 SNR Loss를 언제 전환할지 정하는 임곗값이 필요하다. 이 값을 데이터셋마다 다시 맞추면 각 코퍼스에 과적합된 결과가 될 수 있다. 따라서 VCTK에서만 임곗값을 정하고, 나머지 영어 음성 코퍼스에는 수정 없이 그대로 적용했다.

<div class="research-table" role="region" aria-label="RoVO 음성 코퍼스 구성" tabindex="0">
  <table>
    <thead><tr><th>역할</th><th>코퍼스</th><th>표본 구성</th><th>사용 방식</th></tr></thead>
    <tbody>
      <tr><td>Threshold selection</td><td>VCTK</td><td>109명 × 10개 발화</td><td>PerC-AL 임곗값 결정</td></tr>
      <tr><td>Main evaluation</td><td>FST</td><td rowspan="5">총 70명·700개 발화</td><td rowspan="5">VCTK 임곗값을 재튜닝 없이 적용</td></tr>
      <tr><td>Main evaluation</td><td>MCV</td></tr>
      <tr><td>Main evaluation</td><td>CSNED</td></tr>
      <tr><td>Main evaluation</td><td>CSUKIED</td></tr>
      <tr><td>Main evaluation</td><td>LibriSpeech</td></tr>
    </tbody>
  </table>
</div>

메인 평가에서는 코퍼스별로 10–20명의 화자를 선택하고, 화자마다 5–10초 길이 발화 10개를 사용했다. 전체는 70명, 700개 원본 발화였다. 각 발화를 보호한 뒤 세 white-box voice cloning 모델에서 합성하고, 여러 speaker verification backend로 원 화자 수용 여부를 측정했다.

VCTK는 임곗값 선택 전용 데이터로, 다른 다섯 코퍼스는 일반화 확인용으로 역할을 분리했다. 언어가 모두 영어라는 공통점은 남았지만, 억양·녹음 환경·발화 스타일이 다른 코퍼스에 같은 임곗값을 적용해 특정 데이터셋에서만 작동하는 설정을 피했다.

<p class="section-label">07 · Evaluation protocol</p>

## 복제 모델, 검증 모델, 품질 지표를 분리했다

방어 생성에 사용하는 speaker encoder, 합성에 사용하는 voice cloning 모델, 결과를 판정하는 speaker verification 모델을 분리했다. 하나의 모델에서만 교란이 성공하는지보다 모델 조합이 바뀌어도 효과가 남는지를 보기 위한 구성이다.

<div class="research-callout">
  <p class="research-callout-title">Models and baselines</p>
  <ul>
    <li><strong>White-box cloning</strong> — SV2TTS, YourTTS, AVC</li>
    <li><strong>Black-box cloning</strong> — Tortoise, CosyVoice</li>
    <li><strong>Speaker verification</strong> — ECAPA-TDNN, Resemblyzer, ResNet 계열</li>
    <li><strong>Signal-domain baselines</strong> — AttackVC, AntiFake, VoiceGuard</li>
  </ul>
</div>

DSR(Defense Success Rate)은 보호 음성으로 생성한 합성 음성이 원 화자로 받아들여지지 않은 비율이다. 일반적인 인증 정확도와 반대로 DSR은 높을수록 방어가 강하다. MOS는 보호 음성의 지각 품질을 1–5 범위로 평가하고, WER은 발화 내용이 얼마나 유지되는지 측정했다.

보충 실험에서는 단순 낭독문 대신 금전 송금 요구, 긴급 상황, 계정 인증, 의심 거래 확인처럼 실제 복제 음성이 악용될 수 있는 문장을 합성 입력으로 사용했다. 모델이 무해한 문장만 생성하는 조건보다 사칭과 설득이 필요한 상황에 가까운 평가를 구성하려는 선택이었다.

<p class="section-label">08 · Base and weak attacks</p>

## 재튜닝 없이 평균 DSR을 크게 높였다

VCTK threshold-selection set에서 보호하지 않은 RAW 음성의 평균 DSR은 9.6%였고, RoVO를 적용하면 82.5%로 증가했다. VCTK에서 정한 임곗값을 다른 코퍼스에 그대로 적용한 메인 평가에서도 평균 DSR은 RAW 13.1%에서 RoVO 88.0%로 높아졌다.

<div class="research-metrics" aria-label="RoVO 기본 성능 핵심 수치">
  <div class="research-metric"><span class="research-metric-value">82.5%</span><span class="research-metric-label">VCTK 평균 DSR<br>RAW 9.6%</span></div>
  <div class="research-metric"><span class="research-metric-value">88.0%</span><span class="research-metric-label">메인 코퍼스 평균 DSR<br>RAW 13.1%</span></div>
  <div class="research-metric"><span class="research-metric-value">70명</span><span class="research-metric-label">메인 평가 화자<br>700개 발화</span></div>
  <div class="research-metric"><span class="research-metric-value">16.4%</span><span class="research-metric-label">보호 음성 평균 WER<br>Clean 5.3%</span></div>
</div>

<div class="research-table" role="region" aria-label="메인 평가 데이터의 RAW와 RoVO DSR" tabindex="0">
  <table>
    <thead><tr><th>Verifier</th><th>SV2TTS RAW</th><th>SV2TTS RoVO</th><th>YourTTS RAW</th><th>YourTTS RoVO</th><th>AVC RAW</th><th>AVC RoVO</th></tr></thead>
    <tbody>
      <tr><td>Resemblyzer</td><td>0.8%</td><td>84.1%</td><td>0.7%</td><td>80.9%</td><td>8.9%</td><td>91.1%</td></tr>
      <tr><td>ECAPA-TDNN</td><td>23.5%</td><td>83.6%</td><td>11.3%</td><td>83.1%</td><td>33.6%</td><td>94.2%</td></tr>
      <tr><td>ResNet</td><td>13.3%</td><td>87.5%</td><td>2.6%</td><td>90.9%</td><td>23.2%</td><td>96.6%</td></tr>
    </tbody>
  </table>
</div>

보호 음성의 평균 WER은 clean speech 5.3%에서 16.4%로 증가했다. 음성 내용이 완전히 무너지지는 않았지만, 방어 성능을 얻는 과정에서 명료도 비용이 발생했음을 뜻한다.

약한 공격에서는 quantization, resampling, filtering, mel inversion을 각각 적용했다. 전체 조합 평균 DSR 하락은 2.2%p에 그쳤다. AVC에서는 모든 변환과 verifier 조합에서 88.5% 이상을 유지했고, 가장 어려운 조건은 YourTTS–ResNet의 mel inversion으로 DSR 73.0%였다. 일부 조건은 변환 뒤 DSR이 최대 8.8%p 증가했다.

<p class="section-label">09 · Moderate adaptive attacks</p>

## 음성 향상 뒤에도 signal-domain baseline보다 더 많은 방어력을 남겼다

중간 강도의 적응형 공격은 simple transform보다 현실적인 학습 기반 enhancement를 사용했다. Spectral Masking, DeepFilterNet, MP-SENet의 DNS·VoiceBank 버전을 보호 음성에 적용하고, AttackVC·AntiFake·VoiceGuard와 같은 조건에서 비교했다.

36개 enhancement·cloning·verification 조합에서 RoVO는 평균 82.8% DSR을 유지했다. 공격 전 보호 음성과 비교한 평균 하락은 5.2%p였다. 같은 조건에서 AttackVC는 30.8%p, AntiFake는 35.5%p, VoiceGuard는 49.7%p 하락했다. Signal-domain baseline은 초기 조건에서 높은 DSR을 보이는 경우가 있었지만, enhancement가 들어오면 감소 폭이 더 컸다.

<div class="research-table" role="region" aria-label="음성 향상 공격 후 방어 성능 변화" tabindex="0">
  <table>
    <thead><tr><th>Defense</th><th>Representation</th><th>평균 DSR 변화</th><th>해석</th></tr></thead>
    <tbody>
      <tr><td>AttackVC</td><td>Signal domain</td><td>−30.8%p</td><td>향상 뒤 방어력 감소</td></tr>
      <tr><td>AntiFake</td><td>Signal domain</td><td>−35.5%p</td><td>교란 정화에 취약</td></tr>
      <tr><td>VoiceGuard</td><td>Signal domain</td><td>−49.7%p</td><td>가장 큰 평균 하락</td></tr>
      <tr><td><strong>RoVO</strong></td><td><strong>Codec latent</strong></td><td><strong>−5.2%p</strong></td><td><strong>평균 DSR 82.8%</strong></td></tr>
    </tbody>
  </table>
</div>

RoVO는 AVC 조건에서 enhancement 이후에도 평균 93.8% DSR을 유지했다. 일부 조건에서는 DSR이 최대 4.4%p 상승했다. 그러나 이를 곧바로 방어 품질의 향상으로 해석하지 않았다. Enhancement가 보호 교란을 제거하지 못하고 음성 자체를 더 손상하면 speaker verification이 더 어려워져 DSR이 오를 수 있기 때문이다.

품질 측면에서 RoVO의 무공격 평균 MOS는 2.53이었고, enhancement 뒤 평균 2.68로 제한적으로 회복됐다. Signal-domain baseline은 교란이 제거되면서 MOS가 크게 오르는 경향을 보였지만 RoVO는 회복 폭이 작았다. 제거하기 어려운 대신 처음부터 지각 품질 비용이 더 크다는 trade-off가 남았다.

<div class="research-callout research-callout-finding">
  <p class="research-callout-title">Core observation</p>
  <p>좋은 방어는 공격 전 DSR만 높아서는 부족했다. 정화 이후 DSR 하락이 작고, 그 결과가 단순한 음성 파괴 때문인지까지 함께 확인해야 했다.</p>
</div>

<p class="section-label">10 · Transfer and strong attacks</p>

## 보지 못한 복제 모델과 방어 구조를 아는 공격까지 평가했다

Black-box 평가는 SV2TTS, YourTTS, AVC의 speaker encoder를 ensemble로 사용해 보호 음성을 만들고, 방어 생성에 참여하지 않은 Tortoise와 CosyVoice에서 수행했다. 모델 하나에 맞춘 교란보다 여러 surrogate encoder의 공통 방향을 사용해 보지 못한 복제 모델로의 전이를 유도했다.

<div class="research-table" role="region" aria-label="RoVO black-box와 강한 공격 결과 요약" tabindex="0">
  <table>
    <thead><tr><th>평가 조건</th><th>DSR</th><th>품질·보조 결과</th></tr></thead>
    <tbody>
      <tr><td>Black-box 전체</td><td>81.6%</td><td>MOS 2.83 ± 0.46</td></tr>
      <tr><td>Black-box weak attacks</td><td>89.0%</td><td>Tortoise·CosyVoice</td></tr>
      <tr><td>Black-box enhancement·purification</td><td>77.3%</td><td>FlowSE·De-AntiFake 포함</td></tr>
      <tr><td>Strong white-box reconstruction</td><td>82.1%</td><td>MOS 3.38–3.76, 원 화자 수용률 15.3%</td></tr>
      <tr><td>LLaSE-G1 reconstruction</td><td>72.9%</td><td>ECAPA-TDNN 평균 82.6%</td></tr>
    </tbody>
  </table>
</div>

Black-box 전체 공격 조합의 평균 DSR은 81.6%였다. 약한 변환에서는 89.0%, enhancement·purification에서는 77.3%를 기록했다. Ensemble-protected audio의 MOS는 2.83 ± 0.46이었다. White-box에서 사용한 모델과 다른 생성 구조에서도 보호가 완전히 사라지지 않았다.

강한 공격에서는 공격자가 RoVO의 backbone, 최적화 목적, target reference를 안다고 가정했다. 보호 음성에서 더 자연스러운 신호를 재구성해 교란을 역으로 줄이려는 조건이었다. 재구성 음성의 MOS는 모델별 3.38–3.76까지 회복됐지만, speaker verification에서 원 화자로 받아들여진 비율은 평균 15.3%에 그쳤다. 이 음성으로 다시 복제했을 때 DSR은 73.2–90.7%, 평균 82.1%였다.

보충자료에서는 LLaSE-G1을 추가 reconstruction attack으로 사용했다. WavLM으로 speaker-related embedding을 얻고, 이를 speech token으로 바꿔 LLaMA 기반 언어 모델과 X-Codec decoder로 다시 음성을 구성하는 공격이다. 전체 조합 평균 DSR은 72.9%였고, ECAPA-TDNN 판정에서는 SV2TTS 82.2%, YourTTS 82.7%, AVC 79.9%, black-box Tortoise 85.4%로 평균 82.6%를 유지했다.

<p class="section-label">11 · Commercial verification</p>

## 상용 화자 검증 API에서도 결과를 확인했다

Open-source verifier의 결과가 특정 구현이나 공개 임곗값에만 의존하는지 확인하기 위해 MS Azure 상용 화자 검증 API를 추가했다. Azure는 RAW 음성에서도 일부 복제 모델의 DSR이 비교적 높았지만, RoVO 적용 후 세 모델 모두 98% 이상으로 증가했다.

<div class="research-table" role="region" aria-label="MS Azure 화자 검증 API의 RAW와 RoVO DSR" tabindex="0">
  <table>
    <thead><tr><th>Voice cloning</th><th>RAW</th><th>RoVO</th><th>증가</th></tr></thead>
    <tbody>
      <tr><td>SV2TTS</td><td>68.1%</td><td>99.8%</td><td>+31.7%p</td></tr>
      <tr><td>YourTTS</td><td>18.0%</td><td>99.5%</td><td>+81.5%p</td></tr>
      <tr><td>AVC</td><td>52.3%</td><td>98.6%</td><td>+46.3%p</td></tr>
    </tbody>
  </table>
</div>

음성 향상 뒤 Azure 평가에서 AntiFake는 평균 DSR 94.1%, 평균 5.6%p 하락을 기록했다. RoVO는 평균 DSR 99.0%를 유지했고 평균 변화는 0.3%p에 불과했다. 모든 enhancement·cloning 조합에서 98.2–99.9% 범위였다.

상용 API는 open-source verifier와 decision boundary가 다르므로 절대 수치를 직접 같은 척도로 비교하지 않았다. 핵심은 외부 상용 backend로 판정 모델이 바뀌어도 RoVO의 보호 효과와 enhancement 저항성이 유지됐다는 점이다.

<p class="section-label">12 · Trade-off and limitations</p>

## 제거하기 어려운 보호와 지각 품질 사이에 trade-off가 남았다

보호 음성의 사용성을 사람 평가로도 확인했다. IRB 승인을 받은 user study에서 Prolific을 통해 모집한 영어 원어민 100명이 각각 30개 음성 쌍을 들었다. 참가자는 두 음성이 같은 화자처럼 들리는 정도를 `Very Similar`부터 `Very Different`까지 5점 척도로 평가했다.

평가 조건은 같은 화자의 실제 음성 두 개(RA_RA), 다른 화자의 실제 음성(RA_RB), 원본과 보호 음성(RA_DA), 원본과 보호 음성으로 만든 합성 결과(RA_FDA), 그리고 보호·합성 음성에 enhancement를 적용한 RA_DA-SE와 RA_FDA-SE로 구성했다.

<figure class="research-figure research-figure-interface">
  <img src="/assets/writings/rovo/user-study.png" alt="실제 음성, 보호 음성, 합성 음성, 음성 향상 적용 조건의 화자 유사도 응답 분포">
  <figcaption>RA_DA는 실제 같은 화자 조건에 더 가까웠지만, 합성 조건 RA_FDA와 RA_FDA-SE는 원 화자와 다르다는 응답이 우세했다. Enhancement를 적용한 보호 음성은 유사도가 더 낮아져 추가 왜곡이 발생했음을 보였다. 최신 심사 원고 Figure 5.</figcaption>
</figure>

RA_RA는 유사하다는 응답이 우세하고 RA_RB는 다르다는 응답이 우세해 평가 기준이 정상적으로 작동했다. 원본과 RoVO 보호 음성을 비교한 RA_DA는 합성 조건보다 원본 화자에 가까웠다. 반면 보호 음성으로 생성한 RA_FDA와 enhancement 이후의 RA_FDA-SE는 원본 화자와 다르다는 응답이 대부분이었다.

결과는 보호 음성이 발화자 정체성을 완전히 지우는 익명화가 아니라, 사람이 듣는 원 화자의 특성은 어느 정도 남기면서 복제 결과가 원 화자를 재현하지 못하게 하는 proactive protection임을 보여 줬다. 다만 enhancement가 들어간 RA_DA-SE는 RA_DA보다 다르게 들렸고, 공격 저항성이 사용성 손실 없이 얻어진 것은 아니었다.

<div class="research-callout research-callout-limit">
  <p class="research-callout-title">Limitations</p>
  <ul>
    <li><strong>Perceptual quality</strong> — 잠재공간 교란은 제거하기 어렵지만 MOS와 WER에 측정 가능한 비용을 남겼다.</li>
    <li><strong>Enhancement damage</strong> — 정화 뒤 DSR 상승은 교란의 우수성뿐 아니라 음성 자체의 추가 훼손을 포함할 수 있다.</li>
    <li><strong>Evaluation scope</strong> — 영어 코퍼스와 선택한 TTS·VC·ASV 모델 밖의 언어와 최신 생성기로 일반화를 보장하지 않는다.</li>
    <li><strong>Deployment</strong> — 반복 최적화의 연산 시간과 모바일·실시간 보호는 별도 연구가 필요하다.</li>
    <li><strong>Review status</strong> — 확장 원고는 심사 중이므로 최종 출판 과정에서 실험 구성과 수치가 바뀔 수 있다.</li>
  </ul>
</div>

<p class="section-label">13 · Manuscript and preprint</p>

## 이 연구를 바탕으로 RoVO 논문을 작성했다

2024–2025년에 수행한 연구를 바탕으로 RoVO 논문을 작성했다. 2025년 5월에는 초기 방법과 실험을 담은 arXiv v1을 공개했고, 이후 여섯 코퍼스, 단계별 적응형 공격, PerC-AL, black-box transfer, 상용 검증 API와 추가 reconstruction 공격을 포함하는 확장 원고로 발전시켰다.

현재 확장 원고는 심사 중이다. 아래 arXiv 링크는 공개된 2025년 v1이며, 이 글에서 설명한 최신 확장 실험 전체와는 버전이 다르다.

<div class="publication-card">
  <p class="publication-card-kicker">Manuscript under review · Expanded experiments</p>
  <p class="publication-card-title">RoVo: Robust Voice Protection Against Voice Cloning Attacks via Embedding-Level Adversarial Perturbations</p>
  <p class="publication-card-meta">2024–2025 research · Current manuscript · Results may change during peer review</p>
</div>

<div class="publication-card">
  <p class="publication-card-kicker">Public preprint · arXiv v1 · May 2025</p>
  <p class="publication-card-title">RoVo: Robust Voice Protection Against Unauthorized Speech Synthesis with Embedding-Level Perturbations</p>
  <p class="publication-card-meta">Seungmin Kim, Sohee Park, Donghyun Kim, Jisu Lee, Daeseon Choi</p>
  <p class="publication-card-links"><a href="https://arxiv.org/abs/2505.12686">arXiv에서 공개본 보기</a></p>
</div>

---
title: "RoCo: perturbation code로 음성 복제 방어를 빠르게 만들기"
description: "RoVo의 neural-codec 잠재공간 방어를 discrete perturbation code, STE, two-stage optimization으로 발전시켜 강건성과 생성 속도를 함께 다룬 2025–2026 연구."
lang: ko
period: "2025 – 2026"
---

2025년부터 2026년까지 RoVo의 neural-codec 잠재공간 방어를 실제 사용에 더 가까운 형태로 발전시키는 연구를 수행했다. RoVo가 embedding-level perturbation이 음성 향상과 적응형 제거 공격에도 남을 수 있음을 보였다면, RoCo(Robust Code)는 같은 방향을 **이산 perturbation code**로 다시 설계해 보호 음성 생성 시간을 줄이는 데 초점을 맞췄다.

이 연구는 ICASSP 2026 프로시딩에 `RoCo: Robust Code for Fast and Effective Proactive Defense against Voice Cloning Attack`으로 게재됐고, 스페인 바르셀로나에서 구두 발표했다. 논문에서는 전용 perturbation code, Straight-Through Estimator(STE), two-stage loss optimization을 결합하고, 6개 음성 코퍼스·3개 복제 모델·3개 화자 검증 모델에서 방어력과 음질, 후처리 강건성, 생성 시간을 함께 평가했다.

<div class="project-meta" aria-label="연구 개요">
  <div><span>Period</span><strong>2025 – 2026</strong></div>
  <div><span>Task</span><strong>Fast proactive voice protection</strong></div>
  <div><span>Publication</span><strong>ICASSP 2026 · Oral</strong></div>
</div>

<p class="section-label">01 · From RoVo to RoCo</p>

## RoVo의 잠재공간 방어를 더 빠른 code-level 방어로 발전시켰다

[RoVo 연구](/writings/rovo-robust-voice-protection/)는 보호 교란을 파형에 직접 더하지 않고 neural audio codec의 연속 embedding에 넣었다. 비선형 decoder를 통과한 교란은 음성 구조와 결합되므로 speech enhancement가 일반 잡음처럼 분리하기 어려웠다. 대신 발화마다 연속값 교란을 여러 단계 최적화해야 하므로, 공개할 음성이 많거나 빠른 처리가 필요한 상황에서는 생성 비용이 남았다.

RoCo는 이 병목을 없애기 위해 보호 신호를 **별도의 discrete codebook channel**로 분리했다. 원 음성의 acoustic token은 그대로 두고, 화자 정체성 추출만 방해하는 perturbation code를 추가한 뒤 codec decoder로 함께 복원했다. RoVo의 핵심 가정인 “교란을 codec 표현 내부에 결합하면 제거하기 어려워진다”를 유지하면서, 최적화 단위를 연속 embedding에서 양자화된 code로 바꾼 후속 설계다.

<div class="research-table" role="region" aria-label="RoVo와 RoCo의 설계 차이" tabindex="0">
  <table>
    <thead><tr><th>구분</th><th>RoVo</th><th>RoCo</th></tr></thead>
    <tbody>
      <tr><td>보호 단위</td><td>연속 codec embedding의 perturbation</td><td>추가 codebook channel의 discrete perturbation code</td></tr>
      <tr><td>최적화</td><td>연속 잠재공간에서 PGD 기반 업데이트</td><td>양자화 forward와 gradient backward를 잇는 STE</td></tr>
      <tr><td>손실 제어</td><td>방어력과 지각 품질을 교대로 조정</td><td>임곗값 전 Target Loss, 이후 SNR Loss</td></tr>
      <tr><td>연구 초점</td><td>적응형 제거 공격에서도 남는 강건성</td><td>강건성을 유지하면서 생성 지연 단축</td></tr>
    </tbody>
  </table>
</div>

<p class="section-label">02 · Research problem</p>

## 방어 교란은 제거하기 어려워야 했고 생성도 오래 걸리지 않아야 했다

기존 proactive defense는 공개 전 음성에 적대적 교란을 넣어 TTS나 voice conversion 모델의 speaker encoder가 원 화자의 특징을 정확히 읽지 못하게 한다. 그러나 파형에 더한 작은 교란은 최신 speech enhancement나 denoising 모델에서 배경 잡음으로 취급될 수 있다. 공격자가 보호 음성을 먼저 정화한 뒤 복제하면 초기 방어 성공률이 크게 떨어질 수 있다.

두 번째 문제는 처리 시간이다. Signal-domain 방법은 한 발화의 수많은 waveform sample을 반복적으로 갱신한다. 5–10초 음성을 보호하는 데 수십 초에서 2분 가까이 걸리면, 영상·방송·실시간 대화처럼 연속 음성이 생성되는 환경에 적용하기 어렵다.

따라서 RoCo의 연구 질문은 다음 두 조건을 동시에 만족하는가로 정리했다.

<div class="research-callout research-callout-finding">
  <p class="research-callout-title">Research question</p>
  <p>음성 향상 모델이 쉽게 제거하지 못하는 보호 성분을 neural codec의 discrete code에 넣으면서, 기존 signal-domain defense보다 보호 음성을 빠르게 생성할 수 있는가?</p>
</div>

<p class="section-label">03 · Perturbation code</p>

## 원래 acoustic token 옆에 방어 전용 codebook channel을 붙였다

Neural codec 기반 음성 모델은 입력 음성을 여러 codebook의 acoustic token으로 표현한다. Coarse Transformer가 앞쪽 codebook의 장기 구조를 autoregressive하게 예측하고, Fine Transformer가 뒤쪽 codebook의 세부 음향 정보를 보완한다. 시간 프레임 `t`와 codebook `q`에 따른 원래 latent token을 `a(q,t)`라고 두면, RoCo는 같은 시간 길이를 갖는 perturbation code `p(t)`를 하나 더 만든다.

`ã = [a; p]`

여기서 `[a; p]`는 시간축이 아니라 codebook 축의 결합이다. 원래 codebook은 음소·운율·음색을 복원하는 역할을 유지하고, 추가된 `p`는 speaker identity 추출을 방해하는 목적에만 사용된다. 방어 성분을 별도 channel로 분리했기 때문에 원 음성 내용을 담은 token 전체를 다시 흔드는 것보다 갱신 범위를 좁힐 수 있다.

<figure class="research-figure research-figure-comparison">
  <a class="research-figure-scroll" href="/assets/writings/roco/roco-framework.png" aria-label="RoCo 전체 구조 그림 크게 보기"><img src="/assets/writings/roco/roco-framework.png" alt="원 음성의 latent code에 perturbation code를 추가하고 STE, Target Loss, SNR Loss로 최적화한 뒤 neural codec decoder로 보호 음성을 복원하는 RoCo 구조"></a>
  <figcaption>원 음성의 latent code는 유지하고 perturbation code를 추가했다. Target Loss로 화자 정체성을 이동시킨 뒤 SNR Loss로 음질을 보정한다. ICASSP 2026 논문 Figure 1.</figcaption>
</figure>

<p class="section-label">04 · Straight-Through Estimator</p>

## 이산 code를 유지하면서 STE로 gradient를 전달했다

Perturbation code는 codebook index이므로 정수값이다. Forward pass에서 one-hot index로 codebook vector를 선택하는 quantization은 미분할 수 없고, 그대로는 Target Loss의 gradient가 code 선택까지 전달되지 않는다. RoCo는 이 지점을 Straight-Through Estimator로 연결했다.

`z_STE = q + (e − stopgrad(e))`

`q`는 forward에서 선택된 실제 discrete codebook vector이고, `e`는 embedding matrix에서 얻은 연속 표현이다. Forward pass에서는 `e − stopgrad(e)`의 값이 0이므로 실제 양자화 결과 `q`가 유지된다. Backward pass에서는 `stopgrad(e)`가 gradient를 막고 `e` 쪽 경로만 남기 때문에, 이산 code를 사용하면서도 연속 embedding을 통하듯 gradient를 전달할 수 있다.

<div class="research-callout">
  <p class="research-callout-title">Why STE matters</p>
  <ul>
    <li><strong>Forward</strong> — 실제 codec이 사용하는 discrete code를 그대로 선택했다.</li>
    <li><strong>Backward</strong> — quantization을 identity처럼 근사해 loss gradient를 code 선택에 전달했다.</li>
    <li><strong>Update</strong> — 전체 waveform 대신 방어 전용 perturbation code를 집중적으로 갱신했다.</li>
  </ul>
</div>

<p class="section-label">05 · Two-stage optimization</p>

## 먼저 화자 정체성을 흔들고 임곗값 이후에 음질을 보정했다

Target Loss와 SNR Loss를 처음부터 함께 최적화하면 두 목적이 충돌했다. Target Loss는 보호 음성의 speaker embedding을 미리 정한 target speaker 쪽으로 이동시켜 복제 모델이 원 화자를 읽지 못하게 한다. 반면 SNR Loss는 원본과 보호 음성의 차이를 줄여 자연스러움을 보존한다. 실험에서는 SNR Loss가 지나치게 강하면 perturbation code가 충분히 자라지 못해 방어 성능이 떨어졌다.

RoCo는 두 손실을 가중합하지 않고 단계로 분리했다. perturbation code의 embedding-space 크기 `||P||₂`가 임곗값 `τ`보다 작을 때는 Target Loss만 최적화한다. 임곗값에 도달하면 Target Loss 업데이트를 멈추고 SNR Loss로 전환해 지각 품질을 보정한다.

`L = L_Target  if ||P||₂ < τ,  otherwise L_SNR`

이 순서는 먼저 최소 방어력을 확보하고, 확보한 화자 교란을 크게 되돌리지 않는 범위에서 음질을 회복하려는 설계다. 전환 임곗값은 VCTK에서 정한 뒤 다른 다섯 코퍼스에는 재튜닝 없이 적용했다.

<p class="section-label">06 · Dataset and protocol</p>

## 여섯 코퍼스의 120명·1,200개 발화에서 같은 설정을 평가했다

평가에는 VCTK, FST, MCV, CSNED, CSUKIED, LibriSpeech를 사용했다. 코퍼스 전체에서 120명을 선택하고 화자마다 발화 10개를 사용해 총 1,200개 음성을 보호했다. VCTK는 two-stage 임곗값 선택에 사용했고, 나머지 코퍼스에서는 동일한 임곗값을 유지해 특정 데이터에만 맞춘 설정을 피했다.

<div class="research-table" role="region" aria-label="RoCo 평가 구성" tabindex="0">
  <table>
    <thead><tr><th>평가 요소</th><th>구성</th><th>역할</th></tr></thead>
    <tbody>
      <tr><td>Speech corpora</td><td>VCTK, FST, MCV, CSNED, CSUKIED, LibriSpeech</td><td>120명 × 10개 발화 = 1,200개</td></tr>
      <tr><td>Voice cloning</td><td>SV2TTS, YourTTS, AdaptVC(AVC)</td><td>2개 zero-shot TTS와 1개 voice conversion</td></tr>
      <tr><td>Speaker verification</td><td>Resemblyzer, ECAPA-TDNN, ResNet</td><td>복제 음성의 원 화자 수용 여부 판정</td></tr>
      <tr><td>Enhancement</td><td>Spectral Masking, DeepFilterNet, MP-SENet DNS/VB</td><td>보호 교란 제거 후 DSR 변화 측정</td></tr>
      <tr><td>Purification</td><td>De-AntiFake</td><td>보호 음성 전용 정화 공격에 대한 추가 검증</td></tr>
      <tr><td>Baselines</td><td>AntiFake, AttackVC, VoiceGuard</td><td>Signal-domain proactive defense 비교</td></tr>
    </tbody>
  </table>
</div>

방어 성공률(DSR)은 보호 음성으로 만든 복제 음성이 원 화자로 받아들여지지 않은 비율이다. 높을수록 방어가 강하다. 음질은 1–5 범위의 NISQA MOS로 측정했고, 생성 시간은 5–10초 입력 음성을 보호하는 데 걸린 초 단위 시간으로 비교했다.

<p class="section-label">07 · Base defense performance</p>

## 세 복제 모델에서 일관된 방어력을 확보했다

보호하지 않은 RAW 음성은 대부분 복제 뒤 원 화자로 받아들여져 DSR이 낮았다. RoCo를 적용하면 세 verifier와 세 cloning model 조합 모두에서 DSR이 증가했다. 특히 AVC 평균에서는 RoCo가 81.5%로 AntiFake 74.8%, VoiceGuard 66.9%, AttackVC 60.1%보다 높았다.

SV2TTS에서는 AttackVC와 AntiFake가 더 높은 평균을 보였지만 RoCo도 84.6%를 기록했다. YourTTS에서는 RoCo 75.3%와 가장 높은 AntiFake 77.1%의 차이가 1.8%p였다. 특정 한 모델에서 가장 높은 값만 만드는 대신 TTS와 VC 전반에서 방어력·후처리 강건성·속도를 함께 유지하는 것이 RoCo의 목표였다.

<div class="research-table" role="region" aria-label="RoCo 기본 DSR 결과" tabindex="0">
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

<div class="research-metrics" aria-label="RoCo 기본 성능 핵심 수치">
  <div class="research-metric"><span class="research-metric-value">84.6%</span><span class="research-metric-label">SV2TTS 평균 DSR</span></div>
  <div class="research-metric"><span class="research-metric-value">75.3%</span><span class="research-metric-label">YourTTS 평균 DSR</span></div>
  <div class="research-metric"><span class="research-metric-value">81.5%</span><span class="research-metric-label">AVC 평균 DSR</span></div>
</div>

<p class="section-label">08 · Enhancement robustness</p>

## 음성 향상 뒤 평균 하락 폭을 기존 방법보다 작게 줄였다

공격자는 Spectral Masking, DeepFilterNet, MP-SENet으로 보호 음성을 정화한 뒤 복제를 다시 시도했다. 네 enhancement와 세 cloning model, 세 verifier를 결합한 36개 조건에서 RoCo의 평균 DSR 하락은 논문 기준 약 15%p였다. 비교 baseline의 평균 하락은 약 38%p였다.

아래 값은 논문 Table 2의 각 enhancement별 9개 cloning·verification 조합을 평균한 결과다. MP-SENet DNS의 일부 조합에서는 44.7%까지 내려갔지만, 다른 조건에서는 80% 안팎을 유지했다. 방어가 제거되지 않았다는 결론과 모든 조건에서 동일하게 강하다는 주장은 구분했다.

<div class="research-table" role="region" aria-label="음성 향상 이후 RoCo DSR 요약" tabindex="0">
  <table>
    <thead><tr><th>Enhancement</th><th>평균 DSR</th><th>최저–최고</th><th>평가 조합</th></tr></thead>
    <tbody>
      <tr><td>Spectral Masking</td><td>67.8%</td><td>54.8–78.6%</td><td>9</td></tr>
      <tr><td>DeepFilterNet</td><td>62.6%</td><td>49.1–76.5%</td><td>9</td></tr>
      <tr><td>MP-SENet DNS</td><td>63.6%</td><td>44.7–78.2%</td><td>9</td></tr>
      <tr><td>MP-SENet VB</td><td>64.8%</td><td>52.0–80.4%</td><td>9</td></tr>
    </tbody>
  </table>
</div>

De-AntiFake purification도 별도로 적용했다. AVC에서는 Resemblyzer 77.4%, ECAPA 80.3%, ResNet 79.1%를 유지했다. YourTTS는 63.1–79.2%, SV2TTS는 49.4–70.5%로 모델별 차이가 있었지만, 정화 이후에도 보호 효과가 완전히 사라지지는 않았다.

<div class="research-table" role="region" aria-label="De-AntiFake purification 이후 RoCo DSR" tabindex="0">
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

## 5–10초 보호 음성을 13–22초에 생성했다

RoCo의 가장 직접적인 개선점은 생성 시간이다. SV2TTS 조건에서 AntiFake 113초, AttackVC 122초가 걸린 반면 RoCo는 20초가 걸렸다. YourTTS에서는 89초·40초 대비 22초, AVC에서는 105초·59초 대비 13초였다. 엄밀한 실시간 처리에는 아직 도달하지 않았지만, 발화마다 1–2분이 필요했던 signal-domain 최적화보다 적용 가능성을 크게 높였다.

<figure class="research-figure research-figure-comparison">
  <a class="research-figure-scroll" href="/assets/writings/roco/generation-time.svg" aria-label="보호 음성 생성 시간 비교 차트 크게 보기"><img src="/assets/writings/roco/generation-time.svg" alt="SV2TTS, YourTTS, AVC에서 AntiFake, AttackVC, RoCo의 보호 음성 생성 시간을 비교한 가로 막대그래프"></a>
  <figcaption>5–10초 발화를 보호하는 데 걸린 시간이다. RoCo는 세 복제 조건에서 13–22초를 기록했다. ICASSP 2026 논문 Table 5를 시각화했다.</figcaption>
</figure>

음질은 NISQA MOS로 함께 확인했다. Enhancement 전 RoCo 평균 MOS는 2.42였고, DeepFilterNet과 MP-SENet DNS를 적용하면 각각 3.23, 3.17로 증가했다. 그러나 enhancement 뒤 MOS 상승을 곧바로 방어 개선으로 해석하지 않았다. 정화 모델이 음질을 높이는 동시에 보호 성분을 줄일 수 있으므로 DSR과 함께 봐야 한다.

<div class="research-table" role="region" aria-label="RoCo 음질 평가" tabindex="0">
  <table>
    <thead><tr><th>Enhancement</th><th>SV2TTS MOS</th><th>YourTTS MOS</th><th>AVC MOS</th><th>세 모델 평균</th></tr></thead>
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
  <p class="research-callout-title">What RoCo solved—and what remains</p>
  <p>RoCo는 code-level 최적화로 생성 지연을 줄이고 enhancement 이후 평균 방어 성능 하락도 완화했다. 다만 13–22초는 strict real-time이 아니며, 논문 평가는 세 복제 모델과 enhancement·purification 공격에 집중했다. 방어 구조를 모두 아는 adaptive reconstruction과 더 다양한 최신 cloning model은 후속 검증 범위로 남았다.</p>
</div>

<p class="section-label">10 · ICASSP presentation</p>

## ICASSP 2026에서 RoVo 이후의 설계 변화를 발표했다

RoCo는 2026년 5월 4–8일 스페인 바르셀로나에서 열린 IEEE ICASSP 2026에서 구두 발표했다. 발표에서는 RoVo와 이어지는 codec 기반 proactive defense의 배경을 먼저 설명하고, perturbation code·STE·two-stage loss optimization이 생성 속도와 후처리 강건성을 어떻게 바꿨는지 논문 Figure 1을 중심으로 정리했다.

<figure class="research-figure research-figure-photo">
  <img src="/assets/writings/roco/icassp-presentation.jpg" alt="ICASSP 2026 발표장에서 RoCo의 perturbation code, STE, two-stage loss optimization과 전체 구조를 설명하는 장면">
  <figcaption>ICASSP 2026 oral presentation. 발표 화면에는 RoCo의 세 핵심 요소와 codec-based defense pipeline을 함께 제시했다. Barcelona, Spain · May 2026.</figcaption>
</figure>

논문 본문만으로는 모델의 출력 음질과 enhancement 전후 변화를 직접 듣기 어렵다. 별도 데모 페이지에는 AVC, SV2TTS, YourTTS별 원본·보호 음성·복제 결과·enhancement 이후 음성과 재복제 결과를 나란히 구성했다. 수치로 나타낸 DSR과 MOS가 실제 청취에서 어떤 차이로 이어지는지 확인할 수 있다.

<p class="section-label">11 · Publication and resources</p>

## 연구 결과를 ICASSP 2026 프로시딩 논문으로 정리했다

이 연구는 2025년에 시작해 방법과 실험을 정리했고, 2026년 ICASSP 프로시딩에 5쪽 논문으로 게재했다. IEEE Xplore DOI는 `10.1109/ICASSP55912.2026.11462176`이며, 프로시딩 페이지는 1671–1675다. 첫 두 저자는 동등하게 기여했다.

<div class="publication-card">
  <p class="publication-card-kicker">ICASSP 2026 · Oral · Published</p>
  <p class="publication-card-title">RoCo: Robust Code for Fast and Effective Proactive Defense against Voice Cloning Attack</p>
  <p class="publication-card-meta">Seungmin Kim*, Dain Kim*, Sohee Park, Daeseon Choi · ICASSP 2026 · pp. 1671–1675 · May 2026</p>
  <p class="publication-note">*These authors contributed equally to this work.</p>
  <p class="publication-card-links"><a href="https://doi.org/10.1109/ICASSP55912.2026.11462176">IEEE DOI로 논문 보기</a><a href="https://smerge0802.github.io/RoCo/">음성 샘플 듣기</a><a href="/writings/rovo-robust-voice-protection/">이전 RoVo 연구 보기</a></p>
</div>

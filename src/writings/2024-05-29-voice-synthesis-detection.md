---
title: "Voice Synthesis Detection Using Language Model-Based Speech Feature Extraction"
description: "오디오 코덱의 이산 코드와 BERT를 결합해 실제 음성과 생성 음성을 판별한 2023–2024 연구."
lang: ko
period: "2023 – 2024"
---

2023년에 시작해 2024년 5월 논문 게재로 이어진 생성 음성 탐지 연구다. TTS와 음성 변환 기술이 자연스러워질수록 한 시점의 파형이나 스펙트럼만으로는 생성 과정의 흔적을 찾기 어려워진다. 본 연구는 오디오를 이산 토큰 시퀀스로 바꾸고, 텍스트로 사전학습한 BERT가 그 순서를 읽게 하는 특징 추출 방법을 제안했다.

연구 질문은 오디오 코덱이 만든 이산 코드에도 생성 음성을 구분할 수 있는 시간적 관계가 남는지 확인하는 것이었다. 이를 검증하기 위해 Encodec을 오디오 토크나이저로, BERT-Base를 시퀀스 특징 추출기로 사용했다.

<div class="project-meta" aria-label="연구 개요">
  <div><span>Period</span><strong>2023 – 2024</strong></div>
  <div><span>Task</span><strong>생성 음성 이진 탐지</strong></div>
  <div><span>Core idea</span><strong>Encodec + BERT</strong></div>
</div>

<p class="section-label">01 · Research question</p>

## 생성 음성의 어떤 흔적을 읽을 것인가

기존 생성 음성 탐지는 스펙트럼, 위상, filter bank, 원시 파형처럼 음향 신호에서 직접 얻은 특징을 주로 사용했다. 다른 흐름에서는 HuBERT와 같은 음성 사전학습 모델을 특징 추출기로 사용했다. 두 접근 모두 효과가 있었지만 특정 생성기나 데이터 조건에서 잘 보이는 국소 흔적에 의존할 수 있었다.

본 연구는 오디오를 연속 신호가 아닌 코드의 순서로 표현했다. 신경 오디오 코덱 Encodec이 음성을 압축하면서 만든 이산 코드를 BERT의 입력으로 사용했다. BERT가 코드 하나의 값뿐 아니라 앞뒤 코드의 관계를 함께 읽으면, 생성 음성에서 반복되는 장기 패턴까지 특징으로 만들 수 있다고 가정했다.

<div class="research-callout">
  <p class="research-callout-title">기존 표현과 제안 표현</p>
  <p>스펙트럼과 파형은 음향 신호를 직접 읽는다. Encodec-BERT는 음성을 코드북 인덱스의 시퀀스로 바꾼 뒤, 코드 사이의 문맥을 읽는다.</p>
</div>

<p class="section-label">02 · Feature extractor</p>

## Encodec을 BERT의 오디오 토크나이저로 사용했다

Encodec은 인코더, residual vector quantization(RVQ), 디코더로 구성된 신경 오디오 코덱이다. 인코더가 연속 음성을 잠재 표현으로 바꾸면 RVQ가 이를 여러 코드북의 정수 인덱스로 양자화한다. 일반적인 코덱 사용에서는 디코더가 이 코드를 다시 음성으로 복원하지만, 본 연구에서는 디코더 대신 BERT에 코드를 전달했다.

선행 실험 결과를 바탕으로 두 번째 양자화 레이어의 출력을 사용했다. 한 음성에서 얻은 코드는 `[2, 512]` 형태로 정리했다. 첫 번째 축은 선택한 양자화 코드의 구성, 두 번째 축은 BERT가 처리할 시퀀스 길이에 해당한다. 이산 정수 코드를 BERT 입력 임베딩으로 바꾸고 생성 음성 탐지용 특징을 추출했다.

BERT-Base는 12개의 Transformer 인코더 레이어, 768차원 hidden state, 12개의 self-attention head로 구성했다. 텍스트 문장에서 토큰의 앞뒤 관계를 모델링하듯이, 시간 순서로 나열한 오디오 코드 사이의 관계를 학습시켰다.

<figure class="research-figure">
  <img src="/assets/writings/voice-synthesis-detection/encodec-bert-feature-extractor.jpg" alt="음성을 Encodec 인코더와 residual vector quantization으로 이산 코드화한 뒤 BERT에 입력하는 특징 추출 구조">
  <figcaption>Encodec 인코더와 RVQ가 만든 이산 코드를 BERT가 처리한다. 게재 논문 Fig. 4다.</figcaption>
</figure>

<div class="research-callout research-callout-finding">
  <p class="research-callout-title">모델 입력 요약</p>
  <ul>
    <li><strong>Tokenizer</strong> — Encodec encoder + residual vector quantization</li>
    <li><strong>Code selection</strong> — 두 번째 양자화 레이어 출력</li>
    <li><strong>Input shape</strong> — `[2, 512]` 이산 코드 시퀀스</li>
    <li><strong>Context model</strong> — BERT-Base, 12 layers, 768 hidden, 12 heads</li>
  </ul>
</div>

<p class="section-label">03 · Dataset</p>

## ASVspoof 2019와 2021을 1:1로 재구성했다

평가에는 ASVspoof 2019와 ASVspoof 2021을 사용했다. LA(Logical Access)는 TTS와 음성 변환 기반 공격을 다루고, DF(DeepFake)는 생성 음성 탐지에 더 직접적으로 초점을 둔다. 2019 데이터는 초기 비교와 분류기 선별에 사용했고, 2021 LA와 DF는 공격 조건이 달라졌을 때의 성능을 확인하는 데 사용했다.

원본 Challenge 데이터는 bona fide와 spoof의 수가 크게 달랐다. 한 클래스의 비율이 다른 클래스보다 약 8배 큰 조건도 있었다. 이 상태에서는 높은 전체 정확도를 얻더라도 소수 클래스를 제대로 구분하지 못할 수 있다. 학습, 검증, 테스트를 각각 실제 음성과 생성 음성의 1:1 비율로 맞췄다.

<div class="research-table" role="region" aria-label="ASVspoof 균형 데이터 구성" tabindex="0">
  <table>
    <thead><tr><th>데이터셋</th><th>분할</th><th>Bona fide</th><th>Spoof</th><th>합계</th></tr></thead>
    <tbody>
      <tr><td rowspan="3">2019 LA</td><td>학습</td><td>2,580</td><td>2,580</td><td>5,160</td></tr>
      <tr><td>검증</td><td>2,548</td><td>2,548</td><td>5,096</td></tr>
      <tr><td>테스트</td><td>7,355</td><td>7,355</td><td>14,710</td></tr>
      <tr><td rowspan="3">2021 LA</td><td>학습</td><td>10,784</td><td>10,784</td><td>21,568</td></tr>
      <tr><td>검증</td><td>2,704</td><td>2,704</td><td>5,408</td></tr>
      <tr><td>테스트</td><td>3,376</td><td>3,376</td><td>6,752</td></tr>
      <tr><td rowspan="3">2021 DF</td><td>학습</td><td>11,824</td><td>11,824</td><td>23,648</td></tr>
      <tr><td>검증</td><td>2,548</td><td>2,548</td><td>5,096</td></tr>
      <tr><td>테스트</td><td>7,355</td><td>7,355</td><td>14,710</td></tr>
    </tbody>
  </table>
</div>

<div class="research-callout">
  <p class="research-callout-title">균형 데이터의 역할</p>
  <p>각 분할에서 실제 음성과 생성 음성의 수를 같게 맞췄다. 전체 정확도만 보는 대신 두 클래스를 균형 있게 구분하는지도 함께 평가할 수 있는 조건을 만들었다.</p>
</div>

<p class="section-label">04 · Experiment design</p>

## 특징 추출기와 분류기를 두 단계로 검증했다

목표는 특정 분류기 하나를 제안하는 것이 아니라 Encodec-BERT 표현 자체가 생성 음성 탐지에 유효한지 확인하는 것이었다. 동일한 특징을 FC-layer, Transformer, ResNet-18, ResNet2 네 분류기에 입력했다.

- **FC-layer** — 추출한 특징만으로 두 클래스를 선형에 가깝게 구분할 수 있는지 확인했다.
- **Transformer** — 후단에서도 시퀀스 관계를 다시 모델링했다.
- **ResNet-18** — `[512, 768]` 크기의 고차원 특징 패턴을 잔차 신경망으로 학습했다.
- **ResNet2** — ResNet-18의 각 레이어 입출력 크기를 음성 특징에 맞게 조정했다.

실험은 두 단계로 진행했다. 1단계에서는 ASVspoof 2019 LA로 네 분류기를 학습·평가하고 ASSD, TSSDNet, CCT와 비교했다. ASSD는 오디오 코덱과 Transformer를 사용하는 유사한 구조였기 때문에 제안 특징과 비교할 기준으로 선택했다. 2단계에서는 2019 LA에서 성능이 높았던 FC-layer, ResNet-18, ResNet2를 2021 LA와 DF에 적용했다.

<figure class="research-figure research-figure-comparison">
  <img src="/assets/writings/voice-synthesis-detection/two-stage-experiment.svg" alt="ASVspoof 2019 LA에서 네 분류기를 비교한 뒤 세 분류기를 골라 ASVspoof 2021 LA와 DF에서 재평가한 2단계 실험 흐름도">
  <figcaption>Encodec-BERT 특징 추출기는 고정하고 후단 분류기와 데이터 조건을 바꿨다. 논문의 실험 절차를 다시 그린 도식이다.</figcaption>
</figure>

<figure class="research-figure research-figure-interface">
  <img src="/assets/writings/voice-synthesis-detection/classifier-evaluation.jpg" alt="Encodec-BERT 특징을 pooling한 뒤 FC-layer, Transformer, ResNet-18, ResNet2에 입력하는 평가 구조">
  <figcaption>동일한 Encodec-BERT 특징을 네 종류의 후단 분류기에 입력했다. 게재 논문 Fig. 5다.</figcaption>
</figure>

<p class="section-label">05 · Metrics</p>

## 클래스별 정확도와 EER을 함께 사용했다

논문에서 Class 0은 실제 음성, Class 1은 생성 음성을 뜻한다. 클래스별 정확도는 어느 쪽에서 오류가 많이 발생하는지 보여 준다. Balanced Accuracy는 두 클래스 정확도의 평균이며, Accuracy는 전체 표본 중 맞힌 비율이다.

EER(Equal Error Rate)은 실제 음성을 생성 음성으로 잘못 판단하는 비율과 생성 음성을 실제 음성으로 놓치는 비율이 같아지는 지점의 오류율이다. 생성 음성 탐지에서는 EER이 낮을수록 두 클래스를 더 잘 분리한 결과다.

<div class="research-callout">
  <p class="research-callout-title">평가 지표</p>
  <ul>
    <li><strong>Class 0 Accuracy</strong> — 실제 음성 식별 정확도</li>
    <li><strong>Class 1 Accuracy</strong> — 생성 음성 식별 정확도</li>
    <li><strong>Balanced Accuracy</strong> — 두 클래스 정확도의 평균</li>
    <li><strong>EER</strong> — 두 종류 오류율이 같아지는 지점, 낮을수록 우수</li>
  </ul>
</div>

<p class="section-label">06 · Results</p>

## 2021 DF에서 11.79% EER을 기록했다

<div class="research-metrics" aria-label="핵심 실험 결과">
  <div class="research-metric"><span class="research-metric-value">88.08%</span><span class="research-metric-label">2019 LA 정확도<br>Encodec-BERT + ResNet2</span></div>
  <div class="research-metric"><span class="research-metric-value">15.98%</span><span class="research-metric-label">2019 LA EER<br>Encodec-BERT + ResNet2</span></div>
  <div class="research-metric"><span class="research-metric-value">10.91%</span><span class="research-metric-label">2021 LA EER<br>Encodec-BERT + FC-layer</span></div>
  <div class="research-metric"><span class="research-metric-value">11.79%</span><span class="research-metric-label">2021 DF EER<br>Encodec-BERT + ResNet2</span></div>
</div>

### 1단계: ASVspoof 2019 LA

<div class="research-table" role="region" aria-label="ASVspoof 2019 LA 제안 모델 결과" tabindex="0">
  <table>
    <thead><tr><th>분류기</th><th>Class 0</th><th>Class 1</th><th>Balanced</th><th>Accuracy</th><th>EER</th></tr></thead>
    <tbody>
      <tr><td>FC-layer</td><td>80.84%</td><td>99.08%</td><td>89.96%</td><td>87.88%</td><td>17.09%</td></tr>
      <tr><td>ResNet-18</td><td>80.46%</td><td>99.04%</td><td>89.75%</td><td>87.57%</td><td>17.40%</td></tr>
      <tr><td><strong>ResNet2</strong></td><td>81.27%</td><td>98.69%</td><td><strong>89.98%</strong></td><td><strong>88.08%</strong></td><td><strong>15.98%</strong></td></tr>
      <tr><td>Transformer</td><td>81.43%</td><td>70.43%</td><td>77.00%</td><td>74.65%</td><td>23.07%</td></tr>
    </tbody>
  </table>
</div>

ResNet2가 88.08% Accuracy와 15.98% EER로 네 구성 중 가장 좋은 결과를 냈다. FC-layer도 87.88% Accuracy와 17.09% EER을 기록했다. 단순한 분류기에서도 성능이 유지됐다는 점은 Encodec-BERT 특징 자체에 판별 정보가 포함됐음을 보여 준다.

Transformer 후단은 Class 1 Accuracy가 70.43%로 낮았다. 특징 추출 단계에서 이미 BERT가 시퀀스 관계를 모델링했기 때문에, 후단 Transformer를 추가하는 것이 항상 이득을 만들지는 않았다.

### 2단계: ASVspoof 2021 LA와 DF

<div class="research-table" role="region" aria-label="데이터 조건별 최상위 결과" tabindex="0">
  <table>
    <thead><tr><th>데이터</th><th>분류기</th><th>Balanced Accuracy</th><th>Accuracy</th><th>EER</th></tr></thead>
    <tbody>
      <tr><td>2019 LA</td><td>ResNet2</td><td>89.98%</td><td>88.08%</td><td>15.98%</td></tr>
      <tr><td>2021 LA</td><td>FC-layer</td><td>89.42%</td><td>88.67%</td><td><strong>10.91%</strong></td></tr>
      <tr><td>2021 DF</td><td>ResNet2</td><td>87.74%</td><td>87.02%</td><td><strong>11.79%</strong></td></tr>
    </tbody>
  </table>
</div>

2021 LA에서는 FC-layer가 가장 좋은 결과를 냈다. Class 0 Accuracy는 84.52%였고, Balanced Accuracy 89.42%, 전체 Accuracy 88.67%, EER 10.91%를 기록했다. 반면 DF에서는 ResNet2가 Class 1 Accuracy 91.28%, Balanced Accuracy 87.74%, 전체 Accuracy 87.02%, EER 11.79%로 가장 좋았다.

<div class="research-figure-pair">
  <figure class="research-figure research-figure-comparison">
    <img src="/assets/writings/voice-synthesis-detection/la-results.jpg" alt="ASVspoof 2021 LA에서 FC-layer, ResNet-18, ResNet2의 클래스별 정확도와 EER을 비교한 그래프">
    <figcaption>2021 LA에서는 FC-layer가 88.67% Accuracy와 10.91% EER을 기록했다. 게재 논문 Fig. 6이다.</figcaption>
  </figure>
  <figure class="research-figure research-figure-comparison">
    <img src="/assets/writings/voice-synthesis-detection/df-results.jpg" alt="ASVspoof 2021 DF에서 FC-layer, ResNet-18, ResNet2의 클래스별 정확도와 EER을 비교한 그래프">
    <figcaption>2021 DF에서는 ResNet2가 87.02% Accuracy와 11.79% EER을 기록했다. 게재 논문 Fig. 7이다.</figcaption>
  </figure>
</div>

DF 조건의 11.79% EER은 논문에서 비교한 Mel-spectrogram, SincNet, Raw 기반 특징과 CNN·ResNet 분류기 조합의 15.64%보다 낮았다. Fbank 기반 비교 모델은 16.05%, CQT 기반 모델은 18.30%였다. 같은 비교 조건에서 Encodec-BERT가 더 낮은 오류율을 기록했다.

<div class="research-callout research-callout-finding">
  <p class="research-callout-title">핵심 관찰</p>
  <p>한 분류기가 모든 데이터에서 가장 좋지는 않았다. LA에서는 FC-layer, DF에서는 ResNet2가 가장 낮은 EER을 기록했다. 공통 특징을 사용하더라도 마지막 결정 경계는 공격 유형과 데이터 조건의 영향을 받았다.</p>
</div>

<p class="section-label">07 · Limits</p>

## 클래스 균형을 맞춘 뒤에도 성능 차이가 남았다

데이터 수를 1:1로 맞췄지만 Class 0과 Class 1 Accuracy의 차이는 완전히 사라지지 않았다. 단순한 표본 수 외에도 학습·검증·테스트에 포함된 생성 방식과 공격 난이도가 달랐기 때문이다. 2019 LA에서 높았던 분류기가 2021 LA와 DF에서 같은 순위를 유지하지 않은 결과도 데이터 조건의 영향을 보여 줬다.

본 실험은 ASVspoof의 정해진 공격 조건에서 특징 표현의 가능성을 확인했다. 새로운 TTS와 음성 변환 모델, 서로 다른 오디오 코덱, 압축·재전송, 실제 통화 채널까지 일반화한다고 결론 내릴 수는 없다. 생성기와 전송 조건을 넓힌 평가가 다음 단계로 남았다.

<div class="research-callout research-callout-limit">
  <p class="research-callout-title">평가상의 한계</p>
  <p>균형 샘플링은 클래스 수의 편향을 줄였지만 공격 유형의 편향까지 제거하지는 못했다. 보지 못한 생성기와 채널 조건에서 성능이 유지되는지 별도로 검증해야 한다.</p>
</div>

<p class="section-label">08 · Conclusion</p>

## 결론

Encodec의 RVQ 코드를 BERT의 입력 토큰처럼 사용해 생성 음성 탐지 특징을 추출했다. 2019 LA에서 네 분류기를 비교한 뒤 상위 세 분류기를 2021 LA와 DF로 확장했고, DF에서는 기존 비교 모델의 15.64%보다 낮은 11.79% EER을 기록했다.

결과는 텍스트용 사전학습 모델이 오디오의 이산 표현에서도 판별 가능한 시퀀스 관계를 추출할 수 있음을 보였다. 동시에 후단 분류기와 데이터 조건에 따라 결과가 달라졌으며, 새로운 생성기와 실제 전송 환경에 대한 일반화는 후속 연구로 남았다.

<p class="section-label">09 · Publication</p>

## 논문

<div class="publication-card">
  <p class="publication-card-kicker">Publication · First author</p>
  <p class="publication-card-title">언어 모델 기반 음성 특징 추출을 활용한 생성 음성 탐지</p>
  <p class="publication-card-meta">김승민, 박소희, 최대선 · 정보보호학회논문지 34(3), 439–449 · 2024</p>
  <p class="publication-card-links"><a href="https://doi.org/10.13089/JKIISC.2024.34.3.439">DOI로 논문 보기</a><a href="https://www.kci.go.kr/kciportal/ci/sereArticleSearch/ciSereArtiView.kci?sereArticleSearchBean.artiId=ART003089524">KCI 논문 페이지</a></p>
</div>

---
title: "생성 음성 탐지: Encodec-BERT로 오디오를 토큰처럼 읽기"
description: "오디오 코덱과 BERT를 결합해 생성 음성과 실제 음성을 판별하는 특징을 추출한 2024년 연구."
lang: ko
period: "2023 – 2024"
---

생성형 TTS와 음성 변환 기술이 고도화되면서, 사람이 듣기에 자연스러운 음성이 보이스피싱·사칭·허위 정보 유포에 사용될 수 있게 됐습니다. 이 연구는 생성 음성을 탐지할 때 **어떤 음성 특징을 추출해야 하는가**라는 질문에서 출발했습니다.

기존 탐지기는 스펙트럼이나 파형에서 사람이 설계한 특징, 혹은 음성 전용 사전학습 모델을 주로 사용합니다. 여기서는 오디오를 이산 토큰 시퀀스로 바꾼 뒤, 텍스트로 사전학습된 BERT가 그 순서를 읽도록 하는 새로운 특징 추출 방식을 제안했습니다.

<div class="project-meta" aria-label="연구 개요">
  <div><span>Period</span><strong>2023 – 2024</strong></div>
  <div><span>Task</span><strong>생성 음성 이진 탐지</strong></div>
  <div><span>Core idea</span><strong>Encodec + BERT</strong></div>
</div>

## 연구 질문: 언어 모델이 오디오의 순서를 읽을 수 있을까

BERT는 문장에서 앞뒤 토큰의 관계를 함께 보며 문맥을 학습하는 언어 모델입니다. 음성도 시간에 따라 전개되는 순차 데이터이지만, 파형을 그대로 BERT에 넣을 수는 없습니다. 이 연구는 고품질 신경 오디오 코덱인 Encodec을 BERT의 **오디오 토크나이저**로 사용했습니다.

Encodec의 인코더와 residual vector quantization(RVQ)은 연속적인 음성 신호를 코드북 인덱스의 이산 값으로 바꿉니다. 이 값을 정해진 길이의 시퀀스로 정리해 BERT-Base에 입력하고, BERT가 만든 표현을 생성 음성 탐지용 특징으로 사용했습니다. 실험에서는 선행 결과를 바탕으로 두 번째 양자화 레이어의 출력을 선택하고, BERT 입력 길이에 맞춰 `[2, 512]` 형태로 전처리했습니다.

BERT-Base는 12개의 Transformer 인코더 레이어, 768차원 hidden state, 12개의 self-attention head로 구성됩니다. 텍스트에서 다음 단어를 읽듯이, 이 연구에서는 시간에 따라 나열된 오디오 코드의 앞뒤 관계를 함께 읽게 했습니다. 이 선택은 생성 음성이 남기는 미세한 국소 아티팩트뿐 아니라, 시간에 걸쳐 반복되는 패턴도 특징으로 만들 수 있다는 가설에 기반합니다.

<figure class="research-figure">
  <img src="/assets/writings/voice-synthesis-detection/encodec-bert-feature-extractor.jpg" alt="오디오를 Encodec의 residual vector quantization으로 이산화한 뒤 BERT에 입력해 특징을 추출하는 Encodec-BERT 구조">
  <figcaption>제안한 특징 추출기. Encodec을 오디오 토크나이저로 사용해 BERT가 이산화된 음성 시퀀스를 처리하도록 구성했습니다. 논문 Fig. 4.</figcaption>
</figure>

## 데이터: ASVspoof의 LA와 DF 환경

성능 평가는 공개 벤치마크인 ASVspoof 2019와 ASVspoof 2021을 사용했습니다. 실제 음성(bonafide)과 생성 음성(spoof)의 수가 크게 다른 원본 분포가 특정 클래스에 편향된 특징을 만들 수 있기 때문에, 학습·검증·테스트 단계에서 두 클래스를 **1:1 비율**로 맞췄습니다.

LA(Logical Access)는 합성·음성 변환 기반 공격을, DF(DeepFake)는 생성 음성 탐지에 초점을 둔 환경을 뜻합니다. 2019 LA로 제안 방식과 기존 탐지기를 먼저 비교한 뒤, 2021 LA와 DF에서 어떤 공격 환경에 더 잘 일반화되는지 확인했습니다.

<div class="research-table" role="region" aria-label="ASVspoof 실험 데이터 구성" tabindex="0">
  <table>
    <thead><tr><th>데이터셋</th><th>학습</th><th>검증</th><th>테스트</th></tr></thead>
    <tbody>
      <tr><td>ASVspoof 2019 LA</td><td>5,160</td><td>5,096</td><td>14,710</td></tr>
      <tr><td>ASVspoof 2021 LA</td><td>21,568</td><td>5,408</td><td>6,752</td></tr>
      <tr><td>ASVspoof 2021 DF</td><td>23,648</td><td>5,096</td><td>14,710</td></tr>
    </tbody>
  </table>
</div>

표의 각 분할은 실제 음성과 생성 음성을 같은 수로 맞춘 뒤의 규모입니다. 따라서 정확도만 높게 나오는 모델보다, 두 클래스를 얼마나 균형 있게 구분하는지도 함께 확인할 수 있습니다.

실험에는 정확도(Accuracy), 클래스별 정확도, Balanced Accuracy, EER을 함께 사용했습니다. 생성 음성만 잘 맞히거나 실제 음성만 잘 맞히는 모델은 실용적인 탐지기가 아니기 때문에, 두 클래스의 평균 성능과 오인식·오거부가 같아지는 지점의 오류율(EER)을 별도로 확인했습니다. EER은 낮을수록 실제 음성과 생성 음성을 더 잘 분리한다는 뜻입니다.

## 특징 추출기와 분류기를 분리해 검증했다

이 연구의 목적은 특정 분류기 하나를 제시하는 것이 아니라, Encodec-BERT가 생성 음성 탐지에 쓸 수 있는 특징을 추출하는지 확인하는 것이었습니다. 그래서 동일한 특징을 네 가지 분류기에 각각 넣었습니다.

- **FC-layer:** 추출된 특징만으로도 분류 가능한지 확인하는 기준선
- **Transformer:** 순차 특징을 다시 모델링하는 분류기
- **ResNet-18:** 고차원 특징의 패턴을 학습하는 잔차 신경망
- **ResNet2:** 입력·출력 크기를 음성 특징에 맞게 조정한 ResNet-18 변형

이 구분은 특징 추출기와 분류기의 역할을 분리하기 위한 실험 설계입니다. FC-layer에서도 성능이 유지되면 Encodec-BERT 표현 자체가 판별력을 가진다는 뜻이고, 더 복잡한 분류기에서 추가 이득이 생기면 추출된 특징 안에 더 활용할 수 있는 구조가 남아 있다는 뜻입니다.

<figure class="research-figure research-figure-interface">
  <img src="/assets/writings/voice-synthesis-detection/classifier-evaluation.jpg" alt="Encodec-BERT 특징을 pooling한 뒤 FC-layer, Transformer, ResNet-18, ResNet2 분류기에 입력하는 실험 흐름">
  <figcaption>하나의 Encodec-BERT 특징 추출기를 고정하고 네 종류의 후단 분류기로 비교한 실험 구조. 논문 Fig. 5.</figcaption>
</figure>

## 결과: DF 환경에서 11.79% EER

<div class="research-metrics" aria-label="핵심 실험 결과">
  <div class="research-metric"><span class="research-metric-value">88.08%</span><span class="research-metric-label">ASVspoof 2019 LA 정확도<br>Encodec-BERT + ResNet2</span></div>
  <div class="research-metric"><span class="research-metric-value">15.98%</span><span class="research-metric-label">ASVspoof 2019 LA EER<br>Encodec-BERT + ResNet2</span></div>
  <div class="research-metric"><span class="research-metric-value">11.79%</span><span class="research-metric-label">ASVspoof 2021 DF EER<br>Encodec-BERT + ResNet2</span></div>
  <div class="research-metric"><span class="research-metric-value">15.64%</span><span class="research-metric-label">기존 비교 모델의 DF EER<br>Mel/SincNet/Raw 기반</span></div>
</div>

ASVspoof 2019 LA에서는 ResNet2가 **88.08% 정확도**, **15.98% EER**로 가장 좋은 결과를 보였습니다. ASVspoof 2021 LA에서는 FC-layer가 88.67% 정확도와 10.91% EER로 가장 좋았고, 실제 생성 음성 탐지에 초점을 둔 DF 환경에서는 ResNet2가 **87.02% 정확도**, **11.79% EER**을 기록했습니다.

DF 결과에서 11.79% EER은 논문에서 비교한 기존 Mel-spectrogram·SincNet·Raw 기반 방식의 15.64%보다 낮았습니다. 즉, Encodec으로 이산화한 음성 시퀀스와 BERT의 문맥적 표현을 결합하는 방식이 생성 음성의 흔적을 잡아내는 데 유효하다는 결과입니다.

<div class="research-figure-pair">
  <figure class="research-figure research-figure-comparison">
    <img src="/assets/writings/voice-synthesis-detection/la-results.jpg" alt="ASVspoof 2021 LA 데이터셋에서 FC-layer, ResNet-18, ResNet2의 클래스별 정확도와 EER을 비교한 그래프">
    <figcaption>LA 결과. FC-layer가 88.67% 정확도와 10.91% EER을 기록했습니다. 논문 Fig. 6.</figcaption>
  </figure>
  <figure class="research-figure research-figure-comparison">
    <img src="/assets/writings/voice-synthesis-detection/df-results.jpg" alt="ASVspoof 2021 DF 데이터셋에서 FC-layer, ResNet-18, ResNet2의 클래스별 정확도와 EER을 비교한 그래프">
    <figcaption>DF 결과. ResNet2가 87.02% 정확도와 11.79% EER로 가장 낮은 EER을 보였습니다. 논문 Fig. 7.</figcaption>
  </figure>
</div>

결과는 하나의 후단 분류기가 모든 조건에서 항상 가장 좋지는 않다는 점도 보여 줍니다. LA에서는 단순 FC-layer가, DF에서는 ResNet2가 가장 좋은 EER을 보였습니다. 이는 Encodec-BERT 특징이 서로 다른 공격 환경에서 유의미한 정보를 제공하지만, 최종 결정 경계는 데이터 환경과 분류기 구조의 영향을 함께 받는다는 의미입니다.

한편 클래스별 정확도 차이는 여전히 남았습니다. 1:1로 전처리하더라도 훈련·검증·테스트 분할의 공격 유형과 난이도가 같지는 않기 때문입니다. 이후 연구에서는 더 다양한 생성기, 코덱, 압축·전송 조건을 포함한 일반화 평가가 필요하다는 과제로 남겼습니다.

## 논문

<div class="publication-card">
  <p class="publication-card-kicker">Publication · First author</p>
  <p class="publication-card-title">언어 모델 기반 음성 특징 추출을 활용한 생성 음성 탐지</p>
  <p class="publication-card-meta">김승민, 박소희, 최대선 · 정보보호학회논문지 34(3), 439–449 · 2024</p>
  <p class="publication-card-links"><a href="https://doi.org/10.13089/JKIISC.2024.34.3.439">DOI로 논문 보기</a><a href="https://www.kci.go.kr/kciportal/ci/sereArticleSearch/ciSereArtiView.kci?sereArticleSearchBean.artiId=ART003089524">KCI 논문 페이지</a></p>
</div>

이 연구는 텍스트용 사전학습 모델을 음성 특징 추출로 확장해, 생성 음성 탐지에 적용한 작업입니다. 음성 생성 기술이 빠르게 변하는 환경에서 특정 생성기의 표면적인 흔적만 찾는 대신, 코덱 기반 이산 표현과 시퀀스 문맥을 함께 다루는 방향을 제안했습니다.

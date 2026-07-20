---
title: "한국어 통화음성 비식별화: 방송 피치 변조와 Lightweight 모델"
description: "97,285개 한국어 상담 통화음성에서 방송형 피치 변조와 Lightweight 음성 비식별화 기법을 비교한 2022–2023 위탁연구."
lang: ko
period: "2022 – 2023"
---

2022년 7월부터 2023년 3월까지 수행한 음성 익명화 위탁연구다. 방송에서 흔히 사용하는 피치 변조가 실제로 화자 식별을 얼마나 막는지 확인하고, 이를 대체할 Lightweight 음성 비식별화 기법을 한국어 상담 통화음성에서 비교했다.

목표는 목소리를 낯설게 만드는 데 그치지 않았다. 사람과 화자 검증 모델이 모두 원 화자를 연결하기 어려워야 했고, 변조 뒤에도 통화 내용을 이해할 수 있어야 했다. 연구 결과는 2023년 KCI 논문으로 게재했다.

<div class="project-meta" aria-label="연구 개요">
  <div><span>Period</span><strong>2022.07 – 2023.03</strong></div>
  <div><span>Data</span><strong>한국어 상담 통화음성</strong></div>
  <div><span>Outcome</span><strong>KCI 논문 게재</strong></div>
</div>

<p class="section-label">01 · Research question</p>

## 방송형 피치 변조를 다시 검증한 이유

뉴스나 취재 프로그램은 제보자의 신원을 가리기 위해 목소리의 피치를 올리거나 내린다. 구현은 간단하지만 변조 방향을 추정해 반대로 조정하면 원래 목소리와 가까운 음성을 얻을 수 있다. 화자를 구별하는 단서에는 기본 주파수뿐 아니라 포먼트, 성도 길이, 공명 특성, 발화 습관도 포함된다. 피치 하나만 바꾸는 방식으로는 이 단서를 충분히 제거하기 어렵다.

방송형 피치 이동을 기준선으로 두고 VoicePrivacy 계열 Lightweight 모델의 McAdams, Resampling, VTLN을 같은 한국어 통화음성에서 비교했다. 평가는 세 축으로 나눴다. 사람이 원 화자와 얼마나 다르게 듣는지, 화자 검증 모델이 원 화자를 얼마나 혼동하는지, 변조 뒤 발화 내용을 얼마나 보존하는지를 각각 측정했다.

<div class="research-callout">
  <p class="research-callout-title">비식별화의 두 조건</p>
  <p>화자 프라이버시는 높이고 언어 정보 손실은 낮춰야 한다. EER 하나만 높거나 음성이 크게 훼손된 방법은 최종 후보로 보지 않았다.</p>
</div>

<p class="section-label">02 · Method screening</p>

## 본 실험 전에 후보 기법을 선별했다

Lightweight 모델이 제공하는 모든 변조 모듈을 곧바로 통화 코퍼스에 적용하지 않았다. 먼저 AI Hub 화자 인식용 한국어 음성에서 후보 기법의 비식별화 성능과 청취 품질을 함께 확인했다. 해당 코퍼스는 3,000명·7,000시간 규모였으며, 이 가운데 화자 100명을 골라 한 사람당 30개씩 총 3,000개 발화를 구성했다.

각 발화를 후보 기법으로 변조한 뒤 ECAPA-TDNN으로 화자 임베딩을 추출하고 EER을 계산했다. Modspec은 EER만 보면 강한 결과를 냈지만 직접 들었을 때 음성이 뭉개져 발화 내용을 활용하기 어려웠다. 수치가 높더라도 음성 유용성이 낮으면 실제 가명처리에 적합하지 않다고 판단했다. 최종 비교에는 McAdams, Resampling, VTLN을 남겼다.

<div class="research-callout research-callout-finding">
  <p class="research-callout-title">선별 단계에서 확인한 점</p>
  <p>후보 선택 기준을 EER로만 두면 Modspec을 선택할 가능성이 있었다. 직접 청취를 함께 사용하면서 프라이버시와 음질을 동시에 만족하는 세 방법으로 범위를 좁혔다.</p>
</div>

<p class="section-label">03 · Source corpus</p>

## 97,285개 한국어 상담 통화음성

본 실험에는 Timegate가 관리한 실제 상담 통화음성 코퍼스를 사용했다. 창원시, 한국우편사업진흥원, 한국소비자원이 제공한 상담사와 고객의 통화 녹음으로 구성됐다. 전체 규모는 97,285개, 약 180 GB였다.

<div class="research-table" role="region" aria-label="기관별 한국어 상담 통화음성 구성" tabindex="0">
  <table>
    <thead><tr><th>제공 기관</th><th>녹음 수</th><th>용량</th><th>도메인</th></tr></thead>
    <tbody>
      <tr><td>창원시</td><td>78,114</td><td>81.93 GB</td><td>문화·관광, 보건·복지, 도시·교통</td></tr>
      <tr><td>한국우편사업진흥원</td><td>10,430</td><td>27.95 GB</td><td>전자상거래, 우편</td></tr>
      <tr><td>한국소비자원</td><td>8,741</td><td>70.10 GB</td><td>교통·차량, 금융, 보험, 생활·패션</td></tr>
      <tr><td><strong>합계</strong></td><td><strong>97,285</strong></td><td><strong>약 180 GB</strong></td><td><strong>9개 도메인</strong></td></tr>
    </tbody>
  </table>
</div>

<figure class="research-figure research-figure-comparison">
  <img src="/assets/writings/speech-anonymization/source-corpus.svg" alt="창원시 78,114개, 한국우편사업진흥원 10,430개, 한국소비자원 8,741개의 상담 통화 녹음 수와 용량을 비교한 그래프">
  <figcaption>막대 길이는 기관별 녹음 수를 나타낸다. 저장 용량은 녹음 길이에 따라 개수와 다른 비율을 보인다. 위탁과제 보고서 기준이다.</figcaption>
</figure>

원본은 PCM, 128 Kbps, 8 kHz 형식이었다. 변조 파일은 16 kHz, 256 Kbps로 저장해 청취평가와 자동평가에 사용했다. 실제 상담 통화에는 대화 내용과 화자 정보가 포함되므로 원본 음성, 전사문, 식별 정보는 이 페이지에 공개하지 않았다.

### JSON 라벨에서 단일 화자 구간을 만들었다

한 통화 파일에는 상담사와 고객의 발화가 함께 들어 있었다. JSON 라벨에서 상담사·고객 ID와 각 대화의 시작·종료 시점을 읽어 화자별 구간을 분리했다. 파일명에는 기관 도메인, 상담사·고객 구분, 대화 ID를 남겨 변조와 평가 단계에서 표본을 추적할 수 있게 했다.

청취평가용 발화에는 다음 조건을 적용했다.

- 발화 내용이 명확하게 들리는 2–6초 구간
- 두 화자의 목소리가 겹치지 않는 구간
- 사투리나 배경 잡음의 영향이 과도하지 않은 구간
- 같은 성별과 같은 상담 도메인 안에서 비교할 수 있는 표본

이 과정을 거쳐 142명 화자의 발화를 선별했다. 청취평가에는 반복 제시를 포함한 3,000개 음성을 사용했고, 자동평가에는 중복을 제거한 1,677개를 사용했다. 자동평가 표본은 남성 837개와 여성 840개로 구성했다.

<figure class="research-figure">
  <img src="/assets/writings/speech-anonymization/evaluation-flow.svg" alt="한국어 상담 통화음성을 단일 화자 구간으로 자른 뒤 네 가지 비식별화 방법을 적용하고 사람 평가와 자동평가로 나누는 흐름도">
  <figcaption>전처리한 단일 화자 발화에 같은 변조 조건을 적용한 뒤 청취 유사도, 화자 검증 EER, 발화 내용 보존을 따로 평가했다.</figcaption>
</figure>

<p class="section-label">04 · Anonymization methods</p>

## 네 가지 변조 방법과 한국어 파라미터

방송형 Pitch 변조를 기준선으로 구현하고, 나머지 세 방법은 영어 음성에서 정한 기본값을 그대로 사용하지 않았다. Lightweight 모델 논문이 제시한 범위 안에서 값을 0.05 단위로 바꿔 한국어 통화음성에 적용했다. 변조 강도와 문장 청취 가능성을 직접 비교해 최종 값을 정했다.

<div class="research-table" role="region" aria-label="음성 비식별화 방법과 한국어 파라미터" tabindex="0">
  <table>
    <thead><tr><th>방법</th><th>주로 바꾸는 단서</th><th>설정</th><th>원본–변조 유사도</th></tr></thead>
    <tbody>
      <tr><td>Pitch</td><td>기본 주파수</td><td>방송형 기준선</td><td>1.99</td></tr>
      <tr><td>McAdams</td><td>포먼트·공명 주파수</td><td>계수 0.80</td><td>2.05</td></tr>
      <tr><td>Resampling</td><td>샘플링 특성</td><td>rate 0.85</td><td>2.49</td></tr>
      <tr><td>VTLN</td><td>주파수 축·성도 특성</td><td>factor 0.175</td><td><strong>1.52</strong></td></tr>
    </tbody>
  </table>
</div>

McAdams 변환은 선형 예측 부호화로 얻은 극의 각도를 조정해 포먼트와 관련된 공명 주파수를 이동한다. VTLN은 주파수 축을 워핑해 성도 길이와 관련된 화자 특성을 바꾼다. Resampling은 음성의 지속시간을 유지하면서 샘플링 특성을 바꾼다. 세 방법 모두 기본 주파수 하나만 이동하는 방송형 변조보다 넓은 화자 단서를 다룬다.

<div class="research-figure-pair">
  <figure class="research-figure">
    <img src="/assets/writings/speech-anonymization/mcadams-transformation.png" alt="McAdams 계수에 따라 극의 각도와 진폭 스펙트럼이 변하는 논문 그림">
    <figcaption>McAdams 변환은 극의 각도를 바꿔 공명 주파수 특성을 이동한다. 게재 논문 그림이다.</figcaption>
  </figure>
  <figure class="research-figure">
    <img src="/assets/writings/speech-anonymization/vtln-frequency-warping.png" alt="VTLN 워핑 계수에 따라 주파수 축과 진폭 스펙트럼이 변하는 논문 그림">
    <figcaption>VTLN은 주파수 축을 워핑해 성도와 관련된 화자 특성을 약화한다. 게재 논문 그림이다.</figcaption>
  </figure>
</div>

<p class="section-label">05 · Evaluation protocol</p>

## 사람, 화자 검증 모델, 받아쓰기로 나누어 평가했다

### 블라인드 청취평가

10대부터 50대까지 연령대별 10명씩 총 50명을 모집했다. 참가자는 두 음성을 들은 뒤 같은 사람이 말한 것처럼 느껴지는 정도를 0점부터 5점까지 선택했다. 0점은 ‘아주 다름’, 5점은 ‘아주 비슷함’을 뜻했다.

평가지는 300문항씩 5개 세트, 총 1,500문항으로 구성했다. 원본과 같은 화자의 다른 발화, 원본과 다른 화자의 발화, 원본과 각 방법으로 변조한 발화를 섞어 제시했다. 비교하는 두 음성은 같은 성별·같은 도메인으로 맞췄다. 참가자에게는 대화 내용보다 목소리 톤을 중심으로 판단하고, OX 문제가 아니므로 양 끝 점수만 반복해서 선택하지 않도록 안내했다. 한 문항에는 최소 20초를 사용하게 했다.

<figure class="research-figure research-figure-interface">
  <img src="/assets/writings/speech-anonymization/human-test-interface.png" alt="음성 A와 B를 재생한 뒤 화자 유사도를 0점부터 5점까지 선택하는 블라인드 청취평가 화면">
  <figcaption>프로젝트에서 사용한 청취평가 화면이다. 두 음성의 관계를 공개하지 않은 상태에서 화자 유사도를 기록했다.</figcaption>
</figure>

### ECAPA-TDNN 화자 검증

자동평가는 ECAPA-TDNN으로 각 음성의 화자 임베딩을 추출한 뒤 코사인 유사도를 계산했다. 임곗값을 바꾸면서 타인을 본인으로 받아들이는 오인식률과 본인을 거부하는 오거부율이 같아지는 지점의 EER(Equal Error Rate)을 구했다.

일반적인 화자 검증에서는 EER이 낮을수록 성능이 좋다. 이 실험에서는 반대로 변조 뒤 EER이 높을수록 모델이 원 화자를 구별하기 어려워졌다고 해석했다. 50%에 가까우면 두 클래스를 무작위에 가깝게 판단한다는 뜻이다.

<div class="research-callout">
  <p class="research-callout-title">세 개의 평가 축</p>
  <ul>
    <li><strong>청취 유사도</strong> — 사람이 원 화자를 얼마나 다르게 듣는가</li>
    <li><strong>EER</strong> — 화자 검증 모델이 원 화자를 얼마나 혼동하는가</li>
    <li><strong>CER</strong> — 변조 뒤에도 발화 내용을 얼마나 읽을 수 있는가</li>
  </ul>
</div>

<p class="section-label">06 · Results</p>

## 사람에게는 VTLN, 모델에는 Resampling이 가장 강했다

<div class="research-metrics" aria-label="핵심 실험 결과">
  <div class="research-metric"><span class="research-metric-value">1.52 / 5</span><span class="research-metric-label">VTLN 청취 유사도<br>네 방법 중 최저</span></div>
  <div class="research-metric"><span class="research-metric-value">46.39%</span><span class="research-metric-label">Resampling 화자 검증 EER<br>비교 방법 중 최고</span></div>
  <div class="research-metric"><span class="research-metric-value">1,677</span><span class="research-metric-label">자동평가 고유 발화<br>남성 837 · 여성 840</span></div>
  <div class="research-metric"><span class="research-metric-value">50명</span><span class="research-metric-label">블라인드 청취평가<br>총 1,500문항</span></div>
</div>

위탁과제 보고서 집계에서 원본과 같은 화자의 다른 발화는 평균 4.40점, 다른 화자의 발화는 2.72점이었다. 게재 논문은 같은 값을 반올림 차이로 각각 4.41점과 2.73점으로 표기했다. 변조 전에는 청취자가 같은 화자와 다른 화자를 구분할 수 있음을 먼저 확인했다.

네 방법은 모두 원본–변조 유사도를 1.52–2.49점으로 낮췄다. VTLN은 보고서 기준 1.52점으로 가장 낮았고, 다른 화자의 원본 음성 2.72점보다도 더 다르게 들렸다. 논문 집계에서는 VTLN의 같은 화자 비교를 1.53점, 다른 화자 비교를 1.26점으로 제시했다.

<figure class="research-figure research-figure-comparison">
  <img src="/assets/writings/speech-anonymization/method-comparison.svg" alt="VTLN 1.52, Pitch 1.99, McAdams 2.05, Resampling 2.49의 원본–변조 화자 유사도를 비교한 막대그래프">
  <figcaption>값이 낮을수록 변조 음성이 원 화자와 다르게 들렸음을 뜻한다. 위탁과제 보고서의 청취평가 결과다.</figcaption>
</figure>

도메인별 VTLN 유사도는 생활·패션 1.27점부터 우편 1.59점까지 분포했다. 남성은 1.42점, 여성은 1.62점이었다. 도메인과 성별에 따라 차이는 있었지만 특정 집단에서 효과가 사라지는 수준은 아니었다. 청취자 연령별로는 20대 0.93점, 50대 1.89점으로 차이가 나타났다.

자동평가의 순위는 청취평가와 달랐다. 원본 조건의 EER은 14.88%였으며, 방송형 Pitch 변조는 43.68%, VTLN은 44.00%, Resampling은 46.39%였다. 사람에게 가장 다르게 들린 방법은 VTLN이었지만 화자 검증 모델을 가장 어렵게 한 방법은 Resampling이었다.

<div class="research-callout research-callout-finding">
  <p class="research-callout-title">핵심 관찰</p>
  <p>‘사람에게 다르게 들리는가’와 ‘화자 검증 모델이 실패하는가’는 같은 순위를 만들지 않았다. 비식별화 방법을 고를 때 청취평가와 자동평가를 함께 봐야 하는 이유다.</p>
</div>

<p class="section-label">07 · Utility and limits</p>

## 발화 내용 보존은 별도로 확인했다

발화 정보 보존에는 CER(Character Error Rate)을 사용했다. 먼저 CLOVA Speech Recognition으로 원본과 변조 음성을 전사해 CER을 비교했다. 그러나 변조하지 않은 원본에서도 CER이 높게 나타났다. 8 kHz 상담 통화음성과 자동 전사기의 조건이 맞지 않아, 이 결과만으로 변조 방법의 유용성을 판단하기 어렵다고 봤다.

자동 전사의 한계를 보완하기 위해 사람이 변조 음성을 듣고 받아쓰는 평가를 추가했다. 받아쓰기 문장과 원문을 비교한 결과, 방법별 CER은 모두 20% 미만이었다. 자동 전사 수치에는 문제가 있었지만 사람이 발화 내용을 이해하는 데에는 큰 문제가 없음을 확인했다.

<div class="research-callout research-callout-limit">
  <p class="research-callout-title">평가상의 한계</p>
  <p>CSR 기반 CER은 원본에서도 높아 변조 방법 간 유용성 비교 지표로 쓰기 어려웠다. 사람 받아쓰기가 내용 보존을 보완했지만, 향후에는 한국어 통화음성에 맞는 ASR과 통제된 문장 이해 평가가 필요하다.</p>
</div>

## 결론과 다음 실험

방송형 피치 변조는 구현이 쉽지만 피치를 반대로 조정해 원 음성에 접근할 수 있다는 약점이 있었다. 한국어 상담 통화음성에서 Lightweight 방법을 같은 조건으로 비교한 결과, VTLN과 Resampling은 방송형 Pitch보다 사람 또는 모델 기준에서 더 강한 비식별화 성능을 보였다.

한 가지 점수로 최선의 방법을 정할 수는 없었다. VTLN은 청취 유사도를 가장 낮췄고, Resampling은 EER을 가장 높였다. 사람 받아쓰기에서는 발화 내용이 유지됐지만 자동 전사 조건에는 한계가 있었다. 후속 실험에서는 변조 음성을 다시 복원하는 공격을 적용하고, 복원 전후의 화자 유사도를 측정할 필요가 있다.

## 논문

<div class="publication-card">
  <p class="publication-card-kicker">Publication · First author</p>
  <p class="publication-card-title">음성 비식별화 모델과 방송 음성 변조의 한국어 음성 비식별화 성능 비교</p>
  <p class="publication-card-meta">김승민, 박대얼, 최대선 · 스마트미디어저널 12(2), 56–65 · 2023</p>
  <p class="publication-card-links"><a href="https://doi.org/10.30693/SMJ.2023.12.2.56">DOI로 논문 보기</a><a href="https://www.kci.go.kr/kciportal/landing/article.kci?arti_id=ART002945798">KCI 논문 페이지</a></p>
</div>

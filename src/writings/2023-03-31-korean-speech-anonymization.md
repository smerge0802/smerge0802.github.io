---
title: "한국어 통화음성 비식별화: 방송 피치 변조의 한계와 Lightweight 모델 비교"
description: "97,285개 한국어 상담 통화음성에서 방송형 피치 변조와 Lightweight 음성 비식별화 기법을 비교한 2022–2023 위탁연구."
lang: ko
period: "2022 – 2023"
---

2022년 7월부터 2023년 3월까지 진행한 음성 익명화 위탁연구입니다. 방송에서 흔히 쓰는 피치 변조를 한국어 상담 통화음성에 적용했을 때, 실제로 화자 식별을 얼마나 막을 수 있는지부터 확인했습니다. 이어서 Lightweight 음성 비식별화 모델의 세 가지 변조 기법을 같은 데이터와 평가 절차로 비교했습니다.

실험은 두 질문으로 정리할 수 있습니다. 피치를 되돌리기 쉬운 방송형 변조를 대신할 방법이 있는가, 그리고 그 방법이 목소리만 바꾸고 통화 내용까지 망가뜨리지는 않는가. 결과는 2023년 KCI 논문으로 게재됐습니다.

<div class="project-meta" aria-label="연구 개요">
  <div><span>Period</span><strong>2022.07 – 2023.03</strong></div>
  <div><span>Data</span><strong>한국어 상담 통화음성</strong></div>
  <div><span>Outcome</span><strong>KCI 논문 게재</strong></div>
</div>

## 왜 방송형 피치 변조를 다시 검증했나

뉴스나 취재 프로그램에서 제보자의 목소리를 가릴 때 가장 흔히 쓰는 방식은 피치(pitch)를 올리거나 내리는 것입니다. 구현이 간단하고 즉시 적용할 수 있지만, 변조된 방향을 추정해 반대로 조정하면 원래 음성과 비슷한 특성이 다시 드러날 수 있습니다. 실제 화자 식별에는 음높이뿐 아니라 성도 길이, 포먼트, 발화 습관처럼 여러 음향 단서가 함께 작용합니다.

방송형 피치 이동을 기준선으로 두고, VoicePrivacy 계열 Lightweight 모델의 McAdams, Resampling, VTLN을 한국어 통화음성에서 비교했습니다. 사람에게 얼마나 다른 화자로 들리는지, 화자 검증 모델이 원 화자를 얼마나 구별하는지, STT 결과에서 발화 내용이 얼마나 유지되는지를 따로 측정했습니다.

## 먼저 변조 기법을 골랐다

본 실험 전에 AI Hub 화자 인식용 한국어 음성 데이터에서 Lightweight 모델의 후보 기법을 먼저 비교했습니다. 3,000명·7,000시간 규모의 코퍼스에서 화자 100명을 골라 각 30개씩, 총 3,000개 발화를 변조하고 ECAPA-TDNN으로 EER을 계산했습니다.

Modspec은 EER만 보면 강한 비식별화 성능을 보였지만, 직접 들어보면 음성이 뭉개져 발화 내용을 활용하기 어려웠습니다. 그래서 EER과 청취 품질을 함께 보고 McAdams, Resampling, VTLN 세 방법을 본 비교 실험에 남겼습니다. 이 단계가 없었다면 숫자만 가장 좋은 방법을 선택했을 가능성이 큽니다.

## 어떤 데이터셋을 다뤘나

실험에는 Timegate가 관리한 한국어 상담 통화음성 코퍼스를 사용했습니다. 창원시·한국우편사업진흥원·한국소비자원에서 제공한 상담사와 고객의 통화 녹음으로, 문화·관광, 보건·복지, 도시·교통, 전자상거래, 우편, 금융, 보험, 생활·패션 등 **9개 도메인**을 포함합니다.

원천 코퍼스는 총 **97,285개** 녹음(약 **180GB**)으로 구성됐습니다. 파일은 PCM, 128 Kbps, 8 kHz 형식입니다. 실제 상담 통화이기 때문에 이 페이지에는 원본 음성·대화 내용·화자 식별 정보를 싣지 않았습니다. 변조 파일은 16 kHz, 256 Kbps로 저장해 이후 청취·자동 평가에 사용했습니다.

### 단일 화자 구간으로 만드는 전처리

원본 통화에는 상담사와 고객의 발화가 섞여 있어 그대로 비교할 수 없었습니다. JSON 라벨에서 화자 ID와 발화 구간을 연결한 뒤, 각 대화를 시작·종료 시점에 맞춰 잘라 단일 화자 음성 파일로 만들었습니다. 이후 다음 기준으로 청취평가용 구간을 선별했습니다.

- 발화 내용이 명확하게 들리는 2–6초 구간
- 두 화자의 음성이 겹치지 않는 구간
- 사투리나 잡음의 영향이 과도하지 않은 구간
- 도메인별 남녀 화자 비율을 가능한 한 균형 있게 맞춘 표본

이 과정을 거쳐 142명 화자, 중복을 포함한 3,000개 음성 구간으로 청취평가를 구성했습니다. 자동 평가는 중복을 제거한 1,677개 구간(남성 837개, 여성 840개)을 사용했습니다.

<figure class="research-figure">
  <img src="/assets/writings/speech-anonymization/evaluation-flow.svg" alt="한국어 통화음성을 전처리한 뒤 네 가지 비식별화 기법을 적용하고, 청취평가와 EER 기반 화자 검증으로 비교하는 흐름도">
  <figcaption>원본 통화음성은 단일 화자 구간으로 전처리한 뒤, 사람 평가와 자동 화자 검증에 같은 조건으로 투입했습니다.</figcaption>
</figure>

## 네 가지 변조 방법과 한국어 파라미터 탐색

방송형 Pitch 변조는 PSOLA 기반 피치 이동으로 구현했습니다. 나머지 세 방법은 영어 음성에서 사용된 기본값을 그대로 쓰지 않았습니다. 한국어 통화음성에 값을 0.05 단위로 적용해 보면서, 화자 특성이 얼마나 달라졌는지와 문장이 여전히 들리는지를 함께 확인해 값의 범위를 좁혔습니다.

<div class="research-table" role="region" aria-label="음성 비식별화 방법과 설정" tabindex="0">
  <table>
    <thead><tr><th>방법</th><th>바꾸는 화자 단서</th><th>한국어 실험 설정</th><th>청취 유사도</th></tr></thead>
    <tbody>
      <tr><td>Pitch</td><td>기본 주파수</td><td>방송형 기준선</td><td>1.99</td></tr>
      <tr><td>McAdams</td><td>포먼트·공명 주파수</td><td>계수 0.80</td><td>2.05</td></tr>
      <tr><td>Resampling</td><td>샘플링 특성</td><td>rate 0.85</td><td>2.49</td></tr>
      <tr><td>VTLN</td><td>주파수 축·성도 특성</td><td>factor 0.175</td><td><strong>1.52</strong></td></tr>
    </tbody>
  </table>
</div>

McAdams 변환은 스펙트럼의 공명 주파수, 즉 포먼트와 관련된 특성을 이동합니다. VTLN은 주파수 축을 워핑해 성도 길이와 관계된 화자 단서를 바꿉니다. 둘 다 피치만 움직이는 방식보다 더 넓은 음향 단서를 다루는 접근입니다.

<div class="research-figure-pair">
  <figure class="research-figure">
    <img src="/assets/writings/speech-anonymization/mcadams-transformation.png" alt="McAdams 계수에 따라 공명 주파수와 진폭 스펙트럼이 변하는 모습을 보이는 논문 그림">
    <figcaption>McAdams 변환: 공명 주파수 특성을 조절합니다. 논문 그림.</figcaption>
  </figure>
  <figure class="research-figure">
    <img src="/assets/writings/speech-anonymization/vtln-frequency-warping.png" alt="VTLN 워핑 계수에 따라 주파수 축과 스펙트럼이 변하는 모습을 보이는 논문 그림">
    <figcaption>VTLN: 주파수 축을 워핑해 화자 특성을 약화합니다. 논문 그림.</figcaption>
  </figure>
</div>

## 사람과 모델이 각각 본 평가

청취평가는 10대부터 50대까지의 참가자 50명을 모집해 블라인드 방식으로 진행했습니다. 참가자는 두 음성을 들은 뒤 “같은 사람이 말한 것처럼 느껴지는가”를 0–5점으로 답했습니다. 한 사람은 300문항을 풀었고, 총 5개 세트 1,500문항을 만들었습니다. 원본과 동일 화자의 다른 발화, 원본과 다른 화자, 원본과 각 변조 음성을 섞어 제시했습니다. 두 음성은 같은 성별·같은 도메인으로 맞춰, 주제나 성별이 답에 영향을 주는 일을 줄였습니다.

자동 평가는 같은 표본에서 ECAPA-TDNN 임베딩을 추출해 EER(Equal Error Rate)을 계산했습니다. 여기서는 EER가 높을수록 원본과 변조 음성을 구별하기 어렵다는 뜻입니다. 언어 정보는 한국어 STT 결과와 원문을 비교해 CER(Character Error Rate)로 확인했습니다. 화자 단서를 많이 지우는 방법이 항상 문장 보존에도 좋은 것은 아니기 때문에 두 지표를 분리했습니다.

<figure class="research-figure research-figure-interface">
  <img src="/assets/writings/speech-anonymization/human-test-interface.png" alt="두 음성을 재생한 뒤 화자 유사도를 0점부터 5점까지 선택하는 프로젝트 청취평가 화면">
  <figcaption>프로젝트에서 사용한 블라인드 청취평가 화면. 결과는 JSON으로 저장해 기법별·도메인별로 분석했습니다.</figcaption>
</figure>

## 결과: 피치 변조보다 넓은 화자 단서를 바꿨다

<div class="research-metrics" aria-label="핵심 실험 결과">
  <div class="research-metric"><span class="research-metric-value">97,285</span><span class="research-metric-label">원천 상담 통화 녹음<br>약 180 GB</span></div>
  <div class="research-metric"><span class="research-metric-value">1.52 / 5</span><span class="research-metric-label">VTLN 청취 유사도<br>네 방법 중 최저</span></div>
  <div class="research-metric"><span class="research-metric-value">46.39%</span><span class="research-metric-label">Resampling 화자 검증 EER<br>네 방법 중 최고</span></div>
  <div class="research-metric"><span class="research-metric-value">50명</span><span class="research-metric-label">블라인드 청취평가 참가자<br>총 1,500문항</span></div>
</div>

원본 음성과 같은 화자의 다른 발화는 평균 **4.40점**, 다른 화자는 **2.72점**으로 평가됐습니다. 즉, 변조 전에는 청취자가 화자를 어느 정도 구분할 수 있었습니다. 네 방법 모두 원본과 변조 음성의 유사도를 낮췄지만, VTLN은 **1.52점**으로 가장 낮았습니다. 다른 화자의 원본 음성보다도 더 다르게 들린다는 뜻입니다.

<figure class="research-figure research-figure-comparison">
  <img src="/assets/writings/speech-anonymization/method-comparison.svg" alt="VTLN, Pitch, McAdams, Resampling의 원본과 변조 음성 간 화자 유사도를 비교한 막대그래프. VTLN이 1.52점으로 가장 낮다.">
  <figcaption>0점은 아주 다름, 5점은 아주 비슷함을 뜻합니다. 값이 낮을수록 사람이 원 화자를 덜 떠올렸습니다.</figcaption>
</figure>

도메인별 VTLN 유사도는 **1.27–1.59점** 범위였고, 남성 1.42점·여성 1.62점으로 성별 차이도 크지 않았습니다. 한두 도메인에만 효과가 몰린 결과가 아니라는 점을 이 수치에서 확인했습니다.

자동 평가의 순위는 청취평가와 조금 달랐습니다. 방송형 Pitch 변조의 EER은 <strong>43.68%</strong>였고, VTLN은 <strong>44.00%</strong>, Resampling은 <strong>46.39%</strong>였습니다. 즉, 사람에게 가장 다르게 들린 방법은 VTLN이었지만 화자 검증 모델을 가장 어렵게 한 방법은 Resampling이었습니다. 원본 음성끼리의 EER 14.88%와 비교하면 세 변조 방법 모두 화자 검증을 크게 어렵게 했습니다.

CER에서는 변조 뒤 오류가 늘었습니다. 특히 발화 내용의 정확도를 가장 잘 보존한 방법과 화자 유사도를 가장 낮춘 방법이 같지 않았습니다. 이 실험에서는 하나의 점수로 “최고”를 고르기보다, 익명화 강도와 음성 사용성 사이의 선택지를 확인하는 쪽이 더 적절했습니다.

## 논문

<div class="publication-card">
  <p class="publication-card-kicker">Publication · First author</p>
  <p class="publication-card-title">음성 비식별화 모델과 방송 음성 변조의 한국어 음성 비식별화 성능 비교</p>
  <p class="publication-card-meta">김승민, 박대얼, 최대선 · 스마트미디어저널 12(2), 56–65 · 2023</p>
  <p class="publication-card-links"><a href="https://doi.org/10.30693/SMJ.2023.12.2.56">DOI로 논문 보기</a><a href="https://www.kci.go.kr/kciportal/landing/article.kci?arti_id=ART002945798">KCI 논문 페이지</a></p>
</div>

방송형 피치 변조는 구현은 쉬웠지만, 피치를 반대로 조정하면 원 화자와 가까워질 수 있다는 약점이 있었습니다. 이 연구에서는 그 기준선을 실제 한국어 상담 통화음성에서 수치로 비교했고, 신호 처리 기반 비식별화 방법이 어떤 조건에서 더 나은지 정리했습니다.

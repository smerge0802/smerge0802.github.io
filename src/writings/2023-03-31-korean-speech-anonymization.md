---
title: "한국어 음성 비식별화: 방송 음성 변조를 대체할 수 있을까?"
description: "2022.07–2023.03 위탁연구에서 한국어 통화음성을 대상으로 방송 피치 변조와 경량 음성 비식별화 기법을 비교·평가한 연구."
lang: ko
---

> 2022년 7월부터 2023년 3월까지 수행한 위탁연구입니다. 한국어 통화음성에서 화자 식별 가능성은 낮추고 발화 내용의 활용 가능성은 유지하는 방법을 검증했으며, 결과를 KCI 논문으로 확장했습니다.

<div class="project-meta" aria-label="연구 개요">
  <div><span>Period</span><strong>2022.07 – 2023.03</strong></div>
  <div><span>Research</span><strong>음성 익명화 위탁연구</strong></div>
  <div><span>Outcome</span><strong>KCI 논문 게재</strong></div>
</div>

## 문제: 피치만 바꾸면 보호가 충분할까?

뉴스나 취재 프로그램에서 제보자의 신원을 감추기 위해 흔히 쓰는 방법은 피치(pitch)를 올리거나 내리는 것입니다. 빠르고 직관적이지만, 변조 방향을 추정해 반대로 조정하면 원래 목소리와 비슷한 특성을 되찾을 수 있습니다. 목소리에는 음높이뿐 아니라 성도 특성, 포먼트, 발화 습관처럼 화자를 구분하게 하는 단서가 남기 때문입니다.

이 연구는 한국어 통화음성을 대상으로 방송형 피치 변조와 경량(Lightweight) 음성 비식별화 기법을 같은 조건에서 비교했습니다. 목표는 단순히 목소리를 다르게 만드는 것이 아니라, **사람과 모델 모두 원 화자를 구분하기 어렵게 하면서도 발화 내용은 계속 활용할 수 있게 하는 것**이었습니다.

## 데이터와 실험 범위

개인정보가 포함될 수 있는 원본 통화음성은 공개하지 않았습니다. 대신 분석 단계에서 한 사람의 발화만 남도록 구간을 정리하고, 내용이 분명하고 사투리 영향이 과도하지 않으며 두 화자가 겹치지 않는 2–6초 길이의 구간을 선별했습니다.

- **청취평가 표본:** 142명 화자, 중복을 포함한 3,000개 음성 구간
- **도메인 구성:** 9개 상담 도메인으로 분산해 특정 주제에 결과가 치우치지 않는지 점검
- **자동 평가 표본:** 중복을 제거한 1,677개 음성 구간
- **평가 조건:** 비교하는 두 음성은 동일 성별·동일 도메인으로 구성해 음색 외의 단서를 줄임

이 과정은 실제 데이터의 민감성을 보존하면서도, 한국어 통화음성 환경에서 익명화가 작동하는지 확인하기 위한 실험 설계였습니다.

## 비교한 네 가지 변조 방법

방송형 **Pitch 변조**를 기준선으로 두고, VoicePrivacy 계열의 Lightweight 모델에서 사용되는 세 가지 신호 처리 기반 방법을 비교했습니다. McAdams 변환은 포먼트와 관련된 공명 주파수 특성을 바꾸고, Resampling은 시간 길이를 유지한 채 샘플링 특성을 조절하며, VTLN은 주파수 축을 워핑해 성도 길이와 관련된 화자 단서를 약화합니다.

<div class="research-table" role="region" aria-label="변조 기법별 청취평가 결과" tabindex="0">
  <table>
    <thead><tr><th>방법</th><th>핵심 아이디어</th><th>사용 설정</th><th>청취 유사도</th></tr></thead>
    <tbody>
      <tr><td>Pitch</td><td>피치 이동</td><td>방송형 기준선</td><td>1.99</td></tr>
      <tr><td>McAdams</td><td>포먼트·공명 특성 변환</td><td>계수 0.80</td><td>2.05</td></tr>
      <tr><td>Resampling</td><td>샘플링 특성 변환</td><td>rate 0.85</td><td>2.49</td></tr>
      <tr><td>VTLN</td><td>주파수 축 워핑</td><td>factor 0.175</td><td><strong>1.52</strong></td></tr>
    </tbody>
  </table>
</div>

<figure class="research-figure research-figure-comparison">
  <img src="/assets/writings/speech-anonymization/method-comparison.svg" alt="VTLN, Pitch, McAdams, Resampling의 원본과 변조 음성 간 화자 유사도를 비교한 막대그래프. VTLN이 1.52점으로 가장 낮다.">
  <figcaption>화자 유사도는 0점이 아주 다름, 5점이 아주 비슷함을 뜻합니다. 낮을수록 원 화자의 단서가 적게 남았다고 해석합니다.</figcaption>
</figure>

## 내가 맡은 일

- 한국어 통화음성의 단일 화자 구간 전처리와 평가용 데이터셋 구성
- 4가지 변조 기법 구현, 파라미터 튜닝, 비교 실험 설계
- 청취평가 화면 구축과 운영, 화자 유사도 응답 수집
- ECAPA-TDNN 기반 EER 분석 및 한국어 STT 기반 CER 분석
- 결과 해석과 KCI 논문 작성

## 평가 설계: 사람과 모델을 함께 봤다

한 지표만으로는 익명화 품질을 판단하기 어렵습니다. 그래서 사람이 듣는 인상, 화자 검증 모델이 포착하는 단서, 그리고 언어 내용의 보존을 분리해 측정했습니다.

**1) 블라인드 청취평가**에서는 10대부터 50대까지의 참여자 50명이 두 음성을 듣고, 동일 화자처럼 느껴지는 정도를 0–5점으로 답했습니다. 참가자는 두 음성이 실제로 동일인인지 알 수 없었고, 한 사람은 300문항을 수행했습니다. 총 5개 세트, 1,500문항으로 구성해 원본·동일 화자의 다른 발화·다른 화자·각 변조 방법을 비교했습니다.

**2) 자동 화자 검증**에서는 ECAPA-TDNN으로 음성 임베딩을 추출하고 EER(Equal Error Rate)을 계산했습니다. EER가 낮으면 원 화자 정보가 잘 유지된 것이고, 비식별화 관점에서는 EER가 높아질수록 화자 구분이 어려워졌다고 해석합니다.

**3) 언어 정보 보존**은 한국어 STT 결과와 원문을 비교한 CER(Character Error Rate)로 확인했습니다. 한국어는 조사와 음절 구조의 특성 때문에 단어 단위 WER보다 글자 단위 CER이 더 적합하다고 판단했습니다.

<figure class="research-figure">
  <img src="/assets/writings/speech-anonymization/evaluation-flow.svg" alt="한국어 통화음성을 네 가지 비식별화 기법으로 처리한 뒤 청취평가와 EER 기반 화자 검증 평가로 비교하는 흐름도">
  <figcaption>한국어 통화음성 → 비식별화 기법 → 사람·모델 평가의 비교 흐름.</figcaption>
</figure>

## 핵심 결과

<div class="research-metrics" aria-label="핵심 평가 결과">
  <div class="research-metric"><span class="research-metric-value">1.52 / 5</span><span class="research-metric-label">VTLN의 원본-변조 화자 유사도</span></div>
  <div class="research-metric"><span class="research-metric-value">46.39%</span><span class="research-metric-label">VTLN 화자 검증 EER</span></div>
  <div class="research-metric"><span class="research-metric-value">43.68%</span><span class="research-metric-label">방송형 Pitch 변조 EER</span></div>
  <div class="research-metric"><span class="research-metric-value">50명</span><span class="research-metric-label">청취평가 참여자</span></div>
</div>

원본 음성끼리는 본인 화자 유사도가 평균 <strong>4.40점</strong>, 다른 화자는 <strong>2.72점</strong>이었습니다. 즉, 변조 전에는 청취자가 화자를 어느 정도 구분할 수 있었습니다. 반면 VTLN은 원본과 변조 음성의 유사도를 <strong>1.52점</strong>까지 낮춰, 다른 화자 원본 음성보다도 더 다르게 들리게 했습니다.

자동 평가에서도 논문 기준 VTLN의 EER은 <strong>46.39%</strong>, 방송형 피치 변조는 <strong>43.68%</strong>였습니다. 두 값 모두 원본 대비 화자 식별을 어렵게 했지만, 사람 평가와 화자 검증 평가를 종합했을 때 VTLN이 방송형 변조보다 안정적인 비식별화 대안이라는 결론에 도달했습니다.

CER 분석에서는 변조된 음성이 원본보다 언어 정보 손실을 보였지만, 방법에 따라 프라이버시와 내용 보존의 균형이 달랐습니다. 이 결과는 가장 강한 익명화만을 고르는 문제라기보다, **누가 듣는지·어떤 모델이 공격하는지·발화 내용을 어느 정도 유지해야 하는지**를 함께 고려해야 한다는 점을 보여 줍니다.

## 청취평가를 직접 설계하고 운영했다

평가자는 원본과 변조 음성을 각각 듣고, 화자 유사도를 선택했습니다. 한 문제에 두 음성만 집중할 수 있도록 화면을 단순하게 구성해 응답 부담을 낮췄고, 동일한 평가 절차를 여러 기법에 적용했습니다.

<figure class="research-figure research-figure-interface">
  <img src="/assets/writings/speech-anonymization/human-test-interface.png" alt="원본과 변조 음성의 화자 유사도를 0점부터 5점까지 선택하는 청취평가 화면">
  <figcaption>프로젝트에서 사용한 화자 유사도 청취평가 화면. 원본 통화음성은 공개하지 않았습니다.</figcaption>
</figure>

## 연구 성과와 논문

<div class="publication-card">
  <p class="publication-card-kicker">Publication · First author</p>
  <p class="publication-card-title">음성 비식별화 모델과 방송 음성 변조의 한국어 음성 비식별화 성능 비교</p>
  <p class="publication-card-meta">김승민, 박대얼, 최대선 · 스마트미디어저널 12(2), 56–65 · 2023</p>
  <p class="publication-card-links"><a href="https://doi.org/10.30693/SMJ.2023.12.2.56">DOI로 논문 보기</a><a href="https://www.kci.go.kr/kciportal/landing/article.kci?arti_id=ART002945798">KCI 논문 페이지</a></p>
</div>

연구 결과는 제가 제1저자로 참여한 KCI 등재 논문으로 이어졌습니다. 원문과 서지 정보는 위의 DOI 및 KCI 링크에서 확인할 수 있습니다.

이 작업을 통해 음성 프라이버시는 변조 강도만으로 판단할 수 없고, **사람이 느끼는 익명성·모델이 식별하는 단서·언어 정보 보존**을 함께 측정해야 한다는 기준을 세웠습니다. 이후 음성 AI 보안 연구를 이어가는 출발점이 된 프로젝트입니다.

---
title: "한국어 음성 비식별화: 방송 음성 변조를 대체할 수 있을까?"
description: "2022.07–2023.03 위탁연구에서 한국어 통화음성을 대상으로 방송 피치 변조와 경량 음성 비식별화 기법을 비교·평가한 연구."
---

> 2022년 7월부터 2023년 3월까지 수행한 위탁연구입니다. 한국어 통화음성에서 익명화 성능과 발화 내용의 보존을 함께 살피고, 결과를 KCI 논문으로 확장했습니다.

<div class="project-meta" aria-label="연구 개요">
  <div><span>Period</span><strong>2022.07 – 2023.03</strong></div>
  <div><span>Research</span><strong>음성 익명화 위탁연구</strong></div>
  <div><span>Outcome</span><strong>KCI 논문 게재</strong></div>
</div>

## 문제: 피치만 바꾸면 보호가 충분할까?

방송에서 흔히 쓰는 피치 변조는 직관적이고 빠르지만, 변조 방향을 추정해 역으로 조정하면 원 화자 특성이 다시 드러날 수 있습니다. 이 연구는 한국어 통화음성을 대상으로 방송형 피치 변조와 경량 음성 비식별화 기법을 같은 조건에서 비교했습니다.

비교 대상은 **Pitch 변조**, **McAdams 계수 변환**, **Resampling**, **VTLN(Vocal Tract Length Normalization)** 네 가지였습니다. 목표는 단순히 목소리를 다르게 만드는 것이 아니라, 화자 식별을 어렵게 하면서도 발화 내용을 사용할 수 있게 유지하는 것이었습니다.

## 내가 맡은 일

- 한국어 통화음성의 단일 화자 구간 전처리와 평가용 데이터셋 구성
- 4가지 변조 기법 구현, 파라미터 튜닝, 비교 실험 설계
- 청취평가 화면 구축과 운영, 화자 유사도 응답 수집
- ECAPA-TDNN 기반 EER 및 CER 분석
- 결과 해석과 KCI 논문 작성

## 평가 설계

익명화된 음성을 사람과 모델 양쪽에서 평가했습니다. 청취평가에서는 원본과 변조 음성을 들은 참여자가 두 화자가 같은 사람처럼 느껴지는 정도를 0–5점으로 답했습니다. 자동 평가에서는 화자 검증 모델의 EER(Equal Error Rate)을 사용했습니다. EER가 높을수록 원 화자와의 구분이 어려워져 비식별화 관점에서 유리합니다.

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

원본 음성끼리는 본인 화자 유사도가 평균 <strong>4.40점</strong>, 다른 화자는 <strong>2.72점</strong>이었습니다. VTLN은 원본과 변조 음성의 유사도를 <strong>1.52점</strong>까지 낮췄고, 화자 검증 EER도 <strong>46.39%</strong>로 높아져 화자 구분을 어렵게 했습니다. 반면 방송형 피치 변조의 EER은 <strong>43.68%</strong>였습니다.

사람의 전사 결과에서도 각 비식별화 기법의 문자 오류율(CER)은 20% 미만으로 나타났습니다. 즉, VTLN은 화자 단서 노출을 줄이면서도 통화 내용 활용 가능성을 함께 유지한 방법으로 확인했습니다.

## 청취평가를 직접 설계하고 운영했다

평가자는 원본과 변조 음성을 각각 듣고, 화자 유사도를 선택했습니다. 한 문제에 두 음성만 집중할 수 있도록 화면을 단순하게 구성해 응답 부담을 낮췄고, 동일한 평가 절차를 여러 기법에 적용했습니다.

<figure class="research-figure research-figure-interface">
  <img src="/assets/writings/speech-anonymization/human-test-interface.png" alt="원본과 변조 음성의 화자 유사도를 0점부터 5점까지 선택하는 청취평가 화면">
  <figcaption>프로젝트에서 사용한 화자 유사도 청취평가 화면. 원본 통화음성은 공개하지 않았습니다.</figcaption>
</figure>

## 연구 성과

연구 결과는 제가 제1저자로 참여한 논문, 「음성 비식별화 모델과 방송 음성 변조의 한국어 음성 비식별화 성능 비교」로 이어졌습니다. [스마트미디어저널 12권 2호, 56–65 (2023)](https://doi.org/10.30693/SMJ.2023.12.2.56)에 게재됐습니다.

이 작업을 통해 음성 프라이버시는 변조 강도만으로 판단할 수 없고, **사람이 느끼는 익명성·모델이 식별하는 단서·언어 정보 보존**을 함께 측정해야 한다는 기준을 세웠습니다. 이후 음성 AI 보안 연구를 이어가는 출발점이 된 프로젝트입니다.

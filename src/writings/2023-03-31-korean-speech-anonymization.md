---
title: "한국어 통화음성 비식별화: 방송 피치 변조의 한계와 Lightweight 모델 비교"
description: "97,285개 한국어 상담 통화음성에서 방송형 피치 변조와 Lightweight 음성 비식별화 기법을 비교한 2022–2023 위탁연구."
lang: ko
period: "2022 – 2023"
---

2022년 7월부터 2023년 3월까지 수행한 음성 익명화 위탁연구입니다. 방송에서 널리 쓰이는 피치 변조가 실제로 화자의 신원을 충분히 보호하는지, 그리고 음성 비식별화 모델이 한국어 통화음성에서도 더 나은 대안이 될 수 있는지를 검증했습니다.

핵심은 목소리를 단순히 낯설게 만드는 것이 아니었습니다. 사람이 들었을 때와 화자 검증 모델이 판단할 때 모두 원 화자를 연결하기 어렵게 하면서, 통화 내용은 계속 활용할 수 있어야 했습니다. 연구 결과는 제1저자 KCI 논문으로 이어졌습니다.

<div class="project-meta" aria-label="연구 개요">
  <div><span>Period</span><strong>2022.07 – 2023.03</strong></div>
  <div><span>Data</span><strong>한국어 상담 통화음성</strong></div>
  <div><span>Outcome</span><strong>KCI 논문 게재</strong></div>
</div>

## 왜 방송형 피치 변조를 다시 검증했나

뉴스나 취재 프로그램에서 제보자의 목소리를 가릴 때 가장 흔히 쓰는 방식은 피치(pitch)를 올리거나 내리는 것입니다. 구현이 간단하고 즉시 적용할 수 있지만, 변조된 방향을 추정해 반대로 조정하면 원래 음성과 비슷한 특성이 다시 드러날 수 있습니다. 실제 화자 식별에는 음높이뿐 아니라 성도 길이, 포먼트, 발화 습관처럼 여러 음향 단서가 함께 작용합니다.

이 연구는 피치 이동을 방송형 기준선으로 두고, VoicePrivacy 계열 Lightweight 모델의 세 기법인 McAdams, Resampling, VTLN을 한국어 통화음성에서 비교했습니다. 비교의 기준은 “얼마나 다르게 들리는가” 하나가 아니라, 화자 프라이버시와 언어 정보 보존 사이의 균형이었습니다.

## 어떤 데이터셋을 다뤘나

실험에는 Timegate가 관리한 한국어 상담 통화음성 코퍼스를 사용했습니다. 창원시·한국우편사업진흥원·한국소비자원에서 제공한 상담사와 고객의 통화 녹음으로, 문화·관광, 보건·복지, 도시·교통, 전자상거래, 우편, 금융, 보험, 생활·패션 등 **9개 도메인**을 포함합니다.

원천 코퍼스는 총 **97,285개** 녹음(약 **180GB**)으로 구성됐습니다. PCM, 128 Kbps, 8 kHz 형식의 실제 상담 통화이기 때문에, 원본 음성·대화 내용·개인정보는 이 포트폴리오에 공개하지 않았습니다. 대신 보고서의 실험 절차와 논문의 결과 수치만 정리했습니다.

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

방송형 Pitch 변조는 PSOLA 기반 피치 이동으로 구현했습니다. 나머지 세 방법은 원래 영어 음성에서 정해진 Lightweight 모델의 설정을 그대로 가져오지 않고, 한국어 통화음성에서 0.05 단위로 값을 바꿔가며 직접 청취해 변조 강도와 음성의 자연스러움을 함께 확인했습니다.

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

청취평가는 10대부터 50대까지의 참가자 50명을 모집해 블라인드 방식으로 진행했습니다. 참가자는 두 음성을 듣고 같은 사람이 말한 것처럼 느껴지는 정도를 0–5점으로 응답했습니다. 한 사람은 300문항을 수행했고, 총 5개 세트 1,500문항으로 원본·동일 화자의 다른 발화·다른 화자·각 변조 방법을 비교했습니다. 비교하는 두 음성은 같은 성별·같은 도메인으로 맞춰, 음색 이외의 단서가 결과에 미치는 영향을 줄였습니다.

자동 평가는 ECAPA-TDNN으로 음성 임베딩을 추출해 EER(Equal Error Rate)을 계산했습니다. EER가 낮으면 원 화자 정보가 잘 보존된 것이고, 비식별화 관점에서는 EER가 높을수록 모델이 원 화자를 구분하기 어려워진 것으로 해석합니다. 언어 정보는 한국어 STT 결과와 원문을 비교하는 CER(Character Error Rate)로 측정했습니다.

<figure class="research-figure research-figure-interface">
  <img src="/assets/writings/speech-anonymization/human-test-interface.png" alt="두 음성을 재생한 뒤 화자 유사도를 0점부터 5점까지 선택하는 프로젝트 청취평가 화면">
  <figcaption>프로젝트에서 사용한 블라인드 청취평가 화면. 결과는 JSON으로 저장해 기법별·도메인별로 분석했습니다.</figcaption>
</figure>

## 결과: 피치 변조보다 넓은 화자 단서를 바꿨다

원본 음성과 같은 화자의 다른 발화는 평균 **4.40점**, 다른 화자는 **2.72점**으로 평가됐습니다. 즉, 변조 전에는 청취자가 화자를 어느 정도 구분할 수 있었습니다. 네 방법 모두 원본과 변조 음성의 유사도를 낮췄지만, VTLN은 **1.52점**으로 가장 낮았습니다. 다른 화자의 원본 음성보다도 더 다르게 들린다는 뜻입니다.

<figure class="research-figure research-figure-comparison">
  <img src="/assets/writings/speech-anonymization/method-comparison.svg" alt="VTLN, Pitch, McAdams, Resampling의 원본과 변조 음성 간 화자 유사도를 비교한 막대그래프. VTLN이 1.52점으로 가장 낮다.">
  <figcaption>0점은 아주 다름, 5점은 아주 비슷함을 뜻합니다. 값이 낮을수록 사람이 원 화자를 덜 떠올렸습니다.</figcaption>
</figure>

도메인별 VTLN 유사도는 **1.27–1.59점** 범위였고, 남성 1.42점·여성 1.62점으로 성별 간에도 큰 차이가 없었습니다. 이는 특정 상담 주제나 성별에만 국한되지 않고 비교적 고르게 익명화 효과가 나타났다는 근거입니다.

자동 평가에서도 같은 방향의 결과가 나왔습니다. 논문 기준 방송형 Pitch 변조의 EER은 **43.68%**, VTLN은 **46.39%**였습니다. 원본 음성끼리의 EER 14.88%와 비교하면 변조 후 화자 검증이 훨씬 어려워졌습니다. 다만 CER 분석에서는 변조에 따른 언어 정보 손실도 확인됐으며, 프라이버시가 강할수록 내용 보존이 항상 좋아지는 것은 아니었습니다.

## 논문

<div class="publication-card">
  <p class="publication-card-kicker">Publication · First author</p>
  <p class="publication-card-title">음성 비식별화 모델과 방송 음성 변조의 한국어 음성 비식별화 성능 비교</p>
  <p class="publication-card-meta">김승민, 박대얼, 최대선 · 스마트미디어저널 12(2), 56–65 · 2023</p>
  <p class="publication-card-links"><a href="https://doi.org/10.30693/SMJ.2023.12.2.56">DOI로 논문 보기</a><a href="https://www.kci.go.kr/kciportal/landing/article.kci?arti_id=ART002945798">KCI 논문 페이지</a></p>
</div>

이 연구는 한국어 상담 통화음성에서 방송형 변조의 한계를 실험으로 확인하고, 경량 음성 비식별화 기법을 실제 데이터 조건에서 비교했다는 데 의미가 있습니다. 이후 음성 AI 보안 연구에서 화자 프라이버시와 음성 유용성을 함께 평가하는 기준점이 됐습니다.

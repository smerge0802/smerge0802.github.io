# RoVo Research Writing Design

## 목적

2024년부터 2025년까지 진행한 RoVo 연구를 포트폴리오의 세 번째 상세 Writing으로 추가한다. 글은 공개된 arXiv v1의 단순 요약이 아니라 사용자가 제공한 최신 본문 `RoVo_Robust Voice Protection.pdf`와 `Supplementary Materials RoVo_Robust Voice Protection.pdf`를 근거로 작성한다. 독자는 신호 수준 방어의 취약점, RoVo의 잠재공간 교란, 적응형 공격 평가, 데이터 구성, 결과와 음질 trade-off를 논문을 직접 읽지 않아도 따라갈 수 있어야 한다.

연구 기간은 `2024 – 2025`로 표시한다. 최신 원고의 상태는 `Manuscript under review`로 표기하되, 익명 심사를 해칠 수 있는 학회명, submission ID, 익명 저자 표기는 공개하지 않는다. 2025년 5월 공개된 arXiv v1은 글 마지막의 별도 논문 카드에서 선행 공개본으로 연결한다.

## 근거 자료와 버전 경계

### 최신 본문

최신 본문을 방법, 데이터, 적응형 공격 분류, 주요 결과와 한계의 우선 근거로 사용한다.

- 제목: `RoVo: Robust Voice Protection Against Voice Cloning Attacks via Embedding-Level Adversarial Perturbations`
- 핵심 방법: Neural Audio Codec 잠재공간의 embedding-level perturbation
- 최적화: Target-based Loss와 SNR Loss를 번갈아 적용하는 PerC-AL
- 평가 범위: 약한 신호 변환, 음성 향상·정화 기반 중간 공격, 방어 구조를 아는 강한 white-box 공격, black-box transfer
- 최신 원고에만 있는 실험과 수치는 `심사 중인 확장 원고`의 결과로 설명한다.

### 보충자료

보충자료는 본문에서 생략된 선택 근거와 추가 검증을 보완하는 데 사용한다.

- Bark clean reconstruction의 MOS 4.53과 원본 대비 cosine similarity 0.96
- opposite-gender target을 사용한 speaker embedding 분포 근거
- 실제 악용 상황을 반영한 threat-oriented prompts
- MS Azure 상용 화자 검증 API 결과
- VCTK 추가 성능과 음성 향상 후 비교
- cross-model·black-box transfer 표
- LLaSE-G1 reconstruction 기반 추가 적응형 공격

보충자료의 표가 최신 본문과 평가 범위나 집계 방식이 다른 경우, 같은 표에서 수치를 합치지 않는다. 각 결과가 어느 평가 설정에서 나온 값인지 본문과 캡션에 적는다.

### arXiv v1

arXiv:2505.12686은 2025년 5월 19일 공개된 v1으로만 소개한다.

- 제목: `RoVo: Robust Voice Protection Against Unauthorized Speech Synthesis with Embedding-Level Perturbations`
- 저자: Seungmin Kim, Sohee Park, Donghyun Kim, Jisu Lee, Daeseon Choi
- 링크: `https://arxiv.org/abs/2505.12686`
- 상태 표기: `Public preprint · arXiv v1 · May 2025`

최신 심사 원고와 제목·실험 범위가 다르므로 arXiv v1을 최신 원고 전체의 출처처럼 표현하지 않는다.

## 글의 편집 원칙

- 본문 종결어미는 `~했다`, `~다`로 통일한다.
- `~했습니다`, `~입니다`, `~됩니다`, `~있습니다`는 사용하지 않는다.
- “강건하다”, “효과적이다” 같은 평가는 DSR 변화량, MOS, 공격 조건과 함께 쓴다.
- 최신 원고와 보충자료의 수치를 임의로 평균하거나 재계산하지 않는다.
- DSR은 높을수록 방어가 성공한 비율이라는 점을 첫 등장 때 설명한다.
- MOS와 WER은 방어력과 별개의 품질·명료성 지표로 분리해서 설명한다.
- signal-domain baseline이 특정 white-box 조건에서 더 높은 초기 DSR을 보인 경우도 숨기지 않는다.
- 음성 향상 뒤 RoVo의 DSR이 증가한 사례는 “교란 제거 실패”와 “음성 자체의 추가 훼손”을 구분해 해석한다.
- 최신 원고가 심사 중이라는 상태와 공개 arXiv v1의 버전 차이를 명확히 적는다.
- 논문 그림과 표의 작은 글씨만으로 정보를 전달하지 않고, 핵심 수치는 HTML 표·결과 카드·캡션에서 다시 제공한다.

## 페이지 메타데이터

- 파일명: `src/writings/2025-05-19-rovo-robust-voice-protection.md`
- 제목: `RoVo: 잠재공간 교란으로 음성 복제 방어를 견고하게 만들기`
- 설명: 신경 오디오 코덱의 잠재공간에서 적대적 교란을 최적화하고 약·중·강 적응형 공격과 black-box 조건에서 검증한 2024–2025 음성 보호 연구
- 기간: `2024 – 2025`
- 개요 카드:
  - Period: `2024 – 2025`
  - Task: `Proactive voice protection`
  - Status: `Manuscript under review`

## 본문 구성

### 01 · Research question

#### 음성 복제 전에 막는 방어가 왜 필요한가

- 공개 음성 몇 초만으로 zero-shot voice cloning이 가능한 위협을 설명한다.
- 생성 뒤 탐지하는 사후 방어와 공유 전 음성을 보호하는 proactive defense를 구분한다.
- 공격자가 보호 음성에 speech enhancement를 먼저 적용하면 기존 교란이 약해지는 adaptive removal 문제를 연구 질문으로 설정한다.
- 위협 개요 그림을 배치해 `피해자 → 보호 음성 공개 → 공격자 수집 → 정화·복제 → 사칭 실패` 흐름을 보여 준다.

### 02 · Threat model

#### 공격자의 능력을 약·중·강 세 단계로 나눴다

- 공격자는 공개 플랫폼에서 제한된 피해자 음성을 수집하고 zero-shot TTS·VC에 사용한다.
- 방어 실패는 보호 음성으로 만든 합성 음성이 ASV에서 원 화자로 받아들여지는 경우로 정의한다.
- 약한 공격: quantization, resampling, filtering, mel inversion 같은 단순 변환
- 중간 공격: Spectral Masking, DeepFilterNet, MP-SENet, FlowSE, De-AntiFake 같은 enhancement·purification
- 강한 공격: 공격자가 RoVo 구조, 목적함수와 target reference를 알고 보호 음성에서 더 자연스러운 신호를 재구성하는 white-box 조건
- black-box 조건에서는 학습에 사용하지 않은 Tortoise와 CosyVoice를 사용한다.

### 03 · Why latent space

#### 신호에 노이즈를 더하는 대신 codec embedding을 바꿨다

- AntiFake, AttackVC, VoiceGuard 같은 signal-domain 방어의 교란이 enhancement 모델에 의해 분리될 수 있는 이유를 설명한다.
- RoVo는 입력 음성 `x`를 codec encoder로 `z`에 매핑하고, latent perturbation `δz`를 더한 뒤 decoder로 보호 음성 `x_rovo`를 복원한다.
- 비선형 decoder를 통과한 교란은 파형에 단순 가산된 잡음이 아니라 음성 구조와 결합된 변형이 된다.
- 스펙트로그램 그림으로 AntiFake는 향상 후 원본 구조가 복구되는 반면 RoVo는 교란이 깨끗하게 분리되지 않는 차이를 설명한다.

### 04 · RoVo framework

#### Bark와 EnCodec 표현 위에서 보호 음성을 재구성했다

- Bark의 Neural Codec Encoder, Coarse Transformer, Fine Transformer, embedding, Neural Codec Decoder 흐름을 설명한다.
- clean reconstruction 검증에서 MOS 4.53, 원본과의 cosine similarity 0.96을 얻어 backbone 자체의 복원 성능을 먼저 확인했다.
- RoVo 구조 그림을 원본 비율로 사용하고 모바일에서 글씨가 지나치게 작아지지 않도록 확대 가능한 단일 figure로 배치한다.

### 05 · Optimization

#### 방어력과 음질을 번갈아 최적화한 PerC-AL

- Target-based Loss는 보호 음성의 speaker embedding을 원 화자에서 멀어지게 하고 반대 성별 target speaker 방향으로 이동시킨다.
- SNR Loss는 원본과 보호 음성의 차이를 제한해 음질 붕괴를 억제한다.
- 두 loss를 단순 가중합하면 품질 목적이 방어 목적을 지배할 수 있어, 임곗값에 따라 목적을 전환하는 alternating optimization을 사용했다.
- joint optimization과 alternating optimization의 단계별 DSR·MOS 그래프를 사용한다.
- 보충자료의 t-SNE 그림으로 opposite-gender target이 embedding 공간에서 더 큰 이동을 유도한다는 선택 근거를 설명한다.

### 06 · Dataset

#### VCTK에서 임곗값을 고르고 여섯 코퍼스로 일반화를 확인했다

- VCTK, FST, MCV, CSNED, CSUKIED, LibriSpeech를 표로 정리한다.
- VCTK의 109명 × 10개 발화는 PerC-AL 임곗값 선택에만 사용한다.
- 나머지 데이터는 코퍼스별 10–20명, 화자별 10개, 발화 길이 5–10초로 구성한다.
- 본 평가 규모는 70명·700개 원본 발화이며, 각 보호 음성을 세 white-box cloning model에 적용한다.
- VCTK에서 고른 임곗값을 다른 코퍼스에 다시 맞추지 않았다는 점을 일반화 조건으로 강조한다.

### 07 · Evaluation protocol

#### 복제 모델, 검증 모델, 품질 지표를 분리했다

- white-box voice cloning: SV2TTS, YourTTS, AVC
- black-box voice cloning: Tortoise, CosyVoice
- speaker verification: ECAPA-TDNN, Resemblyzer, ResNet 계열
- baseline defense: AttackVC, AntiFake, VoiceGuard
- DSR: 합성 음성이 원 화자로 받아들여지지 않은 비율
- MOS: 보호 음성의 지각 품질
- WER: 보호 후 발화 내용의 명료성
- 보충자료의 threat-oriented prompts는 금융 송금, 긴급 상황, 계정 인증 같은 악용 맥락을 평가 문장으로 사용했다는 수준에서 요약하고 실제 민감정보는 포함하지 않는다.

### 08 · Base and weak-attack results

#### 재튜닝 없이 평균 DSR을 크게 높였다

- VCTK threshold selection에서 평균 DSR이 RAW 9.6%에서 RoVo 82.5%로 증가한 결과를 제시한다.
- 다른 다섯 코퍼스에서도 같은 VCTK 임곗값을 사용한 결과를 별도 표로 정리한다.
- 약한 변환 공격 전체에서 보호 전후 변화량과 가장 어려운 조건을 설명한다.
- 핵심 수치 카드에는 `82.5% VCTK 평균 DSR`, `70 speakers / 700 utterances`, `3 white-box + 2 black-box models`를 배치한다.

### 09 · Moderate adaptive attacks

#### 음성 향상 뒤에도 signal-domain baseline보다 더 많은 방어력을 남겼다

- 36개 enhancement·cloning·verification 조합에서 RoVo가 평균 82.8% DSR을 유지하고 평균 하락이 5.2%p였다는 최신 본문 결과를 중심으로 설명한다.
- AttackVC, AntiFake, VoiceGuard의 평균 하락 폭 30.8%p, 35.5%p, 49.7%p와 비교한다.
- AVC 조건의 평균 DSR 93.8%와 일부 enhancement 뒤 최대 4.4%p 상승한 사례를 설명한다.
- MOS는 무공격 평균 2.53에서 enhancement 뒤 2.68로 제한적으로 변했다. 품질이 낮아지는 trade-off를 방어력과 함께 제시한다.
- 전체 36개 표를 그대로 옮기지 않고 대표 조건과 평균을 웹용 표로 압축한다.

### 10 · Transfer and strong attacks

#### 보지 못한 복제 모델과 방어 구조를 아는 공격까지 평가했다

- 세 surrogate speaker encoder의 ensemble로 만든 보호 음성을 Tortoise와 CosyVoice에 적용한다.
- black-box 전체 평균 DSR 81.6%, 약한 공격 89.0%, enhancement·purification 77.3%, MOS 2.83 ± 0.46을 제시한다.
- 강한 white-box reconstruction에서 MOS는 3.38–3.76까지 회복됐지만 verification acceptance 평균은 15.3%였고, 합성 이후 DSR은 평균 82.1%로 유지됐다는 결과를 설명한다.
- 보충자료의 LLaSE-G1 공격은 WavLM speaker embedding, speech token, LLaMA 기반 모델, X-Codec decoder로 보호 교란을 줄이려는 추가 reconstruction 공격으로 정리한다.
- LLaSE-G1 전체 평균 DSR 72.9%, ECAPA-TDNN 평균 82.6%를 별도 callout으로 표시한다.

### 11 · Commercial verification

#### 상용 화자 검증 API에서도 결과를 확인했다

- MS Azure에서 RAW 대비 RoVo DSR이 SV2TTS 68.1→99.8%, YourTTS 18.0→99.5%, AVC 52.3→98.6%로 증가한 결과를 표로 제시한다.
- enhancement 이후 RoVo 평균 DSR 99.0%, 평균 변화 0.3%p와 AntiFake 평균 94.1%, 5.6%p 하락을 구분한다.
- 상용 API의 decision boundary가 open-source verifier와 다를 수 있어 절대값을 직접 동일시하지 않는다는 한계를 함께 적는다.

### 12 · Trade-off and limitations

#### 제거하기 어려운 보호와 지각 품질 사이에 trade-off가 남았다

- embedding-level perturbation은 제거하기 어렵지만 보호 음성의 MOS를 낮춘다.
- enhancement가 RoVo를 제거하지 못하고 음성 자체를 더 훼손해 DSR이 오르는 경우를 실제 사용성의 장점으로 과장하지 않는다.
- 2024–2025 연구에서 평가한 언어·복제 모델·검증 임곗값 범위를 넘어선 일반화는 보장하지 않는다.
- 연산량과 보호 음성 생성 시간, 모바일·실시간 배포 가능성은 후속 연구 항목으로 남긴다.
- 심사 중 원고의 결과는 최종 게재 과정에서 바뀔 수 있음을 표시한다.

### 13 · Manuscript and preprint

- 현재 확장 원고: `Manuscript under review`
- 공개본: arXiv v1 제목, 저자, 2025년 5월 공개일, arXiv 링크
- 두 버전의 제목과 실험 범위가 다르다는 짧은 주석

## 시각자료

최신 본문과 보충자료에서 다음 여섯 그림을 추출해 웹 자산으로 사용한다.

1. `threat-overview.png`
   - 출처: 최신 본문 Figure 1
   - 역할: 공개 음성에서 adaptive attack과 voice cloning으로 이어지는 위협 흐름
2. `rovo-framework.png`
   - 출처: 최신 본문 Figure 2
   - 역할: Neural Codec embedding 교란과 Target/SNR loss 경로
3. `spectrogram-comparison.png`
   - 출처: 최신 본문 Figure 3
   - 역할: AntiFake와 RoVo의 enhancement 전후 차이
4. `alternating-optimization.png`
   - 출처: 최신 본문 Figure 4
   - 역할: joint와 alternating optimization의 DSR·MOS 변화
5. `target-gender-embedding.png`
   - 출처: 보충자료 Figure 1의 두 패널
   - 역할: opposite-gender target 선택 근거
6. `user-study.png`
   - 출처: 최신 본문 Figure 5
   - 역할: 보호·복제·향상 음성의 화자 유사도 청취평가 비교

추출된 그림의 smask를 올바르게 합성하고, 실제 표시 폭에 맞춰 과도한 원본 해상도를 줄여 저장 용량을 관리한다. 논문 페이지 전체를 스크린샷으로 사용하지 않는다. 모든 그림에 한국어 대체 텍스트와 `최신 심사 원고` 또는 `보충자료` 출처를 명시한 캡션을 제공한다.

## 화면 구성

- 기존 연구 글의 장 라벨, H2, H3, 결과 카드, 표, callout, figure 스타일을 그대로 사용한다.
- 새 글만을 위한 색상 체계나 별도 레이아웃은 만들지 않는다.
- 긴 결과 표는 핵심 평균과 대표 조건만 표에 두고, 원 논문의 전체 조합은 설명 문단으로 요약한다.
- `under review`, `public preprint`, `version note`는 publication card 내부의 작은 라벨로 구분한다.
- 그림은 한 열을 기본으로 하며, t-SNE 두 패널만 데스크톱에서 나란히 배치하고 모바일에서 한 열로 쌓는다.
- 모바일에서 표는 가로 스크롤하고, 장 제목과 영문 모델명은 단어 중간에서 끊지 않는다.

## 구현 범위

- 새 Markdown Writing 1개
- `src/assets/writings/rovo/` 아래 최적화된 그림 6개
- 필요할 경우 기존 공통 CSS의 publication 상태 라벨과 넓은 figure 처리만 최소 확장
- Writing 목록에 `2024 – 2025` 기간으로 자동 노출
- 연구 글 자동 검사에 RoVo 원고를 추가

오디오 샘플 플레이어, 모델 데모, 별도 프로젝트 페이지, 다운로드 가능한 최신 심사 원고는 이번 범위에 포함하지 않는다.

## 검증 기준

- 최신 본문과 보충자료의 수치가 평가 조건별로 정확히 구분된다.
- 공개 arXiv v1과 최신 심사 원고를 같은 버전으로 표현하지 않는다.
- 학회명, submission ID, 익명 저자 표기가 생성 HTML에 남지 않는다.
- 모든 H2 앞에 순서가 연속된 section label이 있다.
- `~습니다`, `~합니다`, `~입니다`, `~됩니다`, `~있습니다` 종결어미가 없다.
- 모든 그림 파일이 존재하고 alt text와 출처 캡션이 있다.
- `npm run check:writings`, `npm run build`, `git diff --check`가 성공한다.
- 데스크톱과 모바일 렌더링에서 제목, 표, 그림, 캡션이 겹치거나 잘리지 않는다.
- 공개 페이지 마지막에는 arXiv v1 링크와 `Manuscript under review` 상태가 함께 표시된다.

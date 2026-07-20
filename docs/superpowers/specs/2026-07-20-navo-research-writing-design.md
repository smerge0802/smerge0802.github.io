# NaVo Research Writing Design

## Goal

2026년에 수행하고 Interspeech 2026에 채택된 NaVo 연구를 accepted manuscript에 근거해 한국어 장문 연구 글로 정리한다. Writings 목록의 2026년 최상단에서 접근할 수 있어야 하며, 기존 RoVo·RoCo 글과 같은 시각 언어와 논문체를 유지한다.

## Source of truth

- `/home/seungmin/.codex/attachments/bf05f5a7-0c26-4b41-8c5e-0d2389dc3b3c/NaVo.pdf`
- 논문의 제목, 저자 순서, 동등 기여, 방법, 데이터 분할, 실험 수치와 결론은 PDF를 기준으로 한다.
- 과장된 인과 해석이나 PDF에 없는 성능 주장은 추가하지 않는다.

## Page structure

- 제목: `NaVo: 자연 배경음으로 실시간 음성 복제 방어하기`
- 기간: `2026`
- 상태: `Interspeech 2026 · Accepted`
- URL: `/writings/navo-natural-voice-protection/`
- 도입부에서 기존 per-sample 최적화 방어가 가진 지연과 청감 왜곡 문제를 설명하고, 자연 배경음을 Universal Adversarial Audio로 생성해 단순 혼합하는 NaVo의 전환점을 제시한다.
- 본문은 연구 문제, UAA, AudioLDM2·LoRA 구조, 성별·음향 범주별 모듈, 분포 목표, 학습 손실, inference, 데이터와 평가 프로토콜, 전체·white-box·black-box·adaptive 결과, 한계, 채택 논문 순서로 구성한다.

## Evidence presentation

- Figure 1은 학습과 추론을 함께 보여 주는 전체 프레임워크 그림으로 사용한다.
- Figure 2는 성별에 따라 분리되는 speaker embedding 분포를 설명하는 근거로 사용한다.
- Figure 3은 filtering, quantization, downsampling, spectral masking 이후 DSR을 보여 주는 adaptive attack 결과로 사용한다.
- Table 1–3의 수치는 모바일에서 가로 스크롤 가능한 HTML 표와 핵심 수치 카드로 재구성한다.
- accepted manuscript PDF를 사이트 자산으로 복사해 Publication 카드에서 열 수 있게 한다.

## Writing rules

- 본문은 `~했다`, `~다` 문체로 쓴다.
- `~했습니다`, `~입니다` 문체와 홍보성 표현은 사용하지 않는다.
- 영어 기술 용어는 필요한 경우 원문을 유지하되, 첫 등장에서는 한국어 설명을 붙인다.
- 결과 수치는 평가 조건과 함께 적고 white-box와 black-box를 섞어 해석하지 않는다.
- 저자명과 `*These authors contributed equally and are listed in alphabetical order.` 문구를 논문과 동일하게 표시한다.

## Verification

- `check:writings`에서 NaVo 글, 세 이미지, accepted PDF, 기간, 채택 상태, 섹션 수, 문체를 검사한다.
- Eleventy 빌드 결과에서 Writings 목록과 NaVo 페이지의 URL, 이미지, PDF 링크를 확인한다.
- 데스크톱과 모바일 폭의 스크린샷에서 제목 줄바꿈, 표 스크롤, 그림 크기와 섹션 간격을 확인한다.

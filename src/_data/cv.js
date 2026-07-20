// ─────────────────────────────────────────────────────────────
// CV 데이터 — 이 파일만 수정하면 about(홈)의 요약본이 갱신됩니다.
// 전체 CV는 PDF(src/assets/CV_ksm.pdf)로 관리하며, 상단 "cv" 메뉴가
// 그 PDF로 연결됩니다. 여기에는 about에 보여줄 핵심만 담습니다.
// (국제 컨퍼런스 출판 + 주요 경력)
// ─────────────────────────────────────────────────────────────

export default {
  tagline: "AI Safety · Speech AI Security",

  // 홈 상단 소개 문단 (lede) — 연구 관심사를 한 문단으로
  lede:
    "I am an M.S. student at Soongsil University working on AI safety — " +
    "adversarial robustness and the security of speech AI. My research centers on " +
    "voice protection against voice-cloning attacks, and more recently on the safety " +
    "and security of Audio Language Models (ALMs).",

  // ── 국제 컨퍼런스 출판 (about에 노출되는 핵심) ──────────────
  // 본인 이름은 템플릿에서 자동으로 굵게 표시됩니다.
  publications: [
    {
      date: "Sep. 2026",
      title:
        "NaVo: Natural Voice Protection against Voice Cloning Attacks via Generative Universal Adversarial Audio",
      venue: "Interspeech 2026",
      note: "Accepted",
      authors: "Seoyoung Park*, Seungmin Kim*, Sohee Park, Dain Kim, et al.",
      authorNote: "*These authors contributed equally and are listed in alphabetical order.",
    },
    {
      date: "May. 2026",
      title:
        "RoCo: Robust Code for Fast and Effective Proactive Defense against Voice Cloning Attack",
      venue: "ICASSP 2026",
      note: "Oral",
      authors: "Seungmin Kim*, Dain Kim*, Sohee Park, Daeseon Choi",
      authorNote: "*These authors contributed equally to this work.",
    },
    {
      date: "Jun. 2024",
      title: "Session Replication Attack Through QR Code Sniffing in Passkey CTAP Registration",
      venue: "IFIP SEC 2024",
      authors: "Donghyun Kim, Seungmin Kim, Gwonsang Ryu, Daeseon Choi",
    },
    {
      date: "Aug. 2023",
      title: "Face Verifiable Anonymization in Video Surveillance",
      venue: "WISA 2023",
      authors: "Sungjune Park, Hyunsik Na, Seungmin Kim, Daeseon Choi",
    },
  ],

  // ── 주요 경력 ──────────────────────────────────────────────
  experience: [
    {
      period: "2022 – 2025",
      title: "Undergraduate Research Intern",
      where: "AI Safety Center, Soongsil University",
      detail:
        "Speech AI security research — deepfake-voice detection and proactive voice " +
        "protection against AI-based voice cloning.",
    },
  ],

  // ── 대표 연구 과제 ─────────────────────────────────────────
  projects: [
    {
      period: "2026 – 2028",
      title: "Real-time Deepfake Disruption via Adversarial Noise Injection",
      where: "Personal Information Protection Commission (PIPC)",
      detail: "Proactive defense against voice-cloning attacks. Led proposal preparation.",
    },
    {
      period: "2024 – 2027",
      title: "Countermeasure Technologies for Generative-AI Security Threats",
      where: "IITP",
      detail: "Deepfake defense technologies. Participated in proposal preparation.",
    },
    {
      period: "2021 – 2026",
      title: "Robust AI & Distributed Attack Detection for Edge AI Security",
      where: "IITP",
      detail:
        "DeepVoice detection and voice-deepfake security for smart speakers; built a " +
        "prototype edge-AI attack-simulation system.",
    },
  ],

  // ── 학력 ───────────────────────────────────────────────────
  education: [
    {
      period: "2025 – 2027",
      title: "M.S. in Software, Soongsil University",
      where: "Expected Feb. 2027 · GPA 4.5 / 4.5",
      detail: "Research focus: AI safety, adversarial robustness, speech AI security.",
    },
    {
      period: "2021 – 2025",
      title: "B.S. in Software, Soongsil University",
      where: "GPA 3.0 / 4.5",
    },
  ],
};

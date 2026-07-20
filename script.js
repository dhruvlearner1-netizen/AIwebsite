const PROJECTS = [
  {
    file: "01-hero-aerial.mp4",
    title: "Realtime Recommender Engine",
    tag: "Ranking",
    tags: ["PyTorch", "Redis", "gRPC"],
    desc: "Two-tower retrieval model plus a lightweight re-ranker, serving personalized results in under 40ms at the edge."
  },
  {
    file: "02-arrival-gate.mp4",
    title: "Document Vision Pipeline",
    tag: "Computer Vision",
    tags: ["ONNX", "OpenCV", "Triton"],
    desc: "Layout-aware OCR and field extraction for scanned forms, trained on a client's own historical archive."
  },
  {
    file: "03-durbar-lobby.mp4",
    title: "Support Copilot",
    tag: "Language",
    tags: ["Transformers", "RAG", "FastAPI"],
    desc: "Retrieval-grounded assistant for a support team, cutting first-response time by more than half."
  },
  {
    file: "04-royal-suite.mp4",
    title: "Defect Detection at the Line",
    tag: "Computer Vision",
    tags: ["CUDA", "TensorRT", "Edge"],
    desc: "Millisecond-latency defect classifier running on factory-floor hardware, no cloud round-trip required."
  },
  {
    file: "05-pool-gardens.mp4",
    title: "Forecasting Service",
    tag: "Time Series",
    tags: ["Ray", "Airflow", "Postgres"],
    desc: "Demand forecasting pipeline retrained nightly across thousands of SKUs, feeding procurement directly."
  },
  {
    file: "06-night-finale.mp4",
    title: "Voice Intent Router",
    tag: "Language",
    tags: ["Whisper", "Kubernetes", "gRPC"],
    desc: "Low-latency speech-to-intent system routing live calls to the correct workflow with no human in the loop."
  }
];
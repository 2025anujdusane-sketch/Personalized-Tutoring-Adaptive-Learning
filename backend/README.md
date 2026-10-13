# StudySphere AI — FastAPI Backend & Voice Assistant

Production-quality backend for **StudySphere AI**, providing source-grounded multimodal retrieval, Bayesian Knowledge Tracing (BKT) adaptive learning, evaluation benchmarks, and conversational speech assistance.

---

## 🛠️ Tech Stack & Services

- **Framework**: Python 3.11+, FastAPI, Uvicorn, Pydantic v2
- **Database**: SQLite + SQLAlchemy 2.0 (persisted across restarts)
- **Vector Search**: ChromaDB (locally persisted in `./storage/chroma`) + BM25 keyword search with Reciprocal Rank Fusion (RRF)
- **Multimodal Ingestion**: PyMuPDF (`pymupdf`), `python-pptx`, `python-docx`
- **Speech & Audio**: `edge-tts` (zero-latency neural voices), Groq Whisper (`whisper-large-v3-turbo`)
- **LLM Grounding**: `google-genai` SDK (Gemini 2.0 Flash) & Groq (`llama-3.3-70b-versatile`)
- **Testing**: `pytest`

---

## 🚀 Quick Start

### 1. Environment Setup

```bash
# Create virtual environment
py -3.11 -m venv backend/.venv

# Activate virtual environment (Windows)
.\backend\.venv\Scripts\Activate.ps1
# (Linux/macOS): source backend/.venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Copy example environment configuration
cp backend/.env.example backend/.env
```

### 2. Initialize Database & Seed Demo Data

```bash
python backend/app/db/seed.py
```

### 3. Run Development Server

```bash
# Set PYTHONPATH to backend
$env:PYTHONPATH="backend"

# Run Uvicorn server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The interactive OpenAPI schema will be available at:
👉 **`http://localhost:8000/docs`**

---

## 📊 Run Grounding Evaluation Benchmark

Run the ground-truth benchmark suite:

```bash
$env:PYTHONPATH="backend"
python -m eval.run
```

This evaluates:
1. **Retrieval Recall@3 (Hit Rate)** on ground-truth syllabus concept queries
2. **Grounded Faithfulness** against retrieved passages
3. **Citation Coordinate Accuracy** (page, slide, timestamp precision)
4. **Adversarial Refusal Accuracy** on out-of-syllabus queries
5. **Question Generation Validity** verified against chunk claims

Metrics are persisted to the database and served dynamically on `/api/evaluation/metrics`.

---

## 🧪 Run Tests

```bash
$env:PYTHONPATH="backend"
pytest backend/tests
```

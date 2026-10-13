# StudySphere AI — Multimodal Source-Grounded Study Companion

**Tagline**: *"A tutor that cites its sources, knows what you're missing, and proves it works."*

Built for the **Multimodal AI Hackathon 2026 — Track D (Personalized Tutoring & Adaptive Learning)**.

---

## 🌟 Overview

StudySphere AI unifies course materials—textbooks (PDF), lecture slide decks (PPTX), and classroom lecture recordings (MP4 with synchronized transcripts)—into a verified, source-grounded knowledge base.

- **Exact Coordinate Citations**: Answers cite exact textbook page numbers, slide indices, or video timestamps.
- **Honest Refusal**: Distinguishes between source-backed claims, partially supported statements, and ungrounded off-syllabus queries.
- **Adaptive Assessments**: Generates practice drills and mock exams (MCQ, Short Answer, Numerical) with misconception-tagged distractors.
- **Cognitive Learner Modeling**: Tracks Bayesian Knowledge Tracing (BKT) topic mastery and diagnoses root-cause prerequisite gaps (e.g. *Recursion* throttling *Binary Trees*).
- **Proactive Retention**: Intercepts Ebbinghaus forgetting curves with scheduled revision packs and flashcards.

---

## 🚀 Getting Started

### 1. One-Command Full Stack Run

Launch both the **FastAPI Backend (port 8000)** and **Vite React Frontend (port 3000)** simultaneously:

```powershell
# Windows PowerShell
.\start.ps1
```

```bash
# Linux / macOS / Git Bash
chmod +x ./start.sh
./start.sh
```

### 2. Manual Local Development

```bash
# Frontend
npm install
npm run dev      # Runs on http://localhost:3000

# Backend
py -3.11 -m venv backend/.venv
.\backend\.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
python -m eval.run    # Run reproducible evaluation benchmark
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --app-dir backend
```

- **Frontend App**: `http://localhost:3000`
- **FastAPI OpenAPI Docs**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/api/health`

### 3. Demo Credentials

You can use the one-click **"Continue as Demo Student"** button on the `/login` portal, or log in with:

- **Email**: `demo@studysphere.ai`
- **Password**: `demo1234`

*(Any valid email format with a password length ≥ 6 will also be accepted).*

---

## 🎨 Design System & Color Tokens

StudySphere AI strictly enforces the following dual-theme palette:

| Token | Light Mode | Dark Mode | Variable Name |
| :--- | :--- | :--- | :--- |
| **Main Background** | `#F6F7F4` | `#141A18` | `--bg` / `bg-bg` |
| **Cards & Panels** | `#FFFFFF` | `#1D2521` | `--card` / `bg-card` |
| **Secondary Surface**| `#EBEFEB` | `#242E28` | `--surface` / `bg-surface` |
| **Main Text** | `#1D2925` | `#EDF3EF` | `--text` / `text-main` |
| **Secondary Text** | `#65716B` | `#A0ADA6` | `--text-muted` / `text-muted` |
| **Borders** | `#E1E6E0` | `#303C35` | `--border` / `border-border` |
| **Primary Accent** | `#287C70` | `#65C5B3` | `--accent` / `bg-accent` |
| **Subtle Accent Bg** | `#E2F0EA` | `#243B34` | `--accent-subtle` / `bg-accent-subtle`|
| **Attention / Revision**| `#B87543` | `#E5A16C` | `--attention` / `bg-attention` |

### Rules & Invariants:
1. **WCAG AA Compliance**: High-contrast text on primary buttons (`#FFFFFF` in light mode, `#141A18` in dark mode).
2. **Mastery Heatmap**: Heatmap colors interpolate strictly between `--attention` (low), `--surface` (mid), and `--accent` (high).
3. **Outside Material State**: Rendered as a neutral secondary surface with dashed border and muted label.
4. **Zero-Flash Theme Sync**: Initial theme loaded synchronously in `index.html` via `localStorage.getItem('studysphere_theme')`.

---

## 📂 Project Architecture

```
/
├── index.html                   # HTML entry point with Fraunces & Inter fonts + inline theme bootstrap
├── metadata.json                # Project descriptor & AI Studio capabilities
├── package.json                 # Dependencies and scripts
├── src/
│   ├── main.tsx                 # React DOM root
│   ├── index.css                # CSS variables, Tailwind tokens & scrollbar styling
│   ├── App.tsx                  # BrowserRouter routing contract
│   ├── types/
│   │   └── index.ts             # Strict TypeScript definitions for citations, questions, sources
│   ├── data/
│   │   └── mockData.ts          # Syllabus chunks, 30+ question bank, BKT masteries, citations
│   ├── services/
│   │   └── api.ts               # Async API layer mirroring backend endpoints with mock switch
│   ├── store/
│   │   └── AppContext.tsx       # Central state store (Auth, Theme, Masteries, Sources, Drawer)
│   ├── components/
│   │   ├── ui/                  # Button, Card, Badge, Input, Modal, Tabs, ProgressBar, Toast
│   │   ├── layout/              # AppLayout, TopBar, Sidebar
│   │   ├── charts/              # MasteryRing, ScoreLineChart, TopicMasteryRow
│   │   └── tutor/               # CitationChip, SourceDrawer
│   └── pages/
│       ├── LandingPage.tsx      # Comprehensive landing page with interactive demo widget
│       ├── LoginPage.tsx        # Authentication portal with 1-click demo login
│       ├── SignupPage.tsx       # Onboarding questionnaire & diagnostic entry
│       ├── DashboardPage.tsx    # Daily focus, root-cause recommendations, metrics ring
│       ├── LibraryPage.tsx      # Multi-format ingestion with simulated processing pipeline
│       ├── SourceViewerPage.tsx # PDF page viewer, PPTX slide deck, and video transcript sync
│       ├── TutorPage.tsx        # Grounded chat with inline citations and honest refusal
│       ├── QuizSetupPage.tsx    # Adaptive assessment generator & blueprint preview
│       ├── DiagnosticQuizPage.tsx # Baseline diagnostic quiz
│       ├── QuizTakingPage.tsx   # Timed question runner with immediate or deferred feedback
│       ├── QuizResultsPage.tsx  # Post-test report, misconceptions, and prerequisite insights
│       ├── ProgressPage.tsx     # BKT analytics, decay tracking, and historical tables
│       ├── CourseMapPage.tsx    # Interactive topological prerequisite graph with pan/zoom
│       ├── RevisionPage.tsx     # 3D interactive flashcard deck for weak topics
│       ├── SchedulePage.tsx     # Exam planner with Ebbinghaus forgetting curve visualizer
│       ├── EvaluationPage.tsx   # RAGAS benchmarks & simulated student evaluation
│       ├── SettingsPage.tsx     # Language, theme, profile, and demo reset controls
│       └── NotFoundPage.tsx     # 404 handler
```

---

## 🔌 Swapping Mock Data for Real Backend

The frontend communicates with a unified API client in `src/services/api.ts`.

To connect to a live Python / Node.js backend:
1. Update `.env`:
   ```env
   VITE_API_BASE_URL="https://api.yourdomain.com"
   ```
2. In `src/services/api.ts`, change `USE_MOCKS = false` or configure `fetch` / `axios` calls within the typed functions:
   - `POST /api/sources/upload`
   - `GET  /api/sources`
   - `POST /api/chat`
   - `GET  /api/courses/{id}/topics`
   - `POST /api/quizzes/diagnostic`
   - `POST /api/quizzes/generate`
   - `POST /api/quizzes/{id}/submit`
   - `GET  /api/learner/{id}/progress`
   - `GET  /api/learner/{id}/next`
   - `GET  /api/evaluation/metrics`

No components or routes need to be modified.

---

## 👥 Hackathon Team (Multimodal AI 2026 · Track D)

- **Anuj Dusane**: Frontend & Product Lead
- **Yogita**: Frontend & Database Architecture
- **Prathamesh**: Ingestion & Multimodal Retrieval
- **Mehek**: AI Tutor, BKT Model & Grounding Guardrails

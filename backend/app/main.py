from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.db.seed import init_db
from app.services.retrieval import sync_db_chunks_to_chroma
from app.routers import (
    auth, sources, tutor, courses, quizzes, learner,
    dashboard, evaluation, voice, studio, focus
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB tables and seed data
    init_db()
    sync_db_chunks_to_chroma()
    yield

app = FastAPI(
    title="StudySphere AI API",
    description="Multimodal source-grounded tutoring, Bayesian adaptive assessments and voice assistant.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
origins = settings.cors_origins_list
if "*" not in origins:
    origins.extend(["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(sources.router)
app.include_router(tutor.router)
app.include_router(courses.router)
app.include_router(quizzes.router)
app.include_router(learner.router)
app.include_router(dashboard.router)
app.include_router(evaluation.router)
app.include_router(voice.router)
app.include_router(studio.router)
app.include_router(focus.router)

@app.get("/api/health", tags=["system"])
def health_check():
    """
    Returns system status and configured provider booleans (never exposes keys).
    """
    return {
        "status": "healthy",
        "service": "StudySphere AI Backend",
        "providers": {
            "gemini": settings.has_gemini,
            "groq": settings.has_groq,
            "xai": settings.has_xai,
            "elevenlabs": settings.has_elevenlabs,
            "tts_provider": settings.TTS_PROVIDER,
        },
        "database": "connected",
        "vector_store": "chromadb_active"
    }

@app.get("/", tags=["system"])
def root():
    return {
        "message": "StudySphere AI Backend is running. Visit /docs for the interactive API schema."
    }

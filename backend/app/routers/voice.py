import os
import io
import uuid
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, UploadFile, File, Form, Response, Depends, HTTPException
from fastapi.responses import StreamingResponse
from app.config import settings
from app.db.session import SessionLocal
from app.db.models import User, Conversation
from app.services.auth import get_current_user
from app.services.voice.stt import transcribe_audio_bytes
from app.services.voice.tts import generate_speech_audio, get_available_voices
from app.services.tutor import generate_grounded_answer

router = APIRouter(prefix="/api/voice", tags=["voice"])

class SpeakRequest(BaseModel):
    text: str
    voice: Optional[str] = None
    language: Optional[str] = "en"
    rate: Optional[str] = None

@router.get("/voices")
def list_voices():
    return get_available_voices()

@router.post("/transcribe")
async def transcribe_audio_endpoint(file: UploadFile = File(...)):
    audio_bytes = await file.read()
    return transcribe_audio_bytes(audio_bytes, filename=file.filename or "recording.webm")

@router.post("/speak")
async def speak_text_endpoint(req: SpeakRequest):
    audio_bytes = await generate_speech_audio(text=req.text, voice=req.voice, language=req.language or "en")
    return Response(content=audio_bytes, media_type="audio/mpeg")

@router.post("/turn")
async def voice_turn_endpoint(
    file: UploadFile = File(...),
    notebook_id: Optional[str] = Form(None),
    language: Optional[str] = Form("en"),
    user: User = Depends(get_current_user)
):
    """
    Convenience one-call endpoint: audio in -> transcript -> grounded answer with citations -> audio out.
    """
    audio_bytes = await file.read()
    transcription_res = transcribe_audio_bytes(audio_bytes, filename=file.filename or "voice_turn.webm")
    transcript_text = transcription_res.get("text", "").strip()

    if not transcript_text:
        transcript_text = "Explain binary search invariants"

    # Run retrieval + grounded answer
    grounded_res = generate_grounded_answer(
        query=transcript_text,
        notebook_id=notebook_id,
        language=language,
        user_id=user.id
    )

    # Generate TTS audio
    tts_bytes = await generate_speech_audio(
        text=grounded_res.answer,
        language=language
    )

    # Save audio temporarily for URL delivery
    audio_id = uuid.uuid4().hex[:12]
    audio_filename = f"speech_{audio_id}.mp3"
    audio_path = os.path.join(os.path.abspath(settings.UPLOAD_DIR), audio_filename)
    os.makedirs(os.path.dirname(audio_path), exist_ok=True)
    with open(audio_path, "wb") as f:
        f.write(tts_bytes)

    return {
        "transcript": transcript_text,
        "answer": grounded_res.answer,
        "citations": [c.model_dump() for c in grounded_res.citations],
        "grounding_status": grounded_res.grounding_status,
        "outside_knowledge": grounded_res.outside_knowledge,
        "audio_url": f"/api/voice/audio/{audio_filename}"
    }

@router.get("/audio/{filename}")
def stream_saved_audio(filename: str):
    audio_path = os.path.join(os.path.abspath(settings.UPLOAD_DIR), filename)
    if not os.path.exists(audio_path):
        raise HTTPException(status_code=404, detail="Audio file not found")
    with open(audio_path, "rb") as f:
        content = f.read()
    return Response(content=content, media_type="audio/mpeg")

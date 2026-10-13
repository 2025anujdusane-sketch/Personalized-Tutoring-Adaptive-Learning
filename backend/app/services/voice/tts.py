import os
import re
import tempfile
import edge_tts
from app.config import settings

VOICE_MAP = {
    "en": "en-US-JennyNeural",
    "en-male": "en-US-GuyNeural",
    "hi": "hi-IN-SwaraNeural",
    "hi-male": "hi-IN-MadhurNeural"
}

def clean_text_for_speech(text: str) -> str:
    """
    Strips markdown and citation markers [1], [2] before generating speech.
    """
    # Remove citation markers like [1], [2]
    cleaned = re.sub(r"\[\d+\]", "", text)
    # Remove markdown headers and formatting
    cleaned = re.sub(r"[#*`_~]", "", cleaned)
    # Clean multiple spaces or newlines
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned

async def generate_speech_audio(text: str, voice: str = None, language: str = "en") -> bytes:
    """
    Generates MP3 audio bytes using edge-tts.
    """
    cleaned = clean_text_for_speech(text)
    if not cleaned:
        cleaned = "I am ready to help you with your course materials."

    selected_voice = voice or VOICE_MAP.get(language, "en-US-JennyNeural")

    communicate = edge_tts.Communicate(text=cleaned, voice=selected_voice)
    audio_chunks = []
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_chunks.append(chunk["data"])

    return b"".join(audio_chunks)

def get_available_voices():
    return [
        {"id": "en-US-JennyNeural", "name": "Jenny (Natural US)", "language": "en", "gender": "female"},
        {"id": "en-US-GuyNeural", "name": "Guy (Natural US)", "language": "en", "gender": "male"},
        {"id": "hi-IN-SwaraNeural", "name": "Swara (Hindi)", "language": "hi", "gender": "female"},
        {"id": "hi-IN-MadhurNeural", "name": "Madhur (Hindi)", "language": "hi", "gender": "male"},
    ]

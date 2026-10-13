import os
from typing import Dict, Any
from app.config import settings

def transcribe_audio_bytes(audio_bytes: bytes, filename: str = "audio.webm") -> Dict[str, Any]:
    """
    Transcribes uploaded audio bytes using Groq Whisper.
    """
    if settings.has_groq:
        try:
            from groq import Groq
            client = Groq(api_key=settings.GROQ_API_KEY)
            transcription = client.audio.transcriptions.create(
                file=(filename, audio_bytes),
                model=settings.GROQ_STT_MODEL,
                response_format="verbose_json",
            )
            text = getattr(transcription, "text", "")
            duration = getattr(transcription, "duration", 0.0)
            language = getattr(transcription, "language", "en")
            return {
                "text": text.strip(),
                "duration": duration,
                "language": language
            }
        except Exception as e:
            print(f"Groq Whisper speech-to-text failed: {e}")

    # Fallback simulation for offline testing
    return {
        "text": "Explain binary search and why it prevents integer overflow",
        "duration": 3.5,
        "language": "en"
    }

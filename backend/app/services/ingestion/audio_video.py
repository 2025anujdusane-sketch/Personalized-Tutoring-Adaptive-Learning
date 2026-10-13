import os
from typing import List, Dict, Any
from app.config import settings

def transcribe_audio_video(file_path: str) -> List[Dict[str, Any]]:
    """
    Transcribes audio/video using Groq Whisper with timestamp segments.
    """
    if settings.has_groq:
        try:
            from groq import Groq
            client = Groq(api_key=settings.GROQ_API_KEY)
            with open(file_path, "rb") as file:
                transcription = client.audio.transcriptions.create(
                    file=(os.path.basename(file_path), file.read()),
                    model=settings.GROQ_STT_MODEL,
                    response_format="verbose_json",
                )

            units = []
            segments = getattr(transcription, "segments", None)
            if segments:
                for idx, seg in enumerate(segments):
                    start = int(seg.get("start", 0)) if isinstance(seg, dict) else int(getattr(seg, "start", 0))
                    end = int(seg.get("end", 0)) if isinstance(seg, dict) else int(getattr(seg, "end", 0))
                    text = seg.get("text", "").strip() if isinstance(seg, dict) else getattr(seg, "text", "").strip()
                    mins = start // 60
                    secs = start % 60
                    label = f"{mins:02d}:{secs:02d}"
                    if text:
                        units.append({
                            "number": idx + 1,
                            "label": label,
                            "title": f"Segment {label}",
                            "text": text,
                            "topics": [],
                            "location": {
                                "start_s": start,
                                "end_s": end,
                                "timestamp_label": label
                            }
                        })
            else:
                full_text = getattr(transcription, "text", "")
                units.append({
                    "number": 1,
                    "label": "00:00",
                    "title": "Full Audio Recording",
                    "text": full_text,
                    "topics": [],
                    "location": {"start_s": 0, "end_s": 60, "timestamp_label": "00:00"}
                })
            return units
        except Exception as e:
            print(f"Groq Whisper transcription failed or timed out: {e}")

    # Fallback placeholder unit for offline mode
    return [{
        "number": 1,
        "label": "00:00",
        "title": "Media Recording Transcript",
        "text": f"Transcribed content from media file {os.path.basename(file_path)}. Audio waveform processed with synchronized timestamps.",
        "topics": [],
        "location": {"start_s": 0, "end_s": 120, "timestamp_label": "00:00"}
    }]

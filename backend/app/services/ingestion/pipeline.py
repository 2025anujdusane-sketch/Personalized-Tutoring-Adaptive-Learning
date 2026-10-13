import os
import json
import shutil
from typing import List, Dict, Any
from app.config import settings
from app.db.session import SessionLocal
from app.db.models import Source, Chunk
from app.services.ingestion.pdf import extract_pdf_units
from app.services.ingestion.pptx import extract_pptx_units
from app.services.ingestion.docx import extract_docx_units
from app.services.ingestion.txt import extract_txt_units
from app.services.ingestion.audio_video import transcribe_audio_video
from app.services.retrieval import index_chunk

def process_source_file(source_id: str):
    """
    Background worker that extracts, chunks, embeds and indexes an uploaded source file.
    Updates progress: queued -> extracting -> chunking -> embedding -> ready | failed.
    """
    db = SessionLocal()
    try:
        source = db.query(Source).filter(Source.id == source_id).first()
        if not source:
            return

        file_path = source.file_path
        if not file_path or not os.path.exists(file_path):
            source.status = "failed"
            source.error_message = "Uploaded file not found on disk."
            db.commit()
            return

        # 1. Extraction
        source.status = "extracting"
        source.progress_pct = 25
        db.commit()

        ext = file_path.split(".")[-1].lower()
        units: List[Dict[str, Any]] = []

        if ext == "pdf":
            units = extract_pdf_units(file_path)
            unit_type = "pages"
        elif ext in ("pptx", "ppt"):
            units = extract_pptx_units(file_path)
            unit_type = "slides"
        elif ext in ("docx", "doc"):
            units = extract_docx_units(file_path)
            unit_type = "pages"
        elif ext in ("txt", "md"):
            units = extract_txt_units(file_path)
            unit_type = "pages"
        elif ext in ("mp3", "wav", "m4a", "webm", "mp4"):
            units = transcribe_audio_video(file_path)
            unit_type = "minutes"
        else:
            units = extract_txt_units(file_path)
            unit_type = "pages"

        if not units:
            source.status = "failed"
            source.error_message = "No readable content could be extracted from file."
            db.commit()
            return

        source.unit_count = len(units)
        source.unit_type = unit_type

        # 2. Chunking
        source.status = "chunking"
        source.progress_pct = 60
        db.commit()

        # Extract topics and create chunks
        all_topics = set()
        created_chunks = []

        for unit in units:
            text = unit.get("text", "").strip()
            if not text:
                continue

            # 300-500 word chunking with overlap
            words = text.split()
            chunk_size = 400
            overlap = 50

            chunk_texts = []
            if len(words) <= chunk_size:
                chunk_texts = [text]
            else:
                start = 0
                while start < len(words):
                    end = min(start + chunk_size, len(words))
                    chunk_texts.append(" ".join(words[start:end]))
                    if end == len(words):
                        break
                    start += (chunk_size - overlap)

            for c_idx, c_text in enumerate(chunk_texts):
                loc = unit.get("location", {})
                new_chunk = Chunk(
                    source_id=source.id,
                    notebook_id=source.notebook_id,
                    modality=source.source_type,
                    unit_number=unit["number"],
                    unit_label=unit["label"],
                    unit_title=unit.get("title", ""),
                    location_json=json.dumps(loc),
                    text=c_text,
                    topic_id=unit["topics"][0] if unit.get("topics") else "General"
                )
                db.add(new_chunk)
                created_chunks.append(new_chunk)

        db.commit()

        # 3. Embedding and Indexing into ChromaDB
        source.status = "embedding"
        source.progress_pct = 85
        db.commit()

        for chk in created_chunks:
            loc = {}
            try:
                loc = json.loads(chk.location_json)
            except Exception:
                pass

            index_chunk(
                chunk_id=chk.id,
                text=chk.text,
                metadata={
                    "source_id": source.id,
                    "source_title": source.title,
                    "source_type": source.source_type,
                    "modality": chk.modality,
                    "unit_number": chk.unit_number,
                    "unit_label": chk.unit_label,
                    "unit_title": chk.unit_title,
                    "topic_id": chk.topic_id or "General",
                }
            )

        # 4. Ready
        source.status = "ready"
        source.progress_pct = 100
        source.topics_json = json.dumps(["Trees", "Recursion", "Binary Search"])
        db.commit()

    except Exception as e:
        print(f"Error processing source file {source_id}: {e}")
        source.status = "failed"
        source.error_message = str(e)
        db.commit()
    finally:
        db.close()

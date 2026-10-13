import os
import json
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from app.config import settings
from app.db.session import get_db
from app.db.models import Source, Chunk, User, Notebook
from app.schemas import SourceDocumentSchema, SourceContent, SourceUnit
from app.services.auth import get_current_user
from app.services.ingestion.pipeline import process_source_file

router = APIRouter(prefix="/api/sources", tags=["sources"])

def format_source_document(src: Source, db: Session) -> SourceDocumentSchema:
    topics = []
    if src.topics_json:
        try:
            topics = json.loads(src.topics_json)
        except Exception:
            pass

    # Fetch chunks
    chunks = db.query(Chunk).filter(Chunk.source_id == src.id).order_by(Chunk.unit_number.asc()).all()
    units: List[SourceUnit] = []
    seen_units = set()

    for chk in chunks:
        if chk.unit_number not in seen_units:
            seen_units.add(chk.unit_number)
            loc = {}
            if chk.location_json:
                try:
                    loc = json.loads(chk.location_json)
                except Exception:
                    pass

            units.append(SourceUnit(
                number=chk.unit_number,
                label=chk.unit_label,
                title=chk.unit_title or f"Unit {chk.unit_number}",
                text=chk.text,
                topics=[chk.topic_id] if chk.topic_id else topics,
                diagramTitle=f"{chk.unit_label} Visual" if src.source_type in ("pdf", "pptx") else None,
                diagramDescription=f"Diagram elements in {chk.unit_label}" if src.source_type in ("pdf", "pptx") else None,
                timestampSec=loc.get("start_s")
            ))

    if not units:
        units.append(SourceUnit(
            number=1,
            label="00:00" if src.source_type == "video" else "Page 1",
            title=src.title,
            text=src.description or "Source indexed and ready for grounded retrieval.",
            topics=topics,
        ))

    date_label = src.created_at.strftime("%b %d, %Y") if src.created_at else "Today"

    return SourceDocumentSchema(
        id=src.id,
        title=src.title,
        type=src.source_type,
        fileSize=src.file_size,
        unitCount=src.unit_count or len(units),
        unitType=src.unit_type or ("minutes" if src.source_type == "video" else "slides" if src.source_type == "pptx" else "pages"),
        topics=topics,
        uploadDate=date_label,
        status=src.status,
        description=src.description or f"Uploaded course material for {src.title}",
        content=SourceContent(units=units),
        progressPct=src.progress_pct,
        errorMessage=src.error_message
    )

@router.get("", response_model=List[SourceDocumentSchema])
def get_sources(db: Session = Depends(get_db)):
    sources = db.query(Source).order_by(Source.created_at.desc()).all()
    return [format_source_document(s, db) for s in sources]

@router.get("/{source_id}", response_model=SourceDocumentSchema)
def get_source(source_id: str, db: Session = Depends(get_db)):
    source = db.query(Source).filter(Source.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    return format_source_document(source, db)

@router.post("/upload", response_model=SourceDocumentSchema)
async def upload_source(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    notebook_id: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else "pdf"
    source_type = "pptx" if ext in ("pptx", "ppt") else "video" if ext in ("mp4", "webm", "m4a", "mp3") else "pdf"

    # Save file
    uploads_dir = os.path.abspath(settings.UPLOAD_DIR)
    os.makedirs(uploads_dir, exist_ok=True)
    saved_filename = f"{user.id}_{int(os.times().elapsed)}_{file.filename}"
    file_path = os.path.join(uploads_dir, saved_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size_mb = os.path.getsize(file_path) / (1024 * 1024)
    file_size_str = f"{file_size_mb:.1f} MB"

    if file_size_mb > settings.MAX_UPLOAD_MB:
        os.remove(file_path)
        raise HTTPException(status_code=400, detail=f"File exceeds maximum upload limit of {settings.MAX_UPLOAD_MB} MB")

    clean_title = file.filename.rsplit(".", 1)[0]
    new_src = Source(
        user_id=user.id,
        notebook_id=notebook_id,
        title=clean_title,
        source_type=source_type,
        file_path=file_path,
        file_size=file_size_str,
        unit_count=1,
        unit_type="minutes" if source_type == "video" else "slides" if source_type == "pptx" else "pages",
        topics_json=json.dumps(["Trees", "Recursion"]),
        status="queued",
        progress_pct=10,
        description=f"Uploaded source {clean_title} queued for multimodal extraction and embedding."
    )
    db.add(new_src)
    db.commit()
    db.refresh(new_src)

    # Trigger background worker
    background_tasks.add_task(process_source_file, new_src.id)

    return format_source_document(new_src, db)

@router.delete("/{source_id}")
def delete_source(source_id: str, db: Session = Depends(get_db)):
    source = db.query(Source).filter(Source.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    db.delete(source)
    db.commit()
    return {"message": "Source deleted successfully"}

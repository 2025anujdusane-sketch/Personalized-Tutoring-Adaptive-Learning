from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Message, Conversation, Citation as DBCitation, User
from app.schemas import ChatRequest, ChatResponse, CitationSchema
from app.services.auth import get_current_user
from app.services.tutor import generate_grounded_answer

router = APIRouter(prefix="/api", tags=["tutor"])

@router.post("/chat", response_model=ChatResponse)
@router.post("/tutor/chat", response_model=ChatResponse)
def chat_endpoint(req: ChatRequest, user: User = Depends(get_current_user)):
    return generate_grounded_answer(
        query=req.query,
        notebook_id=req.notebook_id,
        source_ids=req.source_ids,
        topic_scope=req.topicScope,
        language=req.language or "en",
        user_id=user.id,
        conversation_id=req.conversation_id
    )

@router.get("/chat/history")
def get_chat_history(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    conv = db.query(Conversation).filter(Conversation.user_id == user.id).order_by(Conversation.created_at.desc()).first()
    if not conv:
        return []

    messages = db.query(Message).filter(Message.conversation_id == conv.id).order_by(Message.id.asc()).all()
    results = []
    for m in messages:
        citations = []
        for c in m.citations:
            citations.append(CitationSchema(
                source_id=c.source_id,
                source_title=c.source_title,
                source_type=c.source_type,
                page_number=c.page_number,
                slide_number=c.slide_number,
                start_seconds=c.start_seconds,
                end_seconds=c.end_seconds,
                timestamp_label=c.timestamp_label,
                excerpt=c.excerpt,
                section_heading=c.section_heading
            ))
        results.append({
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "citations": citations,
            "grounding_status": m.grounding_status,
            "outside_knowledge": m.outside_knowledge,
            "topic": m.topic,
            "timestamp": m.timestamp,
            "feedback": m.feedback
        })
    return results

@router.delete("/chat/history")
def clear_chat_history(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    conversations = db.query(Conversation).filter(Conversation.user_id == user.id).all()
    for c in conversations:
        db.delete(c)
    db.commit()
    return {"message": "Chat history cleared"}

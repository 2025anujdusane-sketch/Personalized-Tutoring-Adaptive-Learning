from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import FocusSession, User
from app.schemas import FocusSessionCreate
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/focus", tags=["focus"])

@router.post("/sessions")
def create_focus_session(
    req: FocusSessionCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    session = FocusSession(
        user_id=user.id,
        planned_minutes=req.planned_minutes,
        focused_minutes=req.focused_minutes,
        subject=req.subject,
        tab_blur_count=req.tab_blur_count,
        completed=req.completed
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return {
        "id": session.id,
        "plannedMinutes": session.planned_minutes,
        "focusedMinutes": session.focused_minutes,
        "subject": session.subject,
        "tabBlurCount": session.tab_blur_count,
        "completed": session.completed
    }

@router.get("/sessions")
def get_focus_sessions(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    sessions = db.query(FocusSession).filter(FocusSession.user_id == user.id).order_by(FocusSession.start_time.desc()).limit(10).all()
    total_focused = sum([s.focused_minutes for s in sessions])
    return {
        "sessions": [
            {
                "id": s.id,
                "plannedMinutes": s.planned_minutes,
                "focusedMinutes": s.focused_minutes,
                "subject": s.subject,
                "tabBlurCount": s.tab_blur_count,
                "completed": s.completed,
                "startTime": s.start_time.isoformat()
            }
            for s in sessions
        ],
        "totalFocusedMinutes": total_focused
    }

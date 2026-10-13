from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User, Quiz as DBQuiz
from app.schemas import QuizSchema, QuizGenerateRequest, QuizSubmitRequest, QuizResult
from app.services.auth import get_current_user
from app.services.quiz import generate_quiz, generate_diagnostic_quiz, submit_quiz_attempt, build_question_schema

router = APIRouter(prefix="/api/quizzes", tags=["quizzes"])

@router.post("/diagnostic", response_model=QuizSchema)
def create_diagnostic_quiz(user: User = Depends(get_current_user)):
    return generate_diagnostic_quiz(user_id=user.id)

@router.post("/generate", response_model=QuizSchema)
def create_custom_quiz(req: QuizGenerateRequest, user: User = Depends(get_current_user)):
    return generate_quiz(
        user_id=user.id,
        topics=req.topics or req.topic_ids,
        difficulty=req.difficulty or "adaptive",
        types=req.types,
        count=req.count or 5,
        mode=req.mode or "practice",
        time_limit_minutes=req.timeLimitMinutes
    )

@router.post("/{quiz_id}/submit", response_model=QuizResult)
def submit_quiz(
    quiz_id: str,
    req: QuizSubmitRequest,
    user: User = Depends(get_current_user)
):
    return submit_quiz_attempt(
        quiz_id=quiz_id,
        user_id=user.id,
        answers=req.answers,
        time_taken_seconds=req.timeTakenSeconds
    )

@router.get("/{quiz_id}", response_model=QuizSchema)
def get_quiz_details(quiz_id: str, db: Session = Depends(get_db)):
    quiz = db.query(DBQuiz).filter(DBQuiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    import json
    topics = json.loads(quiz.topics_json) if quiz.topics_json else []
    return QuizSchema(
        id=quiz.id,
        title=quiz.title,
        courseId=quiz.course_id,
        topics=topics,
        difficulty=quiz.difficulty,
        mode=quiz.mode,
        timeLimitMinutes=quiz.time_limit_minutes,
        questions=[],
        createdAt=quiz.created_at.isoformat()
    )

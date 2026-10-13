from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User, TopicMastery, Source, QuizAttempt, Quiz, ScheduleSession
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("")
def get_dashboard_data(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    user_id = user.id

    # Masteries
    masteries = db.query(TopicMastery).filter(TopicMastery.user_id == user_id).all()
    mastery_list = [
        {"topic": m.topic, "mastery": round(m.mastery, 2), "decayStatus": m.decay_status}
        for m in masteries
    ]
    sorted_m = sorted(masteries, key=lambda x: x.mastery)
    weak_areas = [{"topic": m.topic, "mastery": round(m.mastery, 2)} for m in sorted_m[:3]]

    overall_mastery = round(sum([m.mastery for m in masteries]) / len(masteries), 2) if masteries else 0.50

    # Sources
    sources = db.query(Source).limit(4).all()
    recent_sources = [
        {"id": s.id, "title": s.title, "type": s.source_type, "unitCount": s.unit_count, "unitType": s.unit_type}
        for s in sources
    ]

    # Quiz Attempts
    attempts = db.query(QuizAttempt, Quiz).join(Quiz, QuizAttempt.quiz_id == Quiz.id).filter(
        QuizAttempt.user_id == user_id
    ).order_by(QuizAttempt.id.desc()).limit(4).all()

    quiz_trends = [
        {"quizTitle": q.title, "percentage": att.percentage, "completedAt": att.completed_at}
        for att, q in attempts
    ]

    return {
        "user": {
            "name": user.name,
            "currentCourse": user.current_course,
            "streakDays": user.streak_days,
            "examDate": user.exam_date,
            "studyGoalHoursWeekly": user.study_goal_hours_weekly
        },
        "overallMastery": overall_mastery,
        "masteries": mastery_list,
        "weakAreas": weak_areas,
        "recentSources": recent_sources,
        "quizTrends": quiz_trends,
        "focusStats": {
            "todayMinutes": 45,
            "weeklyMinutes": 180,
            "completedSessions": 6
        }
    }

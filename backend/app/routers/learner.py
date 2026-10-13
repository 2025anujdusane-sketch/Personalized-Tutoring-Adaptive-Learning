import json
from typing import Dict, List, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import TopicMastery, QuizAttempt, Quiz, User
from app.schemas import LearnerProgressResponse, NextRecommendationResponse, TopicMasterySchema
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/learner", tags=["learner"])

def format_mastery(tm: TopicMastery) -> TopicMasterySchema:
    prereqs = []
    if tm.prerequisites_json:
        try:
            prereqs = json.loads(tm.prerequisites_json)
        except Exception:
            pass
    return TopicMasterySchema(
        topic=tm.topic,
        mastery=round(tm.mastery, 2),
        lastPracticed=tm.last_practiced or "Recently",
        attemptsCount=tm.attempts_count,
        correctRate=round(tm.correct_rate, 2),
        decayStatus=tm.decay_status,
        confidenceInterval=(tm.confidence_lower, tm.confidence_upper),
        prerequisites=prereqs
    )

@router.get("/{learner_id}/progress", response_model=LearnerProgressResponse)
def get_learner_progress(learner_id: str, db: Session = Depends(get_db)):
    # Find user or default to demo
    user = db.query(User).filter(User.id == learner_id).first()
    user_id = user.id if user else "usr-demo-01"

    tm_list = db.query(TopicMastery).filter(TopicMastery.user_id == user_id).all()
    if not tm_list:
        tm_list = db.query(TopicMastery).all()

    masteries_dict: Dict[str, TopicMasterySchema] = {}
    for tm in tm_list:
        masteries_dict[tm.topic] = format_mastery(tm)

    values = [m.mastery for m in masteries_dict.values()]
    overall = round(sum(values) / len(values), 2) if values else 0.50

    sorted_list = sorted(masteries_dict.values(), key=lambda x: x.mastery)
    weakest = sorted_list[:3]
    strongest = list(reversed(sorted_list[-3:]))

    # Fetch recent quiz attempts
    attempts = db.query(QuizAttempt, Quiz).join(Quiz, QuizAttempt.quiz_id == Quiz.id).filter(
        QuizAttempt.user_id == user_id
    ).order_by(QuizAttempt.id.desc()).limit(5).all()

    recent_scores = []
    for att, q in attempts:
        recent_scores.append({
            "quizTitle": q.title,
            "score": att.percentage,
            "date": att.completed_at
        })

    if not recent_scores:
        recent_scores = [
            {"quizTitle": "Arrays & Sorting Practice", "score": 92, "date": "Oct 08"},
            {"quizTitle": "Binary Search Invariants", "score": 85, "date": "Oct 09"},
            {"quizTitle": "Recursion Call Stack Quiz", "score": 55, "date": "Oct 10"},
            {"quizTitle": "Trees & BST Traversal", "score": 40, "date": "Oct 10"},
        ]

    return LearnerProgressResponse(
        masteries=masteries_dict,
        overallMastery=overall,
        weakestTopics=weakest,
        strongestTopics=strongest,
        recentScores=recent_scores
    )

@router.get("/{learner_id}/next", response_model=NextRecommendationResponse)
def get_next_recommendation(learner_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == learner_id).first()
    user_id = user.id if user else "usr-demo-01"

    weakest_tm = db.query(TopicMastery).filter(TopicMastery.user_id == user_id).order_by(TopicMastery.mastery.asc()).first()
    topic_name = weakest_tm.topic if weakest_tm else "Trees"
    mastery_val = weakest_tm.mastery if weakest_tm else 0.32

    return NextRecommendationResponse(
        topic=f"Recursion & {topic_name}",
        title=f"Practice {topic_name} and Foundational Prerequisites",
        estimatedMinutes=12,
        reason=f"Mastery {mastery_val:.2f} on {topic_name}, decay status: critical.",
        prerequisiteNote=(
            f"Root-cause analysis: Difficulties on {topic_name} correlate with upstream gaps. "
            "Strengthening recursive base-case formulation will directly accelerate your mastery recovery."
        )
    )

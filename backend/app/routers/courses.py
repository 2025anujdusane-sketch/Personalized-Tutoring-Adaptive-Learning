from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Topic, TopicPrerequisite

router = APIRouter(prefix="/api/courses", tags=["courses"])

@router.get("/{course_id}/topics")
def get_course_topics(course_id: str, db: Session = Depends(get_db)):
    topics_records = db.query(Topic).order_by(Topic.order_index.asc()).all()
    prereq_records = db.query(TopicPrerequisite).all()

    topics = [t.name for t in topics_records] if topics_records else [
        "Arrays", "Recursion", "Linked Lists", "Binary Search", "Trees",
        "Graphs", "Sorting", "Hashing", "Dynamic Programming"
    ]

    prerequisites = [
        {"from": p.from_topic, "to": p.to_topic, "reason": p.reason}
        for p in prereq_records
    ]

    return {
        "topics": topics,
        "prerequisites": prerequisites
    }

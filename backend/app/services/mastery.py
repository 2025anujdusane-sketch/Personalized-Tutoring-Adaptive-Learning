import json
from typing import Dict, List, Tuple, Any
from app.db.session import SessionLocal
from app.db.models import TopicMastery, MasteryHistory, TopicPrerequisite

# Bayesian Knowledge Tracing Default Parameters
DEFAULT_BKT_PARAMS = {
    "p_learn": 0.20,
    "p_slip": 0.10,
    "p_guess": 0.25,
}

def update_bkt_mastery(
    current_p: float,
    is_correct: bool,
    p_learn: float = 0.20,
    p_slip: float = 0.10,
    p_guess: float = 0.25
) -> float:
    """
    Standard Bayesian Knowledge Tracing (BKT) update:
    1. Compute P(L_t | Evidence)
    2. Compute P(L_{t+1}) = P(L_t | Evidence) + (1 - P(L_t | Evidence)) * P(T)
    """
    p_l = max(0.05, min(0.98, current_p))

    if is_correct:
        numerator = p_l * (1.0 - p_slip)
        denominator = numerator + (1.0 - p_l) * p_guess
    else:
        numerator = p_l * p_slip
        denominator = numerator + (1.0 - p_l) * (1.0 - p_guess)

    p_post = numerator / (denominator if denominator > 0 else 1.0)
    p_next = p_post + (1.0 - p_post) * p_learn
    return round(min(0.98, max(0.08, p_next)), 2)

def diagnose_root_causes(
    user_id: str,
    topic_breakdown: Dict[str, Any]
) -> List[str]:
    """
    Walks prerequisite graph to find upstream blockers for weak topics.
    """
    db = SessionLocal()
    insights = []
    try:
        prereqs = db.query(TopicPrerequisite).all()
        user_masteries = {
            m.topic: m.mastery
            for m in db.query(TopicMastery).filter(TopicMastery.user_id == user_id).all()
        }

        for topic, stats in topic_breakdown.items():
            score = stats.get("score", 100)
            if score < 70:
                # Find prerequisites
                upstream = [p for p in prereqs if p.to_topic == topic]
                for p in upstream:
                    prereq_mastery = user_masteries.get(p.from_topic, 0.5)
                    if prereq_mastery < 0.55:
                        insights.append(
                            f"Your mistakes on {topic} frequently correlate with upstream gaps. "
                            f"The prerequisite {p.from_topic} is at {prereq_mastery:.2f} mastery: "
                            f"{p.reason} Strengthening {p.from_topic} will yield the fastest mastery gains."
                        )

        if not insights:
            for topic, stats in topic_breakdown.items():
                if stats.get("score", 100) < 70:
                    insights.append(f"Review the cited source units for {topic} to solidify core problem patterns.")
    finally:
        db.close()
    return insights

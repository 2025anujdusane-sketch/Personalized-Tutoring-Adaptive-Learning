import pytest
from app.services.mastery import update_bkt_mastery, diagnose_root_causes

def test_bkt_mastery_increases_on_correct_answer():
    p_init = 0.40
    p_after_correct = update_bkt_mastery(p_init, is_correct=True)
    assert p_after_correct > p_init

def test_bkt_mastery_decreases_on_incorrect_answer():
    p_init = 0.70
    p_after_incorrect = update_bkt_mastery(p_init, is_correct=False)
    assert p_after_incorrect < p_init

def test_root_cause_diagnosis():
    insights = diagnose_root_causes(
        user_id="usr-demo-01",
        topic_breakdown={"Trees": {"score": 40, "total": 2, "correct": 0}}
    )
    assert len(insights) > 0
    assert any("Recursion" in text or "prerequisite" in text.lower() for text in insights)

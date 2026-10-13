import pytest
from app.services.tutor import generate_grounded_answer

def test_citation_formatting_on_syllabus_query():
    resp = generate_grounded_answer("explain binary search")
    assert resp.grounding_status == "backed"
    assert len(resp.citations) > 0

    top_citation = resp.citations[0]
    assert top_citation.source_id is not None
    assert top_citation.source_title is not None
    assert top_citation.source_type in ("pdf", "pptx", "video")
    assert len(top_citation.excerpt) > 10

def test_off_syllabus_refusal_has_no_citations():
    resp = generate_grounded_answer("what is the recipe for chocolate cake?")
    assert resp.grounding_status == "outside"
    assert len(resp.citations) == 0
    assert "not present in your uploaded course materials" in resp.answer

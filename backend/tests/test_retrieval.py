import pytest
from app.services.retrieval import hybrid_search, get_fallback_embedding

def test_fallback_embedding_dimension_and_norm():
    vec = get_fallback_embedding("Binary search trees and recursion invariants")
    assert len(vec) == 768
    norm = sum(x * x for x in vec) ** 0.5
    assert abs(norm - 1.0) < 1e-4

def test_hybrid_search_on_syllabus():
    evidence, confidence = hybrid_search("binary search midpoint overflow", top_k=2)
    assert len(evidence) > 0
    assert confidence > 0.5
    top_chunk = evidence[0]
    assert "binary search" in top_chunk["text"].lower() or "midpoint" in top_chunk["text"].lower()

def test_hybrid_search_off_syllabus_refusal():
    evidence, confidence = hybrid_search("what is the capital of France?", top_k=2)
    # Off syllabus prompt should result in low confidence threshold
    assert confidence < 0.20

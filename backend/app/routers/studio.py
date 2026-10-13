import json
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Flashcard as DBFlashcard, User
from app.schemas import StudioGenerateRequest, FlashcardSchema, CitationSchema
from app.services.auth import get_current_user
from app.services.retrieval import hybrid_search

router = APIRouter(prefix="/api/studio", tags=["studio"])

@router.post("/generate")
def generate_study_material(
    req: StudioGenerateRequest,
    user: User = Depends(get_current_user)
):
    evidence, _ = hybrid_search(
        query=f"Core concepts and principles for {req.kind}",
        notebook_id=req.notebook_id,
        source_ids=req.source_ids,
        top_k=3
    )

    ev_text = "\n".join([e["text"] for e in evidence]) if evidence else "Core algorithm invariants and properties."
    top_src = evidence[0] if evidence else {
        "source_id": "src-dsa-textbook",
        "source_title": "Data Structures & Algorithms",
        "source_type": "pdf",
        "unit_label": "Page 24",
        "page_number": 24,
        "text": ev_text
    }

    citation = {
        "source_id": top_src["source_id"],
        "source_title": top_src["source_title"],
        "source_type": top_src.get("source_type", "pdf"),
        "page_number": top_src.get("page_number", 24),
        "excerpt": top_src["text"][:200]
    }

    if req.kind == "flashcards":
        return {
            "kind": "flashcards",
            "items": [
                {
                    "question": "Why does midpoint calculation use low + ((high - low) >> 1)?",
                    "answer": "To prevent 32-bit signed integer arithmetic overflow when low + high exceeds 2^31 - 1.",
                    "topic": "Binary Search",
                    "citation": citation
                },
                {
                    "question": "What is the global invariant for a Binary Search Tree (BST)?",
                    "answer": "All keys in the left subtree must be strictly less than the node key, and all keys in the right subtree strictly greater.",
                    "topic": "Trees",
                    "citation": citation
                }
            ]
        }
    elif req.kind == "mind_map":
        return {
            "kind": "mind_map",
            "nodes": [
                {"id": "root", "label": "Data Structures & Algorithms"},
                {"id": "rec", "label": "Recursion & Call Stacks"},
                {"id": "trees", "label": "Binary Search Trees"},
                {"id": "dp", "label": "Dynamic Programming (Memoization)"}
            ],
            "edges": [
                {"from": "root", "to": "rec"},
                {"from": "rec", "to": "trees", "label": "Prerequisite base cases"},
                {"from": "rec", "to": "dp", "label": "Subproblem overlap"}
            ]
        }
    else: # summary, study_guide, faq, etc.
        return {
            "kind": req.kind,
            "title": f"Grounded {req.kind.replace('_', ' ').title()}",
            "content": (
                f"### Executive Overview\n\n"
                f"Derived from your course materials ({top_src['source_title']}, {top_src.get('unit_label', 'Page 1')}):\n\n"
                f"{ev_text[:500]}...\n\n"
                f"**Key Takeaway**: Master fundamental base cases and bounds before advancing to higher-order tree transformations."
            ),
            "citations": [citation]
        }

@router.get("/flashcards", response_model=List[FlashcardSchema])
def get_flashcards(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    cards = db.query(DBFlashcard).filter(DBFlashcard.user_id == user.id).all()
    results = []
    for c in cards:
        cit_data = json.loads(c.citation_json) if c.citation_json else {}
        results.append(FlashcardSchema(
            id=c.id,
            topic=c.topic,
            question=c.question,
            answer=c.answer,
            citation=CitationSchema(
                source_id=cit_data.get("source_id", "src-dsa-textbook"),
                source_title=cit_data.get("source_title", "Data Structures & Algorithms"),
                source_type=cit_data.get("source_type", "pdf"),
                excerpt=cit_data.get("excerpt", "Concept excerpt"),
                page_number=cit_data.get("page_number", 24)
            ),
            difficulty=c.difficulty,
            lastReviewed=c.last_reviewed,
            state=c.state
        ))
    return results

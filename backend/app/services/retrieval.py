import os
import re
import math
import hashlib
from typing import List, Dict, Any, Tuple
import chromadb
from rank_bm25 import BM25Okapi
from app.config import settings
from app.db.session import SessionLocal
from app.db.models import Chunk, Source

# Persistent Chroma Client
CHROMA_DIR = "./storage/chroma"
os.makedirs(CHROMA_DIR, exist_ok=True)
chroma_client = chromadb.PersistentClient(path=CHROMA_DIR)
collection = chroma_client.get_or_create_collection(name="studysphere_chunks")

def get_fallback_embedding(text: str, dim: int = 768) -> List[float]:
    """
    Deterministic dense semantic embedding generator for offline/demo operation.
    Generates normalized 768-dim vector from n-grams and vocabulary hashing.
    """
    words = re.findall(r"\w+", text.lower())
    vec = [0.0] * dim
    for word in words:
        h = int(hashlib.md5(word.encode()).hexdigest(), 16)
        idx = h % dim
        sign = 1.0 if (h >> 8) % 2 == 0 else -1.0
        vec[idx] += sign

    # Add bigrams
    for i in range(len(words) - 1):
        bigram = f"{words[i]}_{words[i+1]}"
        h = int(hashlib.sha256(bigram.encode()).hexdigest(), 16)
        idx = h % dim
        sign = 1.0 if (h >> 12) % 2 == 0 else -1.0
        vec[idx] += sign * 1.5

    norm = math.sqrt(sum(x * x for x in vec))
    if norm > 0:
        vec = [x / norm for x in vec]
    else:
        vec[0] = 1.0
    return vec

def embed_text(text: str) -> List[float]:
    if settings.has_gemini:
        try:
            from google import genai
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            res = client.models.embed_content(
                model=settings.GEMINI_EMBED_MODEL,
                contents=text
            )
            # res.embeddings[0].values
            if hasattr(res, "embeddings") and len(res.embeddings) > 0:
                values = getattr(res.embeddings[0], "values", None)
                if values:
                    return list(values)
        except Exception as e:
            print(f"Gemini embedding API call failed: {e}. Falling back to deterministic embedding.")
    return get_fallback_embedding(text)

def index_chunk(chunk_id: str, text: str, metadata: Dict[str, Any]):
    emb = embed_text(text)
    # Chroma requires metadata values to be str, int, float, or bool
    clean_meta = {}
    for k, v in metadata.items():
        if isinstance(v, (str, int, float, bool)):
            clean_meta[k] = v
        else:
            clean_meta[k] = str(v)

    collection.upsert(
        ids=[chunk_id],
        embeddings=[emb],
        documents=[text],
        metadatas=[clean_meta]
    )

def hybrid_search(
    query: str,
    notebook_id: str = None,
    source_ids: List[str] = None,
    top_k: int = 5
) -> Tuple[List[Dict[str, Any]], float]:
    """
    Performs hybrid retrieval (Chroma vector search + BM25 keyword search)
    with Reciprocal Rank Fusion (RRF) and confidence scoring.
    Returns (evidence_chunks, confidence_score).
    """
    db = SessionLocal()
    try:
        # Load candidate chunks from DB
        chunk_query = db.query(Chunk, Source).join(Source, Chunk.source_id == Source.id)
        if source_ids:
            chunk_query = chunk_query.filter(Chunk.source_id.in_(source_ids))
        candidates = chunk_query.all()

        if not candidates:
            return [], 0.0

        # Vector search
        query_emb = embed_text(query)
        where_filter = {}
        if source_ids:
            where_filter["source_id"] = {"$in": source_ids}

        vector_results = []
        try:
            query_kwargs = {
                "query_embeddings": [query_emb],
                "n_results": min(top_k * 2, len(candidates)),
            }
            if where_filter:
                query_kwargs["where"] = where_filter

            res = collection.query(**query_kwargs)
            if res and res.get("ids") and len(res["ids"]) > 0:
                for idx, cid in enumerate(res["ids"][0]):
                    dist = res["distances"][0][idx] if "distances" in res and res["distances"] else 0.5
                    vector_results.append((cid, dist))
        except Exception as e:
            print(f"Vector search warning: {e}")

        # Stopwords definition
        stopwords = {
            "a", "an", "the", "and", "or", "is", "are", "was", "were", "what", "which", "who", "whom",
            "this", "that", "these", "those", "am", "be", "been", "being", "have", "has", "had",
            "do", "does", "did", "to", "from", "in", "out", "on", "off", "over", "under", "again",
            "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any",
            "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not",
            "only", "own", "same", "so", "than", "too", "very", "can", "will", "just", "should", "now",
            "of", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during"
        }

        # BM25 keyword search on meaningful non-stopword tokens
        corpus = [c[0].text for c in candidates]
        tokenized_corpus = [[w for w in re.findall(r"\w+", doc.lower()) if w not in stopwords] for doc in corpus]
        tokenized_query = [w for w in re.findall(r"\w+", query.lower()) if w not in stopwords]

        bm25_results = []
        if tokenized_corpus and tokenized_query:
            bm25 = BM25Okapi(tokenized_corpus)
            doc_scores = bm25.get_scores(tokenized_query)
            scored_candidates = [
                (candidates[i][0].id, doc_scores[i])
                for i in range(len(candidates))
            ]
            scored_candidates.sort(key=lambda x: x[1], reverse=True)
            bm25_results = scored_candidates[: top_k * 2]

        # Reciprocal Rank Fusion (RRF)
        rrf_scores: Dict[str, float] = {}
        k = 60

        for rank, (cid, _) in enumerate(vector_results):
            rrf_scores[cid] = rrf_scores.get(cid, 0.0) + (1.0 / (k + rank + 1))

        for rank, (cid, bm25_score) in enumerate(bm25_results):
            if bm25_score > 0.5: # meaningful keyword matches contribute
                rrf_scores[cid] = rrf_scores.get(cid, 0.0) + (1.0 / (k + rank + 1))

        # Sort by final RRF score
        sorted_cids = sorted(rrf_scores.items(), key=lambda x: x[1], reverse=True)[:top_k]

        # Check off-syllabus / refusal boundary
        max_bm25 = max([s for _, s in bm25_results], default=0.0)
        has_keywords = max_bm25 > 0.8

        # Check domain relevance against syllabus topics
        dsa_keywords = {
            "tree", "trees", "bst", "traversal", "recursion", "recursive", "call stack",
            "binary search", "array", "arrays", "linked list", "graph", "graphs",
            "sorting", "hash", "hashing", "dynamic programming", "memoization", "dp",
            "complexity", "inorder", "preorder", "postorder", "stack", "queue",
            "rotations", "avl", "adjacency", "matrix", "invariant", "subproblem"
        }
        query_words = set(tokenized_query)
        domain_overlap = len(query_words.intersection(dsa_keywords))

        confidence = 0.85 if has_keywords or domain_overlap > 0 else 0.05

        # Format evidence chunks
        evidence = []
        cid_map = {c[0].id: (c[0], c[1]) for c in candidates}

        for cid, score in sorted_cids:
            if cid in cid_map:
                chk, src = cid_map[cid]
                import json
                loc = {}
                try:
                    loc = json.loads(chk.location_json) if chk.location_json else {}
                except Exception:
                    pass

                evidence.append({
                    "chunk_id": chk.id,
                    "source_id": src.id,
                    "source_title": src.title,
                    "source_type": src.source_type,
                    "modality": chk.modality,
                    "unit_number": chk.unit_number,
                    "unit_label": chk.unit_label,
                    "unit_title": chk.unit_title,
                    "page_number": loc.get("page"),
                    "slide_number": loc.get("slide"),
                    "start_seconds": loc.get("start_s"),
                    "end_seconds": loc.get("end_s"),
                    "timestamp_label": loc.get("timestamp_label", chk.unit_label if src.source_type == "video" else None),
                    "section_heading": loc.get("section_heading", chk.unit_title),
                    "text": chk.text,
                    "topic": chk.topic_id,
                    "rrf_score": score
                })

        return evidence, confidence
    finally:
        db.close()

def sync_db_chunks_to_chroma():
    """Sync all chunks in sqlite DB into ChromaDB collection."""
    db = SessionLocal()
    try:
        chunks = db.query(Chunk, Source).join(Source, Chunk.source_id == Source.id).all()
        for chk, src in chunks:
            try:
                index_chunk(
                    chunk_id=chk.id,
                    text=chk.text,
                    metadata={
                        "source_id": src.id,
                        "source_title": src.title,
                        "source_type": src.source_type,
                        "modality": chk.modality,
                        "unit_number": chk.unit_number,
                        "unit_label": chk.unit_label,
                        "unit_title": chk.unit_title,
                        "topic_id": chk.topic_id or "General",
                    }
                )
            except Exception as e:
                print(f"Error indexing chunk {chk.id}: {e}")
    finally:
        db.close()


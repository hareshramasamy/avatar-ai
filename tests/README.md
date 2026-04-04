# Tests

Each folder maps to a roadmap phase. Run scripts directly — no test framework needed.

```
source venv/bin/activate
```

## Phase 0 — Foundation

| File | What it tests |
|------|--------------|
| `phase0/test_pinecone.py` | Pinecone connection, index stats |

## Phase 1 — Ingestion Pipeline

| File | What it tests |
|------|--------------|
| `phase1/test_chunker.py` | Token-based text chunking |
| `phase1/test_embedder.py` | OpenAI embeddings API (1536 dims) |
| `phase1/test_pipeline.py` | Full ingest → query round-trip |

## Phase 2 — FastAPI Backend

| File | What it tests |
|------|--------------|
| `phase2/test_chat_workflow.py` | signup → upload → chat (requires server running) |
| `phase2/debug_ingestion.py` | Each ingestion layer independently (no server needed) |

**Run order for Phase 2:**
1. `python tests/phase2/debug_ingestion.py` — confirm pipeline works before involving the API
2. Start server: `uvicorn api.main:app --reload`
3. `python tests/phase2/test_chat_workflow.py`

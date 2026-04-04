"""
Ingestion Debug Script — run directly (no server needed).

Tests each layer independently and checks Pinecone for results.

Usage:
    source venv/bin/activate
    python debug_ingestion.py
"""

from dotenv import load_dotenv
load_dotenv(override=True)

import asyncio
import os
from pinecone import Pinecone
from ingestion.chunker import chunk_text
from ingestion.embedder import embed_texts
from ingestion.store import upsert_chunks, query_chunks
from ingestion.pipeline import ingest_document

TEST_USER_ID = "debug_user_001"
TEST_TEXT = (
    "Haresh Ramasamy is a software engineer with 5 years of experience. "
    "He specialises in Python, AWS, and machine learning systems. "
    "He has built production RAG pipelines and agentic AI platforms. "
    "He is currently open to senior ML and backend engineering roles."
)
METADATA = {"user_id": TEST_USER_ID, "doc_id": "debug_doc_001", "filename": "debug_text"}


def section(title):
    print(f"\n{'='*55}")
    print(f"  {title}")
    print('='*55)


# ── 1. Chunker ────────────────────────────────────────────────────────────────
section("1. Chunker")
chunks = chunk_text(TEST_TEXT)
print(f"  Input length : {len(TEST_TEXT)} chars")
print(f"  Chunks produced: {len(chunks)}")
for i, c in enumerate(chunks):
    print(f"  [{i}] {c[:80]}{'...' if len(c) > 80 else ''}")
assert len(chunks) > 0, "FAIL: chunker returned no chunks"
print("  PASS")


# ── 2. Embedder ───────────────────────────────────────────────────────────────
section("2. Embedder")
vectors = embed_texts(chunks)
print(f"  Vectors produced: {len(vectors)}")
print(f"  Vector dimension: {len(vectors[0])}")
assert len(vectors) == len(chunks), "FAIL: vector count != chunk count"
assert len(vectors[0]) > 0, "FAIL: empty vector"
print("  PASS")


# ── 3. Pinecone upsert ────────────────────────────────────────────────────────
section("3. Pinecone upsert")
upsert_chunks(TEST_USER_ID, chunks, vectors, METADATA)
print(f"  Upserted {len(chunks)} chunks to namespace=user_{TEST_USER_ID}")
print("  Waiting 3s for Pinecone to index...")
import time; time.sleep(3)
print("  PASS (no exception)")


# ── 4. Pinecone query ─────────────────────────────────────────────────────────
section("4. Pinecone query")
query = "What are Haresh's technical skills?"
query_vector = embed_texts([query])[0]
results = query_chunks(TEST_USER_ID, query_vector, top_k=3)
print(f"  Query: '{query}'")
print(f"  Results returned: {len(results)}")
if results:
    for i, r in enumerate(results):
        print(f"  [{i}] {r[:100]}{'...' if len(r) > 100 else ''}")
    print("  PASS")
else:
    print("  FAIL: no results returned — check Pinecone namespace and index name")


# ── 5. Pinecone namespace stats ───────────────────────────────────────────────
section("5. Pinecone namespace stats")
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index(os.getenv("PINECONE_INDEX_NAME"))
stats = index.describe_index_stats()
print(f"  Index name    : {os.getenv('PINECONE_INDEX_NAME')}")
print(f"  Total vectors : {stats.total_vector_count}")
namespaces = stats.namespaces or {}
ns_key = f"user_{TEST_USER_ID}"
if ns_key in namespaces:
    print(f"  Namespace '{ns_key}': {namespaces[ns_key].vector_count} vectors")
    print("  PASS")
else:
    print(f"  FAIL: namespace '{ns_key}' not found in index")
    print(f"  All namespaces: {list(namespaces.keys())}")


# ── 6. Full pipeline (async) ──────────────────────────────────────────────────
section("6. Full pipeline (ingest_document)")
metadata2 = {"user_id": TEST_USER_ID, "doc_id": "debug_doc_002", "filename": "pipeline_test"}
result = asyncio.run(ingest_document(TEST_USER_ID, "text", TEST_TEXT, metadata2))
print(f"  Chunks ingested: {result}")
assert result and result > 0, "FAIL: pipeline returned 0 chunks"
print("  PASS")


print("\n" + "="*55)
print("  All checks complete.")
print("="*55 + "\n")

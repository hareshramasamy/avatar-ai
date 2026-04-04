"""
Session 1.5 — End-to-end pipeline test
Ingests a text document and queries it back from Pinecone.

Usage:
    source venv/bin/activate
    python tests/phase1/test_pipeline.py
"""

import asyncio
from dotenv import load_dotenv
load_dotenv()

from ingestion.pipeline import ingest_document
from ingestion.store import query_chunks
from ingestion.embedder import embed_texts

TEST_USER_ID = "test_user"

async def test():
    print("Ingesting document...")
    n = await ingest_document(
        user_id=TEST_USER_ID,
        source_type="text",
        content="Haresh is a software engineer from Chennai who loves hot chocolate.",
        metadata={"source_type": "text", "filename": "test.txt"}
    )
    print(f"Ingested {n} chunk(s)")

    print("\nQuerying Pinecone...")
    query_vec = embed_texts(["What does Haresh like to drink?"])[0]
    results = query_chunks(TEST_USER_ID, query_vec)

    print(f"Results returned: {len(results)}")
    for i, r in enumerate(results):
        print(f"  [{i}] {r[:100]}")

    assert len(results) > 0, "No results returned — check Pinecone namespace"
    print("\nPASS")

asyncio.run(test())

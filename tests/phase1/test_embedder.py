"""
Session 1.2 — Embedder test
Verifies that the OpenAI embeddings API returns 1536-dimensional vectors.

Usage:
    source venv/bin/activate
    python tests/phase1/test_embedder.py
"""

from dotenv import load_dotenv
load_dotenv()

from ingestion.embedder import embed_texts

vectors = embed_texts(["Hello, I am a software engineer"])

print(f"Vectors produced : {len(vectors)}")
print(f"Vector dimensions: {len(vectors[0])}")
print(f"First 5 values   : {vectors[0][:5]}")

assert len(vectors) == 1, "Expected 1 vector"
assert len(vectors[0]) == 1536, f"Expected 1536 dims, got {len(vectors[0])}"
print("\nPASS")

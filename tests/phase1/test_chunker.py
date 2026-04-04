"""
Session 1.1 — Chunker test
Verifies that text is split into token-bounded overlapping chunks.

Usage:
    source venv/bin/activate
    python tests/phase1/test_chunker.py
"""

from dotenv import load_dotenv
load_dotenv()

from ingestion.chunker import chunk_text

sample = "This is a test sentence. " * 200
chunks = chunk_text(sample)

print(f"Input length   : {len(sample)} chars")
print(f"Chunks produced: {len(chunks)}")
print(f"First chunk    : {chunks[0][:80]}...")
print(f"Last chunk     : {chunks[-1][:80]}...")

assert len(chunks) > 1, "Expected multiple chunks for long input"
print("\nPASS")

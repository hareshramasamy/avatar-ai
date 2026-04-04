"""
Session 0.4 — Pinecone connection test
Verifies that your API key, index name, and region are correctly configured.

Usage:
    source venv/bin/activate
    python tests/phase0/test_pinecone.py
"""

from dotenv import load_dotenv
load_dotenv()

import os
from pinecone import Pinecone

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index(os.getenv("PINECONE_INDEX_NAME"))

stats = index.describe_index_stats()
print("Connected to Pinecone successfully.")
print(f"Index name    : {os.getenv('PINECONE_INDEX_NAME')}")
print(f"Total vectors : {stats.total_vector_count}")
print(f"Namespaces    : {list(stats.namespaces.keys()) if stats.namespaces else '(empty)'}")

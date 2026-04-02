from pinecone import Pinecone
import os
import uuid

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index(os.getenv("PINECONE_INDEX_NAME"))

def upsert_chunks(user_id: str, chunks: list[str], vectors: list[list[float]], metadata: dict):
    """Store chunks and their vectors in the user's Pinecone namespace."""
    records = []
    for i, (chunk, vector) in enumerate(zip(chunks, vectors)):
        records.append({
            "id": str(uuid.uuid4()),
            "values": vector,
            "metadata": {**metadata, "text": chunk}
        })
    index.upsert(vectors=records, namespace=f"user_{user_id}")

def query_chunks(user_id: str, query_vector: list[float], top_k: int = 5) -> list[str]:
    """Retrieve the most relevant chunks for a query vector."""
    result = index.query(
        vector=query_vector,
        top_k=top_k,
        namespace=f"user_{user_id}",
        include_metadata=True
    )
    return [match.metadata["text"] for match in result.matches]
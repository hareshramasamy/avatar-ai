from openai import OpenAI
import os

client = OpenAI()

def embed_texts(texts: list[str]) -> list[list[float]]:
    """Return embeddings for a list of text strings."""
    response = client.embeddings.create(
        input=texts,
        model="text-embedding-3-small"
    )
    return [item.embedding for item in response.data]
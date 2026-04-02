import tiktoken

def chunk_text(text, max_tokens: int = 500, overlap: int = 50):
    """Split text into overlapping chunks by token count"""
    encoder = tiktoken.get_encoding("cl100k_base")
    tokens = encoder.encode(text)
    chunks = []
    start = 0
    while start < len(tokens):
        end = min(start + max_tokens, len(tokens))
        chunk_tokens = tokens[start:end]
        chunks.append(encoder.decode(chunk_tokens))
        start += max_tokens - overlap
    return chunks
from pathlib import Path

from ai.rag.loader import load_document
from ai.rag.splitter import chunk_text
from ai.rag.embeddings import generate_embeddings


def process_document(file_path: str):
    """
    Complete document processing pipeline.

    Steps:
    1. Load document
    2. Split into chunks
    3. Generate embeddings
    4. Return processing summary
    """

    # Load document
    text = load_document(file_path)

    # Split into chunks
    chunks = chunk_text(text)

    # Generate embeddings
    embeddings = generate_embeddings(chunks)

    return {
        "filename": Path(file_path).name,
        "characters": len(text),
        "chunks": len(chunks),
        "embeddings": len(embeddings),
        "chunk_texts": chunks,
        "embedding_vectors": embeddings,
    }

from pathlib import Path

from ai.rag.loader import load_document
from ai.rag.splitter import chunk_text
from ai.vectorstore.qdrant_store import store_embeddings


def process_document(file_path: str):
    """
    Complete document processing pipeline.

    Steps:
    1. Load document
    2. Split into chunks
    3. Store chunks in Qdrant using Cloud Inference
    """

    # Load document
    text = load_document(file_path)

    # Split into chunks
    chunks = chunk_text(text)

    # Store chunks + generate embeddings through Qdrant Cloud Inference
    store_embeddings(
        chunks,
        Path(file_path).name,
    )

    return {
        "filename": Path(file_path).name,
        "characters": len(text),
        "chunks": len(chunks),
        "embeddings": len(chunks),
        "chunk_texts": chunks,
    }
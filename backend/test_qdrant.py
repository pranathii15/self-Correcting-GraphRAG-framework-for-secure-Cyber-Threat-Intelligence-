from ai.rag.loader import load_document
from ai.rag.splitter import chunk_text
from ai.rag.embeddings import generate_embeddings

from ai.vectorstore.qdrant_store import (
    create_collection,
    store_embeddings,
)

# Create collection
create_collection()

# Load document
text = load_document(
    "ai/datasets/demo/3am-ransomware-lockbit.json"
)

# Chunk
chunks = chunk_text(text)

# Generate embeddings
embeddings = generate_embeddings(chunks)

# Store in Qdrant
store_embeddings(chunks, embeddings)

print("Finished!")
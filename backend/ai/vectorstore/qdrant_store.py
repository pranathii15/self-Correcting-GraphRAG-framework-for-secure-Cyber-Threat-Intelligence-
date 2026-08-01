from uuid import uuid4

from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
)

from ai.rag.embeddings import model

# -----------------------------
# Configuration
# -----------------------------

COLLECTION_NAME = "cti_documents"

VECTOR_SIZE = model.get_embedding_dimension()

client = QdrantClient(
    host="localhost",
    port=6333,
)


# -----------------------------
# Create Collection
# -----------------------------

def create_collection():
    """
    Create the Qdrant collection if it doesn't already exist.
    """

    collections = client.get_collections().collections
    names = [collection.name for collection in collections]

    if COLLECTION_NAME not in names:

        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(
                size=VECTOR_SIZE,
                distance=Distance.COSINE,
            ),
        )

        print(f"Collection '{COLLECTION_NAME}' created.")

    else:
        print(f"Collection '{COLLECTION_NAME}' already exists.")


# -----------------------------
# Store Embeddings
# -----------------------------

def store_embeddings(chunks, embeddings):
    """
    Store document chunks and their embeddings in Qdrant.
    """

    points = []

    for chunk, embedding in zip(chunks, embeddings):

        points.append(
            PointStruct(
                id=str(uuid4()),
                vector=embedding.tolist(),
                payload={
                    "text": chunk,
                },
            )
        )

    client.upsert(
        collection_name=COLLECTION_NAME,
        points=points,
    )

    print(f"Stored {len(points)} vectors in Qdrant.")
from uuid import uuid4

from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct


COLLECTION_NAME = "cti_documents"

client = QdrantClient(
    host="localhost",
    port=6333
)


def create_collection():
    """
    Create the Qdrant collection if it doesn't already exist.
    """

    collections = client.get_collections().collections

    if any(c.name == COLLECTION_NAME for c in collections):
        print(f"Collection '{COLLECTION_NAME}' already exists.")
        return

    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(
            size=384,
            distance=Distance.COSINE,
        ),
    )

    print(f"Collection '{COLLECTION_NAME}' created.")


def store_embeddings(chunks, embeddings, source):
    """
    Store document chunks and embeddings in Qdrant.
    """

    points = []

    for index, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
        points.append(
            PointStruct(
                id=str(uuid4()),
                vector=embedding.tolist(),
                payload={
                    "text": chunk,
                    "filename": source,
                    "chunk_id": index,
                },
            )
        )

    client.upsert(
        collection_name=COLLECTION_NAME,
        points=points,
    )

    print(f"Stored {len(points)} vectors in Qdrant.")
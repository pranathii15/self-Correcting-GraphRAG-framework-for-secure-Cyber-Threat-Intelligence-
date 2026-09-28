import os
from uuid import uuid4

from dotenv import load_dotenv
from qdrant_client import QdrantClient, models

load_dotenv()

COLLECTION_NAME = "cti_documents"

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")

EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

client = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY,
    cloud_inference=True,
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
        vectors_config=models.VectorParams(
            size=384,
            distance=models.Distance.COSINE,
        ),
    )

    print(f"Collection '{COLLECTION_NAME}' created.")


def reset_collection():
    """
    Delete and recreate the collection.

    This is used when rebuilding the index with a different
    embedding model.
    """

    collections = client.get_collections().collections

    if any(c.name == COLLECTION_NAME for c in collections):
        print(f"Deleting existing collection '{COLLECTION_NAME}'...")
        client.delete_collection(collection_name=COLLECTION_NAME)

    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=models.VectorParams(
            size=384,
            distance=models.Distance.COSINE,
        ),
    )

    print(f"Collection '{COLLECTION_NAME}' recreated.")


def store_embeddings(chunks, source):
    """
    Store document chunks in Qdrant.

    Qdrant Cloud Inference generates the embeddings server-side
    using all-MiniLM-L6-v2.
    """

    points = []

    for index, chunk in enumerate(chunks):
        points.append(
            models.PointStruct(
                id=str(uuid4()),
                vector=models.Document(
                    text=chunk,
                    model=EMBEDDING_MODEL,
                ),
                payload={
                    "text": chunk,
                    "filename": source,
                    "chunk_id": index,
                },
            )
        )

    client.upload_points(
        collection_name=COLLECTION_NAME,
        points=points,
        batch_size=32,
    )

    print(f"Stored {len(points)} vectors in Qdrant.")
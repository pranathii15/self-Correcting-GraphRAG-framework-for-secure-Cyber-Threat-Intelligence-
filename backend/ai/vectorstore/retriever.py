from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer

from ai.reranker.reranker import rerank

MODEL_NAME = "BAAI/bge-small-en-v1.5"

model = SentenceTransformer(MODEL_NAME)

client = QdrantClient(
    host="localhost",
    port=6333
)

COLLECTION_NAME = "cti_documents"


def search_documents(query: str, limit: int = 5):

    query_embedding = model.encode(
        query,
        normalize_embeddings=True
    ).tolist()

    # Retrieve more candidates from Qdrant
    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_embedding,
        limit=50,
    )

    documents = [
        point.payload["text"]
        for point in results.points
    ]

    # Remove duplicate chunks
    documents = list(dict.fromkeys(documents))

    # Rerank them
    documents = rerank(
        query=query,
        documents=documents,
        top_k=limit,
    )

    return documents
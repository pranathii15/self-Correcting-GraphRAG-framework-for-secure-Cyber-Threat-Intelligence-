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
    {
        "text": point.payload["text"],
        "filename": point.payload["filename"]
    }
    for point in results.points
    ]

    # Remove duplicate chunks
    unique_documents = []
    seen_texts = set()
    for document in documents:
        if document["text"] not in seen_texts:
            unique_documents.append(document)
            seen_texts.add(document["text"])

    documents = unique_documents

    # Rerank them
    documents = rerank(
        query=query,
        documents=documents,
        top_k=50,
    )

    # Limit the number of chunks from the same source file
    diverse_documents = []
    source_counts = {}

    MAX_CHUNKS_PER_SOURCE = 2

    for document in documents:
        filename = document["filename"]

        if source_counts.get(filename, 0) >= MAX_CHUNKS_PER_SOURCE:
            continue

        diverse_documents.append(document)
        source_counts[filename] = source_counts.get(filename, 0) + 1

        if len(diverse_documents) >= limit:
            break

    return diverse_documents
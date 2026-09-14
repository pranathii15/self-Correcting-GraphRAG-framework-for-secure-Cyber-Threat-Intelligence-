from pathlib import Path

from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer

from ai.reranker.reranker import rerank
from ai.graph_rag.neo4j_store import Neo4jGraph


MODEL_NAME = "BAAI/bge-small-en-v1.5"

model = SentenceTransformer(MODEL_NAME)

client = QdrantClient(
    host="localhost",
    port=6333
)

COLLECTION_NAME = "cti_documents"

DATASET_PATH = Path("../data/cti_nexus/demo")


def search_documents(query: str, limit: int = 5):

    # --------------------------------------------------
    # 1. Generate query embedding
    # --------------------------------------------------

    query_embedding = model.encode(
        query,
        normalize_embeddings=True
    ).tolist()

    # --------------------------------------------------
    # 2. Retrieve candidates from Qdrant
    # --------------------------------------------------

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

    # --------------------------------------------------
    # 3. Remove duplicate chunks
    # --------------------------------------------------

    unique_documents = []
    seen_texts = set()

    for document in documents:

        if document["text"] not in seen_texts:

            unique_documents.append(document)
            seen_texts.add(document["text"])

    documents = unique_documents

    # --------------------------------------------------
    # 4. Rerank documents
    # --------------------------------------------------

    documents = rerank(
        query=query,
        documents=documents,
        top_k=50,
    )

    # --------------------------------------------------
    # 5. Source diversity
    #    Maximum 2 chunks per source file
    # --------------------------------------------------

    diverse_documents = []
    source_counts = {}

    MAX_CHUNKS_PER_SOURCE = 2

    for document in documents:

        filename = document["filename"]

        if source_counts.get(filename, 0) >= MAX_CHUNKS_PER_SOURCE:
            continue

        diverse_documents.append(document)

        source_counts[filename] = (
            source_counts.get(filename, 0) + 1
        )

        if len(diverse_documents) >= limit:
            break

    # --------------------------------------------------
    # 6. Query Neo4j for graph information
    # --------------------------------------------------

    graph_results = []

    query_lower = query.lower()

    # Generic entities should not be selected as the
    # main entity for a specific query.
    GENERIC_ENTITIES = {
        "ransomware",
        "malware",
        "threat actor",
        "threat actors",
        "attack",
        "attacks",
        "cyber attack",
        "cyber attacks",
        "software",
        "tool",
        "tools",
        "system",
        "systems",
        "network",
        "networks",
    }

    # --------------------------------------------------
    # 7. Find the best entity matching the query
    # --------------------------------------------------

    best_match = None
    best_match_length = 0

    for document in diverse_documents:

        filename = document["filename"]

        file_path = DATASET_PATH / filename

        if not file_path.exists():
            continue

        # Read entities from the CTINexus JSON file
        import json

        with open(file_path, encoding="utf-8") as file:
            data = json.load(file)

        for entity in data.get("entities", []):

            entity_name = entity.get("entity_name")

            if not entity_name:
                continue

            entity_lower = entity_name.lower().strip()

            # Ignore generic entities
            if entity_lower in GENERIC_ENTITIES:
                continue

            # Entity must actually appear in the query
            if entity_lower not in query_lower:
                continue

            # Prefer the longest / most specific entity
            if len(entity_name) > best_match_length:

                best_match = entity_name
                best_match_length = len(entity_name)

    # --------------------------------------------------
    # 8. Query the best matching entity in Neo4j
    # --------------------------------------------------

    if best_match:

        neo4j_graph = Neo4jGraph()

        try:

            result = neo4j_graph.query_entity(
                best_match
            )

            if result is not None:

                graph_results.append(result)

        finally:

            neo4j_graph.close()

    # --------------------------------------------------
    # 9. Return retrieval + graph
    # --------------------------------------------------

    return {
        "documents": diverse_documents,
        "graph": graph_results
    }
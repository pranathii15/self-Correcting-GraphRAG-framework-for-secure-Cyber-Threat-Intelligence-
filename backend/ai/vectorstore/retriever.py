
import json
import re
import time
from pathlib import Path

from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer

from ai.reranker.reranker import rerank
from ai.agents.query_agent import understand_query
from ai.graph_rag.neo4j_store import Neo4jGraph


MODEL_NAME = "BAAI/bge-small-en-v1.5"

# Model is loaded when this module is imported.
model = SentenceTransformer(MODEL_NAME)

client = QdrantClient(
    host="localhost",
    port=6333
)

COLLECTION_NAME = "cti_documents"

DATASET_PATH = Path("../data/cti_nexus/demo")

MIN_RERANK_SCORE = 0.05


def search_documents(query: str, limit: int = 5):
    total_start = time.perf_counter()
    timings = {}

    # --------------------------------------------------
    # 1. Understand and improve the user query
    # --------------------------------------------------

    stage_start = time.perf_counter()

    query_info = understand_query(query)

    timings["query_agent"] = time.perf_counter() - stage_start

    original_query = query_info["original_query"]
    expanded_query = query_info["expanded_query"]
    used_fallback = query_info.get("used_fallback", False)

    retrieval_query = (
        original_query if used_fallback else expanded_query
    )

    # --------------------------------------------------
    # 2. Generate query embedding
    # --------------------------------------------------

    stage_start = time.perf_counter()

    query_embedding = model.encode(
        retrieval_query,
        normalize_embeddings=True
    ).tolist()

    timings["embedding"] = time.perf_counter() - stage_start

    # --------------------------------------------------
    # 3. Retrieve candidates from Qdrant
    # --------------------------------------------------

    stage_start = time.perf_counter()

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

    timings["qdrant_search"] = time.perf_counter() - stage_start
    candidate_count = len(documents)

    # --------------------------------------------------
    # 4. Remove duplicate chunks
    # --------------------------------------------------

    stage_start = time.perf_counter()

    unique_documents = []
    seen_texts = set()

    for document in documents:
        if document["text"] not in seen_texts:
            unique_documents.append(document)
            seen_texts.add(document["text"])

    documents = unique_documents

    timings["deduplication"] = time.perf_counter() - stage_start
    unique_count = len(documents)

    # --------------------------------------------------
    # 5. Rerank documents using the original query
    # --------------------------------------------------

    stage_start = time.perf_counter()
    RERANK_CANDIDATES = 5

    documents = rerank(
        query=original_query,
        documents=documents[:RERANK_CANDIDATES],
        top_k=RERANK_CANDIDATES,
    )

    timings["reranking"] = time.perf_counter() - stage_start

    # --------------------------------------------------
    # 6. Filter weak matches using reranker scores
    # --------------------------------------------------

    stage_start = time.perf_counter()

    documents = [
        document
        for document in documents
        if document.get("rerank_score", float("-inf"))
        >= MIN_RERANK_SCORE
    ]

    timings["score_filtering"] = time.perf_counter() - stage_start

    # --------------------------------------------------
    # 7. Source diversity
    # --------------------------------------------------

    stage_start = time.perf_counter()

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

    timings["source_diversity"] = time.perf_counter() - stage_start

    # --------------------------------------------------
    # 8. Prepare graph matching
    # --------------------------------------------------

    graph_results = []

    query_normalized = " ".join(original_query.casefold().split())

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

    def entity_matches_query(entity_name: str) -> bool:
        entity_normalized = " ".join(
            entity_name.casefold().split()
        )

        if not entity_normalized:
            return False

        escaped_entity = re.escape(entity_normalized)
        pattern = rf"(?<!\w){escaped_entity}(?!\w)"

        return re.search(pattern, query_normalized) is not None

    # --------------------------------------------------
    # 9. Find the best matching entity in retrieved files
    # --------------------------------------------------

    stage_start = time.perf_counter()

    best_match = None
    best_match_length = 0
    graph_entities_checked = 0

    for document in diverse_documents:
        filename = document["filename"]
        file_path = DATASET_PATH / filename

        if not file_path.exists():
            continue

        with open(file_path, encoding="utf-8") as file:
            data = json.load(file)

        for entity in data.get("entities", []):
            entity_name = entity.get("entity_name")

            if not entity_name:
                continue

            graph_entities_checked += 1

            entity_normalized = " ".join(
                entity_name.casefold().split()
            )

            if entity_normalized in GENERIC_ENTITIES:
                continue

            if not entity_matches_query(entity_name):
                continue

            if len(entity_normalized) > best_match_length:
                best_match = entity_name
                best_match_length = len(entity_normalized)

    timings["graph_build_and_matching"] = (
        time.perf_counter() - stage_start
    )

    # --------------------------------------------------
    # 10. Query Neo4j for the matching entity.
    #     Graph retrieval is optional: if Neo4j is
    #     unavailable, continue with vector results.
    # --------------------------------------------------

    stage_start = time.perf_counter()

    if best_match:
        neo4j_graph = None

        try:
            neo4j_graph = Neo4jGraph()
            result = neo4j_graph.query_entity(best_match)

            if result is not None:
                graph_results.append(result)

        except Exception as exc:
            print(
                "Neo4j unavailable; continuing with "
                f"vector retrieval. Error: {exc}"
            )

        finally:
            if neo4j_graph is not None:
                try:
                    neo4j_graph.close()
                except Exception as exc:
                    print(f"Neo4j close warning: {exc}")

    timings["graph_query"] = time.perf_counter() - stage_start

    # --------------------------------------------------
    # 11. Log timings
    # --------------------------------------------------

    total_time = time.perf_counter() - total_start

    print("\n========== RETRIEVER TIMING ==========")

    for stage, duration in timings.items():
        print(f"{stage:28s}: {duration:8.2f} seconds")

    print(f"{'Qdrant candidates':28s}: {candidate_count}")
    print(f"{'Unique documents':28s}: {unique_count}")
    print(f"{'Selected documents':28s}: {len(diverse_documents)}")
    print(f"{'Graph entities checked':28s}: {graph_entities_checked}")
    print(f"{'Total retrieval':28s}: {total_time:8.2f} seconds")
    print("======================================\n")

    # --------------------------------------------------
    # 12. Return retrieval + graph + query understanding
    # --------------------------------------------------

    return {
        "original_query": original_query,
        "intent": query_info["intent"],
        "entities": query_info["entities"],
        "expanded_query": expanded_query,
        "used_fallback": used_fallback,
        "documents": diverse_documents,
        "graph": graph_results
    }
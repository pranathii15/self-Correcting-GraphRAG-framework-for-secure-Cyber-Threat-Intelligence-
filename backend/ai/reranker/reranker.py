from sentence_transformers import CrossEncoder


MODEL_NAME = "BAAI/bge-reranker-base"

reranker = CrossEncoder(MODEL_NAME)


def rerank(query, documents, top_k=5):
    """
    Rerank retrieved documents using a CrossEncoder.

    Each document contains:
        - text
        - filename

    Returns ranked documents with:
        - rerank_score
    """

    if not documents:
        return []

    pairs = [
        (
            query,
            f"{document['filename']} {document['text']}"
        )
        for document in documents
    ]

    scores = reranker.predict(
        pairs,
        batch_size=8,
        show_progress_bar=False,
    )

    ranked = sorted(
        zip(documents, scores),
        key=lambda x: float(x[1]),
        reverse=True,
    )

    results = []

    for document, score in ranked[:top_k]:
        result = document.copy()
        result["rerank_score"] = float(score)
        results.append(result)

    return results
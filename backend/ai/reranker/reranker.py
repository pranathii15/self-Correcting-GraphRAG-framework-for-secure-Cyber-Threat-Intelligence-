from sentence_transformers import CrossEncoder

MODEL_NAME = "BAAI/bge-reranker-base"

reranker = CrossEncoder(MODEL_NAME)


def rerank(query, documents, top_k=5):
    """
    Rerank retrieved documents using a CrossEncoder.
    """

    if len(documents) == 0:
        return []

    pairs = [
        (query, document)
        for document in documents
    ]

    scores = reranker.predict(pairs)

    ranked = sorted(
        zip(documents, scores),
        key=lambda x: x[1],
        reverse=True
    )

    return [
        document
        for document, score in ranked[:top_k]
    ]
import math
import re


def _tokenize(text):
    """
    Convert text into normalized word tokens.
    """
    return set(
        re.findall(
            r"\b[a-zA-Z0-9][a-zA-Z0-9_-]*\b",
            text.lower(),
        )
    )


def _score_document(query, document):
    """
    Calculate a lightweight lexical relevance score.

    The score combines:
    - query-term overlap
    - filename matches
    - phrase matches
    """

    query_tokens = _tokenize(query)

    if not query_tokens:
        return 0.0

    text = document.get("text", "")
    filename = document.get("filename", "")

    text_tokens = _tokenize(text)
    filename_tokens = _tokenize(filename)

    # Query terms appearing in the document.
    overlap = query_tokens.intersection(text_tokens)

    # Basic recall-style score.
    overlap_score = len(overlap) / len(query_tokens)

    # Give a small boost when query terms occur in the filename.
    filename_overlap = query_tokens.intersection(
        filename_tokens
    )

    filename_score = (
        len(filename_overlap) / len(query_tokens)
    )

    # Phrase match gives an additional small boost.
    normalized_query = " ".join(
        query.lower().split()
    )
    normalized_text = " ".join(
        text.lower().split()
    )

    phrase_score = (
        1.0
        if normalized_query
        and normalized_query in normalized_text
        else 0.0
    )

    # Final lightweight score.
    score = (
        0.75 * overlap_score
        + 0.20 * filename_score
        + 0.05 * phrase_score
    )

    return float(score)


def rerank(query, documents, top_k=5):
    """
    Lightweight CPU-friendly document reranker.

    Each document contains:
        - text
        - filename

    Returns ranked documents with:
        - rerank_score
    """

    if not documents:
        return []

    scored_documents = []

    for document in documents:
        score = _score_document(
            query,
            document,
        )

        result = document.copy()
        result["rerank_score"] = score

        scored_documents.append(result)

    ranked = sorted(
        scored_documents,
        key=lambda document: document["rerank_score"],
        reverse=True,
    )

    return ranked[:top_k]
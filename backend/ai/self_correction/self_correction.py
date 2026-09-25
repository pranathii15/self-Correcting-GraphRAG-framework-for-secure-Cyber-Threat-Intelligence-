from ai.vectorstore.retriever import search_documents
from ai.self_correction.reasoning_agent import analyze_evidence
from ai.self_correction.confidence_checker import check_confidence

MAX_RETRIES = 2


def run_self_correction(query, limit=5):
    if not query or not isinstance(query, str) or not query.strip():
        return {
            "query": query,
            "documents": [],
            "graph": [],
            "reasoning": {
                "sufficient": False,
                "coverage": "none",
                "consistency": "unknown",
                "missing_information": [
                    "A valid query was not provided."
                ],
                "conflicts": [],
                "unsupported_claims": [],
                "reason": "The query is empty or invalid.",
                "used_fallback": True,
            },
            "confidence": "LOW",
            "confidence_reason": "A valid query was not provided.",
            "retry_count": 0,
            "correction_exhausted": False,
        }

    current_query = query
    retry_count = 0

    while True:
        retrieval_result = search_documents(
            current_query,
            limit=limit
        )

        documents = retrieval_result.get("documents", [])
        graph = retrieval_result.get("graph", [])

        reasoning_result = analyze_evidence(
            query=query,
            documents=documents,
            graph=graph,
        )

        confidence_result = check_confidence(reasoning_result)

        # ---------------------------------------------------------
        # IMPORTANT:
        # If the Reasoning Agent could not run because Gemini is
        # unavailable, do NOT retry the entire retrieval pipeline.
        # The retrieved evidence can still be used by the local
        # fallback answer generator.
        # ---------------------------------------------------------
        if reasoning_result.get("used_fallback", False):
            return {
                "query": query,
                "retrieval_query": current_query,
                "documents": documents,
                "graph": graph,
                "reasoning": reasoning_result,
                "confidence": "LOW",
                "confidence_reason": (
                    "Reasoning could not be evaluated because "
                    "the reasoning model was unavailable. "
                    "Retrieved evidence is available for fallback."
                ),
                "retry_count": retry_count,
                "correction_exhausted": False,
                "reasoning_unavailable": True,

                # Retrieval metadata
                "intent": retrieval_result.get("intent"),
                "expanded_query": retrieval_result.get(
                    "expanded_query"
                ),
                "retrieval_used_fallback": retrieval_result.get(
                    "used_fallback",
                    False,
                ),
            }

        # ---------------------------------------------------------
        # Normal self-correction path
        # ---------------------------------------------------------
        if (
            reasoning_result.get("sufficient", False)
            and confidence_result["confidence"]
            in {"HIGH", "MEDIUM"}
        ):
            return {
                "query": query,
                "retrieval_query": current_query,
                "documents": documents,
                "graph": graph,
                "reasoning": reasoning_result,
                "confidence": confidence_result["confidence"],
                "confidence_reason": confidence_result["reason"],
                "retry_count": retry_count,
                "correction_exhausted": False,

                # Retrieval metadata
                "intent": retrieval_result.get("intent"),
                "expanded_query": retrieval_result.get(
                    "expanded_query"
                ),
                "retrieval_used_fallback": retrieval_result.get(
                    "used_fallback",
                    False,
                ),
            }

        # ---------------------------------------------------------
        # Maximum self-correction attempts reached
        # ---------------------------------------------------------
        if retry_count >= MAX_RETRIES:
            return {
                "query": query,
                "retrieval_query": current_query,
                "documents": documents,
                "graph": graph,
                "reasoning": reasoning_result,
                "confidence": confidence_result["confidence"],
                "confidence_reason": confidence_result["reason"],
                "retry_count": retry_count,
                "correction_exhausted": True,

                # Retrieval metadata
                "intent": retrieval_result.get("intent"),
                "expanded_query": retrieval_result.get(
                    "expanded_query"
                ),
                "retrieval_used_fallback": retrieval_result.get(
                    "used_fallback",
                    False,
                ),
            }

        # ---------------------------------------------------------
        # Evidence is insufficient but reasoning itself worked.
        # This is when self-correction should actually happen.
        # ---------------------------------------------------------
        missing_information = reasoning_result.get(
            "missing_information",
            [],
        )

        unsupported_claims = reasoning_result.get(
            "unsupported_claims",
            [],
        )

        refinement_parts = [query]

        if missing_information:
            refinement_parts.extend(missing_information)

        if unsupported_claims:
            refinement_parts.extend(unsupported_claims)

        current_query = " ".join(refinement_parts)
        retry_count += 1
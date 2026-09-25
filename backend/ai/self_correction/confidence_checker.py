def check_confidence(reasoning_result):
    """
    Classify confidence based on the evidence assessment
    produced by the Reasoning Agent.
    """

    if not isinstance(reasoning_result, dict):
        return {
            "confidence": "LOW",
            "reason": "No valid reasoning result was provided."
        }

    sufficient = reasoning_result.get("sufficient", False)
    coverage = reasoning_result.get("coverage", "none")
    consistency = reasoning_result.get("consistency", "unknown")

    missing_information = reasoning_result.get(
        "missing_information", []
    )

    conflicts = reasoning_result.get("conflicts", [])

    unsupported_claims = reasoning_result.get(
        "unsupported_claims", []
    )

    # High confidence:
    # Evidence is sufficient, covers the question well,
    # and has no identified conflicts.
    if (
        sufficient
        and coverage == "high"
        and consistency == "consistent"
        and not conflicts
        and not unsupported_claims
    ):
        return {
            "confidence": "HIGH",
            "reason": (
                "The evidence sufficiently covers the question "
                "and is internally consistent."
            )
        }

    # Medium confidence:
    # Some useful evidence exists, but coverage is incomplete
    # or there are minor limitations.
    if (
        coverage == "medium"
        and consistency != "conflicting"
        and not conflicts
    ):
        return {
            "confidence": "MEDIUM",
            "reason": (
                "The evidence is relevant but does not completely "
                "cover the question."
            )
        }

    # Everything else is treated as low confidence.
    reasons = []

    if not sufficient:
        reasons.append("the evidence is insufficient")

    if coverage in {"low", "none"}:
        reasons.append("evidence coverage is limited")

    if consistency == "conflicting" or conflicts:
        reasons.append("the evidence contains conflicts")

    if missing_information:
        reasons.append("important information is missing")

    if unsupported_claims:
        reasons.append("some claims are not supported by the evidence")

    if not reasons:
        reasons.append("the evidence could not be confidently assessed")

    return {
        "confidence": "LOW",
        "reason": "; ".join(reasons) + "."
    }
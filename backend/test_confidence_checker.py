from ai.self_correction.confidence_checker import check_confidence


# Test 1: High confidence
high_result = {
    "sufficient": True,
    "coverage": "high",
    "consistency": "consistent",
    "missing_information": [],
    "conflicts": [],
    "unsupported_claims": []
}

print("Test 1 - High confidence:")
print(check_confidence(high_result))


# Test 2: Medium confidence
medium_result = {
    "sufficient": False,
    "coverage": "medium",
    "consistency": "consistent",
    "missing_information": [
        "Some details are missing"
    ],
    "conflicts": [],
    "unsupported_claims": []
}

print("\nTest 2 - Medium confidence:")
print(check_confidence(medium_result))


# Test 3: Low confidence - conflicting evidence
conflict_result = {
    "sufficient": False,
    "coverage": "high",
    "consistency": "conflicting",
    "missing_information": [],
    "conflicts": [
        "Two sources provide different information"
    ],
    "unsupported_claims": []
}

print("\nTest 3 - Conflicting evidence:")
print(check_confidence(conflict_result))


# Test 4: Low confidence - no evidence
no_evidence_result = {
    "sufficient": False,
    "coverage": "none",
    "consistency": "unknown",
    "missing_information": [
        "No relevant evidence was retrieved"
    ],
    "conflicts": [],
    "unsupported_claims": [
        "The question cannot be answered from the evidence"
    ]
}

print("\nTest 4 - No evidence:")
print(check_confidence(no_evidence_result))
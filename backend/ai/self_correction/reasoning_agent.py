import os
import json

from google import genai
from dotenv import load_dotenv


load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=API_KEY) if API_KEY else None

MODEL_NAME = "gemini-3.8-flash"


def _fallback_reasoning():
    """
    Return a safe reasoning result when Gemini is unavailable
    or its response cannot be parsed.
    """
    return {
        "sufficient": False,
        "coverage": "unknown",
        "consistency": "unknown",
        "missing_information": [
            "Evidence could not be evaluated."
        ],
        "conflicts": [],
        "unsupported_claims": [],
        "reason": (
            "The reasoning agent could not evaluate the retrieved "
            "evidence."
        ),
        "used_fallback": True,
    }


def analyze_evidence(query, documents=None, graph=None):
    """
    Analyze retrieved document and graph evidence for a user query.

    The reasoning agent does not generate the final answer.
    It only determines whether the supplied evidence is sufficient,
    complete, and consistent enough to support an answer.
    """

    if not query or not isinstance(query, str) or not query.strip():
        return _fallback_reasoning()

    documents = documents or []
    graph = graph or []

    if client is None:
        return _fallback_reasoning()

    # Prepare document evidence
    document_context = []

    for index, document in enumerate(documents, start=1):
        text = document.get("text", "")
        filename = document.get("filename", "Unknown source")

        if text:
            document_context.append(
                f"Document {index}: {filename}\n{text}"
            )

    document_context = "\n\n".join(document_context)

    # Prepare graph evidence
    graph_context = (
        json.dumps(graph, indent=2)
        if graph
        else "No graph evidence available."
    )

    prompt = f"""
You are the Reasoning Agent in a cybersecurity
threat-intelligence system.

Your task is to evaluate whether the supplied evidence
is sufficient to answer the user's question.

IMPORTANT:
- Use ONLY the supplied document and graph evidence.
- Do NOT use your general knowledge to fill missing information.
- Do NOT invent facts, entities, relationships, sources, or claims.
- Do NOT generate the final answer to the user.
- Your job is evidence analysis only.

Return ONLY valid JSON using exactly this structure:

{{
    "sufficient": true,
    "coverage": "high",
    "consistency": "consistent",
    "missing_information": [],
    "conflicts": [],
    "unsupported_claims": [],
    "reason": "..."
}}

Field rules:

1. sufficient:
   - true only when the supplied evidence is sufficient to
     support a reliable answer to the user's question.
   - false when important information is missing, evidence is
     irrelevant, or evidence is contradictory.

2. coverage:
   - "high" when the evidence directly covers the main question.
   - "medium" when the evidence covers only part of the question.
   - "low" when little relevant information is available.
   - "none" when there is no useful evidence.

3. consistency:
   - "consistent" when the supplied evidence does not conflict.
   - "conflicting" when relevant evidence contradicts another
     piece of evidence.
   - "unknown" when there is not enough evidence to determine
     consistency.

4. missing_information:
   - List important information required to answer the question
     that is not present in the supplied evidence.
   - Use an empty list when nothing important is missing.

5. conflicts:
   - List concrete contradictions between supplied evidence.
   - Use an empty list when no contradictions exist.

6. unsupported_claims:
   - Identify parts of the user's question that the evidence
     cannot support.
   - Use an empty list when all relevant parts are supported.

7. reason:
   - Briefly explain why the evidence is or is not sufficient.
   - Base this explanation only on the supplied evidence.

User question:
{query}

Retrieved document evidence:
{document_context or "No document evidence available."}

Retrieved graph evidence:
{graph_context}
"""

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
        )

        if not response.text:
            return _fallback_reasoning()

        text = response.text.strip()

        # Remove Markdown code fences if Gemini adds them
        if text.startswith("```"):
            text = text.replace("```json", "")
            text = text.replace("```", "").strip()

        result = json.loads(text)

        required_fields = [
            "sufficient",
            "coverage",
            "consistency",
            "missing_information",
            "conflicts",
            "unsupported_claims",
            "reason",
        ]

        if not isinstance(result, dict):
            return _fallback_reasoning()

        if not all(field in result for field in required_fields):
            return _fallback_reasoning()

        # Validate the expected field types
        if not isinstance(result["sufficient"], bool):
            return _fallback_reasoning()

        if result["coverage"] not in {
            "high",
            "medium",
            "low",
            "none",
        }:
            return _fallback_reasoning()

        if result["consistency"] not in {
            "consistent",
            "conflicting",
            "unknown",
        }:
            return _fallback_reasoning()

        if not isinstance(result["missing_information"], list):
            return _fallback_reasoning()

        if not isinstance(result["conflicts"], list):
            return _fallback_reasoning()

        if not isinstance(result["unsupported_claims"], list):
            return _fallback_reasoning()

        if not isinstance(result["reason"], str):
            return _fallback_reasoning()

        result["used_fallback"] = False

        return result

    except Exception as error:
        print(
            f"Reasoning Agent fallback: "
            f"{type(error).__name__}: {error}"
        )
        return _fallback_reasoning()
import os
import json

from google import genai
from dotenv import load_dotenv


# Load environment variables
load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

# Create Gemini client only when an API key is available
client = genai.Client(api_key=API_KEY) if API_KEY else None

MODEL_NAME = "gemini-3.8-flash"


def _fallback_reasoning():
    """
    Return a safe reasoning structure when Gemini is unavailable
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
            "The reasoning agent could not evaluate "
            "the retrieved evidence."
        ),
        "used_fallback": True,
    }


def analyze_evidence(query, documents=None, graph=None):
    """
    Analyze retrieved cybersecurity evidence using Gemini.

    The reasoning agent evaluates whether the retrieved
    documents and graph evidence are sufficient, consistent,
    and relevant to answer the user's query.

    If Gemini is unavailable, a safe fallback assessment
    is returned so the self-correction pipeline can continue
    without repeatedly retrying an unavailable model.
    """

    # Validate query
    if not query or not isinstance(query, str) or not query.strip():
        return _fallback_reasoning()

    documents = documents or []
    graph = graph or []

    # Gemini unavailable
    if client is None:
        return _fallback_reasoning()

    # Prepare document evidence
    document_context = []

    for index, document in enumerate(documents, start=1):
        text = document.get("text", "")
        filename = document.get(
            "filename",
            "Unknown source"
        )

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
You are a cybersecurity evidence reasoning agent
for a Cyber Threat Intelligence system.

Your task is to evaluate ONLY the retrieved evidence
provided below.

Do not use outside knowledge.
Do not invent facts.
Do not answer the user's question directly.

User query:
{query}

Retrieved document evidence:
{document_context if document_context else "No document evidence available."}

Retrieved graph evidence:
{graph_context}

Return ONLY valid JSON using exactly this structure:

{{
    "sufficient": true,
    "coverage": "complete",
    "consistency": "consistent",
    "missing_information": [],
    "conflicts": [],
    "unsupported_claims": [],
    "reason": "Brief explanation based only on the evidence."
}}

Rules:

1. sufficient:
   - true only when the retrieved evidence is adequate
     to support an answer to the user's query.
   - false when important evidence is missing or unclear.

2. coverage:
   - Describe how well the retrieved evidence covers
     the user's query.
   - Use concise values such as:
     "complete", "partial", or "insufficient".

3. consistency:
   - Determine whether the retrieved document and graph
     evidence agree with each other.
   - Use concise values such as:
     "consistent", "conflicting", or "unknown".

4. missing_information:
   - List important information needed to answer the
     query that is not present in the retrieved evidence.
   - Use an empty list when nothing important is missing.

5. conflicts:
   - List contradictions between the retrieved evidence.
   - Use an empty list when there are no conflicts.

6. unsupported_claims:
   - Identify claims that cannot be supported by the
     retrieved evidence.
   - Use an empty list when there are none.

7. reason:
   - Briefly explain the assessment using only the
     retrieved evidence.
   - Do not introduce outside cybersecurity knowledge.

Return only the JSON object.
"""

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config={
                "http_options": {
                    "timeout": 10000
                }
            },
        )

        if not response.text:
            return _fallback_reasoning()

        text = response.text.strip()

        # Remove Markdown code fences if present
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

        # Validate result structure
        if not isinstance(result, dict):
            return _fallback_reasoning()

        if not all(
            field in result
            for field in required_fields
        ):
            return _fallback_reasoning()

        # Validate field types
        if not isinstance(
            result["sufficient"],
            bool
        ):
            return _fallback_reasoning()

        if not isinstance(
            result["coverage"],
            str
        ):
            return _fallback_reasoning()

        if not isinstance(
            result["consistency"],
            str
        ):
            return _fallback_reasoning()

        if not isinstance(
            result["missing_information"],
            list
        ):
            return _fallback_reasoning()

        if not isinstance(
            result["conflicts"],
            list
        ):
            return _fallback_reasoning()

        if not isinstance(
            result["unsupported_claims"],
            list
        ):
            return _fallback_reasoning()

        if not isinstance(
            result["reason"],
            str
        ):
            return _fallback_reasoning()

        result["used_fallback"] = False

        return result

    except Exception as error:
        error_type = type(error).__name__
        error_message = str(error)

        if (
            "429" in error_message
            or "RESOURCE_EXHAUSTED" in error_message
        ):
            print(
                "Reasoning Agent fallback: "
                "Gemini quota unavailable; "
                "using fallback assessment."
            )

        elif (
            "503" in error_message
            or "UNAVAILABLE" in error_message
        ):
            print(
                "Reasoning Agent fallback: "
                "Gemini temporarily unavailable; "
                "using fallback assessment."
            )

        else:
            print(
                f"Reasoning Agent fallback: {error_type}"
            )

        return _fallback_reasoning()
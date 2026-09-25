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


def _fallback_query(user_query: str):
    """
    Return a safe query structure when Gemini is unavailable
    or its response cannot be parsed.
    """
    return {
        "original_query": user_query,
        "intent": "cybersecurity information retrieval",
        "entities": [],
        "expanded_query": user_query,
        "used_fallback": True,
    }


def understand_query(user_query: str):
    """
    Understand and expand a cybersecurity query using Gemini.

    The original query is preserved for reranking and graph
    matching. If Gemini fails or returns invalid output,
    retrieval continues using the original query.
    """

    # Validate user query
    if not user_query or not user_query.strip():
        return _fallback_query(user_query)

    # Gemini client unavailable
    if client is None:
        return _fallback_query(user_query)

    prompt = f"""
You are a cybersecurity query understanding and search
expansion agent for a Cyber Threat Intelligence system.

Analyze the user's question and return ONLY valid JSON.

Use exactly this structure:

{{
    "original_query": "...",
    "intent": "...",
    "entities": [],
    "expanded_query": "..."
}}

Rules:

1. original_query:
   - Preserve the user's exact question.

2. intent:
   - Briefly describe what information the user is seeking.
   - Do not answer the question.

3. entities:
   - Return a JSON list of important cybersecurity entities
     explicitly mentioned in the user's question.
   - Include relevant names such as malware families,
     threat actors, CVEs, tools, and organizations.
   - Do not invent entity names.
   - For a broad concept query, an empty list is acceptable.

4. expanded_query:
   - Create a concise search query that improves retrieval
     from cybersecurity threat intelligence documents.
   - Preserve the user's main topic and intended scope.
   - For broad questions, include useful synonyms,
     terminology, and relevant subtopics without narrowing
     the query to a single threat actor or incident.
   - For questions about a specific entity, retain its exact
     name and include relevant contextual terms.
   - Do not introduce unrelated malware, threat actors,
     vulnerabilities, or incidents.
   - Do not turn the query into an answer.
   - Keep the expansion focused and reasonably concise.

5. Output:
   - Return only a valid JSON object.
   - Do not include Markdown fences or extra commentary.

User query:
{user_query}
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

        # Empty Gemini response
        if not response.text:
            return _fallback_query(user_query)

        text = response.text.strip()

        # Remove Markdown code fences if Gemini adds them
        if text.startswith("```"):
            text = text.replace("```json", "")
            text = text.replace("```", "").strip()

        # Parse JSON
        result = json.loads(text)

        required_fields = [
            "original_query",
            "intent",
            "entities",
            "expanded_query",
        ]

        # Validate response structure
        if not isinstance(result, dict):
            return _fallback_query(user_query)

        if not all(
            field in result
            for field in required_fields
        ):
            return _fallback_query(user_query)

        # Validate field types
        if not isinstance(
            result["intent"],
            str
        ):
            return _fallback_query(user_query)

        if not isinstance(
            result["entities"],
            list
        ):
            return _fallback_query(user_query)

        if not isinstance(
            result["expanded_query"],
            str
        ):
            return _fallback_query(user_query)

        if not result["expanded_query"].strip():
            return _fallback_query(user_query)

        # Always preserve the exact user query
        result["original_query"] = user_query

        # Normalize expanded query
        result["expanded_query"] = (
            result["expanded_query"].strip()
        )

        # Mark successful Gemini processing
        result["used_fallback"] = False

        return result

    except Exception as error:
        error_type = type(error).__name__
        error_message = str(error)

        # Gemini quota exhausted
        if (
            "429" in error_message
            or "RESOURCE_EXHAUSTED" in error_message
        ):
            print(
                "Query Agent fallback: "
                "Gemini quota unavailable; "
                "using fallback query."
            )

        # Gemini temporarily unavailable
        elif (
            "503" in error_message
            or "UNAVAILABLE" in error_message
        ):
            print(
                "Query Agent fallback: "
                "Gemini temporarily unavailable; "
                "using fallback query."
            )

        # Other errors
        else:
            print(
                f"Query Agent fallback: {error_type}"
            )

        return _fallback_query(user_query)
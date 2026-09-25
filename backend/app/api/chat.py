import time

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ai.self_correction.self_correction import run_self_correction
from ai.agents.answer_agent import generate_answer


router = APIRouter(prefix="/chat", tags=["Chat"])


class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000)


@router.post("/")
def chat(request: ChatRequest):
    total_start = time.perf_counter()
    query = request.query.strip()

    if not query:
        raise HTTPException(
            status_code=400,
            detail="Query cannot be empty."
        )

    try:
        # ------------------------------------------------
        # Stage 1: Retrieval + Reasoning + Self-Correction
        # ------------------------------------------------
        retrieval_start = time.perf_counter()

        correction_result = run_self_correction(
            query,
            limit=5
        )

        retrieval_time = time.perf_counter() - retrieval_start

        # ------------------------------------------------
        # Stage 2: Answer Generation
        # ------------------------------------------------
        answer_start = time.perf_counter()

        answer_result = generate_answer(
            query=correction_result.get("query", query),
            documents=correction_result.get("documents", []),
            graph=correction_result.get("graph", []),
        )

        answer_time = time.perf_counter() - answer_start

        # ------------------------------------------------
        # Total Request Time
        # ------------------------------------------------
        total_time = time.perf_counter() - total_start

        # Print timing information in backend terminal
        print("\n========== CHAT TIMING ==========")
        print(f"Retrieval time:       {retrieval_time:.2f} seconds")
        print(f"Answer generation:    {answer_time:.2f} seconds")
        print(f"Total request time:   {total_time:.2f} seconds")
        print("=================================\n")

        # ------------------------------------------------
        # Final API Response
        # ------------------------------------------------
        return {
            "query": query,

            # Answer
            "answer": answer_result.get(
                "answer",
                ""
            ),

            # Answer Agent status
            "used_fallback": answer_result.get(
                "used_fallback",
                False
            ),

            "evidence_used": answer_result.get(
                "evidence_used",
                False
            ),

            # Confidence
            "confidence": correction_result.get(
                "confidence"
            ),

            "confidence_reason": correction_result.get(
                "confidence_reason"
            ),

            # Structured reasoning metadata
            "reasoning": correction_result.get(
                "reasoning",
                {}
            ),

            # Self-correction
            "retry_count": correction_result.get(
                "retry_count",
                0
            ),

            "correction_exhausted": correction_result.get(
                "correction_exhausted",
                False
            ),

            # IMPORTANT:
            # Tell the frontend when the reasoning model
            # was unavailable and fallback reasoning was used.
            "reasoning_unavailable": correction_result.get(
                "reasoning_unavailable",
                False
            ),

            # Timing
            "timing": {
                "retrieval_seconds": round(
                    retrieval_time,
                    2
                ),
                "answer_generation_seconds": round(
                    answer_time,
                    2
                ),
                "total_seconds": round(
                    total_time,
                    2
                ),
            },

            # Retrieval information
            "retrieval": {
                "intent": correction_result.get(
                    "intent"
                ),

                "expanded_query": correction_result.get(
                    "expanded_query"
                ),

                "used_fallback": correction_result.get(
                    "retrieval_used_fallback",
                    False
                ),

                "documents": correction_result.get(
                    "documents",
                    []
                ),

                "graph": correction_result.get(
                    "graph",
                    []
                ),
            },
        }

    except Exception as exc:
        print(f"Chat API error: {exc}")

        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing the query."
        )
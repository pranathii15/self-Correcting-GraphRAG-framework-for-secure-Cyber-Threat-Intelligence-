
import time

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ai.vectorstore.retriever import search_documents
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
        # Stage 1: Retrieval
        retrieval_start = time.perf_counter()

        retrieval_result = search_documents(query, limit=5)

        retrieval_time = time.perf_counter() - retrieval_start

        # Stage 2: Answer generation
        answer_start = time.perf_counter()

        answer_result = generate_answer(
            query=retrieval_result.get("original_query", query),
            documents=retrieval_result.get("documents", []),
            graph=retrieval_result.get("graph", []),
        )

        answer_time = time.perf_counter() - answer_start

        # Total request time
        total_time = time.perf_counter() - total_start

        # Print timing information in the backend terminal
        print("\n========== CHAT TIMING ==========")
        print(f"Retrieval time:       {retrieval_time:.2f} seconds")
        print(f"Answer generation:    {answer_time:.2f} seconds")
        print(f"Total request time:   {total_time:.2f} seconds")
        print("=================================\n")

        return {
            "query": query,
            "answer": answer_result.get("answer", ""),
            "used_fallback": answer_result.get("used_fallback", False),
            "evidence_used": answer_result.get("evidence_used", False),
            "timing": {
                "retrieval_seconds": round(retrieval_time, 2),
                "answer_generation_seconds": round(answer_time, 2),
                "total_seconds": round(total_time, 2),
            },
            "retrieval": {
                "intent": retrieval_result.get("intent"),
                "expanded_query": retrieval_result.get("expanded_query"),
                "used_fallback": retrieval_result.get("used_fallback", False),
                "documents": retrieval_result.get("documents", []),
                "graph": retrieval_result.get("graph", []),
            },
        }

    except Exception as exc:
        print(f"Chat API error: {exc}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing the query."
        )
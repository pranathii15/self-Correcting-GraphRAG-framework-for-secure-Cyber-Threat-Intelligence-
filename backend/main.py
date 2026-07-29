from fastapi import FastAPI

from backend.app.api.documents import router as documents_router


app = FastAPI(
    title="CyberGuard AI API",
    description=(
        "Backend API for the Self-Correcting Hybrid GraphRAG "
        "Cyber Threat Intelligence Platform"
    ),
    version="1.0.0"
)


app.include_router(documents_router)


@app.get("/")
def root():
    return {
        "message": "CyberGuard AI Backend is running",
        "status": "success"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }
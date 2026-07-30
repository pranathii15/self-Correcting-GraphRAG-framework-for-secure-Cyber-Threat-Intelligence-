from fastapi import FastAPI

from app.api.documents import router as documents_router
from app.api.auth import router as auth_router


app = FastAPI(
    title="CyberGuard AI API",
    description=(
        "Backend API for the Self-Correcting Hybrid GraphRAG "
        "Cyber Threat Intelligence Platform"
    ),
    version="1.0.0"
)

# Register Routers
app.include_router(documents_router)
app.include_router(auth_router)


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
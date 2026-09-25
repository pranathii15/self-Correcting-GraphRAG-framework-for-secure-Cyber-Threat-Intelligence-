from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.documents import router as documents_router
from app.api.auth import router as auth_router
from app.api.chat import router as chat_router


app = FastAPI(
    title="CyberGuard AI API",
    description=(
        "Backend API for the Self-Correcting Hybrid GraphRAG "
        "Cyber Threat Intelligence Platform"
    ),
    version="1.0.0"
)


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register Routers
app.include_router(documents_router)
app.include_router(auth_router)
app.include_router(chat_router)


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
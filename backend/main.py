from fastapi import FastAPI

app = FastAPI(
    title="CyberGuard AI API",
    description="Backend API for the Self-Correcting Hybrid GraphRAG Cyber Threat Intelligence Platform",
    version="1.0.0"
)


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
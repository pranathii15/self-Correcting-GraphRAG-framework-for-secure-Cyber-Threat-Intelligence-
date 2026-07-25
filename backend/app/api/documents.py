from fastapi import APIRouter, UploadFile, File, HTTPException

from backend.app.services.file_service import save_uploaded_file
from backend.app.services.document_pipeline import process_document

router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...)
):
    try:
        # Save uploaded file
        file_info = save_uploaded_file(file)

        # Process the uploaded document
        result = process_document(file_info["file_path"])

        return {
            "status": "success",
            "message": "Document uploaded and processed successfully",
            "document": {
                "original_filename": file_info["original_filename"],
                "stored_filename": file_info["stored_filename"],
                "file_type": file_info["file_type"],
                "characters": result["characters"],
                "chunks": result["chunks"],
                "embeddings": result["embeddings"]
            }
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )
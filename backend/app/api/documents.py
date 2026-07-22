from fastapi import APIRouter, UploadFile, File, HTTPException

from backend.app.services.file_service import save_uploaded_file


router = APIRouter(
    prefix="/documents",
    tags=["Documents"]
)


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...)
):

    try:

        file_info = save_uploaded_file(file)

        return {
            "message": "Document uploaded successfully",
            "document": file_info
        }

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception:

        raise HTTPException(
            status_code=500,
            detail="Failed to upload document"
        )
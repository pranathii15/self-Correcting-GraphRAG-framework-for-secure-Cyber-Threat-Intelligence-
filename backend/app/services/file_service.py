from pathlib import Path
import shutil
import uuid


UPLOAD_DIR = Path("data/raw/uploads")

ALLOWED_EXTENSIONS = {
    ".pdf",
    ".txt",
    ".docx",
    ".json"
}


def save_uploaded_file(upload_file):

    extension = Path(upload_file.filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise ValueError(
            f"Unsupported file type: {extension}"
        )

    UPLOAD_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    unique_filename = (
        f"{uuid.uuid4()}_{upload_file.filename}"
    )

    file_path = UPLOAD_DIR / unique_filename

    with file_path.open("wb") as buffer:
        shutil.copyfileobj(
            upload_file.file,
            buffer
        )

    return {
        "original_filename": upload_file.filename,
        "stored_filename": unique_filename,
        "file_path": str(file_path),
        "file_type": extension
    }
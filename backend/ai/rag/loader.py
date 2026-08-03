from langchain_community.document_loaders import PyMuPDFLoader


def load_pdf(pdf_path):
    """
    Load a PDF and return its documents.
    """
    loader = PyMuPDFLoader(pdf_path)
    return loader.load()
from pathlib import Path
import json
import fitz
from docx import Document


def load_pdf(file_path):
    document = fitz.open(file_path)
    text = ""

    for page in document:
        text += page.get_text()

    document.close()
    return text


def load_docx(file_path):
    document = Document(file_path)
    return "\n".join([paragraph.text for paragraph in document.paragraphs])


def load_txt(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        return file.read()


def load_json(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        data = json.load(file)

    # CTINexus reports store the article here
    if isinstance(data, dict) and "text" in data:
        return data["text"]

    # Fallback for other JSON files
    return json.dumps(data, indent=2)


def load_document(file_path):
    file_path = Path(file_path)
    extension = file_path.suffix.lower()

    if extension == ".pdf":
        return load_pdf(file_path)

    elif extension == ".docx":
        return load_docx(file_path)

    elif extension == ".txt":
        return load_txt(file_path)

    elif extension == ".json":
        return load_json(file_path)

    else:
        raise ValueError(f"Unsupported file type: {extension}")

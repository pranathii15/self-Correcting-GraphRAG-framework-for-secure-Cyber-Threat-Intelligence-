from langchain_community.document_loaders import PyMuPDFLoader


def load_pdf(pdf_path):
    """
    Load a PDF and return its documents.
    """
    loader = PyMuPDFLoader(pdf_path)
    return loader.load()
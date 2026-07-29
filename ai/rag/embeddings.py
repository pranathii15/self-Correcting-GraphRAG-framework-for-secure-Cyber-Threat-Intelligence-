from langchain_community.embeddings import HuggingFaceEmbeddings


def get_embeddings():
    """
    Load the embedding model.
    """
    return HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
from sentence_transformers import SentenceTransformer

MODEL_NAME = "BAAI/bge-small-en-v1.5"

model = SentenceTransformer(MODEL_NAME)


def generate_embeddings(chunks):

    embeddings = model.encode(
        chunks,
        normalize_embeddings=True
    )

    return embeddings

from ai.vectorstore import FAISSVectorStore
from ai.rag.embeddings import get_embeddings


def get_retriever():
    embeddings = get_embeddings()

    vector_store = FAISSVectorStore(embeddings)
    vector_store.load()

    return vector_store
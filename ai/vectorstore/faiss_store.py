import os
import pickle
import faiss
from langchain_community.vectorstores import FAISS


class FAISSVectorStore:
    def __init__(self, embeddings, index_path="ai/vectorstore/index"):
        self.embeddings = embeddings
        self.index_path = index_path
        self.db = None

    def create(self, documents):
        """
        Create a FAISS vector store from documents.
        """
        self.db = FAISS.from_documents(documents, self.embeddings)
        self.save()

    def save(self):
        """
        Save the FAISS index locally.
        """
        if self.db:
            self.db.save_local(self.index_path)

    def load(self):
        """
        Load the FAISS index if it exists.
        """
        if os.path.exists(self.index_path):
            self.db = FAISS.load_local(
                self.index_path,
                self.embeddings,
                allow_dangerous_deserialization=True
            )

    def similarity_search(self, query, k=5):
        """
        Retrieve the k most similar documents.
        """
        if not self.db:
            self.load()

        if not self.db:
            raise ValueError("FAISS index not found.")

        return self.db.similarity_search(query, k=k)
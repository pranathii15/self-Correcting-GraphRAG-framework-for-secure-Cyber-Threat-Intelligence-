import numpy as np


class Retriever:

    def __init__(self):
        self.documents = []
        self.embeddings = None

    def add_documents(self, chunks, embeddings):
        self.documents = chunks
        self.embeddings = embeddings

    def retrieve(self, query_embedding, top_k=3):

        scores = np.dot(self.embeddings, query_embedding)

        top_indices = np.argsort(scores)[::-1][:top_k]

        return [self.documents[i] for i in top_indices]
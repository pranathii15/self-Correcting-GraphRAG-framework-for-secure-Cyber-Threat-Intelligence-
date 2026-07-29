from ai.rag.loader import load_document
from ai.rag.splitter import chunk_text
from ai.rag.embeddings import generate_embeddings

text = load_document(
    "ai/datasets/demo/3am-ransomware-lockbit.json"
)

chunks = chunk_text(text)

embeddings = generate_embeddings(chunks)

print("Characters:", len(text))
print("Chunks:", len(chunks))
print("Embeddings:", len(embeddings))
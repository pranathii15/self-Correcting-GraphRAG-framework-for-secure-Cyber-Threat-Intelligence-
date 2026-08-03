from ai.vectorstore.retriever import search_documents

results = search_documents(
    "Explain LockBit ransomware"
)

print("\nRetrieved Chunks\n")

for i, chunk in enumerate(results, start=1):
    print("=" * 70)
    print(f"Chunk {i}\n")
    print(chunk)
    print()
    
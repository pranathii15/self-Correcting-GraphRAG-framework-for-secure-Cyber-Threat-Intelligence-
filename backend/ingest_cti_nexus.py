from pathlib import Path

from ai.rag.loader import load_document
from ai.rag.splitter import chunk_text
from ai.rag.embeddings import generate_embeddings

from ai.vectorstore.qdrant_store import (
    create_collection,
    store_embeddings,
)

DATASET_PATH = Path("../data/cti_nexus/demo")


def ingest_dataset():

    create_collection()

    total_files = 0
    total_chunks = 0

    for file_path in DATASET_PATH.rglob("*"):

        if file_path.suffix.lower() not in [
            ".txt",
            ".pdf",
            ".docx",
            ".json",
            ".md",
        ]:
            continue

        print(f"\nProcessing {file_path.name}")

        try:

            text = load_document(str(file_path))

            chunks = chunk_text(text)

            embeddings = generate_embeddings(chunks)

            store_embeddings(chunks,embeddings,file_path.name)

            total_files += 1
            total_chunks += len(chunks)

            print(
                f"✓ {len(chunks)} chunks stored."
            )

        except Exception as e:

            print(f"✗ Failed: {e}")

    print("\n------------------------")
    print("Finished Indexing")
    print("------------------------")
    print(f"Files indexed : {total_files}")
    print(f"Chunks stored : {total_chunks}")


if __name__ == "__main__":
    ingest_dataset()
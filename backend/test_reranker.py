from ai.reranker.reranker import rerank

documents = [
    "LockBit is a ransomware-as-a-service platform.",
    "Cats like drinking milk.",
    "The CL0P ransomware group uses double extortion.",
    "FARGO ransomware encrypts Windows servers."
]

query = "Explain LockBit ransomware"

results = rerank(query, documents)

print("\nReranked Results\n")

for index, result in enumerate(results, start=1):
    print(f"{index}. {result}")
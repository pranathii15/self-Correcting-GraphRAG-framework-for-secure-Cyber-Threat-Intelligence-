Self-Correcting GraphRAG Framework for Secure Cyber Threat Intelligence

1. What is RAG?
RAG (Retrieval-Augmented Generation) is an AI method that helps an LLM answer questions using external documents instead of only its own knowledge.

How it works:
User asks a question.
The system searches for relevant documents.
The LLM reads those documents.
The LLM generates an answer based on the retrieved information.
Benefit: Reduces hallucinations and gives more accurate answers.




2. What is GraphRAG?
GraphRAG is an improved version of RAG.
Instead of searching only text, it also stores information as a knowledge graph.
A knowledge graph connects cybersecurity entities such as:
- Threat Actors
- Malware
- CVEs
- Campaigns
- Victims
using relationships like:
- uses
- attacks
- exploits
- targets
This helps the AI understand how different cyber threats are connected.




3. Limitations of Traditional RAG
Traditional RAG has some problems.
• Cannot connect information from many documents
If the answer is spread across multiple reports, RAG may miss important details.
• Doesn't understand relationships
It finds similar text but doesn't know how malware, attackers, and victims are connected.
• Can still hallucinate
If enough information isn't found, it may generate incorrect answers instead of saying "I don't know."
• Difficult to explain answers

It is hard to show why a particular answer was generated.




4. How does the Reference Paper Improve RAG?
The paper compares four AI systems:
- RAG
- GraphRAG
- Agentic GraphRAG
- HybridRAG

GraphRAG:
Uses a knowledge graph instead of only text.
Better for finding relationships between cyber entities.

Agentic GraphRAG:
Checks whether the generated graph query is correct.
If it finds an error, it automatically fixes the query before searching again.

HybridRAG
Uses both Graph search and Text search
Then combines both results to generate a better answer.

Main Finding
The paper concludes that HybridRAG and Agentic GraphRAG give the best results, while GraphRAG alone can fail if the graph query is incorrect.




5. How Will Our Project Improve the Reference Paper?
Our project goes one step further.
Instead of fixing only graph queries, we make the entire AI system self-correcting.

Our Improvements:
✓ Self-Correcting Retrieval
If the retrieved information is not enough, the AI searches again automatically.

✓ Better Query Understanding
The AI improves the user's question before searching to get better results.

✓ Multiple Retrieval Methods
Instead of using only graph search, we combine:
Vector Search
Graph Search
Metadata Search
This increases accuracy.

✓ Confidence Checking
Before giving the final answer, the AI checks:
Is enough evidence available?
Is the answer reliable?
If not, it retrieves more information.

✓ Explainable Answers
The AI will also show:
which CTI reports were used, important entities, relationships, and why it generated that answer.

✓ Modular AI Agents
Different AI agents will handle different tasks:
- Query Agent
- Retrieval Agent
- Graph Agent
- Self-Correction Agent
- Answer Generation Agent
This makes the system easier to improve and maintain.




6. Our Proposed AI Pipeline
User Query
      ↓
Query Understanding
      ↓
Vector RAG Search
      ↓
GraphRAG Search
      ↓
Reasoning Agent
      ↓
Self-Correction
      ↓
Confidence Check
      ↓
Final Answer
      ↓
Evidence + Explanation

Working Process
User asks a cybersecurity question.
The AI understands the query.
Vector RAG retrieves relevant CTI documents.
GraphRAG finds related entities and relationships.
The reasoning agent combines both results.
The self-correction module checks for missing or incorrect information.
If needed, it searches again automatically.
A confidence check verifies the answer.
The final answer is returned along with supporting evidence and explanations.
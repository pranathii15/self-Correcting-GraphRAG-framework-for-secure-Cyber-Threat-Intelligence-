from ai.self_correction.reasoning_agent import analyze_evidence


query = "Explain FARGO ransomware"


documents = [
    {
        "filename": "fargo-ransomware-attacking-microsoft-sql-servers.json",
        "text": (
            "FARGO ransomware focuses on Microsoft SQL servers. "
            "It is also known as Mallox and TargetCompany. "
            "The ransomware uses powershell.exe and cmd.exe."
        ),
    }
]


graph = [
    {
        "entity": "FARGO ransomware",
        "type": "MALWARE",
        "related_entities": [
            {
                "entity": "Microsoft SQL servers",
                "relation": "focuses on",
            },
            {
                "entity": "powershell.exe and cmd.exe",
                "relation": "uses",
            },
        ],
    }
]


result = analyze_evidence(
    query=query,
    documents=documents,
    graph=graph,
)


print("\n========== REASONING RESULT ==========")
print(result)
print("======================================")
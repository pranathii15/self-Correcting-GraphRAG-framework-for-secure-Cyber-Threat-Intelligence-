import re


class EntityExtractor:
    """
    Extract common cybersecurity entities from CTI text.

    This is a rule-based implementation intended as a lightweight
    foundation for the GraphRAG pipeline.
    """

    PATTERNS = {
        "VULNERABILITY": [
            r"\bCVE-\d{4}-\d{4,7}\b"
        ],
        "IP_ADDRESS": [
            r"\b(?:\d{1,3}\.){3}\d{1,3}\b"
        ],
        "DOMAIN": [
            r"\b(?:[a-zA-Z0-9-]+\.)+(?:com|org|net|io|gov|edu|info|biz)\b"
        ],
        "HASH": [
            r"\b[a-fA-F0-9]{32}\b",       # MD5
            r"\b[a-fA-F0-9]{40}\b",       # SHA-1
            r"\b[a-fA-F0-9]{64}\b"        # SHA-256
        ],
        "MALWARE": [
            r"\bLockBit\b",
            r"\bWannaCry\b",
            r"\bRyuk\b",
            r"\bConti\b",
            r"\bBlackCat\b",
            r"\bALPHV\b",
            r"\bEmotet\b",
            r"\bTrickBot\b"
        ],
        "SOFTWARE": [
            r"\bWindows\b",
            r"\bLinux\b",
            r"\bmacOS\b",
            r"\bPowerShell\b",
            r"\bMicrosoft Office\b"
        ],
        "TECHNIQUE": [
            r"\bPhishing\b",
            r"\bSpearphishing\b",
            r"\bCredential Dumping\b",
            r"\bPrivilege Escalation\b",
            r"\bLateral Movement\b",
            r"\bCommand and Control\b"
        ]
    }

    def extract_entities(self, text):
        """
        Extract entities and their types from CTI text.

        Returns:
            List of dictionaries containing entity text and type.
        """

        entities = []

        for entity_type, patterns in self.PATTERNS.items():
            for pattern in patterns:
                matches = re.findall(pattern, text, re.IGNORECASE)

                for match in matches:
                    if isinstance(match, tuple):
                        match = match[0]

                    entity = {
                        "text": match,
                        "type": entity_type
                    }

                    if entity not in entities:
                        entities.append(entity)

        return entities
import re


class EntityExtractor:
    """
    Extract cybersecurity entities.

    Uses CTINexus's existing entity annotations when available.
    Falls back to rule-based extraction for plain CTI text.
    """

    PATTERNS = {
        "VULNERABILITY": [
            r"\bCVE-\d{4}-\d{4,7}\b"
        ],
        "IP_ADDRESS": [
            r"\b(?:\d{1,3}\.){3}\d{1,3}\b"
        ],
        "DOMAIN": [
            r"\b(?:[a-zA-Z0-9-]+\.)+"
            r"(?:com|org|net|io|gov|edu|info|biz)\b"
        ],
        "HASH": [
            r"\b[a-fA-F0-9]{32}\b",
            r"\b[a-fA-F0-9]{40}\b",
            r"\b[a-fA-F0-9]{64}\b",
        ],
        "MALWARE": [
            r"\bLockBit\b",
            r"\bWannaCry\b",
            r"\bRyuk\b",
            r"\bConti\b",
            r"\bBlackCat\b",
            r"\bALPHV\b",
            r"\bEmotet\b",
            r"\bTrickBot\b",
            r"\bFARGO\b",
            r"\bRansomEXX\b",
            r"\bCL0P\b",
            r"\b3AM\b",
        ],
        "SOFTWARE": [
            r"\bWindows\b",
            r"\bLinux\b",
            r"\bmacOS\b",
            r"\bPowerShell\b",
            r"\bMicrosoft Office\b",
            r"\bcmd\.exe\b",
        ],
        "TECHNIQUE": [
            r"\bPhishing\b",
            r"\bSpearphishing\b",
            r"\bCredential Dumping\b",
            r"\bPrivilege Escalation\b",
            r"\bLateral Movement\b",
            r"\bCommand and Control\b",
            r"\bBrute[- ]Force\b",
        ],
    }

    def extract_from_ctinexus(self, data):
        """
        Extract entities directly from a CTINexus JSON object.
        """

        entities = []

        for entity in data.get("entities", []):
            name = entity.get("entity_name")
            entity_type = entity.get("entity_type")

            if not name:
                continue

            entities.append({
                "text": name,
                "type": entity_type
            })

        return entities

    def extract_entities(self, text):
        """
        Rule-based extraction for plain CTI text.
        """

        entities = []

        for entity_type, patterns in self.PATTERNS.items():

            for pattern in patterns:

                matches = re.findall(
                    pattern,
                    text,
                    re.IGNORECASE
                )

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
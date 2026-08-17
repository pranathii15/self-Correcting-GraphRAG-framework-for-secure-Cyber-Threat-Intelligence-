import re


class RelationshipExtractor:
    """
    Extract relationships from CTI data.

    Uses CTINexus explicit_triplets when available.
    Falls back to rule-based relationship extraction
    for plain CTI text.
    """

    RELATION_PATTERNS = {
        "EXPLOITS": [
            r"\bexploits?\b",
            r"\bexploited\b",
            r"\bexploiting\b",
        ],
        "TARGETS": [
            r"\btargets?\b",
            r"\btargeted\b",
            r"\btargeting\b",
        ],
        "USES": [
            r"\buses?\b",
            r"\bused\b",
            r"\busing\b",
        ],
        "DELIVERS": [
            r"\bdelivers?\b",
            r"\bdelivered\b",
            r"\bdelivering\b",
        ],
        "DROPS": [
            r"\bdrops?\b",
            r"\bdropped\b",
            r"\bdropping\b",
        ],
        "STEALS": [
            r"\bsteals?\b",
            r"\bstole\b",
            r"\bstealing\b",
        ],
        "COMMUNICATES_WITH": [
            r"\bcommunicates?\s+with\b",
            r"\bcommunicated\s+with\b",
        ],
    }

    def extract_from_ctinexus(self, data):
        """
        Extract relationships directly from CTINexus
        explicit_triplets.
        """

        relationships = []

        for triplet in data.get("explicit_triplets", []):

            subject = triplet.get("subject")
            relation = triplet.get("relation")
            object_entity = triplet.get("object")

            if not subject or not relation or not object_entity:
                continue

            relationship = {
                "subject": subject,
                "relationship": relation,
                "object": object_entity,
            }

            if relationship not in relationships:
                relationships.append(relationship)

        return relationships

    def extract_implicit_from_ctinexus(self, data):
        """
        Extract relationships from CTINexus implicit_triplets.
        """

        relationships = []

        for triplet in data.get("implicit_triplets", []):

            subject = triplet.get("subject")
            relation = triplet.get("relation")
            object_entity = triplet.get("object")

            if not subject or not relation or not object_entity:
                continue

            relationship = {
                "subject": subject,
                "relationship": relation,
                "object": object_entity,
            }

            if relationship not in relationships:
                relationships.append(relationship)

        return relationships

    def extract_relationships(self, text, entities):
        """
        Rule-based fallback for plain CTI text.
        """

        relationships = []

        entity_names = [
            entity["text"]
            for entity in entities
        ]

        for relation, patterns in self.RELATION_PATTERNS.items():

            for pattern in patterns:

                for match in re.finditer(
                    pattern,
                    text,
                    re.IGNORECASE,
                ):

                    sentence_start = max(
                        text.rfind(".", 0, match.start()),
                        text.rfind("!", 0, match.start()),
                        text.rfind("?", 0, match.start()),
                    ) + 1

                    sentence = text[
                        sentence_start:
                    ]

                    before = text[
                        sentence_start:
                        match.start()
                    ]

                    after = text[
                        match.end():
                    ]

                    previous_entities = [
                        entity
                        for entity in entity_names
                        if re.search(
                            r"\b"
                            + re.escape(entity)
                            + r"\b",
                            before,
                            re.IGNORECASE,
                        )
                    ]

                    next_entities = [
                        entity
                        for entity in entity_names
                        if re.search(
                            r"\b"
                            + re.escape(entity)
                            + r"\b",
                            after,
                            re.IGNORECASE,
                        )
                    ]

                    if not next_entities:
                        continue

                    if previous_entities:
                        subject = previous_entities[-1]
                    else:
                        subject = self._find_previous_malware(
                            text[:match.start()],
                            entities,
                        )

                    if not subject:
                        continue

                    object_entity = min(
                        next_entities,
                        key=lambda entity:
                        after.lower().find(entity.lower()),
                    )

                    relationship = {
                        "subject": subject,
                        "relationship": relation,
                        "object": object_entity,
                    }

                    if relationship not in relationships:
                        relationships.append(
                            relationship
                        )

        return relationships

    def _find_previous_malware(self, text, entities):
        malware_entities = [
            entity["text"]
            for entity in entities
            if entity["type"] == "MALWARE"
        ]

        previous_malware = [
            entity
            for entity in malware_entities
            if re.search(
                r"\b"
                + re.escape(entity)
                + r"\b",
                text,
                re.IGNORECASE,
            )
        ]

        if previous_malware:
            return previous_malware[-1]

        return None
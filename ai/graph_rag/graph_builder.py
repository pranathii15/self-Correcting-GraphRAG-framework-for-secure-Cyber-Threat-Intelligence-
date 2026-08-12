class GraphBuilder:
    """
    Builds an in-memory cybersecurity knowledge graph.

    Each entity is stored with its type, and extracted
    relationships are stored between entities.
    """

    def __init__(self):
        self.graph = {}

    def add_entities(self, entities):
        """
        Add structured entities to the graph.

        Entities should have the format:

        {
            "text": "LockBit",
            "type": "MALWARE"
        }
        """

        for entity in entities:
            name = entity["text"]
            entity_type = entity["type"]

            if name not in self.graph:
                self.graph[name] = {
                    "type": entity_type,
                    "relationships": []
                }

    def add_relationships(self, relationships):
        """
        Add extracted relationships to the graph.

        Relationships should have the format:

        {
            "subject": "LockBit",
            "relationship": "EXPLOITS",
            "object": "CVE-2023-12345"
        }
        """

        for relationship in relationships:
            subject = relationship["subject"]
            relation = relationship["relationship"]
            target = relationship["object"]

            if subject not in self.graph:
                self.graph[subject] = {
                    "type": "UNKNOWN",
                    "relationships": []
                }

            if target not in self.graph:
                self.graph[target] = {
                    "type": "UNKNOWN",
                    "relationships": []
                }

            graph_relationship = {
                "entity": target,
                "relation": relation
            }

            if graph_relationship not in self.graph[subject]["relationships"]:
                self.graph[subject]["relationships"].append(
                    graph_relationship
                )

    def get_graph(self):
        """
        Return the complete graph.
        """
        return self.graph
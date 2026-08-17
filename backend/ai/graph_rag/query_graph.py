class GraphQuery:
    """
    Query the in-memory cybersecurity knowledge graph.
    """

    def __init__(self, graph):
        self.graph = graph

    def get_entity(self, entity):
        return self.graph.get(entity)

    def get_related_entities(self, entity):
        entity_data = self.graph.get(entity)

        if not entity_data:
            return []

        return entity_data.get("relationships", [])

    def query(self, entity):
        entity_data = self.graph.get(entity)

        if not entity_data:
            return {
                "entity": entity,
                "type": None,
                "related_entities": []
            }

        return {
            "entity": entity,
            "type": entity_data.get("type"),
            "related_entities": entity_data.get(
                "relationships", []
            )
        }
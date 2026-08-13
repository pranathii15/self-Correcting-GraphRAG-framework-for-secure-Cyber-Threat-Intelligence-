class GraphQuery:
    """
    Query the in-memory cybersecurity knowledge graph
    created by GraphBuilder.
    """

    def __init__(self, graph):
        self.graph = graph

    def get_entity(self, entity):
        """
        Return information about an entity.
        """
        return self.graph.get(entity)

    def get_related_entities(self, entity):
        """
        Return entities directly connected to the given entity.
        """
        entity_data = self.graph.get(entity)

        if not entity_data:
            return []

        return entity_data.get("relationships", [])

    def query(self, entity):
        """
        Query the graph for an entity and return its
        type and related entities.
        """
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
            "related_entities": entity_data.get("relationships", [])
        }
import json

from ai.graph_rag.entity_extractor import EntityExtractor
from ai.graph_rag.relationship_extractor import RelationshipExtractor
from ai.graph_rag.graph_builder import GraphBuilder
from ai.graph_rag.query_graph import GraphQuery


def build_graph_from_file(file_path):
    """
    Build a cybersecurity graph from a CTINexus JSON file.
    """

    with open(file_path, encoding="utf-8") as file:
        data = json.load(file)

    entities = EntityExtractor().extract_from_ctinexus(data)

    relationships = (
        RelationshipExtractor()
        .extract_from_ctinexus(data)
    )

    builder = GraphBuilder()

    builder.add_entities(entities)
    builder.add_relationships(relationships)

    return GraphQuery(builder.get_graph())
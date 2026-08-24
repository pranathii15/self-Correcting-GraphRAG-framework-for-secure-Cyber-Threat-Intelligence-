import json
import os

from dotenv import load_dotenv
from neo4j import GraphDatabase

load_dotenv()


class Neo4jGraph:
    def __init__(self):
        self.uri = os.getenv("NEO4J_URI")
        self.username = os.getenv("NEO4J_USERNAME")
        self.password = os.getenv("NEO4J_PASSWORD")
        self.database = os.getenv("NEO4J_DATABASE", "neo4j")

        if not self.uri:
            raise ValueError("NEO4J_URI is not set")

        if not self.username:
            raise ValueError("NEO4J_USERNAME is not set")

        if not self.password:
            raise ValueError("NEO4J_PASSWORD is not set")

        self.driver = GraphDatabase.driver(
            self.uri,
            auth=(self.username, self.password)
        )

    def close(self):
        self.driver.close()

    def verify_connection(self):
        self.driver.verify_connectivity()
        return True

    def clear_database(self):
        with self.driver.session(database=self.database) as session:
            session.run("MATCH (n) DETACH DELETE n")

    def add_entities(self, entities):
        query = """
        MERGE (e:Entity {name: $name, type: $type})
        """

        with self.driver.session(database=self.database) as session:
            for entity in entities:
                name = entity.get("text")
                entity_type = entity.get("type", "UNKNOWN")

                if not name:
                    continue

                session.run(
                    query,
                    name=name,
                    type=entity_type
                )

    def add_relationships(self, relationships):
        query = """
        MERGE (s:Entity {name: $subject})
        ON CREATE SET s.type = "UNKNOWN"

        MERGE (o:Entity {name: $object})
        ON CREATE SET o.type = "UNKNOWN"

        MERGE (s)-[r:RELATED_TO {relation: $relationship}]->(o)
        """

        with self.driver.session(database=self.database) as session:
            for relationship in relationships:
                subject = relationship.get("subject")
                relation = relationship.get("relationship")
                object_entity = relationship.get("object")

                if not subject or not relation or not object_entity:
                    continue

                session.run(
                    query,
                    subject=subject,
                    relationship=relation,
                    object=object_entity
                )

    def load_ctinexus(self, file_path):
        with open(file_path, encoding="utf-8") as file:
            data = json.load(file)

        entities = []

        for entity in data.get("entities", []):
            name = entity.get("entity_name")
            entity_type = entity.get("entity_type")

            if name:
                entities.append({
                    "text": name,
                    "type": entity_type or "UNKNOWN"
                })

        relationships = []

        for triplet in data.get("explicit_triplets", []):
            subject = triplet.get("subject")
            relation = triplet.get("relation")
            object_entity = triplet.get("object")

            if subject and relation and object_entity:
                relationships.append({
                    "subject": subject,
                    "relationship": relation,
                    "object": object_entity
                })

        self.add_entities(entities)
        self.add_relationships(relationships)

        return {
            "entities": len(entities),
            "relationships": len(relationships)
        }

    def query_entity(self, entity_name):
        query = """
        MATCH (e:Entity {name: $name})
        OPTIONAL MATCH (e)-[r:RELATED_TO]->(related:Entity)

        RETURN
            e.name AS entity,
            e.type AS type,
            collect(
                CASE
                    WHEN related IS NOT NULL
                    THEN {
                        entity: related.name,
                        relation: r.relation
                    }
                END
        ) AS related_entities
        """

        with self.driver.session(database=self.database) as session:
            result = session.run(
                query,
                name=entity_name
            ).single()

        if result is None:
            return None

        related_entities = [
            item
            for item in result["related_entities"]
            if item is not None
        ]

        return {
            "entity": result["entity"],
            "type": result["type"],
            "related_entities": related_entities
        }
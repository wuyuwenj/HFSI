"""Neo4j vector store service for document embeddings."""

import logging
from typing import List, Dict, Any, Optional
from neo4j import GraphDatabase
from langchain_ollama import OllamaEmbeddings
from langchain_community.vectorstores import Neo4jVector
from langchain_core.documents import Document
from config import settings

logger = logging.getLogger(__name__)


class Neo4jVectorStore:
    """Service for managing vector embeddings in Neo4j."""

    def __init__(self):
        """Initialize Neo4j connection and embeddings."""
        self.driver = GraphDatabase.driver(
            settings.NEO4J_URL,
            auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD),
            database=settings.NEO4J_DATABASE,  
        )

        # Initialize embeddings
        self.embeddings = OllamaEmbeddings(
            model=settings.OLLAMA_EMBEDDING_MODEL, base_url=settings.OLLAMA_BASE_URL
        )

        self.index_name = "legal_documents"
        self.vector_store: Optional[Neo4jVector] = None

        # Initialize vector index
        self.initialize_vector_index()

    def initialize_vector_index(self) -> None:
        """Create or connect to Neo4j vector index."""
        try:
            # Create vector store with index
            self.vector_store = Neo4jVector.from_existing_index(
                embedding=self.embeddings,
                url=settings.NEO4J_URL,
                username=settings.NEO4J_USER,
                password=settings.NEO4J_PASSWORD,
                index_name=self.index_name,
                node_label="DocumentChunk",
                embedding_node_property="embedding",
                text_node_property="text",
            )
            logger.info(f"Connected to existing Neo4j vector index: {self.index_name}")
        except Exception as e:
            # Index doesn't exist, create it
            logger.info(f"Index not found, creating new index: {e}")
            try:
                self.vector_store = Neo4jVector.from_documents(
                    documents=[],
                    embedding=self.embeddings,
                    url=settings.NEO4J_URL,
                    username=settings.NEO4J_USER,
                    password=settings.NEO4J_PASSWORD,
                    index_name=self.index_name,
                    node_label="DocumentChunk",
                    embedding_node_property="embedding",
                    text_node_property="text",
                )
                logger.info(f"Created new Neo4j vector index: {self.index_name}")
            except Exception as create_error:
                logger.error(f"Error creating vector index: {create_error}")
                raise

    def add_documents_for_client(
        self, chunks: List[Dict[str, Any]], client_doc_id: str, client_name: str
    ) -> None:
        """
        Add documents with client metadata to Neo4j.

        Args:
            chunks: List of chunk dictionaries with metadata
            client_doc_id: Client document ID
            client_name: Client name
        """
        if not self.vector_store:
            raise Exception("Vector store not initialized")

        # Convert chunks to LangChain Documents
        documents = []
        for chunk in chunks:
            doc = Document(
                page_content=chunk["text"],
                metadata={
                    "source": chunk["source"],
                    "location": chunk["location"],
                    "chunk_id": chunk["chunk_id"],
                    "client_doc_id": client_doc_id,
                    "client_name": client_name,
                },
            )
            documents.append(doc)

        # Add documents to vector store
        try:
            self.vector_store.add_documents(documents)
            logger.info(
                f"Added {len(documents)} chunks to Neo4j for client: {client_doc_id}"
            )
        except Exception as e:
            logger.error(f"Error adding documents to Neo4j: {e}")
            raise

    def search_by_client(
        self, query: str, client_doc_id: str, k: int = 4
    ) -> List[Document]:
        """
        Client-scoped similarity search with metadata filter.

        Args:
            query: Search query text
            client_doc_id: Client document ID for filtering
            k: Number of results to return

        Returns:
            List of relevant Document objects with metadata
        """
        if not self.vector_store:
            raise Exception("Vector store not initialized")

        try:
            # Perform similarity search with metadata filter
            # Note: Neo4jVector doesn't directly support metadata filtering in search
            # We'll need to filter results after retrieval or use Cypher query

            # Get more results than needed, then filter
            results = self.vector_store.similarity_search(query, k=k * 2)
            
            # Filter by client_doc_id
            filtered_results = [
                doc
                for doc in results
                if doc.metadata.get("client_doc_id") == client_doc_id
            ]

            # Return top k results
            return filtered_results[:k]

        except Exception as e:
            logger.error(f"Error searching Neo4j: {e}")
            raise

    def delete_client_documents(self, client_doc_id: str) -> None:
        """
        Delete all documents for a client from Neo4j.

        Args:
            client_doc_id: Client document ID
        """
        try:
            with self.driver.session() as session:
                result = session.run(
                    """
                    MATCH (n:DocumentChunk {client_doc_id: $client_doc_id})
                    DETACH DELETE n
                    RETURN count(n) as deleted
                    """,
                    client_doc_id=client_doc_id,
                )
                deleted_count = result.single()["deleted"]
                logger.info(
                    f"Deleted {deleted_count} chunks for client: {client_doc_id}"
                )
        except Exception as e:
            logger.error(f"Error deleting client documents: {e}")
            raise

    def close(self) -> None:
        """Close Neo4j driver connection."""
        if self.driver:
            self.driver.close()

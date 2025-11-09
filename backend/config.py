"""Configuration module for loading environment variables."""

import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application settings loaded from environment variables."""

    # Neo4j Configuration
    NEO4J_URL: str = os.getenv("NEO4J_URL", "bolt://localhost:7687")
    NEO4J_USER: str = os.getenv("NEO4J_USER", "neo4j")
    NEO4J_PASSWORD: str = os.getenv("NEO4J_PASSWORD", "password123")
    NEO4J_DATABASE: str = os.getenv("NEO4J_DATABASE", "legal_documents")  # Add this line
    # Supabase Configuration
    # qtlR2bGEzOWBqh8H
    SUPABASE_URL: str = os.getenv(
        "SUPABASE_URL",""
    )
    SUPABASE_SERVICE_KEY: str = os.getenv(
        "SUPABASE_SERVICE_KEY",
        "",
    )
    SUPABASE_BUCKET: str = os.getenv("SUPABASE_BUCKET", "legal-documents")

    # Ollama Configuration
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "sam860/qwen3:8b-Q4_K_M")
    OLLAMA_EMBEDDING_MODEL: str = os.getenv(
        "OLLAMA_EMBEDDING_MODEL", "embeddinggemma:latest"
    )

    # Document Processing Configuration
    CHUNK_SIZE: int = 512
    CHUNK_OVERLAP: int = 50

    @classmethod
    def validate(cls) -> None:
        """Validate that required settings are present."""
        required_settings = [
            ("SUPABASE_URL", cls.SUPABASE_URL),
            ("SUPABASE_SERVICE_KEY", cls.SUPABASE_SERVICE_KEY),
        ]

        missing = [name for name, value in required_settings if not value]
        if missing:
            raise ValueError(
                f"Missing required environment variables: {', '.join(missing)}"
            )


settings = Settings()

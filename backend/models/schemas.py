"""Pydantic schemas for API request/response models."""

from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field
from uuid import UUID


class ClientCreate(BaseModel):
    """Schema for creating a new client."""

    name: str = Field(..., description="Client name")


class ClientResponse(BaseModel):
    """Schema for client response."""

    id: int
    name: str
    summary: str
    doc_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FileUploadResponse(BaseModel):
    """Schema for file upload response."""

    filename: str
    status: str
    chunks_created: int
    message: str


class UploadResult(BaseModel):
    """Schema for upload result."""

    files: List[FileUploadResponse]
    summary: str
    client_doc_id: UUID


class QueryRequest(BaseModel):
    """Schema for query request."""

    question: str = Field(..., description="Question to ask about the documents")
    client_doc_id: UUID = Field(..., description="Client document ID for scoping")


class Citation(BaseModel):
    """Schema for citation."""

    filename: str
    location: str  # e.g., "p.5" or "para.3"


class QueryResponse(BaseModel):
    """Schema for query response."""

    answer: str
    citations: List[Citation]
    client_doc_id: UUID


class FileInfo(BaseModel):
    """Schema for file information."""

    filename: str
    path: str
    size: Optional[int] = None
    created_at: Optional[datetime] = None


class HealthResponse(BaseModel):
    """Schema for health check response."""

    status: str
    ollama_available: bool
    neo4j_available: bool
    supabase_available: bool
    model_info: dict

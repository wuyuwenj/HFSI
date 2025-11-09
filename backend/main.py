"""FastAPI application for Legal Document RAG System."""

from datetime import datetime
import logging
from typing import List
from uuid import UUID
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from models.schemas import (
    ClientCreate,
    ClientResponse,
    QueryRequest,
    QueryResponse,
    UploadResult,
    FileUploadResponse,
    FileInfo,
    HealthResponse,
)
from services.supabase_service import SupabaseService
from services.document_processor import DocumentProcessor
from services.neo4j_store import Neo4jVectorStore
from services.summarization import DocumentSummarizer
from services.agent import LegalRAGAgent
from utils.helpers import validate_file_type, sanitize_filename

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Legal Document RAG System",
    description="Legal document query system with citation tracking",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services (singleton pattern)
supabase_service = SupabaseService()
document_processor = DocumentProcessor()
vector_store = Neo4jVectorStore()
summarizer = DocumentSummarizer()
rag_agent = LegalRAGAgent(vector_store)


# Dependency to get services
def get_supabase_service() -> SupabaseService:
    """Dependency for Supabase service."""
    return supabase_service


def get_vector_store() -> Neo4jVectorStore:
    """Dependency for Neo4j vector store."""
    return vector_store


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on application shutdown."""
    vector_store.close()
    logger.info("Application shutdown complete")


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint.
    Returns system status and model information.
    """
    try:
        # Check Neo4j connection
        neo4j_available = False
        try:
            with vector_store.driver.session() as session:
                session.run("RETURN 1")
            neo4j_available = True
        except Exception:
            pass

        # Check Supabase connection
        supabase_available = False
        try:
            supabase_service.list_all_clients()
            supabase_available = True
        except Exception:
            pass

        # Check Ollama (basic check)
        ollama_available = True  # Will fail during actual use if not available

        return HealthResponse(
            status=(
                "healthy" if (neo4j_available and supabase_available) else "degraded"
            ),
            ollama_available=ollama_available,
            neo4j_available=neo4j_available,
            supabase_available=supabase_available,
            model_info={
                "llm_model": settings.OLLAMA_MODEL,
                "embedding_model": settings.OLLAMA_EMBEDDING_MODEL,
                "ollama_url": settings.OLLAMA_BASE_URL,
            },
        )
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return HealthResponse(
            status="unhealthy",
            ollama_available=False,
            neo4j_available=False,
            supabase_available=False,
            model_info={},
        )


@app.post("/clients/create", response_model=ClientResponse)
async def create_client(
    client_data: ClientCreate, supabase: SupabaseService = Depends(get_supabase_service)
):
    """
    Create a new client record with UUID doc_id.

    Args:
        client_data: Client creation data
        supabase: Supabase service dependency

    Returns:
        Created client record
    """
    try:
        client = supabase.create_client(client_data.name)
        logger.info(f"Created client: {client}, {client_data.name}")
        return ClientResponse(**client)
    except Exception as e:
        logger.error(f"Error creating client: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/clients", response_model=List[ClientResponse])
async def list_clients(supabase: SupabaseService = Depends(get_supabase_service)):
    """
    List all clients.

    Returns:
        List of all client records
    """
    try:
        clients = supabase.list_all_clients()
        return [ClientResponse(**client) for client in clients]
    except Exception as e:
        logger.error(f"Error listing clients: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/clients/{doc_id}/get_docs", response_model=ClientResponse)
async def get_client(
    doc_id: UUID, supabase: SupabaseService = Depends(get_supabase_service)
):
    """
    Get client details by doc_id.

    Args:
        doc_id: Client document ID

    Returns:
        Client record
    """
    try:
        client = supabase.get_client_by_doc_id(str(doc_id))
        if not client:
            raise HTTPException(status_code=404, detail=f"Client not found: {doc_id}")
        return ClientResponse(**client)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting client: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/clients/{doc_id}/upload", response_model=UploadResult)
async def upload_documents(
    doc_id: UUID,
    files: List[UploadFile] = File(...),
    supabase: SupabaseService = Depends(get_supabase_service),
):
    """
    Upload and process documents for a client.

    Process:
    1. Upload files to Supabase Storage
    2. Parse and chunk documents
    3. Generate embeddings and store in Neo4j
    4. Generate summary using Ollama
    5. Update client summary in Supabase

    Args:
        doc_id: Client document ID
        files: List of uploaded files

    Returns:
        Upload results and generated summary
    """
    try:
        # Verify client exists
        client = supabase.get_client_by_doc_id(str(doc_id))
        if not client:
            raise HTTPException(status_code=404, detail=f"Client not found: {doc_id}")

        client_name = client["name"]
        client_doc_id = str(doc_id)

        upload_results = []
        all_chunks = []
        all_chunk_texts = []

        # Process each file
        for file in files:
            try:
                # Validate file type
                if not validate_file_type(file.filename):
                    upload_results.append(
                        FileUploadResponse(
                            filename=file.filename,
                            status="rejected",
                            chunks_created=0,
                            message=f"Unsupported file type: {file.filename}",
                        )
                    )
                    continue

                # Read file content
                file_bytes = await file.read()
                sanitized_filename = sanitize_filename(file.filename)

                # Upload to Supabase Storage
                storage_path = supabase.upload_file(
                    file_bytes, client_doc_id, sanitized_filename
                )

                # Process document
                chunks = document_processor.process_file_bytes(
                    file_bytes, sanitized_filename, client_doc_id, client_name
                )
                logger.info(f"{chunks}")
                all_chunks.extend(chunks)
                all_chunk_texts.extend([chunk["text"] for chunk in chunks])

                upload_results.append(
                    FileUploadResponse(
                        filename=sanitized_filename,
                        status="processed",
                        chunks_created=len(chunks),
                        message=f"Successfully processed {len(chunks)} chunks",
                    )
                )

                logger.info(f"Processed {sanitized_filename}: {len(chunks)} chunks")

            except Exception as e:
                logger.error(f"Error processing file {file.filename}: {e}")
                upload_results.append(
                    FileUploadResponse(
                        filename=file.filename,
                        status="error",
                        chunks_created=0,
                        message=f"Error: {str(e)}",
                    )
                )

        # Add documents to Neo4j vector store
        if all_chunks:
            try:
                vector_store.add_documents_for_client(
                    all_chunks, client_doc_id, client_name
                )
                logger.info(f"Added {len(all_chunks)} chunks to Neo4j")
            except Exception as e:
                logger.error(f"Error adding chunks to Neo4j: {e}")
                raise HTTPException(
                    status_code=500, detail=f"Error storing embeddings: {str(e)}"
                )

        # Generate summary
        summary = ""
        # if all_chunk_texts:
        #     try:
        #         summary = summarizer.summarize_documents(all_chunk_texts, client_name)

        #         # Update client summary in Supabase
        #         supabase.update_client_summary(client_doc_id, summary)
        #         logger.info(f"Generated and saved summary for client: {client_name}")
        #     except Exception as e:
        #         logger.error(f"Error generating summary: {e}")
        #         summary = f"Summary generation encountered an error: {str(e)}"

        return UploadResult(files=upload_results, summary=summary, client_doc_id=doc_id)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading documents: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/query", response_model=QueryResponse)
async def query_documents(
    query_request: QueryRequest,
    supabase: SupabaseService = Depends(get_supabase_service),
):
    """
    Query documents for a specific client with citation tracking.

    Args:
        query_request: Query request with question and client_doc_id

    Returns:
        Answer with citations
    """
    try:
        client_doc_id = str(query_request.client_doc_id)

        # Verify client exists
        client = supabase.get_client_by_doc_id(client_doc_id)
        if not client:
            raise HTTPException(
                status_code=404, detail=f"Client not found: {client_doc_id}"
            )

        # Process query using RAG agent
        result = rag_agent.query(query_request.question, client_doc_id)

        return QueryResponse(
            answer=result["answer"],
            citations=result["citations"],
            client_doc_id=query_request.client_doc_id,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing query: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/clients/{doc_id}/files", response_model=List[FileInfo])
async def list_client_files(
    doc_id: UUID, supabase: SupabaseService = Depends(get_supabase_service)
):
    """
    List all files for a client from Supabase Storage.

    Args:
        doc_id: Client document ID

    Returns:
        List of file information
    """
    try:
        # Verify client exists
        client = supabase.get_client_by_doc_id(str(doc_id))
        if not client:
            raise HTTPException(status_code=404, detail=f"Client not found: {doc_id}")

        files = supabase.list_client_files(str(doc_id))

        file_infos = []
        for file in files:
            file_infos.append(
                FileInfo(
                    filename=file.get("name", ""),
                    path=f"{doc_id}/{file.get('name', '')}",
                    size=file.get("metadata", {}).get("size"),
                    created_at=datetime.now(),  
                )
            )

        return file_infos

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing files: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    # Validate settings
    try:
        settings.validate()
    except ValueError as e:
        logger.error(f"Configuration error: {e}")
        logger.error("Please check your .env file")
        exit(1)

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, log_level="info")



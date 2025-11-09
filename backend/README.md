# Legal Document RAG System with Citation Tracking

A comprehensive legal document query system for lawyers with multi-client document management, semantic search, and precise source citations.

## Features

- ✅ **Multi-client document management** with complete data isolation
- ✅ **Document upload and processing** (PDF, DOCX, DOC)
- ✅ **Vector embeddings** using Ollama (local inference)
- ✅ **Semantic search** with precise source citations
- ✅ **LLM-powered document summarization** using Qwen3 8B
- ✅ **Client-specific query agent** with citation tracking
- ✅ **File storage** organized by client in Supabase Storage
- ✅ **Vector database** using Neo4j for document retrieval

## Tech Stack

- **Backend Framework:** FastAPI (Python 3.10+)
- **LLM:** Ollama Qwen3 8B (local inference)
- **Embeddings:** Ollama embeddingemma
- **Vector Database:** Neo4j (for document embeddings and retrieval)
- **File Storage:** Supabase Storage (organized by client doc_id)
- **Relational Database:** Supabase PostgreSQL
- **Orchestration:** LangChain with Ollama integration
- **Document Processing:** PyPDF2, python-docx

## Architecture

```
┌─────────────────┐
│   FastAPI App   │
│   (main.py)     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐ ┌──────────┐
│Supabase │ │  Neo4j   │
│Storage  │ │  Vector  │
│+ Postgres│ │  Store   │
└─────────┘ └────┬─────┘
                 │
                 ▼
         ┌──────────────┐
         │   Ollama     │
         │ (Qwen3 8B +  │
         │ embeddingemma)│
         └──────────────┘
```

## Project Structure

```
backend/
├── .env                    # Environment variables (create from .env.example)
├── .gitignore
├── main.py                 # FastAPI application
├── config.py               # Configuration management
├── database_schema.sql     # Supabase database schema
├── pyproject.toml          # Python dependencies
├── README.md
├── models/
│   └── schemas.py          # Pydantic models
├── services/
│   ├── supabase_service.py # Supabase client & file management
│   ├── document_processor.py # PDF/DOCX parsing & chunking
│   ├── neo4j_store.py      # Vector storage & retrieval
│   ├── summarization.py    # Document summarization
│   └── agent.py            # RAG agent with citations
├── utils/
│   └── helpers.py          # Utility functions
└── tests/
    └── test_api.py         # API tests
```

## Prerequisites

1. **Python 3.10+**
2. **Ollama** installed and running
3. **Neo4j** database (local or remote)
4. **Supabase** project with Storage bucket

## Setup Instructions

### 1. Install Ollama Models

First, ensure Ollama is installed and running:

```bash
# Install Ollama (if not already installed)
# Visit: https://ollama.ai

# Pull required models
ollama pull qwen3:8b
ollama pull embeddingemma
```

### 2. Set Up Neo4j

Install and start Neo4j:

```bash
# Using Docker
docker run -d \
  --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password \
  neo4j:latest

# Or install locally from https://neo4j.com/download/
```

The vector index will be created automatically when the application starts.

### 3. Set Up Supabase

1. Create a Supabase project at https://supabase.com
2. Create a Storage bucket named `legal-documents`
3. Run the database schema:

```sql
-- Execute database_schema.sql in Supabase SQL Editor
```

4. Get your Supabase URL and Service Key from Project Settings → API

### 4. Install Python Dependencies

```bash
# Using uv (recommended)
uv sync

# Or using pip
pip install -r requirements.txt
```

### 5. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Neo4j
NEO4J_URL=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
SUPABASE_BUCKET=legal-documents

# Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen3:8b
OLLAMA_EMBEDDING_MODEL=embeddingemma
```

### 6. Run the Application

```bash
# From the backend directory
python main.py

# Or using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

## API Usage Examples

### 1. Create a Client

```bash
curl -X POST "http://localhost:8000/clients/create" \
  -H "Content-Type: application/json" \
  -d '{"name": "Acme Corporation"}'
```

Response:
```json
{
  "id": 1,
  "name": "Acme Corporation",
  "summary": "",
  "doc_id": "550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}
```

### 2. Upload Documents

```bash
curl -X POST "http://localhost:8000/clients/{doc_id}/upload" \
  -F "files=@contract.pdf" \
  -F "files=@agreement.docx"
```

Response:
```json
{
  "files": [
    {
      "filename": "contract.pdf",
      "status": "processed",
      "chunks_created": 15,
      "message": "Successfully processed 15 chunks"
    }
  ],
  "summary": "Generated summary of documents...",
  "client_doc_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### 3. Query Documents

```bash
curl -X POST "http://localhost:8000/query" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What are the payment terms?",
    "client_doc_id": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

Response:
```json
{
  "answer": "The payment terms specify... [contract.pdf, p.5]",
  "citations": [
    {
      "filename": "contract.pdf",
      "location": "p.5"
    }
  ],
  "client_doc_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### 4. List All Clients

```bash
curl "http://localhost:8000/clients"
```

### 5. Get Client Details

```bash
curl "http://localhost:8000/clients/{doc_id}"
```

### 6. List Client Files

```bash
curl "http://localhost:8000/clients/{doc_id}/files"
```

### 7. Health Check

```bash
curl "http://localhost:8000/health"
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/clients/create` | Create a new client |
| GET | `/clients` | List all clients |
| GET | `/clients/{doc_id}` | Get client details |
| POST | `/clients/{doc_id}/upload` | Upload documents |
| GET | `/clients/{doc_id}/files` | List client files |
| POST | `/query` | Query documents with citations |
| GET | `/health` | System health check |

## Database Schema

### Supabase PostgreSQL

**clients table:**
- `id` (BIGSERIAL PRIMARY KEY)
- `name` (TEXT NOT NULL)
- `summary` (TEXT DEFAULT '')
- `doc_id` (UUID UNIQUE NOT NULL)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Neo4j Vector Index

- **Index Name:** `legal_documents`
- **Node Label:** `DocumentChunk`
- **Properties:** `text`, `source`, `location`, `chunk_id`, `client_doc_id`, `client_name`
- **Embedding Property:** `embedding`

## Document Processing

- **Chunk Size:** 512 tokens
- **Chunk Overlap:** 50 tokens
- **Supported Formats:** PDF, DOCX, DOC
- **Metadata Preserved:** Source filename, page/paragraph number, chunk_id

## Citation Format

Citations follow the format: `[filename, location]`

- PDF documents: `[contract.pdf, p.5]` (page number)
- DOCX documents: `[agreement.docx, para.3]` (paragraph number)

## Client Isolation

- All queries are filtered by `client_doc_id`
- Neo4j metadata filter ensures no cross-client data access
- Files are stored in Supabase Storage organized by `doc_id`

## Error Handling

The system handles:
- Invalid file types
- Missing clients (404 errors)
- Embedding/generation errors
- Database connection issues
- Meaningful error messages returned to API clients

## Logging

The application logs:
- Document processing steps
- Embedding generation
- Agent reasoning (verbose mode)
- API requests and errors

## Performance Considerations

- Batch document processing where possible
- Ollama `keep_alive` for model persistence
- Optimized chunk sizes for legal documents
- Efficient vector search with client filtering

## Security

- Service keys used for Supabase (not public keys)
- Client access validation
- File upload sanitization
- No SQL injection vulnerabilities (using parameterized queries)

## Development

### Running Tests

```bash
pytest tests/
```

### Code Style

- Type hints throughout
- PEP 8 style guide
- Docstrings for all classes and methods
- Async/await for FastAPI endpoints

## Troubleshooting

### Ollama Connection Issues

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Restart Ollama service
ollama serve
```

### Neo4j Connection Issues

```bash
# Test Neo4j connection
cypher-shell -a bolt://localhost:7687 -u neo4j -p password
```

### Supabase Issues

- Verify bucket exists and is accessible
- Check service key permissions
- Ensure database schema is applied

## License

MIT License

## Support

For issues or questions, please open an issue in the repository.


-- Supabase PostgreSQL Schema for Legal RAG System

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    summary TEXT DEFAULT '',
    doc_id UUID UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on doc_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_clients_doc_id ON clients(doc_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON clients 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Note: Neo4j vector index will be created automatically by the application
-- The index name is "legal_documents" with:
-- - Node Label: DocumentChunk
-- - Properties: text, source, location, chunk_id, client_doc_id, client_name
-- - Embedding Property: embedding


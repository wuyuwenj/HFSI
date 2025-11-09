"""Document processing service for PDF and DOCX files."""

import logging
import tempfile
import os
from typing import List, Dict, Any
from pathlib import Path
import PyPDF2
from docx import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
import tiktoken
from config import settings

logger = logging.getLogger(__name__)


class DocumentProcessor:
    """Service for processing and chunking documents."""

    def __init__(self):
        """Initialize document processor with text splitter."""
        # Initialize tokenizer for chunking
        encoding = tiktoken.get_encoding("cl100k_base")

        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP,
            length_function=len,
            is_separator_regex=False,
        )

    def extract_text_from_pdf(self, file_path: str) -> List[Dict[str, Any]]:
        """
        Extract text from PDF with page numbers.

        Args:
            file_path: Path to PDF file

        Returns:
            List of dictionaries with text and page number
        """
        chunks = []

        try:
            with open(file_path, "rb") as file:
                pdf_reader = PyPDF2.PdfReader(file)

                for page_num, page in enumerate(pdf_reader.pages, start=1):
                    text = page.extract_text()
                    if text.strip():
                        chunks.append({"text": text, "page": page_num, "type": "pdf"})

                logger.info(f"Extracted {len(chunks)} pages from PDF: {file_path}")
                return chunks

        except Exception as e:
            logger.error(f"Error extracting PDF {file_path}: {e}")
            raise

    def extract_text_from_docx(self, file_path: str) -> List[Dict[str, Any]]:
        """
        Extract text from DOCX with paragraph numbers.

        Args:
            file_path: Path to DOCX file

        Returns:
            List of dictionaries with text and paragraph number
        """
        chunks = []

        try:
            doc = Document(file_path)

            for para_num, paragraph in enumerate(doc.paragraphs, start=1):
                text = paragraph.text.strip()
                if text:
                    chunks.append({"text": text, "paragraph": para_num, "type": "docx"})

            logger.info(f"Extracted {len(chunks)} paragraphs from DOCX: {file_path}")
            return chunks

        except Exception as e:
            logger.error(f"Error extracting DOCX {file_path}: {e}")
            raise

    def process_document(
        self, file_path: str, source_filename: str, client_doc_id: str, client_name: str
    ) -> List[Dict[str, Any]]:
        """
        Process document and chunk with metadata.

        Args:
            file_path: Path to document file
            source_filename: Original filename
            client_doc_id: Client document ID
            client_name: Client name

        Returns:
            List of chunk dictionaries with metadata
        """
        file_ext = Path(file_path).suffix.lower()

        # Extract text based on file type
        if file_ext == ".pdf":
            raw_chunks = self.extract_text_from_pdf(file_path)
        elif file_ext in [".docx", ".doc"]:
            raw_chunks = self.extract_text_from_docx(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_ext}")

        # Process and chunk the extracted text
        processed_chunks = []
        chunk_id_counter = 0

        for raw_chunk in raw_chunks:
            text = raw_chunk["text"]

            # Split text into smaller chunks if needed
            text_chunks = self.text_splitter.split_text(text)

            for chunk_text in text_chunks:
                chunk_id_counter += 1
                chunk_id = f"{source_filename}_{chunk_id_counter}"

                # Determine location metadata
                if raw_chunk.get("type") == "pdf":
                    location = f"p.{raw_chunk['page']}"
                else:
                    location = f"para.{raw_chunk['paragraph']}"

                processed_chunks.append(
                    {
                        "text": chunk_text,
                        "source": source_filename,
                        "location": location,
                        "chunk_id": chunk_id,
                        "client_doc_id": client_doc_id,
                        "client_name": client_name,
                    }
                )

        logger.info(f"Processed {len(processed_chunks)} chunks from {source_filename}")
        return processed_chunks

    def process_file_bytes(
        self, file_bytes: bytes, filename: str, client_doc_id: str, client_name: str
    ) -> List[Dict[str, Any]]:
        """
        Process file from bytes (for uploaded files).

        Args:
            file_bytes: File content as bytes
            filename: Original filename
            client_doc_id: Client document ID
            client_name: Client name

        Returns:
            List of chunk dictionaries with metadata
        """
        # Create temporary file
        file_ext = Path(filename).suffix.lower()

        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp_file:
            tmp_file.write(file_bytes)
            tmp_path = tmp_file.name

        try:
            chunks = self.process_document(
                tmp_path, filename, client_doc_id, client_name
            )
            return chunks
        finally:
            # Clean up temporary file
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

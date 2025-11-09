"""Helper utility functions."""
import uuid
from typing import Optional
from pathlib import Path


def generate_doc_id() -> str:
    """Generate a UUID for document ID."""
    return str(uuid.uuid4())


def validate_file_type(filename: str) -> bool:
    """Validate if file type is supported (.pdf, .docx, .doc)."""
    allowed_extensions = {".pdf", ".docx", ".doc"}
    file_ext = Path(filename).suffix.lower()
    return file_ext in allowed_extensions


def get_file_extension(filename: str) -> str:
    """Get file extension from filename."""
    return Path(filename).suffix.lower()


def sanitize_filename(filename: str) -> str:
    """Sanitize filename for storage."""
    # Remove path components and keep only the filename
    safe_name = Path(filename).name
    # Replace spaces and special characters
    safe_name = safe_name.replace(" ", "_")
    return safe_name


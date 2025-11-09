"""Supabase service for client and file management."""
import logging
from typing import List, Optional, Dict, Any
from uuid import UUID
from supabase import create_client, Client
from config import settings
from utils.helpers import generate_doc_id

logger = logging.getLogger(__name__)


class SupabaseService:
    """Service for interacting with Supabase PostgreSQL and Storage."""

    def __init__(self):
        """Initialize Supabase client."""
        # logger.info(f"Initializing Supabase client with URL: {settings.SUPABASE_URL} and service key: {settings.SUPABASE_SERVICE_KEY} and bucket: {settings.SUPABASE_BUCKET}")
        self.client: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        self.bucket_name = settings.SUPABASE_BUCKET

        # Ensure bucket exists
        try:
            buckets = self.client.storage.list_buckets()
            logger.info(f"Buckets: {buckets}")
            bucket_names = [b.name for b in buckets]
            if self.bucket_name not in bucket_names:
                # response = self.client.storage.create_bucket(
                #     self.bucket_name,
                #     options={
                #         "public": False,
                #         "allowed_mime_types": ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation"],
                #         "file_size_limit": 102400000,  # 100 MB
                #     },
                # )
                # logger.info(f"Bucket {self.bucket_name} created: {response}")
                logger.info(f"Bucket {self.bucket_name} does not exist. Please create it in Supabase dashboard.")
        except Exception as e:
            logger.error(f"Error checking buckets: {e}")

    def create_client(self, name: str) -> Dict[str, Any]:
        """
        Create a new client record with UUID doc_id.
        
        Args:
            name: Client name
            
        Returns:
            Client record dictionary
        """
        doc_id = generate_doc_id()

        data = {
            "name": name,
            "doc_id": doc_id,
            "summary": ""
        }
        logger.info(f"data: {data}")

        result = self.client.table("clients").insert(data).execute()
        logger.info(f"result: {result}")
        if result.data:
            logger.info(f"Created client: {name} with doc_id: {doc_id}")
            return result.data[0]
        else:
            raise Exception("Failed to create client")

    def update_client_summary(self, doc_id: str, summary: str) -> Dict[str, Any]:
        """
        Update LLM-generated summary for a client.
        
        Args:
            doc_id: Client document ID
            summary: Generated summary text
            
        Returns:
            Updated client record
        """
        result = self.client.table("clients").update({
            "summary": summary,
            "updated_at": "now()"
        }).eq("doc_id", doc_id).execute()

        if result.data:
            logger.info(f"Updated summary for client: {doc_id}")
            return result.data[0]
        else:
            raise Exception(f"Client not found: {doc_id}")

    def get_client_by_doc_id(self, doc_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve client details by doc_id.
        
        Args:
            doc_id: Client document ID
            
        Returns:
            Client record or None if not found
        """
        result = self.client.table("clients").select("*").eq("doc_id", doc_id).execute()

        if result.data:
            return result.data[0]
        return None

    def list_all_clients(self) -> List[Dict[str, Any]]:
        """
        List all clients.
        
        Returns:
            List of client records
        """
        result = self.client.table("clients").select("*").order("created_at", desc=True).execute()
        return result.data if result.data else []

    def upload_file(self, file_bytes: bytes, doc_id: str, filename: str) -> str:
        """
        Upload file to Supabase Storage organized by doc_id.
        
        Args:
            file_bytes: File content as bytes
            doc_id: Client document ID
            filename: Original filename
            
        Returns:
            Storage path of uploaded file
        """
        storage_path = f"{doc_id}/{filename}"

        result = self.client.storage.from_(self.bucket_name).upload(
            path=storage_path,
            file=file_bytes,
            file_options={"content-type": "application/octet-stream", "upsert": "true"}
        )

        if result:
            logger.info(f"Uploaded file: {storage_path}")
            return storage_path
        else:
            raise Exception(f"Failed to upload file: {filename}")

    def download_file(self, file_path: str) -> bytes:
        """
        Download file from Supabase Storage.
        
        Args:
            file_path: Storage path of the file
            
        Returns:
            File content as bytes
        """
        result = self.client.storage.from_(self.bucket_name).download(file_path)

        if result:
            return result
        else:
            raise Exception(f"Failed to download file: {file_path}")

    def list_client_files(self, doc_id: str) -> List[Dict[str, Any]]:
        """
        List all files for a client from Supabase Storage.
        
        Args:
            doc_id: Client document ID
            
        Returns:
            List of file information dictionaries
        """
        try:
            files = self.client.storage.from_(self.bucket_name).list(path=doc_id)
            return files if files else []
        except Exception as e:
            logger.error(f"Error listing files for client {doc_id}: {e}")
            return []

    def delete_file(self, file_path: str) -> bool:
        """
        Delete a file from Supabase Storage.
        
        Args:
            file_path: Storage path of the file
            
        Returns:
            True if successful
        """
        try:
            result = self.client.storage.from_(self.bucket_name).remove([file_path])
            logger.info(f"Deleted file: {file_path}")
            return True
        except Exception as e:
            logger.error(f"Error deleting file {file_path}: {e}")
            return False

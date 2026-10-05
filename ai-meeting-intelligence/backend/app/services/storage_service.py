import os
import uuid
import aiofiles
from abc import ABC, abstractmethod
from fastapi import UploadFile, HTTPException
from app.config import settings

ALLOWED_AUDIO_EXTENSIONS = {".mp3", ".wav", ".m4a", ".aac", ".ogg"}
ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv", ".webm"}
ALLOWED_EXTENSIONS = ALLOWED_AUDIO_EXTENSIONS | ALLOWED_VIDEO_EXTENSIONS

class BaseStorageService(ABC):
    @abstractmethod
    async def save_file(self, file: UploadFile, meeting_id: str) -> dict:
        """Save an uploaded file and return metadata."""
        pass

    @abstractmethod
    def get_file_path(self, storage_key: str) -> str:
        """Get absolute path or URL for the stored file."""
        pass

    @abstractmethod
    async def delete_file(self, storage_key: str) -> bool:
        """Delete stored file."""
        pass


class LocalStorageService(BaseStorageService):
    def __init__(self):
        self.upload_dir = os.path.abspath(settings.UPLOAD_DIR)
        os.makedirs(self.upload_dir, exist_ok=True)

    def validate_file(self, filename: str, content_type: str | None, file_size: int = 0):
        # Check extension
        ext = os.path.splitext(filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file extension '{ext}'. Supported formats: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
            )
        
        # Check max size if provided
        if file_size > settings.MAX_UPLOAD_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE // (1024 * 1024)}MB"
            )

    async def save_file(self, file: UploadFile, meeting_id: str) -> dict:
        filename = os.path.basename(file.filename or "upload.mp4")
        ext = os.path.splitext(filename)[1].lower()
        
        self.validate_file(filename, file.content_type)
        
        # Determine media type
        media_type = "audio" if ext in ALLOWED_AUDIO_EXTENSIONS else "video"
        
        # Generate secure random storage key to prevent traversal and collision
        storage_key = f"{meeting_id}_{uuid.uuid4().hex[:12]}{ext}"
        destination = os.path.join(self.upload_dir, storage_key)
        
        # Stream file to disk in chunks to avoid blowing up memory
        bytes_written = 0
        chunk_size = 1024 * 1024  # 1MB chunks
        
        async with aiofiles.open(destination, "wb") as f:
            while chunk := await file.read(chunk_size):
                bytes_written += len(chunk)
                if bytes_written > settings.MAX_UPLOAD_SIZE:
                    # Clean up
                    try:
                        os.remove(destination)
                    except OSError:
                        pass
                    raise HTTPException(
                        status_code=413,
                        detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE // (1024 * 1024)}MB"
                    )
                await f.write(chunk)

        # Storage URL path for client retrieval
        storage_url = f"/api/meetings/media/{storage_key}"
        
        return {
            "storage_key": storage_key,
            "file_path": destination,
            "file_size": bytes_written,
            "mime_type": file.content_type or f"{media_type}/{ext.lstrip('.')}",
            "media_type": media_type,
            "storage_url": storage_url
        }

    def get_file_path(self, storage_key: str) -> str:
        # Prevent directory traversal
        clean_key = os.path.basename(storage_key)
        path = os.path.join(self.upload_dir, clean_key)
        return path

    async def delete_file(self, storage_key: str) -> bool:
        path = self.get_file_path(storage_key)
        if os.path.exists(path):
            try:
                os.remove(path)
                return True
            except OSError:
                return False
        return False


class S3StorageService(BaseStorageService):
    def __init__(self):
        import boto3
        self.s3_client = boto3.client(
            "s3",
            endpoint_url=settings.S3_ENDPOINT,
            aws_access_key_id=settings.S3_ACCESS_KEY,
            aws_secret_access_key=settings.S3_SECRET_KEY,
            region_name=settings.S3_REGION
        )
        self.bucket = settings.S3_BUCKET
        self.local_fallback = LocalStorageService()

    async def save_file(self, file: UploadFile, meeting_id: str) -> dict:
        # Save locally first for media processing, then upload to S3 if configured
        local_result = await self.local_fallback.save_file(file, meeting_id)
        if settings.S3_ACCESS_KEY and settings.S3_SECRET_KEY:
            try:
                self.s3_client.upload_file(
                    local_result["file_path"],
                    self.bucket,
                    local_result["storage_key"]
                )
            except Exception as e:
                print(f"S3 upload warning: {e}. Keeping local copy.")
        return local_result

    def get_file_path(self, storage_key: str) -> str:
        return self.local_fallback.get_file_path(storage_key)

    async def delete_file(self, storage_key: str) -> bool:
        if settings.S3_ACCESS_KEY and settings.S3_SECRET_KEY:
            try:
                self.s3_client.delete_object(Bucket=self.bucket, Key=storage_key)
            except Exception:
                pass
        return await self.local_fallback.delete_file(storage_key)


def get_storage_service() -> BaseStorageService:
    if settings.STORAGE_TYPE == "s3" and settings.S3_ACCESS_KEY:
        return S3StorageService()
    return LocalStorageService()

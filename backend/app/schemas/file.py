from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class FileRecordResponse(BaseModel):
    id: UUID
    filename: str
    original_filename: str
    content_type: str
    size_bytes: int
    owner_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class FileUploadResponse(BaseModel):
    file: FileRecordResponse
    download_url: str

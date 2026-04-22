from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from space.backend.app.api.deps import get_current_user
from space.backend.app.db.session import get_db
from space.backend.app.models.user import User
from space.backend.app.schemas.file import FileRecordResponse, FileUploadResponse
from space.backend.app.services import file_service

router = APIRouter()

MAX_UPLOAD_SIZE = 50 * 1024 * 1024  # 50 MB


@router.post("/upload", response_model=FileUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload a file to Cloudflare R2."""
    content = await file.read()
    if len(content) > MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Max size is {MAX_UPLOAD_SIZE // 1024 // 1024} MB",
        )
    # Reset file position after reading
    await file.seek(0)

    record = await file_service.upload_file(db, file, owner_id=current_user.id)
    download_url = file_service.generate_presigned_url(record.r2_key)

    return FileUploadResponse(file=record, download_url=download_url)


@router.get("/", response_model=List[FileRecordResponse])
async def list_files(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List files owned by the current user."""
    return await file_service.get_user_files(db, owner_id=current_user.id, skip=skip, limit=limit)


@router.get("/{file_id}/download")
async def download_file(
    file_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a presigned download URL for a file."""
    record = await file_service.get_file(db, file_id, owner_id=current_user.id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")

    url = file_service.generate_presigned_url(record.r2_key)
    return {"download_url": url, "filename": record.original_filename}


@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_file(
    file_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a file from R2 and the database."""
    record = await file_service.get_file(db, file_id, owner_id=current_user.id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    await file_service.delete_file(db, record)

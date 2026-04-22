import uuid
import boto3
from botocore.exceptions import ClientError
from fastapi import UploadFile
from typing import Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from space.backend.app.core.config import settings
from space.backend.app.models.file import FileRecord


def get_r2_client():
    return boto3.client(
        "s3",
        endpoint_url=settings.R2_ENDPOINT_URL,
        aws_access_key_id=settings.R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
        region_name="auto",
    )


async def upload_file(
    db: AsyncSession,
    file: UploadFile,
    owner_id: UUID,
) -> FileRecord:
    file_ext = ""
    if file.filename and "." in file.filename:
        file_ext = "." + file.filename.rsplit(".", 1)[-1].lower()

    r2_key = f"uploads/{owner_id}/{uuid.uuid4()}{file_ext}"
    content = await file.read()
    size_bytes = len(content)

    client = get_r2_client()
    client.put_object(
        Bucket=settings.R2_BUCKET_NAME,
        Key=r2_key,
        Body=content,
        ContentType=file.content_type or "application/octet-stream",
    )

    record = FileRecord(
        filename=r2_key.split("/")[-1],
        original_filename=file.filename or "unknown",
        content_type=file.content_type or "application/octet-stream",
        size_bytes=size_bytes,
        r2_key=r2_key,
        owner_id=owner_id,
    )
    db.add(record)
    await db.flush()
    await db.refresh(record)
    return record


def generate_presigned_url(r2_key: str, expires_in: int = 3600) -> str:
    client = get_r2_client()
    url = client.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.R2_BUCKET_NAME, "Key": r2_key},
        ExpiresIn=expires_in,
    )
    return url


async def get_user_files(db: AsyncSession, owner_id: UUID, skip: int = 0, limit: int = 50):
    result = await db.execute(
        select(FileRecord)
        .where(FileRecord.owner_id == owner_id)
        .order_by(FileRecord.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


async def get_file(db: AsyncSession, file_id: UUID, owner_id: UUID) -> Optional[FileRecord]:
    result = await db.execute(
        select(FileRecord).where(FileRecord.id == file_id, FileRecord.owner_id == owner_id)
    )
    return result.scalar_one_or_none()


async def delete_file(db: AsyncSession, record: FileRecord) -> None:
    client = get_r2_client()
    try:
        client.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=record.r2_key)
    except ClientError:
        pass
    await db.delete(record)
    await db.flush()


async def get_total_storage(db: AsyncSession, owner_id: UUID) -> int:
    result = await db.execute(
        select(func.coalesce(func.sum(FileRecord.size_bytes), 0))
        .where(FileRecord.owner_id == owner_id)
    )
    return result.scalar_one()

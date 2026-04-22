from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, cast
from sqlalchemy.dialects.postgresql import ARRAY as PG_ARRAY
from sqlalchemy import String

from app.models.note import Note
from app.schemas.note import NoteCreate, NoteUpdate


async def get_notes(
    db: AsyncSession,
    owner_id: UUID,
    skip: int = 0,
    limit: int = 20,
    q: Optional[str] = None,
    tags: Optional[List[str]] = None,
) -> List[Note]:
    query = select(Note).where(Note.owner_id == owner_id)

    if q:
        search = f"%{q}%"
        query = query.where(
            or_(
                Note.title.ilike(search),
                Note.content.ilike(search),
            )
        )

    if tags:
        # Filter notes that contain any of the provided tags
        query = query.where(Note.tags.overlap(tags))

    query = query.order_by(Note.updated_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


async def get_note(db: AsyncSession, note_id: UUID, owner_id: UUID) -> Optional[Note]:
    result = await db.execute(
        select(Note).where(Note.id == note_id, Note.owner_id == owner_id)
    )
    return result.scalar_one_or_none()


async def create_note(db: AsyncSession, note_in: NoteCreate, owner_id: UUID) -> Note:
    note = Note(
        title=note_in.title,
        content=note_in.content,
        tags=note_in.tags,
        owner_id=owner_id,
    )
    db.add(note)
    await db.flush()
    await db.refresh(note)
    return note


async def update_note(db: AsyncSession, note: Note, note_in: NoteUpdate) -> Note:
    update_data = note_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(note, field, value)
    await db.flush()
    await db.refresh(note)
    return note


async def delete_note(db: AsyncSession, note: Note) -> None:
    await db.delete(note)
    await db.flush()


async def count_user_notes(db: AsyncSession, owner_id: UUID) -> int:
    result = await db.execute(
        select(func.count()).select_from(Note).where(Note.owner_id == owner_id)
    )
    return result.scalar_one()

# Import all models here so Alembic can detect them
from space.backend.app.db.base import Base  # noqa: F401
from space.backend.app.models.user import User  # noqa: F401
from space.backend.app.models.note import Note, NoteTag  # noqa: F401
from space.backend.app.models.file import FileRecord  # noqa: F401

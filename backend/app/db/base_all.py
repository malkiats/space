# Import all models here so Alembic can detect them
from app.db.base import Base  # noqa: F401
from app.models.pending_registration import PendingRegistration  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.note import Note, NoteTag  # noqa: F401
from app.models.file import FileRecord  # noqa: F401

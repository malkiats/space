from datetime import datetime, timedelta
import uuid

from sqlalchemy import Column, DateTime, String
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class PendingRegistration(Base):
    __tablename__ = "pending_registrations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), nullable=False)
    full_name = Column(String(255), nullable=True)
    otp_code = Column(String(10), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    @staticmethod
    def default_expiry(minutes: int = 10) -> datetime:
        return datetime.utcnow() + timedelta(minutes=minutes)

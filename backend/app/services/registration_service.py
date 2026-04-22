from datetime import datetime
import random
from typing import Optional

from sqlalchemy import delete, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.pending_registration import PendingRegistration
from app.models.user import User
from app.schemas.registration import RegistrationOtpRequest, RegistrationOtpVerify
from app.schemas.user import UserCreate
from app.services import auth_service, email_service


def generate_otp_code() -> str:
    return f"{random.randint(0, 999999):06d}"


async def get_pending_registration(db: AsyncSession, email: str) -> Optional[PendingRegistration]:
    result = await db.execute(
        select(PendingRegistration).where(PendingRegistration.email == email)
    )
    return result.scalar_one_or_none()


async def delete_expired_pending_registrations(db: AsyncSession) -> None:
    await db.execute(
        delete(PendingRegistration).where(PendingRegistration.expires_at < datetime.utcnow())
    )


async def request_registration_otp(
    db: AsyncSession,
    registration_in: RegistrationOtpRequest,
) -> None:
    await delete_expired_pending_registrations(db)

    existing_user = await db.execute(
        select(User).where(
            or_(
                User.email == registration_in.email,
                User.username == registration_in.username,
            )
        )
    )
    if existing_user.scalar_one_or_none():
        raise ValueError("Email or username is already registered")

    otp_code = generate_otp_code()
    pending = await get_pending_registration(db, registration_in.email)
    if pending:
        pending.username = registration_in.username
        pending.full_name = registration_in.full_name
        pending.otp_code = otp_code
        pending.expires_at = PendingRegistration.default_expiry()
    else:
        pending = PendingRegistration(
            email=registration_in.email,
            username=registration_in.username,
            full_name=registration_in.full_name,
            otp_code=otp_code,
            expires_at=PendingRegistration.default_expiry(),
        )
        db.add(pending)

    await db.flush()
    email_service.send_registration_otp(
        email=registration_in.email,
        otp_code=otp_code,
        username=registration_in.username,
    )


async def verify_registration_otp(
    db: AsyncSession,
    verification_in: RegistrationOtpVerify,
) -> User:
    await delete_expired_pending_registrations(db)

    pending = await get_pending_registration(db, verification_in.email)
    if not pending:
        raise ValueError("No pending registration found for this email")
    if pending.expires_at < datetime.utcnow():
        await db.delete(pending)
        await db.flush()
        raise ValueError("Verification code has expired")
    if pending.otp_code != verification_in.otp_code:
        raise ValueError("Invalid verification code")

    existing_email = await auth_service.get_user_by_email(db, pending.email)
    if existing_email:
        raise ValueError("Email already registered")

    existing_username = await auth_service.get_user_by_username(db, pending.username)
    if existing_username:
        raise ValueError("Username already taken")

    user = await auth_service.create_user(
        db,
        UserCreate(
            email=pending.email,
            username=pending.username,
            full_name=pending.full_name,
            password=verification_in.password,
        ),
    )
    await db.delete(pending)
    await db.flush()
    return user

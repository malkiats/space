from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import AuthMessage, LoginRequest, Token
from app.schemas.registration import RegistrationOtpRequest, RegistrationOtpVerify
from app.schemas.user import UserCreate, UserResponse
from app.services import auth_service, registration_service
from app.core.security import create_access_token

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user."""
    existing = await auth_service.get_user_by_email(db, user_in.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    existing_username = await auth_service.get_user_by_username(db, user_in.username)
    if existing_username:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken")

    user = await auth_service.create_user(db, user_in)
    return user


@router.post("/register/request-otp", response_model=AuthMessage)
async def request_register_otp(
    registration_in: RegistrationOtpRequest,
    db: AsyncSession = Depends(get_db),
):
    """Send an OTP to start registration."""
    try:
        await registration_service.request_registration_otp(db, registration_in)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to send verification code",
        ) from error
    return AuthMessage(message="Verification code sent")


@router.post("/register/verify", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def verify_register_otp(
    verification_in: RegistrationOtpVerify,
    db: AsyncSession = Depends(get_db),
):
    """Verify OTP and create the user with the chosen password."""
    try:
        user = await registration_service.verify_registration_otp(db, verification_in)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(error)) from error
    return user


@router.post("/login", response_model=Token)
async def login(credentials: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    """Login and return a JWT token."""
    user = await auth_service.authenticate_user(db, credentials.email, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")

    token = create_access_token(subject=str(user.id))
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    return Token(access_token=token)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user."""
    return current_user


@router.post("/logout")
async def logout(response: Response):
    """Clear auth cookie."""
    response.delete_cookie(key="access_token", path="/")
    return {"message": "Logged out"}

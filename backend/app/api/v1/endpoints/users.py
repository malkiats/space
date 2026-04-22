from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_current_admin
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserRoleUpdate, UserUpdate
from app.services import user_service

router = APIRouter()


@router.get("/", response_model=List[UserResponse], dependencies=[Depends(get_current_admin)])
async def list_users(skip: int = 0, limit: int = 50, db: AsyncSession = Depends(get_db)):
    """List all users (admin only)."""
    return await user_service.get_all_users(db, skip=skip, limit=limit)


@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """Get own profile."""
    return current_user


@router.patch("/me", response_model=UserResponse)
async def update_my_profile(
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update own profile."""
    return await user_service.update_user(db, current_user, user_in)


@router.get("/{user_id}", response_model=UserResponse, dependencies=[Depends(get_current_admin)])
async def get_user(user_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get a user by ID (admin only)."""
    user = await user_service.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.patch("/{user_id}/role", response_model=UserResponse, dependencies=[Depends(get_current_admin)])
async def update_user_role(
    user_id: UUID,
    role_in: UserRoleUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update a user's role (admin only)."""
    user = await user_service.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return await user_service.update_user_role(db, user, role_in.role)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(get_current_admin)])
async def delete_user(user_id: UUID, db: AsyncSession = Depends(get_db)):
    """Delete a user (admin only)."""
    user = await user_service.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    await user_service.delete_user(db, user)

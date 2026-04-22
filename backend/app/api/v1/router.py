from fastapi import APIRouter

from space.backend.app.api.v1.endpoints import files
from space.backend.app.api.v1.endpoints import auth, notes, users

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(notes.router, prefix="/notes", tags=["Notes"])
api_router.include_router(files.router, prefix="/files", tags=["Files"])

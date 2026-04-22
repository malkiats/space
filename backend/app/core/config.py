from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "MySpace API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    VERCEL: str = ""
    AUTO_CREATE_TABLES: bool = True

    # Database
    DATABASE_URL: str

    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    COOKIE_SECURE: bool = False
    COOKIE_SAMESITE: str = "lax"

    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]

    # Cloudflare R2
    R2_ACCOUNT_ID: str = ""
    R2_ACCESS_KEY_ID: str = ""
    R2_SECRET_ACCESS_KEY: str = ""
    R2_BUCKET_NAME: str = ""
    R2_ENDPOINT_URL: str = ""
    R2_PUBLIC_URL: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

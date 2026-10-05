import os
from typing import Literal
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Meeting Intelligence System"
    API_V1_STR: str = "/api"
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./meeting_intelligence.db"
    
    # JWT Authentication
    JWT_SECRET: str = "super-secret-jwt-key-replace-in-production-meeting-intelligence-2026"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 1440  # 24 hours
    
    # AI Provider
    AI_PROVIDER: Literal["mock", "gemini", "openai", "anthropic"] = "mock"
    GEMINI_API_KEY: str | None = None
    OPENAI_API_KEY: str | None = None
    ANTHROPIC_API_KEY: str | None = None
    
    # Storage
    STORAGE_TYPE: Literal["local", "s3"] = "local"
    UPLOAD_DIR: str = "./uploads"
    S3_ENDPOINT: str | None = None
    S3_BUCKET: str = "meeting-recordings"
    S3_ACCESS_KEY: str | None = None
    S3_SECRET_KEY: str | None = None
    S3_REGION: str = "us-east-1"
    
    # File limits (500 MB)
    MAX_UPLOAD_SIZE: int = 500 * 1024 * 1024
    
    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

# Ensure local upload dir exists if local storage
if settings.STORAGE_TYPE == "local":
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

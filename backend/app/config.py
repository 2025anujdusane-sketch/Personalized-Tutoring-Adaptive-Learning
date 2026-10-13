import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Providers
    GEMINI_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    XAI_API_KEY: str = ""
    ELEVENLABS_API_KEY: str = ""

    # Models (configurable with sensible defaults)
    GEMINI_MODEL: str = "gemini-2.0-flash"
    GEMINI_EMBED_MODEL: str = "text-embedding-004"
    GROQ_CHAT_MODEL: str = "llama-3.3-70b-versatile"
    GROQ_STT_MODEL: str = "whisper-large-v3-turbo"
    GROQ_TTS_MODEL: str = ""
    TTS_PROVIDER: str = "edge"

    # App
    DATABASE_URL: str = "sqlite:///./studysphere.db"
    JWT_SECRET: str = "studysphere_jwt_secret_dev_key_2026_super_secure_32char"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_HOURS: int = 168 # 7 days
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173"
    UPLOAD_DIR: str = "./storage/uploads"
    MAX_UPLOAD_MB: int = 100

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def has_gemini(self) -> bool:
        return bool(self.GEMINI_API_KEY and self.GEMINI_API_KEY.strip() and self.GEMINI_API_KEY != "your_gemini_key_here")

    @property
    def has_groq(self) -> bool:
        return bool(self.GROQ_API_KEY and self.GROQ_API_KEY.strip() and self.GROQ_API_KEY != "your_groq_key_here")

    @property
    def has_xai(self) -> bool:
        return bool(self.XAI_API_KEY and self.XAI_API_KEY.strip())

    @property
    def has_elevenlabs(self) -> bool:
        return bool(self.ELEVENLABS_API_KEY and self.ELEVENLABS_API_KEY.strip())

settings = Settings()

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GEMINI_API_KEY: str = "mock-api-key"
    DATABASE_URL: str = "sqlite+aiosqlite:///./gamify.db"
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

"""Application configuration and settings management."""
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Application
    app_name: str = "Krishi Mitra API"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000  # Render sets PORT env var automatically, uvicorn uses it from command line
    
    # CORS - can be comma-separated string or list
    cors_origins: str | List[str] = "*"
    cors_allow_credentials: bool = True
    cors_allow_methods: List[str] = ["*"]
    cors_allow_headers: List[str] = ["*"]
    
    # Logging
    log_level: str = "INFO"
    log_format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # External APIs
    weather_api_key: str = "1589f7e554414a26b8e142913242110"
    weather_api_base: str = "http://api.weatherapi.com/v1"
    
    # Caching
    cache_ttl_seconds: int = 300  # 5 minutes default cache
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )
    
    def get_cors_origins(self) -> List[str]:
        """Parse CORS origins from string or return as list."""
        if isinstance(self.cors_origins, str):
            if self.cors_origins == "*":
                return ["*"]
            return [origin.strip() for origin in self.cors_origins.split(",")]
        return self.cors_origins


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


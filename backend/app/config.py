import os
from functools import lru_cache

from app.firebase_credentials import normalize_private_key


@lru_cache
def get_settings():
    return Settings()


class Settings:
    firebase_project_id: str = os.getenv("FIREBASE_PROJECT_ID", "")
    firebase_client_email: str = os.getenv("FIREBASE_CLIENT_EMAIL", "")
    firebase_private_key: str = normalize_private_key(os.getenv("FIREBASE_PRIVATE_KEY", ""))
    firebase_service_account_json: str = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON", "")
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    llm_model: str = os.getenv("LLM_MODEL", "gpt-4o-mini")
    cors_origins: list[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173,https://taoyeyang85-bit.github.io",
        ).split(",")
        if origin.strip()
    ]
    port: int = int(os.getenv("PORT", "8000"))
    max_upload_bytes: int = 10 * 1024 * 1024
    raw_text_preview_length: int = 2000

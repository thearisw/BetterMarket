import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

# Shared repo-root .env (same file docker compose and the web app use).
load_dotenv(Path(__file__).resolve().parents[2] / ".env")


@dataclass(frozen=True)
class Settings:
    database_url: str
    meili_url: str
    meili_master_key: str
    redis_url: str


def get_settings() -> Settings:
    return Settings(
        database_url=os.environ["DATABASE_URL"],
        meili_url=os.environ.get("MEILI_URL", "http://localhost:7700"),
        meili_master_key=os.environ.get("MEILI_MASTER_KEY", ""),
        redis_url=os.environ.get("REDIS_URL", "redis://localhost:6379/0"),
    )

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Configuration(BaseSettings):
    """Reglages lus dans les variables d'environnement (ou dans backend/.env)."""

    supabase_url: str
    supabase_anon_key: str

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def lire_configuration() -> Configuration:
    return Configuration()
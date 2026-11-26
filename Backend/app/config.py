"""Réglages lus dans les variables d'environnement. Aucun secret dans le code."""
import os
from dataclasses import dataclass
from functools import lru_cache

TAILLE_MAX_CORPS_OCTETS = 256 * 1024
MODELE_GEMINI_PAR_DEFAUT = "gemini-3.5-flash-lite"


class ConfigurationManquante(RuntimeError):
    """Une variable d'environnement obligatoire est absente."""


@dataclass(frozen=True)
class Reglages:
    supabase_url: str
    supabase_cle_anon: str
    gemini_api_key: str
    gemini_model: str


def _lire(nom: str) -> str:
    valeur = os.environ.get(nom, "").strip()
    if not valeur:
        raise ConfigurationManquante(f"Variable d'environnement manquante : {nom}")
    return valeur


@lru_cache
def lire_reglages() -> Reglages:
    modele_gemini = os.environ.get("GEMINI_MODEL", MODELE_GEMINI_PAR_DEFAUT).strip()
    return Reglages(
        supabase_url=_lire("SUPABASE_URL"),
        supabase_cle_anon=_lire("SUPABASE_CLE_ANON"),
        gemini_api_key=_lire("GEMINI_API_KEY"),
        gemini_model=modele_gemini or MODELE_GEMINI_PAR_DEFAUT,
    )

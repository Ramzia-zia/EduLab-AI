"""Réglages lus dans les variables d'environnement. Aucun secret dans le code."""
import os
from dataclasses import dataclass
from functools import lru_cache

TAILLE_MAX_CORPS_OCTETS = 256 * 1024


class ConfigurationManquante(RuntimeError):
    """Une variable d'environnement obligatoire est absente."""


@dataclass(frozen=True)
class Reglages:
    supabase_url: str
    supabase_cle_anon: str
    ia_cle_api: str
    ia_modele: str


def _lire(nom: str) -> str:
    valeur = os.environ.get(nom, "").strip()
    if not valeur:
        raise ConfigurationManquante(f"Variable d'environnement manquante : {nom}")
    return valeur


@lru_cache
def lire_reglages() -> Reglages:
    return Reglages(
        supabase_url=_lire("SUPABASE_URL"),
        supabase_cle_anon=_lire("SUPABASE_CLE_ANON"),
        ia_cle_api=_lire("IA_CLE_API"),
        ia_modele=_lire("IA_MODELE"),
    )

"""Objets partagés injectés dans les routes (et remplaçables dans les tests)."""
from functools import lru_cache

import httpx
from fastapi import Depends, Request

from app.config import Reglages, lire_reglages
from app.db import SupabaseClient
from app.services.assistant_ia import FournisseurAnthropic
from app.services.limiteur import LimiteurDebit


def get_reglages() -> Reglages:
    return lire_reglages()


def get_http(request: Request) -> httpx.AsyncClient:
    return request.app.state.http


def get_db(http: httpx.AsyncClient = Depends(get_http), reglages: Reglages = Depends(get_reglages)) -> SupabaseClient:
    return SupabaseClient(http, reglages.supabase_url, reglages.supabase_cle_anon)


def get_fournisseur_ia(
    http: httpx.AsyncClient = Depends(get_http), reglages: Reglages = Depends(get_reglages)
) -> FournisseurAnthropic:
    return FournisseurAnthropic(http, reglages.ia_cle_api, reglages.ia_modele)


@lru_cache
def get_limiteur() -> LimiteurDebit:
    return LimiteurDebit(maximum=10, fenetre_s=60.0)

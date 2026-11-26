"""Accès à Supabase AVEC LE JETON DE L'UTILISATEUR : les règles RLS s'appliquent.

Aucune clé service_role ici. La clé « anon » est la clé publique du projet.
"""
from typing import Any, Protocol

import httpx

from app.erreurs import ErreurApi

TAILLE_PAGE = 1000  # limite par défaut de PostgREST (Supabase)


class BaseDeDonnees(Protocol):
    async def utilisateur(self, jeton: str) -> dict[str, Any] | None: ...

    async def select(self, jeton: str, table: str, params: dict[str, str]) -> list[dict[str, Any]]: ...

    async def insert(
        self,
        jeton: str,
        table: str,
        lignes: list[dict[str, Any]],
        *,
        ignorer_doublons: bool = False,
        cle_unique: str = "id",
    ) -> list[dict[str, Any]]: ...


def _verifier(reponse: httpx.Response) -> None:
    if reponse.is_success:
        return
    if reponse.status_code == 401:
        raise ErreurApi(401, "non_authentifie", "Jeton invalide ou expiré.")
    if reponse.status_code == 403:
        raise ErreurApi(403, "acces_refuse", "Accès refusé par les règles de sécurité.")
    code_pg = None
    try:
        corps = reponse.json()
        if isinstance(corps, dict):
            code_pg = corps.get("code")
    except ValueError:
        pass
    if code_pg == "42501":
        raise ErreurApi(403, "acces_refuse", "Accès refusé par les règles de sécurité.")
    if code_pg == "23503":
        raise ErreurApi(
            422, "donnees_invalides", "Une référence envoyée n'existe pas.", {"raison": "reference_inconnue"}
        )
    raise ErreurApi(
        502, "base_indisponible", "La base de données a répondu avec une erreur.", {"statut_base": reponse.status_code}
    )


class SupabaseClient:
    def __init__(self, http: httpx.AsyncClient, url: str, cle_anon: str) -> None:
        self._http = http
        self._url = url.rstrip("/")
        self._cle_anon = cle_anon

    async def _envoyer(self, methode: str, chemin: str, jeton: str, **options: Any) -> httpx.Response:
        entetes = {"apikey": self._cle_anon, "Authorization": f"Bearer {jeton}"}
        entetes.update(options.pop("entetes", {}))
        try:
            return await self._http.request(methode, f"{self._url}{chemin}", headers=entetes, **options)
        except httpx.HTTPError as exc:
            raise ErreurApi(503, "base_indisponible", "La base de données ne répond pas.") from exc

    async def utilisateur(self, jeton: str) -> dict[str, Any] | None:
        """Vérifie le jeton auprès de Supabase. Renvoie None si le jeton est refusé."""
        reponse = await self._envoyer("GET", "/auth/v1/user", jeton)
        if reponse.status_code in (400, 401, 403):
            return None
        _verifier(reponse)
        return reponse.json()

    async def select(self, jeton: str, table: str, params: dict[str, str]) -> list[dict[str, Any]]:
        reponse = await self._envoyer("GET", f"/rest/v1/{table}", jeton, params=params)
        _verifier(reponse)
        return reponse.json()

    async def insert(
        self,
        jeton: str,
        table: str,
        lignes: list[dict[str, Any]],
        *,
        ignorer_doublons: bool = False,
        cle_unique: str = "id",
    ) -> list[dict[str, Any]]:
        """Insère des lignes et renvoie celles qui ont VRAIMENT été insérées."""
        entetes = {"Prefer": "return=representation"}
        params: dict[str, str] = {}
        if ignorer_doublons:
            entetes["Prefer"] = "resolution=ignore-duplicates,return=representation"
            params["on_conflict"] = cle_unique
        reponse = await self._envoyer("POST", f"/rest/v1/{table}", jeton, json=lignes, params=params, entetes=entetes)
        _verifier(reponse)
        return reponse.json()


async def select_tout(
    db: BaseDeDonnees, jeton: str, table: str, params: dict[str, str]
) -> list[dict[str, Any]]:
    """Lit toutes les pages d'une requête. `order` est obligatoire pour une pagination stable."""
    if "order" not in params:
        raise ValueError("select_tout exige un paramètre 'order'")
    lignes: list[dict[str, Any]] = []
    decalage = 0
    while True:
        page = await db.select(jeton, table, {**params, "limit": str(TAILLE_PAGE), "offset": str(decalage)})
        lignes.extend(page)
        if len(page) < TAILLE_PAGE:
            return lignes
        decalage += TAILLE_PAGE

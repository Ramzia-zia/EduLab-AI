"""Acces a Supabase (API PostgREST) AVEC LE JETON DE L'UTILISATEUR.

Les regles RLS s'appliquent donc. Aucune cle service_role n'est utilisee.
"""
from uuid import UUID

import httpx

from app.erreurs import ErreurApi
from app.schemas.synchronisation import EvenementSync, TentativeSync
from app.services.synchronisation import DoublonDepot


class DepotSupabase:
    def __init__(self, url: str, cle_anon: str, jeton: str, transport=None):
        self._client = httpx.Client(
            base_url=f"{url.rstrip('/')}/rest/v1/",
            headers={"apikey": cle_anon, "Authorization": f"Bearer {jeton}"},
            timeout=5.0,
            transport=transport,
        )

    def fermer(self) -> None:
        self._client.close()

    def _envoyer(self, methode: str, table: str, **kwargs) -> httpx.Response:
        try:
            reponse = self._client.request(methode, table, **kwargs)
        except httpx.HTTPError:
            raise ErreurApi(500, "erreur_serveur", "La base de donnees ne repond pas.")
        if reponse.status_code == 409:
            raise DoublonDepot()
        if reponse.status_code in (401, 403):
            raise ErreurApi(403, "interdit", "Acces refuse par la base de donnees.")
        if reponse.status_code >= 400:
            raise ErreurApi(500, "erreur_serveur", "La base de donnees a refuse la demande.")
        return reponse

    def _lire(self, table: str, filtres: dict, colonnes: str) -> list[dict]:
        reponse = self._envoyer("GET", table, params={"select": colonnes, **filtres})
        return reponse.json()

    def lire_tentative(self, tentative_id: UUID) -> dict | None:
        lignes = self._lire("tentative", {"id": f"eq.{tentative_id}"}, "id,profil_id,statut")
        return lignes[0] if lignes else None

    def creer_tentative(self, profil_id: str, tentative: TentativeSync) -> None:
        corps = tentative.model_dump(mode="json")
        corps["profil_id"] = profil_id
        self._envoyer("POST", "tentative", json=corps, headers={"Prefer": "return=minimal"})

    def mettre_a_jour_tentative(self, tentative: TentativeSync) -> None:
        corps = tentative.model_dump(mode="json", include={"fin", "statut", "score", "resultat"})
        self._envoyer("PATCH", "tentative", params={"id": f"eq.{tentative.id}"}, json=corps)

    def evenement_existe(self, evenement_id: UUID) -> bool:
        return bool(self._lire("evenement_tentative", {"id": f"eq.{evenement_id}"}, "id"))

    def rang_pris(self, tentative_id: UUID, rang: int) -> bool:
        filtres = {"tentative_id": f"eq.{tentative_id}", "rang": f"eq.{rang}"}
        return bool(self._lire("evenement_tentative", filtres, "id"))

    def creer_evenement(self, evenement: EvenementSync) -> None:
        self._envoyer(
            "POST",
            "evenement_tentative",
            json=evenement.model_dump(mode="json"),
            headers={"Prefer": "return=minimal"},
        )
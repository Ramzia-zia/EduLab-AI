"""Logique de GET /moi : testable sans serveur."""
from typing import Protocol
from uuid import UUID

from app.auth import Utilisateur
from app.erreurs import ErreurApi
from app.schemas.profil import MoiReponse


class DepotProfil(Protocol):
    def lire_profil(self, profil_id: str) -> dict | None:
        """Renvoie {"id", "nom", "role", "etablissement_id"} ou None."""


def lire_moi(utilisateur: Utilisateur, depot: DepotProfil) -> MoiReponse:
    ligne = depot.lire_profil(utilisateur.id)
    if ligne is None:
        raise ErreurApi(404, "introuvable", "Profil introuvable.")
    if ligne["role"] != utilisateur.role:
        raise ErreurApi(
            403,
            "interdit",
            "Le rôle du profil ne correspond pas au rôle de la connexion.",
        )
    return MoiReponse(**ligne)
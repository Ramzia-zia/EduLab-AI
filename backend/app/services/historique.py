"""Logique de GET /tentatives et GET /tentatives/{id}/bilan : testable sans serveur."""
from typing import Any, Protocol
from uuid import UUID

from app.erreurs import ErreurApi
from app.schemas.tentatives import Bilan, ListeTentatives, Tentative


class DepotHistorique(Protocol):
    def lister_tentatives(self, profil_id: str, page: int, taille: int) -> tuple[list[dict], int]:
        """Renvoie (lignes de la page, nombre total de tentatives de cet eleve)."""

    def lire_bilan(self, profil_id: str, tentative_id: str) -> dict | None:
        """Renvoie la ligne du bilan, ou None si la tentative n'est pas a cet eleve ou n'a pas de bilan."""


def retirer_corrige(valeur: Any) -> Any:
    """Retire, a tous les niveaux, toute cle dont le nom contient 'corrige'.

    Le bilan ne doit jamais montrer le corrige de l'exercice (chapitre 3 du contrat).
    """
    if isinstance(valeur, dict):
        return {k: retirer_corrige(v) for k, v in valeur.items() if "corrige" not in str(k).lower()}
    if isinstance(valeur, list):
        return [retirer_corrige(v) for v in valeur]
    return valeur


def lister_tentatives(depot: DepotHistorique, profil_id: str, page: int, taille: int) -> ListeTentatives:
    lignes, total = depot.lister_tentatives(profil_id, page, taille)
    return ListeTentatives(
        elements=[Tentative(**ligne) for ligne in lignes], page=page, taille=taille, total=total
    )


def lire_bilan(depot: DepotHistorique, profil_id: str, tentative_id: UUID) -> Bilan:
    ligne = depot.lire_bilan(profil_id, str(tentative_id))
    if ligne is None:
        raise ErreurApi(404, "introuvable", "Bilan introuvable.")
    return Bilan(
        tentative_id=ligne["tentative_id"],
        erreurs=ligne.get("erreurs") or [],
        quiz=retirer_corrige(ligne.get("quiz")),
        exercice=retirer_corrige(ligne.get("exercice")),
    )
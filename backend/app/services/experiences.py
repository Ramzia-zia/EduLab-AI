"""Logique de GET /experiences et GET /experiences/{id}/pack : testable sans serveur."""
from typing import Protocol

from app.erreurs import ErreurApi
from app.schemas.experiences import ExperiencePack, ExperienceResume, ListeExperiences


class DepotExperiences(Protocol):
    def lister_publiees(
        self, matiere: str | None, niveau: str | None, page: int, taille: int
    ) -> tuple[list[dict], int]:
        """Renvoie (lignes de la page, nombre total d'experiences publiees)."""

    def statuts_tentatives(self, profil_id: str, experience_ids: list[str]) -> list[dict]:
        """Renvoie [{"experience_id": ..., "statut": ...}] pour les tentatives de cet eleve."""

    def lire_experience(self, experience_id: str) -> dict | None:
        """Renvoie {"id", "version", "definition"} d'une experience publiee, ou None."""


def calculer_etat(statuts: set[str]) -> str:
    if "terminee" in statuts:
        return "terminee"
    if "en_cours" in statuts:
        return "en_cours"
    return "a_commencer"


def lister_experiences(
    depot: DepotExperiences,
    profil_id: str,
    matiere: str | None,
    niveau: str | None,
    page: int,
    taille: int,
) -> ListeExperiences:
    lignes, total = depot.lister_publiees(matiere, niveau, page, taille)
    statuts: dict[str, set[str]] = {}
    for t in depot.statuts_tentatives(profil_id, [ligne["id"] for ligne in lignes]):
        statuts.setdefault(t["experience_id"], set()).add(t["statut"])
    elements = [
        ExperienceResume(**ligne, etat=calculer_etat(statuts.get(ligne["id"], set())))
        for ligne in lignes
    ]
    return ListeExperiences(elements=elements, page=page, taille=taille, total=total)


def lire_pack(depot: DepotExperiences, experience_id: str) -> ExperiencePack:
    ligne = depot.lire_experience(experience_id)
    if ligne is None:
        raise ErreurApi(404, "introuvable", "Expérience introuvable.")
    return ExperiencePack(**ligne)
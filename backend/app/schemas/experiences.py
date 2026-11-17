from typing import Any, Literal

from pydantic import BaseModel

Matiere = Literal["physique", "chimie", "svt", "genie_civil"]
Niveau = Literal["seconde", "premiere", "terminale"]


class ExperienceResume(BaseModel):
    id: str
    matiere: str
    niveau: str
    titre: str
    duree_min: int | None = None
    difficulte: str | None = None
    version: int
    etat: Literal["a_commencer", "en_cours", "terminee"]


class ListeExperiences(BaseModel):
    elements: list[ExperienceResume]
    page: int
    taille: int
    total: int


class ExperiencePack(BaseModel):
    id: str
    version: int
    definition: dict[str, Any]
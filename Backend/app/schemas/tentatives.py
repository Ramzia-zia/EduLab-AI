from typing import Any, Literal
from uuid import UUID

from pydantic import AwareDatetime, BaseModel, Field

from app.schemas.commun import ExperienceId


class TentativeCreation(BaseModel):
    id: UUID = Field(description="Identifiant généré par le mobile (permet de créer hors ligne, sans doublon)")
    experience_id: ExperienceId
    classe_id: UUID | None = Field(default=None, description="Classe de l'élève, si la tentative est faite en classe")
    debut_le: AwareDatetime = Field(description="ISO 8601 avec fuseau, ex. 2026-11-08T09:30:00Z")
    fin_le: AwareDatetime | None = Field(
        default=None,
        description="Fin de la tentative, si elle a été terminée hors ligne avant sa synchronisation.",
    )
    resultat: dict[str, Any] | None = Field(
        default=None,
        description="Compte rendu structuré fourni par le moteur de simulation.",
    )


class Tentative(BaseModel):
    id: UUID
    eleve_id: UUID
    experience_id: ExperienceId
    classe_id: UUID | None = None
    debut_le: AwareDatetime
    fin_le: AwareDatetime | None = None
    score: float | None = None
    resultat: dict[str, Any] | None = None


class EvenementEntrant(BaseModel):
    id: UUID = Field(description="Identifiant unique généré par le mobile : sert à ignorer les doublons")
    tentative_id: UUID
    type: str = Field(pattern=r"^[a-z][a-z0-9_]{0,49}$", description="Type d'événement en snake_case")
    charge: dict[str, Any] = Field(default_factory=dict, description="Contenu libre de l'événement (objet JSON)")
    survenu_le: AwareDatetime


class DemandeSynchronisation(BaseModel):
    evenements: list[EvenementEntrant] = Field(min_length=1, max_length=50)


class ResultatEvenement(BaseModel):
    evenement_id: UUID
    statut: Literal["accepte", "refuse"]
    doublon: bool = Field(default=False, description="Vrai si l'événement avait déjà été reçu (il est ignoré)")
    code: str | None = Field(default=None, description="Raison du refus, ex. tentative_introuvable")


class ReponseSynchronisation(BaseModel):
    resultats: list[ResultatEvenement] = Field(description="Un résultat par événement, dans l'ordre de la demande")

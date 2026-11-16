from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, Field, model_validator

LIMITE_ELEMENTS_PAR_LOT = 50

# Actions du chapitre 5 du contrat (docs/CONTRAT.md).
ACTIONS_CONNUES = frozenset(
    {
        "placer_materiel",
        "action_bloquee",
        "tourner_robinet",
        "verser",
        "regler_angle",
        "lancer_chrono",
        "arreter_chrono",
        "remplir_couche",
        "piquer",
        "soulever_cone",
        "mesurer",
        "terminer",
    }
)


class TentativeSync(BaseModel):
    id: UUID
    experience_id: str
    version_experience: int = Field(ge=1)
    debut: datetime
    fin: datetime | None = None
    statut: Literal["en_cours", "terminee", "abandonnee"]
    score: int | None = Field(default=None, ge=0, le=100)
    resultat: dict[str, Any] | None = None


class EvenementSync(BaseModel):
    id: UUID
    tentative_id: UUID
    rang: int = Field(ge=1)
    horodatage: datetime
    action: str
    valeurs: dict[str, Any] = Field(default_factory=dict)


class SyncLot(BaseModel):
    tentatives: list[TentativeSync] = Field(default_factory=list)
    evenements: list[EvenementSync] = Field(default_factory=list)

    @model_validator(mode="after")
    def limiter_la_taille(self):
        total = len(self.tentatives) + len(self.evenements)
        if total > LIMITE_ELEMENTS_PAR_LOT:
            raise ValueError("Un lot contient 50 elements au plus.")
        return self


class ResultatSync(BaseModel):
    id: UUID
    type: Literal["tentative", "evenement"]
    statut: Literal["accepte", "refuse", "deja_recu"]
    code: str | None = None


class SyncReponse(BaseModel):
    resultats: list[ResultatSync]
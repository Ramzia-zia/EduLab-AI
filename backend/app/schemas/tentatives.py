from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, Field


class Tentative(BaseModel):
    id: UUID
    experience_id: str
    version_experience: int
    debut: datetime
    fin: datetime | None = None
    statut: Literal["en_cours", "terminee", "abandonnee"]
    score: int | None = None
    resultat: dict[str, Any] | None = None


class ListeTentatives(BaseModel):
    elements: list[Tentative]
    page: int
    taille: int
    total: int


class Bilan(BaseModel):
    tentative_id: UUID
    erreurs: list[str] = Field(default_factory=list)
    quiz: Any = None
    exercice: Any = None
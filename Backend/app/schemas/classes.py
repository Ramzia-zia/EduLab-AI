from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.commun import ExperienceId


class ClasseResume(BaseModel):
    id: UUID
    etablissement_id: UUID
    enseignant_id: UUID
    nom: str
    niveau: str


class BilanExperience(BaseModel):
    experience_id: ExperienceId
    nombre_tentatives: int
    score_moyen: float | None = None
    titre: str | None = None
    matiere: str | None = None


class BilanClasse(BaseModel):
    classe_id: UUID
    nombre_eleves: int
    nombre_tentatives: int
    nombre_tentatives_terminees: int
    score_moyen: float | None = Field(default=None, description="Moyenne des scores connus, arrondie à 2 décimales")
    par_experience: list[BilanExperience]

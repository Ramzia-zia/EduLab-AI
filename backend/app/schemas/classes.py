from uuid import UUID
from pydantic import BaseModel
from typing import Any

class ErreurFrequente(BaseModel):
    code: str
    nb: int

class EleveResultat(BaseModel):
    profil_id: UUID
    nom: str
    experiences_faites: int
    score_moyen: int | None = None
    derniere_activite: str | None = None

class Classe(BaseModel):
    id: UUID
    nom: str

class ResultatsClasse(BaseModel):
    classe: Classe
    eleves: list[EleveResultat]
    erreurs_frequentes: list[ErreurFrequente]
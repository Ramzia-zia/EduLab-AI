from typing import Annotated, Any, Literal
from pydantic import BaseModel, Field, StringConstraints

from app.schemas.commun import ExperienceId

Texte1000 = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=1000)]


class MessageHistorique(BaseModel):
    role: Literal["eleve", "assistant"]
    contenu: Texte1000


class QuestionAssistant(BaseModel):
    experience_id: ExperienceId
    message: Texte1000
    historique: list[MessageHistorique] = Field(default_factory=list, max_length=6, description="6 messages maximum")
    niveau_indice: int = Field(default=1, ge=1, le=3, description="1 = question, 2 = piste de méthode, 3 = indice précis")
    etat_experience: dict[str, Any] = Field(default_factory=dict, description="État courant de la simulation")
    derniere_erreur: str | None = Field(default=None, max_length=500)


class ReponseAssistant(BaseModel):
    reponse: str = Field(description="120 mots maximum")
    niveau_indice: int

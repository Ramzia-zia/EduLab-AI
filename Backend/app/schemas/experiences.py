from typing import Any
from pydantic import BaseModel, Field

from app.schemas.commun import ExperienceId, Matiere


class ExperienceResume(BaseModel):
    id: ExperienceId
    matiere: Matiere
    titre: str
    niveau: str = ""
    version: int = 1


class ExperienceDetail(ExperienceResume):
    parametres: dict[str, Any] = Field(description="Paramètres de la simulation (le corrigé n'y figure jamais)")

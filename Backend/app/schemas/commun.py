from typing import Annotated, Any, Literal

from pydantic import BaseModel, Field, StringConstraints

Matiere = Literal["physique", "chimie", "svt", "genie_civil"]
ExperienceId = Annotated[
    str,
    StringConstraints(
        pattern=r"^(?:[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}|[a-z][a-z0-9_]{0,79})$"
    ),
]


class ReponseErreur(BaseModel):
    code: str = Field(description="Code stable lisible par la machine, ex. acces_refuse")
    message: str = Field(description="Phrase lisible par l'utilisateur")
    details: dict[str, Any] = Field(default_factory=dict, description="Informations complémentaires")

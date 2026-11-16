from typing import Literal
from uuid import UUID

from pydantic import BaseModel


class MoiReponse(BaseModel):
    id: UUID
    nom: str
    role: Literal["eleve", "enseignant", "etablissement", "ministere"]
    etablissement_id: UUID | None = None
from uuid import UUID

from pydantic import BaseModel


class ProfilCourant(BaseModel):
    id: UUID
    nom: str
    role: str
    etablissement_id: UUID | None = None
    etablissement_nom: str | None = None
    etablissement_actif: bool | None = None

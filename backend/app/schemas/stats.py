from uuid import UUID
from pydantic import BaseModel

class StatEtablissement(BaseModel):
    etablissement_id: UUID
    nom: str
    commune: str
    nb_eleves_actifs: int
    taux_reussite: float
    progression_moyenne: float
from uuid import UUID

from pydantic import BaseModel

from app.schemas.commun import Matiere


class LigneStatEtablissement(BaseModel):
    etablissement_id: UUID
    matiere: Matiere
    nombre_eleves_actifs: int
    nombre_tentatives: int
    score_moyen: float | None = None


class LigneStatMinistere(LigneStatEtablissement):
    nom_etablissement: str

from uuid import UUID

from fastapi import APIRouter, Depends, Path, Query

from app.auth import Utilisateur, exige
from app.config import lire_configuration
from app.schemas.tentatives import Bilan, ListeTentatives
from app.services.depot_tentatives import DepotTentativesSupabase
from app.services.historique import DepotHistorique, lire_bilan, lister_tentatives

routeur = APIRouter(tags=["tentatives"])

exige_eleve = exige("eleve")


def fournir_depot_historique(utilisateur: Utilisateur = Depends(exige_eleve)):
    config = lire_configuration()
    depot = DepotTentativesSupabase(config.supabase_url, config.supabase_anon_key, utilisateur.jeton)
    try:
        yield depot
    finally:
        depot.fermer()


@routeur.get(
    "/tentatives",
    response_model=ListeTentatives,
    description=(
        "Liste les tentatives de l'eleve connecte, de la plus recente a la plus ancienne. "
        "Pagination : page, taille (50 par defaut, 100 au plus)."
    ),
)
def lister(
    page: int = Query(1, ge=1),
    taille: int = Query(50, ge=1, le=100),
    utilisateur: Utilisateur = Depends(exige_eleve),
    depot: DepotHistorique = Depends(fournir_depot_historique),
) -> ListeTentatives:
    return lister_tentatives(depot, utilisateur.id, page, taille)


@routeur.get(
    "/tentatives/{id}/bilan",
    response_model=Bilan,
    description=(
        "Renvoie le bilan d'une tentative de l'eleve connecte : erreurs, quiz et exercice adapte. "
        "Le corrige de l'exercice n'en fait jamais partie."
    ),
)
def bilan(
    id: UUID = Path(),
    utilisateur: Utilisateur = Depends(exige_eleve),
    depot: DepotHistorique = Depends(fournir_depot_historique),
) -> Bilan:
    return lire_bilan(depot, utilisateur.id, id)
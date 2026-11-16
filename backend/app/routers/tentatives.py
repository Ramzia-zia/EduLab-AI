from fastapi import APIRouter, Depends

from app.auth import Utilisateur, exige
from app.config import lire_configuration
from app.schemas.synchronisation import SyncLot, SyncReponse
from app.services.depot_supabase import DepotSupabase
from app.services.synchronisation import DepotSync, synchroniser_lot

routeur = APIRouter(tags=["tentatives"])

exige_eleve = exige("eleve")


def fournir_depot_sync(utilisateur: Utilisateur = Depends(exige_eleve)):
    config = lire_configuration()
    depot = DepotSupabase(config.supabase_url, config.supabase_anon_key, utilisateur.jeton)
    try:
        yield depot
    finally:
        depot.fermer()


@routeur.post(
    "/tentatives/sync",
    response_model=SyncReponse,
    response_model_exclude_none=True,
    description=(
        "Recoit au plus 50 elements (tentatives et evenements ensemble) envoyes par le "
        "telephone et repond element par element : accepte, refuse (avec un code) ou "
        "deja_recu. Un evenement deja recu n'est jamais ecrit deux fois."
    ),
)
def synchroniser(
    lot: SyncLot,
    utilisateur: Utilisateur = Depends(exige_eleve),
    depot: DepotSync = Depends(fournir_depot_sync),
) -> SyncReponse:
    return synchroniser_lot(lot, utilisateur.id, depot)
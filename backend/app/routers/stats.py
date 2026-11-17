from fastapi import APIRouter, Depends
from app.auth import Utilisateur, exige
from app.schemas.stats import StatEtablissement
from app.services.depot_stats import DepotStatsSupabase
from app.config import lire_configuration

routeur = APIRouter(tags=["stats"])
exige_ministere = exige("ministere")

def fournir_depot(utilisateur: Utilisateur = Depends(exige_ministere)):
    config = lire_configuration()
    depot = DepotStatsSupabase(config.supabase_url, config.supabase_anon_key, utilisateur.jeton)
    try:
        yield depot
    finally:
        depot.fermer()

@routeur.get("/stats/etablissements", response_model=list[StatEtablissement])
def lister(utilisateur: Utilisateur = Depends(exige_ministere), depot: DepotStatsSupabase = Depends(fournir_depot)):
    return depot.lire_stats()
from fastapi import APIRouter, Depends, HTTPException
from uuid import UUID
from app.auth import Utilisateur, exige
from app.schemas.classes import Classe, ResultatsClasse
from app.services.depot_classes import DepotClassesSupabase
from app.config import lire_configuration

routeur = APIRouter(tags=["classes"])
exige_web = exige("enseignant", "etablissement")

def fournir_depot(utilisateur: Utilisateur = Depends(exige_web)):
    config = lire_configuration()
    depot = DepotClassesSupabase(config.supabase_url, config.supabase_anon_key, utilisateur.jeton)
    try:
        yield depot
    finally:
        depot.fermer()

@routeur.get("/classes", response_model=list[Classe])
def lister(utilisateur: Utilisateur = Depends(exige_web), depot: DepotClassesSupabase = Depends(fournir_depot)):
    return depot.lister_classes(utilisateur.id)

@routeur.get("/classes/{id}/resultats", response_model=ResultatsClasse)
def resultats(id: UUID, utilisateur: Utilisateur = Depends(exige_web), depot: DepotClassesSupabase = Depends(fournir_depot)):
    return depot.lister_resultats(str(id))
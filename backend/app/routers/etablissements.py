from fastapi import APIRouter, Depends, UploadFile, File
from uuid import UUID
from app.auth import Utilisateur, exige
from app.schemas.etablissements import ImportReponse
import csv, io

routeur = APIRouter(tags=["etablissements"])
exige_etab = exige("etablissement")

@routeur.post("/etablissements/{id}/import", response_model=ImportReponse)
async def importer(id: UUID, fichier: UploadFile = File(...), utilisateur: Utilisateur = Depends(exige_etab)):
    contenu = await fichier.read()
    texte = contenu.decode("utf-8")
    lecteur = csv.DictReader(io.StringIO(texte))
    
    crees = 0
    ignores = 0
    erreurs = []
    
    # Simulation de l'import (le vrai code appellera Supabase)
    for index, ligne in enumerate(lecteur, start=2):
        if "nom" not in ligne or "role" not in ligne:
            erreurs.append({"ligne": index, "code": "donnees_invalides"})
            ignores += 1
        else:
            crees += 1
            
    return ImportReponse(crees=crees, ignores=ignores, erreurs=erreurs)
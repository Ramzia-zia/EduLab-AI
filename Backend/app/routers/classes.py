from uuid import UUID

from fastapi import APIRouter, Depends

from app.auth import Utilisateur, exige
from app.colonnes import CLASSE
from app.db import BaseDeDonnees, select_tout
from app.dependances import get_db
from app.erreurs import ErreurApi
from app.routers.reponses import erreurs
from app.schemas.classes import BilanClasse, ClasseResume
from app.services.bilans import calculer_bilan

router = APIRouter(prefix="/classes", tags=["classes"])


@router.get(
    "",
    response_model=list[ClasseResume],
    summary="Lister les classes",
    description="Rôles : enseignant (ses classes), etablissement (les classes de l'établissement).",
    responses=erreurs(401, 403, 502, 503),
)
async def lister_classes(
    utilisateur: Utilisateur = Depends(exige("enseignant", "etablissement")),
    db: BaseDeDonnees = Depends(get_db),
):
    return await select_tout(db, utilisateur.jeton, "classe", {"select": CLASSE, "order": "nom.asc,id.asc"})


@router.get(
    "/{classe_id}/bilan",
    response_model=BilanClasse,
    summary="Bilan d'une classe",
    description="Rôles : enseignant, etablissement. Nombre d'élèves, de tentatives et score moyen, par expérience.",
    responses=erreurs(401, 403, 404, 422, 502, 503),
)
async def bilan_classe(
    classe_id: UUID,
    utilisateur: Utilisateur = Depends(exige("enseignant", "etablissement")),
    db: BaseDeDonnees = Depends(get_db),
):
    classes = await db.select(
        utilisateur.jeton, "classe", {"id": f"eq.{classe_id}", "select": "id", "limit": "1"}
    )
    if not classes:
        raise ErreurApi(404, "introuvable", "Classe introuvable.")
    inscriptions = await select_tout(
        db, utilisateur.jeton, "inscription", {"classe_id": f"eq.{classe_id}", "select": "eleve_id", "order": "eleve_id.asc"}
    )
    tentatives = await select_tout(
        db,
        utilisateur.jeton,
        "tentative",
        {"classe_id": f"eq.{classe_id}", "select": "id,experience_id,fin_le,score", "order": "id.asc"},
    )
    experiences = await select_tout(
        db, utilisateur.jeton, "experience", {"select": "id,titre,matiere", "order": "id.asc"}
    )
    details_experiences = {
        str(ligne["id"]): {"titre": ligne["titre"], "matiere": ligne["matiere"]}
        for ligne in experiences
    }
    return calculer_bilan(str(classe_id), len(inscriptions), tentatives, details_experiences)

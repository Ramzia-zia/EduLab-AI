from fastapi import APIRouter, Depends

from app.auth import Utilisateur, exige
from app.db import BaseDeDonnees, select_tout
from app.dependances import get_db
from app.routers.reponses import erreurs
from app.schemas.stats import LigneStatEtablissement, LigneStatMinistere

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get(
    "/etablissement",
    response_model=list[LigneStatEtablissement],
    summary="Statistiques de l'établissement",
    description="Rôle : etablissement. Lit la vue agrégée vue_stats_etablissement (une ligne par matière).",
    responses=erreurs(401, 403, 502, 503),
)
async def stats_etablissement(
    utilisateur: Utilisateur = Depends(exige("etablissement")), db: BaseDeDonnees = Depends(get_db)
):
    return await select_tout(
        db, utilisateur.jeton, "vue_stats_etablissement", {"select": "*", "order": "matiere.asc"}
    )


@router.get(
    "/ministere",
    response_model=list[LigneStatMinistere],
    summary="Statistiques nationales",
    description=(
        "Rôle : ministere. Lit UNIQUEMENT la vue agrégée vue_stats_ministere "
        "(une ligne par établissement et par matière). Aucune table d'élèves n'est lue."
    ),
    responses=erreurs(401, 403, 502, 503),
)
async def stats_ministere(
    utilisateur: Utilisateur = Depends(exige("ministere")), db: BaseDeDonnees = Depends(get_db)
):
    return await select_tout(
        db,
        utilisateur.jeton,
        "vue_stats_ministere",
        {"select": "*", "order": "nom_etablissement.asc,matiere.asc"},
    )

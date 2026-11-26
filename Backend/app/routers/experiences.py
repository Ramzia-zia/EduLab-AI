from fastapi import APIRouter, Depends, Query

from app.auth import ROLES, Utilisateur, exige
from app.colonnes import EXPERIENCE_DETAIL, EXPERIENCE_RESUME
from app.db import BaseDeDonnees
from app.dependances import get_db
from app.erreurs import ErreurApi
from app.routers.reponses import erreurs
from app.schemas.experiences import ExperienceDetail, ExperienceResume
from app.schemas.commun import ExperienceId, Matiere

router = APIRouter(prefix="/experiences", tags=["experiences"])


@router.get(
    "",
    response_model=list[ExperienceResume],
    summary="Lister les expériences",
    description="Catalogue des expériences. Tous les rôles connectés. Le corrigé n'est jamais renvoyé.",
    responses=erreurs(401, 502, 503),
)
async def lister_experiences(
    matiere: Matiere | None = None,
    niveau: str | None = Query(default=None, min_length=1, max_length=40),
    utilisateur: Utilisateur = Depends(exige(*ROLES)), db: BaseDeDonnees = Depends(get_db)
):
    filtres = {"select": EXPERIENCE_RESUME, "order": "titre.asc"}
    if matiere is not None:
        filtres["matiere"] = f"eq.{matiere}"
    if niveau is not None:
        filtres["niveau"] = f"eq.{niveau}"
    return await db.select(utilisateur.jeton, "experience", filtres)


@router.get(
    "/{experience_id}",
    response_model=ExperienceDetail,
    summary="Détail d'une expérience",
    description="Titre, matière et paramètres de la simulation. Tous les rôles connectés. Sans corrigé.",
    responses=erreurs(401, 404, 422, 502, 503),
)
async def lire_experience(
    experience_id: ExperienceId,
    utilisateur: Utilisateur = Depends(exige(*ROLES)),
    db: BaseDeDonnees = Depends(get_db),
):
    lignes = await db.select(
        utilisateur.jeton, "experience", {"id": f"eq.{experience_id}", "select": EXPERIENCE_DETAIL, "limit": "1"}
    )
    if not lignes:
        raise ErreurApi(404, "introuvable", "Expérience introuvable.")
    return lignes[0]

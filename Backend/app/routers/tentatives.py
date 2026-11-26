from uuid import UUID

from fastapi import APIRouter, Depends

from app.auth import Utilisateur, exige
from app.colonnes import TENTATIVE
from app.db import BaseDeDonnees
from app.dependances import get_db
from app.erreurs import ErreurApi
from app.routers.reponses import erreurs
from app.schemas.tentatives import (
    DemandeSynchronisation,
    ReponseSynchronisation,
    Tentative,
    TentativeCreation,
)
from app.services.synchronisation import synchroniser
from app.services.tentatives import creer_tentative

router = APIRouter(prefix="/tentatives", tags=["tentatives"])


@router.post(
    "",
    response_model=Tentative,
    status_code=201,
    summary="Créer ou synchroniser une tentative",
    description=(
        "Rôle : eleve. L'identifiant est fourni par le mobile ; rejouer la même demande renvoie la même tentative. "
        "fin_le permet de synchroniser une tentative terminée hors ligne."
    ),
    responses=erreurs(401, 403, 409, 413, 422, 502, 503),
)
async def demarrer_tentative(
    corps: TentativeCreation,
    utilisateur: Utilisateur = Depends(exige("eleve")),
    db: BaseDeDonnees = Depends(get_db),
):
    return await creer_tentative(db, utilisateur, corps)


@router.post(
    "/sync",
    response_model=ReponseSynchronisation,
    summary="Synchroniser des événements",
    description=(
        "Rôle : eleve. Reçoit de 1 à 50 événements et répond événement par événement (accepte ou refuse). "
        "Un événement déjà reçu est ignoré (doublon=true) : on peut rejouer l'envoi sans risque."
    ),
    responses=erreurs(401, 403, 413, 422, 502, 503),
)
async def synchroniser_evenements(
    corps: DemandeSynchronisation,
    utilisateur: Utilisateur = Depends(exige("eleve")),
    db: BaseDeDonnees = Depends(get_db),
):
    return ReponseSynchronisation(resultats=await synchroniser(db, utilisateur, corps.evenements))


@router.get(
    "",
    response_model=list[Tentative],
    summary="Lister les tentatives de l'élève",
    description="Rôle : eleve. Renvoie les tentatives visibles selon les règles RLS.",
    responses=erreurs(401, 403, 422, 502, 503),
)
async def lister_tentatives(
    page: int = 1,
    taille: int = 50,
    utilisateur: Utilisateur = Depends(exige("eleve")),
    db: BaseDeDonnees = Depends(get_db),
):
    if page < 1 or taille < 1 or taille > 100:
        raise ErreurApi(422, "donnees_invalides", "La page ou la taille demandée est invalide.")
    decalage = (page - 1) * taille
    return await db.select(
        utilisateur.jeton,
        "tentative",
        {
            "eleve_id": f"eq.{utilisateur.id}",
            "select": TENTATIVE,
            "order": "debut_le.desc,id.asc",
            "limit": str(taille),
            "offset": str(decalage),
        },
    )


@router.get(
    "/{tentative_id}",
    response_model=Tentative,
    summary="Détail d'une tentative",
    description="Rôles : eleve (les siennes), enseignant (celles de ses classes). Les règles RLS décident de la visibilité.",
    responses=erreurs(401, 403, 404, 422, 502, 503),
)
async def lire_tentative(
    tentative_id: UUID,
    utilisateur: Utilisateur = Depends(exige("eleve", "enseignant")),
    db: BaseDeDonnees = Depends(get_db),
):
    lignes = await db.select(
        utilisateur.jeton, "tentative", {"id": f"eq.{tentative_id}", "select": TENTATIVE, "limit": "1"}
    )
    if not lignes:
        raise ErreurApi(404, "introuvable", "Tentative introuvable.")
    return lignes[0]

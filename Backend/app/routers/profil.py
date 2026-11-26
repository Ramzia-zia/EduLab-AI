from fastapi import APIRouter, Depends

from app.auth import Utilisateur, utilisateur_courant
from app.db import BaseDeDonnees
from app.dependances import get_db
from app.erreurs import ErreurApi
from app.routers.reponses import erreurs
from app.schemas.profil import ProfilCourant

router = APIRouter(tags=["profil"])


@router.get(
    "/moi",
    response_model=ProfilCourant,
    summary="Lire le profil courant",
    description="Renvoie le profil associé au jeton Supabase courant.",
    responses=erreurs(401, 403, 502, 503),
)
async def lire_profil_courant(
    utilisateur: Utilisateur = Depends(utilisateur_courant),
    db: BaseDeDonnees = Depends(get_db),
):
    lignes = await db.select(
        utilisateur.jeton,
        "profil",
        {
            "id": f"eq.{utilisateur.id}",
            "select": "id,nom_complet,role,etablissement_id",
            "limit": "1",
        },
    )
    if not lignes:
        raise ErreurApi(403, "acces_refuse", "Aucun profil valide n'est associé à ce compte.")
    etablissement = None
    if utilisateur.etablissement_id is not None:
        etablissements = await db.select(
            utilisateur.jeton,
            "etablissement",
            {
                "id": f"eq.{utilisateur.etablissement_id}",
                "select": "nom,actif",
                "limit": "1",
            },
        )
        if etablissements:
            etablissement = etablissements[0]
    return {
        "id": utilisateur.id,
        "nom": lignes[0]["nom_complet"],
        "role": utilisateur.role,
        "etablissement_id": utilisateur.etablissement_id,
        "etablissement_nom": etablissement.get("nom") if etablissement else None,
        "etablissement_actif": etablissement.get("actif") if etablissement else None,
    }

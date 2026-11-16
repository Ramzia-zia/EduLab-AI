from fastapi import APIRouter, Depends

from app.auth import Utilisateur, exige
from app.config import lire_configuration
from app.schemas.profil import MoiReponse
from app.services.depot_profil import DepotProfilSupabase
from app.services.profil import DepotProfil, lire_moi

routeur = APIRouter(tags=["profil"])

exige_tous_les_roles = exige("eleve", "enseignant", "etablissement", "ministere")


def fournir_depot_profil(utilisateur: Utilisateur = Depends(exige_tous_les_roles)):
    config = lire_configuration()
    depot = DepotProfilSupabase(config.supabase_url, config.supabase_anon_key, utilisateur.jeton)
    try:
        yield depot
    finally:
        depot.fermer()


@routeur.get(
    "/moi",
    response_model=MoiReponse,
    description=(
        "Renvoie le profil de la personne connectee. Le role du jeton doit etre le meme "
        "que le role de la table profil, sinon 403."
    ),
)
def moi(
    utilisateur: Utilisateur = Depends(exige_tous_les_roles),
    depot: DepotProfil = Depends(fournir_depot_profil),
) -> MoiReponse:
    return lire_moi(utilisateur, depot)
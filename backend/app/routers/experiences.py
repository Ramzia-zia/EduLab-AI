from fastapi import APIRouter, Depends, Path, Query

from app.auth import Utilisateur, exige
from app.config import lire_configuration
from app.schemas.experiences import ExperiencePack, ListeExperiences, Matiere, Niveau
from app.services.depot_experiences import DepotExperiencesSupabase
from app.services.experiences import DepotExperiences, lire_pack, lister_experiences

routeur = APIRouter(tags=["experiences"])

exige_eleve = exige("eleve")


def fournir_depot_experiences(utilisateur: Utilisateur = Depends(exige_eleve)):
    config = lire_configuration()
    depot = DepotExperiencesSupabase(config.supabase_url, config.supabase_anon_key, utilisateur.jeton)
    try:
        yield depot
    finally:
        depot.fermer()


@routeur.get(
    "/experiences",
    response_model=ListeExperiences,
    description=(
        "Liste les experiences publiees, avec l'etat de l'eleve pour chacune : a_commencer, "
        "en_cours ou terminee. Filtres facultatifs : matiere, niveau. Pagination : page, taille "
        "(50 par defaut, 100 au plus)."
    ),
)
def lister(
    matiere: Matiere | None = None,
    niveau: Niveau | None = None,
    page: int = Query(1, ge=1),
    taille: int = Query(50, ge=1, le=100),
    utilisateur: Utilisateur = Depends(exige_eleve),
    depot: DepotExperiences = Depends(fournir_depot_experiences),
) -> ListeExperiences:
    return lister_experiences(depot, utilisateur.id, matiere, niveau, page, taille)


@routeur.get(
    "/experiences/{id}/pack",
    response_model=ExperiencePack,
    description=(
        "Renvoie le fichier de definition d'une experience publiee, a telecharger sur le "
        "telephone pour travailler sans internet."
    ),
)
def pack(
    id: str = Path(pattern=r"^[a-z0-9_]{1,100}$"),
    utilisateur: Utilisateur = Depends(exige_eleve),
    depot: DepotExperiences = Depends(fournir_depot_experiences),
) -> ExperiencePack:
    return lire_pack(depot, id)
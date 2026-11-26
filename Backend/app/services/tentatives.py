from datetime import datetime, timezone

from app.auth import Utilisateur
from app.colonnes import TENTATIVE
from app.db import BaseDeDonnees
from app.erreurs import ErreurApi
from app.schemas.tentatives import TentativeCreation


def en_utc(date: datetime) -> str:
    """Date ISO 8601 en UTC, comme le veut le contrat."""
    return date.astimezone(timezone.utc).isoformat()


async def creer_tentative(db: BaseDeDonnees, utilisateur: Utilisateur, corps: TentativeCreation) -> dict:
    """Crée la tentative. Idempotent : rejouer le même identifiant renvoie la tentative existante."""
    ligne = {
        "id": str(corps.id),
        "eleve_id": utilisateur.id,
        "experience_id": str(corps.experience_id),
        "classe_id": str(corps.classe_id) if corps.classe_id else None,
        "debut_le": en_utc(corps.debut_le),
        "fin_le": en_utc(corps.fin_le) if corps.fin_le else None,
        "resultat": corps.resultat,
    }
    inseres = await db.insert(utilisateur.jeton, "tentative", [ligne], ignorer_doublons=True)
    if inseres:
        return inseres[0]
    existantes = await db.select(utilisateur.jeton, "tentative", {"id": f"eq.{corps.id}", "select": TENTATIVE})
    if existantes:
        return existantes[0]
    raise ErreurApi(409, "conflit", "Cet identifiant est déjà utilisé par une autre ressource.")

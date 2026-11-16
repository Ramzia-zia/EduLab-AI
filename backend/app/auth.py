import httpx
from fastapi import Depends, Request
from pydantic import BaseModel

from app.config import lire_configuration
from app.erreurs import ErreurApi

ROLES_CONNUS = {"eleve", "enseignant", "etablissement", "ministere"}


class Utilisateur(BaseModel):
    id: str
    role: str
    jeton: str


def verifier_jeton_supabase(jeton: str) -> dict:
    """Demande a Supabase si le jeton est valable et renvoie l'utilisateur."""
    config = lire_configuration()
    try:
        reponse = httpx.get(
            f"{config.supabase_url}/auth/v1/user",
            headers={
                "apikey": config.supabase_anon_key,
                "Authorization": f"Bearer {jeton}",
            },
            timeout=5.0,
        )
    except httpx.HTTPError:
        raise ErreurApi(500, "erreur_serveur", "Le service de connexion ne repond pas.")
    if reponse.status_code != 200:
        raise ErreurApi(401, "non_authentifie", "Jeton absent ou invalide.")
    return reponse.json()


def fournir_verificateur():
    return verifier_jeton_supabase


def utilisateur_courant(
    request: Request, verifier=Depends(fournir_verificateur)
) -> Utilisateur:
    entete = request.headers.get("authorization", "")
    if not entete.lower().startswith("bearer "):
        raise ErreurApi(401, "non_authentifie", "Jeton absent ou invalide.")
    jeton = entete[7:].strip()
    if not jeton:
        raise ErreurApi(401, "non_authentifie", "Jeton absent ou invalide.")
    donnees = verifier(jeton)
    role = (donnees.get("app_metadata") or {}).get("role")
    if role not in ROLES_CONNUS:
        raise ErreurApi(403, "interdit", "Role non autorise.")
    return Utilisateur(id=donnees["id"], role=role, jeton=jeton)


def exige(*roles: str):
    """Garde de route : exige('eleve') laisse passer seulement les eleves."""

    def garde(utilisateur: Utilisateur = Depends(utilisateur_courant)) -> Utilisateur:
        if utilisateur.role not in roles:
            raise ErreurApi(
                403,
                "interdit",
                "Role non autorise.",
                {"roles_autorises": list(roles)},
            )
        return utilisateur

    return garde
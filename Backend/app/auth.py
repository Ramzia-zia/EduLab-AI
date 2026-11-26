"""Authentification (jeton Supabase vérifié à chaque requête) et garde de rôle."""
from dataclasses import dataclass
from typing import Literal, get_args

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.db import BaseDeDonnees
from app.dependances import get_db
from app.erreurs import ErreurApi

Role = Literal["eleve", "enseignant", "etablissement", "ministere"]
ROLES: tuple[str, ...] = get_args(Role)

_schema_bearer = HTTPBearer(auto_error=False, description="Jeton d'accès Supabase")


@dataclass(frozen=True)
class Utilisateur:
    id: str
    role: str
    etablissement_id: str | None
    jeton: str


async def utilisateur_courant(
    identifiants: HTTPAuthorizationCredentials | None = Depends(_schema_bearer),
    db: BaseDeDonnees = Depends(get_db),
) -> Utilisateur:
    if identifiants is None or not identifiants.credentials:
        raise ErreurApi(401, "non_authentifie", "Jeton manquant : envoie l'en-tête Authorization: Bearer <jeton>.")
    jeton = identifiants.credentials
    compte = await db.utilisateur(jeton)
    if not compte or not compte.get("id"):
        raise ErreurApi(401, "non_authentifie", "Jeton invalide ou expiré.")
    profils = await db.select(
        jeton, "profil", {"id": f"eq.{compte['id']}", "select": "id,role,etablissement_id", "limit": "1"}
    )
    if not profils or profils[0]["role"] not in ROLES:
        raise ErreurApi(403, "acces_refuse", "Aucun profil valide n'est associé à ce compte.")
    return Utilisateur(
        id=str(profils[0]["id"]),
        role=profils[0]["role"],
        etablissement_id=profils[0].get("etablissement_id"),
        jeton=jeton,
    )


def exige(*roles: str):
    """Garde de rôle : `Depends(exige("eleve"))` laisse passer seulement ces rôles."""
    inconnus = set(roles) - set(ROLES)
    if not roles or inconnus:
        raise ValueError(f"Rôles invalides : {sorted(inconnus) or 'aucun rôle donné'}")

    async def garde(utilisateur: Utilisateur = Depends(utilisateur_courant)) -> Utilisateur:
        if utilisateur.role not in roles:
            raise ErreurApi(
                403,
                "acces_refuse",
                "Ton rôle ne permet pas d'utiliser cette route.",
                {"roles_autorises": list(roles), "ton_role": utilisateur.role},
            )
        return utilisateur

    return garde

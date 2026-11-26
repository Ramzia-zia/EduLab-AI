"""Réponses d'erreur documentées dans openapi.json."""
from typing import Any

from app.schemas.commun import ReponseErreur

_DESCRIPTIONS = {
    401: "non_authentifie : jeton absent, invalide ou expiré",
    403: "acces_refuse : rôle non autorisé ou règle RLS",
    404: "introuvable : ressource absente ou masquée par les règles RLS",
    409: "conflit : identifiant déjà utilisé",
    413: "corps_trop_gros : plus de 256 ko",
    422: "donnees_invalides : corps ou paramètres invalides",
    429: "limite_atteinte : trop de requêtes",
    502: "base_indisponible : erreur de la base",
    503: "assistant_indisponible ou base_indisponible",
}


def erreurs(*statuts: int) -> dict[int | str, dict[str, Any]]:
    return {s: {"model": ReponseErreur, "description": _DESCRIPTIONS[s]} for s in statuts}

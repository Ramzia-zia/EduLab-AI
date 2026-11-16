import re
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

# Codes d'erreur du bilan (chapitre 5 du contrat).
CODES_ERREUR = frozenset(
    {
        "depassement_equivalence",
        "erreur_volume_acide",
        "lecture_burette",
        "debit_trop_rapide",
        "angle_trop_grand",
        "pince_non_serree",
        "gants_oublies",
        "lunettes_oubliees",
    }
)

MAX_CHAMPS_ETAT = 20
MODELE_NOM_CHAMP = re.compile(r"^[a-z][a-z0-9_]{0,49}$")


class MessageHistorique(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    role: Literal["eleve", "assistant"]
    contenu: str = Field(min_length=1, max_length=1000)


class AssistantDemande(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    experience_id: str = Field(min_length=1, max_length=100)
    tentative_id: UUID
    niveau_indice: int = Field(ge=1, le=3)
    message: str = Field(min_length=1, max_length=1000)
    historique: list[MessageHistorique] = Field(default_factory=list, max_length=6)
    etat_experience: dict[str, Any] = Field(default_factory=dict)
    derniere_erreur: str | None = None

    @field_validator("etat_experience")
    @classmethod
    def verifier_etat(cls, etat: dict[str, Any]) -> dict[str, Any]:
        if len(etat) > MAX_CHAMPS_ETAT:
            raise ValueError("etat_experience contient trop de champs.")
        for nom, valeur in etat.items():
            if not MODELE_NOM_CHAMP.match(nom):
                raise ValueError(f"Nom de champ invalide : {nom}")
            if "corrige" in nom:
                raise ValueError("Le corrige ne doit jamais etre envoye.")
            if valeur is not None and not isinstance(valeur, (bool, int, float, str)):
                raise ValueError(f"Valeur invalide pour {nom}.")
            if isinstance(valeur, str) and len(valeur) > 100:
                raise ValueError(f"Valeur trop longue pour {nom}.")
        return etat

    @field_validator("derniere_erreur")
    @classmethod
    def verifier_erreur(cls, code: str | None) -> str | None:
        if code is not None and code not in CODES_ERREUR:
            raise ValueError("Code d'erreur inconnu.")
        return code


class AssistantReponse(BaseModel):
    reponse: str
    niveau_indice: int
    source: Literal["ia", "regles"]
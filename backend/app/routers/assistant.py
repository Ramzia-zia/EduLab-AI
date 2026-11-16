from fastapi import APIRouter, Depends

from app.auth import Utilisateur, exige
from app.config import lire_configuration
from app.erreurs import ErreurApi
from app.schemas.assistant import AssistantDemande, AssistantReponse
from app.services.assistant import ClientIA, repondre
from app.services.client_ia import ClientAnthropic
from app.services.limiteur import LimiteurDebit

routeur = APIRouter(tags=["assistant"])

exige_eleve = exige("eleve")

_limiteur = LimiteurDebit(maximum=10, fenetre_s=60.0)


def fournir_limiteur() -> LimiteurDebit:
    return _limiteur


def fournir_client_ia() -> ClientIA | None:
    config = lire_configuration()
    if config.ia_cle_api and config.ia_modele:
        return ClientAnthropic(config.ia_cle_api, config.ia_modele)
    return None


@routeur.post(
    "/assistant",
    response_model=AssistantReponse,
    description=(
        "Pose une question a l'assistant. Limite : 10 questions par minute et par eleve. "
        "Reponse de 120 mots au plus. Le corrige de l'exercice n'est jamais envoye a l'IA. "
        "Si l'IA ne repond pas, la reponse vient des regles de secours (source = regles)."
    ),
)
def poser_question(
    demande: AssistantDemande,
    utilisateur: Utilisateur = Depends(exige_eleve),
    limiteur: LimiteurDebit = Depends(fournir_limiteur),
    client: ClientIA | None = Depends(fournir_client_ia),
) -> AssistantReponse:
    if not limiteur.autoriser(utilisateur.id):
        raise ErreurApi(
            429,
            "limite_depassee",
            "Tu as posé trop de questions. Attends une minute.",
            {"limite_par_minute": limiteur.maximum},
        )
    return repondre(demande, client)
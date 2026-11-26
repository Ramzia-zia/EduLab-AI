from fastapi import APIRouter, Depends

from app.auth import Utilisateur, exige
from app.colonnes import EXPERIENCE_DETAIL
from app.db import BaseDeDonnees
from app.dependances import get_db, get_fournisseur_ia, get_limiteur
from app.erreurs import ErreurApi
from app.routers.reponses import erreurs
from app.schemas.assistant import QuestionAssistant, ReponseAssistant
from app.services.assistant_ia import FournisseurIA, repondre_a_question
from app.services.limiteur import LimiteurDebit

router = APIRouter(prefix="/assistant", tags=["assistant"])


@router.post(
    "/question",
    response_model=ReponseAssistant,
    summary="Poser une question à l'assistant",
    description=(
        "Rôle : eleve. 10 questions par minute et par utilisateur ; message de 1000 caractères maximum ; "
        "6 messages d'historique au plus ; réponse de 120 mots au plus. Le corrigé n'est jamais envoyé à l'IA."
    ),
    responses=erreurs(401, 403, 404, 413, 422, 429, 502, 503),
)
async def poser_question(
    corps: QuestionAssistant,
    utilisateur: Utilisateur = Depends(exige("eleve")),
    db: BaseDeDonnees = Depends(get_db),
    ia: FournisseurIA = Depends(get_fournisseur_ia),
    limiteur: LimiteurDebit = Depends(get_limiteur),
):
    attente = limiteur.verifier(utilisateur.id)
    if attente is not None:
        raise ErreurApi(
            429,
            "limite_atteinte",
            "Tu as posé trop de questions. Attends un peu avant de réessayer.",
            {"reessayer_dans_s": attente},
            {"Retry-After": str(attente)},
        )
    lignes = await db.select(
        utilisateur.jeton, "experience", {"id": f"eq.{corps.experience_id}", "select": EXPERIENCE_DETAIL, "limit": "1"}
    )
    if not lignes:
        raise ErreurApi(404, "introuvable", "Expérience introuvable.")
    return await repondre_a_question(ia, lignes[0], corps)

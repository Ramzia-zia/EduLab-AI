"""Logique de l'assistant : testable sans serveur.

Le corrige de l'exercice n'est jamais lu ici : la requete n'a pas de champ pour lui,
et le prompt n'est construit qu'avec les champs de la requete.
"""
from pathlib import Path
from typing import Protocol

from app.schemas.assistant import AssistantDemande, AssistantReponse
from app.services.client_ia import ErreurIA
from app.services.reponses_secours import reponse_de_secours

MAX_MOTS_REPONSE = 120
FICHIER_PROMPT = Path(__file__).with_name("prompt_assistant.txt")


class ClientIA(Protocol):
    def completer(self, systeme: str, message: str) -> str: ...


def charger_prompt() -> str:
    return FICHIER_PROMPT.read_text(encoding="utf-8")


def construire_systeme(niveau_indice: int) -> str:
    return f"{charger_prompt()}\nNiveau d'indice demandé pour cette réponse : {niveau_indice}."


def construire_message(demande: AssistantDemande) -> str:
    lignes = [f"Expérience : {demande.experience_id}"]
    if demande.etat_experience:
        etat = ", ".join(f"{k} = {v}" for k, v in demande.etat_experience.items())
        lignes.append(f"État de l'expérience : {etat}")
    lignes.append(f"Dernière erreur : {demande.derniere_erreur or 'aucune'}")
    if demande.historique:
        lignes.append("Historique de la conversation :")
        for m in demande.historique:
            lignes.append(f"- {m.role} : {m.contenu}")
    lignes.append(f"Question de l'élève : {demande.message}")
    return "\n".join(lignes)


def tronquer_mots(texte: str, maximum: int = MAX_MOTS_REPONSE) -> str:
    mots = texte.split()
    if len(mots) <= maximum:
        return " ".join(mots)
    return " ".join(mots[:maximum]) + "…"


def repondre(demande: AssistantDemande, client: ClientIA | None) -> AssistantReponse:
    if client is not None:
        try:
            texte = client.completer(construire_systeme(demande.niveau_indice), construire_message(demande))
        except ErreurIA:
            texte = ""
        texte = tronquer_mots(texte)
        if texte:
            return AssistantReponse(reponse=texte, niveau_indice=demande.niveau_indice, source="ia")
    secours = reponse_de_secours(demande.niveau_indice, demande.derniere_erreur)
    return AssistantReponse(reponse=secours, niveau_indice=demande.niveau_indice, source="regles")
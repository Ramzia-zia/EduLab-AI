"""Logique de synchronisation hors-ligne (chapitre 4 du contrat).

Aucune dependance au serveur ni a Supabase : le depot est injecte,
donc cette logique se teste sans reseau.
"""
from typing import Protocol
from uuid import UUID

from app.schemas.synchronisation import (
    ACTIONS_CONNUES,
    EvenementSync,
    ResultatSync,
    SyncLot,
    SyncReponse,
    TentativeSync,
)


class DoublonDepot(Exception):
    """Le depot refuse la creation : l'identifiant ou le rang existe deja."""


class DepotSync(Protocol):
    def lire_tentative(self, tentative_id: UUID) -> dict | None:
        """Renvoie {"profil_id": ..., "statut": ...} ou None."""

    def creer_tentative(self, profil_id: str, tentative: TentativeSync) -> None: ...

    def mettre_a_jour_tentative(self, tentative: TentativeSync) -> None: ...

    def evenement_existe(self, evenement_id: UUID) -> bool: ...

    def rang_pris(self, tentative_id: UUID, rang: int) -> bool: ...

    def creer_evenement(self, evenement: EvenementSync) -> None: ...


def _resultat(id_: UUID, type_: str, statut: str, code: str | None = None) -> ResultatSync:
    return ResultatSync(id=id_, type=type_, statut=statut, code=code)


def traiter_tentative(t: TentativeSync, utilisateur_id: str, depot: DepotSync) -> ResultatSync:
    if t.statut == "terminee" and (t.fin is None or t.score is None):
        return _resultat(t.id, "tentative", "refuse", "donnees_invalides")
    if t.statut == "en_cours" and t.score is not None:
        return _resultat(t.id, "tentative", "refuse", "donnees_invalides")

    existante = depot.lire_tentative(t.id)
    if existante is None:
        try:
            depot.creer_tentative(utilisateur_id, t)
        except DoublonDepot:
            # L'identifiant existe mais n'est pas visible : il appartient a quelqu'un d'autre.
            return _resultat(t.id, "tentative", "refuse", "interdit")
        return _resultat(t.id, "tentative", "accepte")

    if str(existante["profil_id"]) != utilisateur_id:
        return _resultat(t.id, "tentative", "refuse", "interdit")
    if existante["statut"] == "terminee":
        return _resultat(t.id, "tentative", "deja_recu")
    depot.mettre_a_jour_tentative(t)
    return _resultat(t.id, "tentative", "accepte")


def traiter_evenement(e: EvenementSync, utilisateur_id: str, depot: DepotSync) -> ResultatSync:
    if e.action not in ACTIONS_CONNUES:
        return _resultat(e.id, "evenement", "refuse", "donnees_invalides")
    if depot.evenement_existe(e.id):
        return _resultat(e.id, "evenement", "deja_recu")

    tentative = depot.lire_tentative(e.tentative_id)
    if tentative is None:
        return _resultat(e.id, "evenement", "refuse", "introuvable")
    if str(tentative["profil_id"]) != utilisateur_id:
        return _resultat(e.id, "evenement", "refuse", "interdit")
    if depot.rang_pris(e.tentative_id, e.rang):
        return _resultat(e.id, "evenement", "refuse", "conflit")
    try:
        depot.creer_evenement(e)
    except DoublonDepot:
        return _resultat(e.id, "evenement", "refuse", "conflit")
    return _resultat(e.id, "evenement", "accepte")


def synchroniser_lot(lot: SyncLot, utilisateur_id: str, depot: DepotSync) -> SyncReponse:
    """Traite d'abord les tentatives, puis les evenements dans l'ordre des rang."""
    resultats = [traiter_tentative(t, utilisateur_id, depot) for t in lot.tentatives]
    evenements = sorted(lot.evenements, key=lambda e: (str(e.tentative_id), e.rang))
    resultats += [traiter_evenement(e, utilisateur_id, depot) for e in evenements]
    return SyncReponse(resultats=resultats)
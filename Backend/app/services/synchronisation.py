"""Synchronisation des événements envoyés par le mobile (idempotente)."""
from app.auth import Utilisateur
from app.db import BaseDeDonnees
from app.schemas.tentatives import EvenementEntrant, ResultatEvenement
from app.services.tentatives import en_utc


async def synchroniser(
    db: BaseDeDonnees, utilisateur: Utilisateur, evenements: list[EvenementEntrant]
) -> list[ResultatEvenement]:
    # 1. Doublons à l'intérieur du même envoi : seule la première occurrence compte.
    vus: set[str] = set()
    a_traiter: list[EvenementEntrant] = []
    for evenement in evenements:
        if str(evenement.id) not in vus:
            vus.add(str(evenement.id))
            a_traiter.append(evenement)

    # 2. Quelles tentatives l'élève a-t-il le droit de voir ? (RLS : seulement les siennes)
    ids_tentatives = sorted({str(e.tentative_id) for e in a_traiter})
    visibles = await db.select(
        utilisateur.jeton, "tentative", {"id": f"in.({','.join(ids_tentatives)})", "select": "id"}
    )
    ids_visibles = {str(ligne["id"]) for ligne in visibles}
    valides = [e for e in a_traiter if str(e.tentative_id) in ids_visibles]

    # 3. Insertion en ignorant les identifiants déjà reçus ; la base renvoie les lignes réellement créées.
    nouveaux: set[str] = set()
    if valides:
        lignes = [
            {
                "id": str(e.id),
                "tentative_id": str(e.tentative_id),
                "type": e.type,
                "charge": e.charge,
                "survenu_le": en_utc(e.survenu_le),
            }
            for e in valides
        ]
        inseres = await db.insert(utilisateur.jeton, "evenement_tentative", lignes, ignorer_doublons=True)
        nouveaux = {str(ligne["id"]) for ligne in inseres}

    # 4. Un résultat par événement, dans l'ordre de la demande.
    resultats: list[ResultatEvenement] = []
    premiers: set[str] = set()
    for e in evenements:
        cle = str(e.id)
        if cle in premiers:
            resultats.append(ResultatEvenement(evenement_id=e.id, statut="accepte", doublon=True))
        elif str(e.tentative_id) not in ids_visibles:
            resultats.append(ResultatEvenement(evenement_id=e.id, statut="refuse", code="tentative_introuvable"))
        else:
            resultats.append(ResultatEvenement(evenement_id=e.id, statut="accepte", doublon=cle not in nouveaux))
        premiers.add(cle)
    return resultats

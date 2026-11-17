"""Lecture des tentatives et des bilans AVEC LE JETON DE L'UTILISATEUR (les regles RLS s'appliquent)."""
from app.services.depot_experiences import lire_total
from app.services.depot_supabase import DepotSupabase

COLONNES = "id,experience_id,version_experience,debut,fin,statut,score,resultat"


class DepotTentativesSupabase(DepotSupabase):
    def lister_tentatives(self, profil_id, page, taille):
        decalage = (page - 1) * taille
        params = {
            "select": COLONNES,
            "profil_id": f"eq.{profil_id}",
            "order": "debut.desc",
            "limit": str(taille),
            "offset": str(decalage),
        }
        reponse = self._envoyer("GET", "tentative", params=params, headers={"Prefer": "count=exact"})
        lignes = reponse.json()
        total = lire_total(reponse.headers.get("content-range"), decalage + len(lignes))
        return lignes, total

    def lire_bilan(self, profil_id, tentative_id):
        # On verifie d'abord que la tentative est bien a cet eleve, en plus des regles RLS.
        if not self._lire("tentative", {"id": f"eq.{tentative_id}", "profil_id": f"eq.{profil_id}"}, "id"):
            return None
        lignes = self._lire("bilan", {"tentative_id": f"eq.{tentative_id}"}, "tentative_id,erreurs,quiz,exercice")
        return lignes[0] if lignes else None
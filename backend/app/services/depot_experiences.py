"""Lecture des experiences AVEC LE JETON DE L'UTILISATEUR (les regles RLS s'appliquent)."""
from app.services.depot_supabase import DepotSupabase

COLONNES_RESUME = "id,matiere,niveau,titre,duree_min,difficulte,version"


def lire_total(content_range: str | None, repli: int) -> int:
    """Content-Range ressemble a '0-9/42'. Si le total est inconnu ('*'), on utilise le repli."""
    if content_range and "/" in content_range:
        total = content_range.split("/")[-1]
        if total.isdigit():
            return int(total)
    return repli


class DepotExperiencesSupabase(DepotSupabase):
    def lister_publiees(self, matiere, niveau, page, taille):
        decalage = (page - 1) * taille
        params = {
            "select": COLONNES_RESUME,
            "publie": "eq.true",
            "order": "id.asc",
            "limit": str(taille),
            "offset": str(decalage),
        }
        if matiere:
            params["matiere"] = f"eq.{matiere}"
        if niveau:
            params["niveau"] = f"eq.{niveau}"
        reponse = self._envoyer("GET", "experience", params=params, headers={"Prefer": "count=exact"})
        lignes = reponse.json()
        total = lire_total(reponse.headers.get("content-range"), decalage + len(lignes))
        return lignes, total

    def statuts_tentatives(self, profil_id, experience_ids):
        if not experience_ids:
            return []
        filtres = {
            "profil_id": f"eq.{profil_id}",
            "experience_id": f"in.({','.join(experience_ids)})",
        }
        return self._lire("tentative", filtres, "experience_id,statut")

    def lire_experience(self, experience_id):
        lignes = self._lire("experience", {"id": f"eq.{experience_id}", "publie": "eq.true"}, "id,version,definition")
        return lignes[0] if lignes else None
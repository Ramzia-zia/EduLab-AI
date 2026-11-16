"""Lecture de la table profil AVEC LE JETON DE L'UTILISATEUR (les regles RLS s'appliquent)."""
from app.services.depot_supabase import DepotSupabase


class DepotProfilSupabase(DepotSupabase):
    def lire_profil(self, profil_id: str) -> dict | None:
        lignes = self._lire("profil", {"id": f"eq.{profil_id}"}, "id,nom,role,etablissement_id")
        return lignes[0] if lignes else None
from app.services.depot_supabase import DepotSupabase

class DepotClassesSupabase(DepotSupabase):
    def lister_classes(self, profil_id: str):
        # Hypothese : on cherche les classes liees a l'enseignant ou l'etablissement
        return self._lire("classe", {}, "id,nom")

    def lister_resultats(self, classe_id: str):
        # Exemple simplifie : on simule les resultats pour l'instant
        return {
            "classe": {"id": classe_id, "nom": "Classe Test"},
            "eleves": [
                {"profil_id": "11111111-1111-1111-1111-111111111111", "nom": "Eleve 1", "experiences_faites": 2, "score_moyen": 75, "derniere_activite": "2026-11-08T07:30:00Z"}
            ],
            "erreurs_frequentes": [{"code": "debit_trop_rapide", "nb": 5}]
        }
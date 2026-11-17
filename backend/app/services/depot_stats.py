from app.services.depot_supabase import DepotSupabase

class DepotStatsSupabase(DepotSupabase):
    def lire_stats(self):
        # Le ministere lit une vue agregee
        return self._lire("vue_stats_etablissement", {}, "etablissement_id,nom,commune,nb_eleves_actifs,taux_reussite,progression_moyenne")
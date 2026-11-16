import httpx

from app.services.depot_profil import DepotProfilSupabase


def depot_avec(reponse_fn):
    envoyees = []

    def gestionnaire(requete):
        envoyees.append(requete)
        return reponse_fn(requete)

    return DepotProfilSupabase("https://exemple.supabase.co", "cle_anon", "jeton_eleve", transport=httpx.MockTransport(gestionnaire)), envoyees


def test_lecture_du_profil_avec_le_jeton_de_l_utilisateur():
    ligne = {"id": "p1", "nom": "Ama", "role": "eleve", "etablissement_id": None}
    depot, envoyees = depot_avec(lambda r: httpx.Response(200, json=[ligne]))
    assert depot.lire_profil("p1") == ligne
    requete = envoyees[0]
    assert requete.url.path == "/rest/v1/profil"
    assert requete.url.params["id"] == "eq.p1"
    assert requete.url.params["select"] == "id,nom,role,etablissement_id"
    assert requete.headers["authorization"] == "Bearer jeton_eleve"


def test_profil_absent_renvoie_none():
    depot, _ = depot_avec(lambda r: httpx.Response(200, json=[]))
    assert depot.lire_profil("inconnu") is None
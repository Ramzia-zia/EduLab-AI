import httpx

from app.services.depot_experiences import DepotExperiencesSupabase, lire_total


def depot_avec(reponse_fn):
    envoyees = []

    def gestionnaire(requete):
        envoyees.append(requete)
        return reponse_fn(requete)

    transport = httpx.MockTransport(gestionnaire)
    return DepotExperiencesSupabase("https://exemple.supabase.co", "cle_anon", "jeton_eleve", transport=transport), envoyees


def test_lire_total():
    assert lire_total("0-9/42", 0) == 42
    assert lire_total("*/0", 7) == 0  # liste vide : le total est bien 0
    assert lire_total("0-9/*", 10) == 10
    assert lire_total(None, 3) == 3


def test_liste_demande_les_publiees_avec_filtres_pagination_et_total():
    lignes = [{"id": "mesure_ph"}]
    depot, envoyees = depot_avec(lambda r: httpx.Response(200, json=lignes, headers={"Content-Range": "10-10/11"}))
    resultat, total = depot.lister_publiees("chimie", "seconde", page=2, taille=10)
    assert resultat == lignes and total == 11
    requete = envoyees[0]
    assert requete.url.path == "/rest/v1/experience"
    p = requete.url.params
    assert p["publie"] == "eq.true"
    assert p["matiere"] == "eq.chimie" and p["niveau"] == "eq.seconde"
    assert p["limit"] == "10" and p["offset"] == "10"
    assert p["order"] == "id.asc"
    assert requete.headers["prefer"] == "count=exact"
    assert requete.headers["authorization"] == "Bearer jeton_eleve"


def test_liste_sans_filtres_n_envoie_pas_matiere_ni_niveau():
    depot, envoyees = depot_avec(lambda r: httpx.Response(200, json=[], headers={"Content-Range": "*/0"}))
    depot.lister_publiees(None, None, 1, 50)
    assert "matiere" not in envoyees[0].url.params and "niveau" not in envoyees[0].url.params


def test_statuts_cible_l_eleve_et_les_experiences_de_la_page():
    depot, envoyees = depot_avec(lambda r: httpx.Response(200, json=[{"experience_id": "a", "statut": "terminee"}]))
    assert depot.statuts_tentatives("p1", ["a", "b"]) == [{"experience_id": "a", "statut": "terminee"}]
    p = envoyees[0].url.params
    assert envoyees[0].url.path == "/rest/v1/tentative"
    assert p["profil_id"] == "eq.p1" and p["experience_id"] == "in.(a,b)"


def test_statuts_sans_experience_ne_fait_aucune_requete():
    depot, envoyees = depot_avec(lambda r: httpx.Response(200, json=[]))
    assert depot.statuts_tentatives("p1", []) == []
    assert envoyees == []


def test_pack_ne_lit_que_les_experiences_publiees():
    ligne = {"id": "x", "version": 1, "definition": {}}
    depot, envoyees = depot_avec(lambda r: httpx.Response(200, json=[ligne]))
    assert depot.lire_experience("x") == ligne
    p = envoyees[0].url.params
    assert p["id"] == "eq.x" and p["publie"] == "eq.true" and p["select"] == "id,version,definition"
    depot2, _ = depot_avec(lambda r: httpx.Response(200, json=[]))
    assert depot2.lire_experience("y") is None
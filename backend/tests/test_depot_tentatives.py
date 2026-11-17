import httpx

from app.services.depot_tentatives import DepotTentativesSupabase


def depot_avec(reponse_fn):
    envoyees = []

    def gestionnaire(requete):
        envoyees.append(requete)
        return reponse_fn(requete)

    transport = httpx.MockTransport(gestionnaire)
    return DepotTentativesSupabase("https://exemple.supabase.co", "cle_anon", "jeton_eleve", transport=transport), envoyees


def test_liste_filtre_sur_l_eleve_trie_et_pagine():
    lignes = [{"id": "t1"}]
    depot, envoyees = depot_avec(lambda r: httpx.Response(200, json=lignes, headers={"Content-Range": "20-20/21"}))
    resultat, total = depot.lister_tentatives("p1", page=3, taille=10)
    assert resultat == lignes and total == 21
    requete = envoyees[0]
    p = requete.url.params
    assert requete.url.path == "/rest/v1/tentative"
    assert p["profil_id"] == "eq.p1" and p["order"] == "debut.desc"
    assert p["limit"] == "10" and p["offset"] == "20"
    assert requete.headers["prefer"] == "count=exact"
    assert requete.headers["authorization"] == "Bearer jeton_eleve"


def test_bilan_verifie_d_abord_que_la_tentative_est_a_l_eleve():
    bilan = {"tentative_id": "t1", "erreurs": [], "quiz": None, "exercice": None}

    def reponse(requete):
        if requete.url.path.endswith("/tentative"):
            return httpx.Response(200, json=[{"id": "t1"}])
        return httpx.Response(200, json=[bilan])

    depot, envoyees = depot_avec(reponse)
    assert depot.lire_bilan("p1", "t1") == bilan
    assert envoyees[0].url.path == "/rest/v1/tentative"
    assert envoyees[0].url.params["id"] == "eq.t1" and envoyees[0].url.params["profil_id"] == "eq.p1"
    assert envoyees[1].url.path == "/rest/v1/bilan"
    assert envoyees[1].url.params["tentative_id"] == "eq.t1"


def test_bilan_d_une_tentative_d_un_autre_eleve_ne_lit_pas_le_bilan():
    depot, envoyees = depot_avec(lambda r: httpx.Response(200, json=[]))
    assert depot.lire_bilan("p1", "t_autre") is None
    assert len(envoyees) == 1  # la table bilan n'est meme pas interrogee


def test_tentative_sans_bilan_renvoie_none():
    def reponse(requete):
        return httpx.Response(200, json=[{"id": "t1"}] if requete.url.path.endswith("/tentative") else [])

    depot, _ = depot_avec(reponse)
    assert depot.lire_bilan("p1", "t1") is None
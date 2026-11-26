from tests.conftest import ETAB, entetes, verifier_erreur


def test_stats_etablissement_normal(client, base):
    base.ajouter(
        "vue_stats_etablissement",
        {"etablissement_id": ETAB, "matiere": "chimie", "nombre_eleves_actifs": 12, "nombre_tentatives": 30, "score_moyen": 71.5},
    )
    r = client.get("/stats/etablissement", headers=entetes("etablissement"))
    assert r.status_code == 200
    assert r.json()[0]["nombre_tentatives"] == 30


def test_stats_etablissement_sans_droit_403(client):
    for role in ("eleve", "enseignant", "ministere"):
        verifier_erreur(client.get("/stats/etablissement", headers=entetes(role)), 403, "acces_refuse")


def test_stats_ministere_lit_uniquement_la_vue(client, base):
    base.ajouter(
        "vue_stats_ministere",
        {"etablissement_id": ETAB, "nom_etablissement": "Lycée A", "matiere": "physique",
         "nombre_eleves_actifs": 40, "nombre_tentatives": 90, "score_moyen": None},
    )
    r = client.get("/stats/ministere", headers=entetes("ministere"))
    assert r.status_code == 200
    assert r.json()[0]["nom_etablissement"] == "Lycée A"
    tables = base.tables_lues() - {"profil"}  # "profil" : lecture de son propre rôle par le garde
    assert tables == {"vue_stats_ministere"}


def test_stats_ministere_sans_droit_403(client):
    for role in ("eleve", "enseignant", "etablissement"):
        verifier_erreur(client.get("/stats/ministere", headers=entetes(role)), 403, "acces_refuse")


def test_le_ministere_n_accede_pas_aux_donnees_des_eleves(client):
    for route in ("/classes", "/tentatives/" + "40000000-0000-4000-8000-000000000001"):
        verifier_erreur(client.get(route, headers=entetes("ministere")), 403, "acces_refuse")

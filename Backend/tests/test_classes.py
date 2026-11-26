from tests.conftest import CLASSE_ID, ETAB, EXPERIENCE_ID, UTILISATEURS, entetes, nouvel_uuid, verifier_erreur

AUTRE_EXPERIENCE = "20000000-0000-4000-8000-000000000002"


def classe_et_donnees(base):
    base.ajouter(
        "classe",
        {"id": CLASSE_ID, "etablissement_id": ETAB, "enseignant_id": UTILISATEURS["enseignant"], "nom": "2nde C", "niveau": "seconde"},
    )
    base.ajouter("inscription", {"classe_id": CLASSE_ID, "eleve_id": nouvel_uuid()}, {"classe_id": CLASSE_ID, "eleve_id": nouvel_uuid()})
    base.ajouter(
        "tentative",
        {"id": nouvel_uuid(), "classe_id": CLASSE_ID, "experience_id": EXPERIENCE_ID, "fin_le": "2026-11-08T10:00:00Z", "score": 80},
        {"id": nouvel_uuid(), "classe_id": CLASSE_ID, "experience_id": EXPERIENCE_ID, "fin_le": "2026-11-08T10:00:00Z", "score": 60},
        {"id": nouvel_uuid(), "classe_id": CLASSE_ID, "experience_id": AUTRE_EXPERIENCE, "fin_le": None, "score": None},
    )


def test_lister_classes(client, base):
    classe_et_donnees(base)
    for role in ("enseignant", "etablissement"):
        r = client.get("/classes", headers=entetes(role))
        assert r.status_code == 200
        assert r.json()[0]["nom"] == "2nde C"


def test_lister_classes_sans_droit_403(client):
    for role in ("eleve", "ministere"):
        verifier_erreur(client.get("/classes", headers=entetes(role)), 403, "acces_refuse")


def test_bilan_normal(client, base):
    classe_et_donnees(base)
    r = client.get(f"/classes/{CLASSE_ID}/bilan", headers=entetes("enseignant"))
    assert r.status_code == 200, r.text
    bilan = r.json()
    assert bilan["nombre_eleves"] == 2
    assert bilan["nombre_tentatives"] == 3
    assert bilan["nombre_tentatives_terminees"] == 2
    assert bilan["score_moyen"] == 70.0
    par_exp = {p["experience_id"]: p for p in bilan["par_experience"]}
    assert par_exp[EXPERIENCE_ID]["score_moyen"] == 70.0
    assert par_exp[EXPERIENCE_ID]["titre"] == "Dosage acide-base"
    assert par_exp[EXPERIENCE_ID]["matiere"] == "chimie"
    assert par_exp[AUTRE_EXPERIENCE] == {
        "experience_id": AUTRE_EXPERIENCE,
        "nombre_tentatives": 1,
        "score_moyen": None,
        "titre": None,
        "matiere": None,
    }


def test_bilan_sans_droit_403(client, base):
    classe_et_donnees(base)
    for role in ("eleve", "ministere"):
        verifier_erreur(client.get(f"/classes/{CLASSE_ID}/bilan", headers=entetes(role)), 403, "acces_refuse")


def test_bilan_classe_introuvable_404(client):
    verifier_erreur(client.get(f"/classes/{nouvel_uuid()}/bilan", headers=entetes("enseignant")), 404, "introuvable")


def test_bilan_identifiant_invalide_422(client):
    verifier_erreur(client.get("/classes/abc/bilan", headers=entetes("enseignant")), 422, "donnees_invalides")


def test_bilan_pagine_au_dela_de_1000_lignes(client, base):
    classe_et_donnees(base)
    base.tables["tentative"] = [
        {"id": f"{i:08d}-0000-4000-8000-000000000000", "classe_id": CLASSE_ID, "experience_id": EXPERIENCE_ID, "fin_le": None, "score": None}
        for i in range(2500)
    ]
    r = client.get(f"/classes/{CLASSE_ID}/bilan", headers=entetes("enseignant"))
    assert r.json()["nombre_tentatives"] == 2500

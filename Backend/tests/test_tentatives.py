from tests.conftest import EXPERIENCE_ID, TENTATIVE_ID, UTILISATEURS, entetes, nouvel_uuid, verifier_erreur

ELEVE = UTILISATEURS["eleve"]


def corps_tentative(**surcharge):
    return {"id": nouvel_uuid(), "experience_id": EXPERIENCE_ID, "debut_le": "2026-11-08T09:30:00+01:00", **surcharge}


def evenement(tentative_id=TENTATIVE_ID, **surcharge):
    return {
        "id": nouvel_uuid(),
        "tentative_id": tentative_id,
        "type": "ajout_reactif",
        "charge": {"volume_ml": 2.5},
        "survenu_le": "2026-11-08T09:31:00Z",
        **surcharge,
    }


def ajouter_tentative(base):
    base.ajouter(
        "tentative",
        {"id": TENTATIVE_ID, "eleve_id": ELEVE, "experience_id": EXPERIENCE_ID, "classe_id": None,
         "debut_le": "2026-11-08T09:30:00+00:00", "fin_le": None, "score": None},
    )


# --- POST /tentatives
def test_demarrer_normal(client, base):
    corps = corps_tentative()
    r = client.post("/tentatives", json=corps, headers=entetes("eleve"))
    assert r.status_code == 201, r.text
    assert r.json()["id"] == corps["id"]
    assert r.json()["eleve_id"] == ELEVE
    assert base.tables["tentative"][0]["debut_le"] == "2026-11-08T08:30:00+00:00"  # converti en UTC


def test_synchroniser_fin_tentative_terminee(client, base):
    corps = corps_tentative(
        fin_le="2026-11-08T09:35:00Z",
        resultat={"experience_titre": "Dosage acide-base", "volume_ml": 21.5},
    )
    r = client.post("/tentatives", json=corps, headers=entetes("eleve"))
    assert r.status_code == 201, r.text
    assert r.json()["fin_le"] == "2026-11-08T09:35:00Z"
    assert r.json()["resultat"] == corps["resultat"]
    assert base.tables["tentative"][0]["fin_le"] == "2026-11-08T09:35:00+00:00"
    assert base.tables["tentative"][0]["resultat"] == corps["resultat"]


def test_demarrer_idempotent(client, base):
    corps = corps_tentative()
    assert client.post("/tentatives", json=corps, headers=entetes("eleve")).status_code == 201
    assert client.post("/tentatives", json=corps, headers=entetes("eleve")).status_code == 201
    assert len(base.tables["tentative"]) == 1


def test_demarrer_avec_identifiant_simulation_slug(client):
    corps = corps_tentative(experience_id="titrage_acide_base")
    r = client.post("/tentatives", json=corps, headers=entetes("eleve"))
    assert r.status_code == 201, r.text
    assert r.json()["experience_id"] == "titrage_acide_base"


def test_demarrer_sans_droit_403(client):
    r = client.post("/tentatives", json=corps_tentative(), headers=entetes("enseignant"))
    verifier_erreur(r, 403, "acces_refuse")


def test_demarrer_donnees_invalides_422(client):
    r = client.post("/tentatives", json={"id": "x", "debut_le": "2026-11-08T09:30:00"}, headers=entetes("eleve"))
    corps = verifier_erreur(r, 422, "donnees_invalides")
    assert corps["details"]["erreurs"]


def test_demarrer_date_sans_fuseau_422(client):
    r = client.post("/tentatives", json=corps_tentative(debut_le="2026-11-08T09:30:00"), headers=entetes("eleve"))
    verifier_erreur(r, 422, "donnees_invalides")


# --- POST /tentatives/sync
def test_sync_normal_et_refus_par_evenement(client, base):
    ajouter_tentative(base)
    bon, mauvais = evenement(), evenement(tentative_id=nouvel_uuid())
    r = client.post("/tentatives/sync", json={"evenements": [bon, mauvais]}, headers=entetes("eleve"))
    assert r.status_code == 200, r.text
    assert r.json()["resultats"] == [
        {"evenement_id": bon["id"], "statut": "accepte", "doublon": False, "code": None},
        {"evenement_id": mauvais["id"], "statut": "refuse", "doublon": False, "code": "tentative_introuvable"},
    ]
    assert [e["id"] for e in base.tables["evenement_tentative"]] == [bon["id"]]


def test_sync_idempotent(client, base):
    ajouter_tentative(base)
    envoi = {"evenements": [evenement(), evenement()]}
    premier = client.post("/tentatives/sync", json=envoi, headers=entetes("eleve")).json()
    second = client.post("/tentatives/sync", json=envoi, headers=entetes("eleve")).json()
    assert [x["doublon"] for x in premier["resultats"]] == [False, False]
    assert [x["doublon"] for x in second["resultats"]] == [True, True]
    assert all(x["statut"] == "accepte" for x in second["resultats"])
    assert len(base.tables["evenement_tentative"]) == 2


def test_sync_doublon_dans_le_meme_envoi(client, base):
    ajouter_tentative(base)
    e = evenement()
    r = client.post("/tentatives/sync", json={"evenements": [e, e]}, headers=entetes("eleve"))
    assert [x["doublon"] for x in r.json()["resultats"]] == [False, True]
    assert len(base.tables["evenement_tentative"]) == 1


def test_sync_50_evenements_acceptes(client, base):
    ajouter_tentative(base)
    r = client.post("/tentatives/sync", json={"evenements": [evenement() for _ in range(50)]}, headers=entetes("eleve"))
    assert r.status_code == 200
    assert len(r.json()["resultats"]) == 50


def test_sync_sans_droit_403(client):
    r = client.post("/tentatives/sync", json={"evenements": [evenement()]}, headers=entetes("enseignant"))
    verifier_erreur(r, 403, "acces_refuse")


def test_sync_51_evenements_422(client):
    r = client.post("/tentatives/sync", json={"evenements": [evenement() for _ in range(51)]}, headers=entetes("eleve"))
    verifier_erreur(r, 422, "donnees_invalides")


def test_sync_liste_vide_422(client):
    verifier_erreur(client.post("/tentatives/sync", json={"evenements": []}, headers=entetes("eleve")), 422, "donnees_invalides")


def test_sync_type_invalide_422(client):
    r = client.post("/tentatives/sync", json={"evenements": [evenement(type="Type Invalide")]}, headers=entetes("eleve"))
    verifier_erreur(r, 422, "donnees_invalides")


# --- GET /tentatives/{id}
def test_lire_tentative_normal(client, base):
    ajouter_tentative(base)
    for role in ("eleve", "enseignant"):
        r = client.get(f"/tentatives/{TENTATIVE_ID}", headers=entetes(role))
        assert r.status_code == 200
        assert r.json()["id"] == TENTATIVE_ID


def test_lire_tentative_sans_droit_403(client, base):
    ajouter_tentative(base)
    for role in ("etablissement", "ministere"):
        verifier_erreur(client.get(f"/tentatives/{TENTATIVE_ID}", headers=entetes(role)), 403, "acces_refuse")


def test_lire_tentative_introuvable_404(client):
    verifier_erreur(client.get(f"/tentatives/{nouvel_uuid()}", headers=entetes("eleve")), 404, "introuvable")


def test_lire_tentative_identifiant_invalide_422(client):
    verifier_erreur(client.get("/tentatives/abc", headers=entetes("eleve")), 422, "donnees_invalides")


def test_lister_tentatives_pour_eleve(client, base):
    ajouter_tentative(base)
    r = client.get("/tentatives?page=1&taille=10", headers=entetes("eleve"))
    assert r.status_code == 200, r.text
    assert [ligne["id"] for ligne in r.json()] == [TENTATIVE_ID]
    assert base.appels[-1][2]["eleve_id"] == f"eq.{ELEVE}"


def test_lister_tentatives_refuse_les_autres_roles(client):
    verifier_erreur(client.get("/tentatives", headers=entetes("enseignant")), 403, "acces_refuse")


def test_lister_tentatives_valide_la_pagination(client):
    verifier_erreur(
        client.get("/tentatives?page=0", headers=entetes("eleve")),
        422,
        "donnees_invalides",
    )

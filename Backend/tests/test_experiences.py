from tests.conftest import EXPERIENCE_ID, entetes, nouvel_uuid, verifier_erreur


def test_lister_normal_sans_corrige(client, base):
    r = client.get("/experiences", headers=entetes("eleve"))
    assert r.status_code == 200
    assert r.json() == [{
        "id": EXPERIENCE_ID,
        "matiere": "chimie",
        "titre": "Dosage acide-base",
        "niveau": "terminale",
        "version": 1,
    }]
    assert "corrige_experience" not in base.tables_lues()


def test_lister_tous_les_roles_autorises(client):
    for role in ("eleve", "enseignant", "etablissement", "ministere"):
        assert client.get("/experiences", headers=entetes(role)).status_code == 200


def test_lister_filtre_par_matiere_et_niveau(client, base):
    base.ajouter(
        "experience",
        {
            "id": "titrage_acide_base",
            "matiere": "chimie",
            "titre": "Dosage acide-base",
            "niveau": "terminale",
            "version": 1,
            "parametres": {},
        },
    )
    r = client.get(
        "/experiences?matiere=chimie&niveau=terminale",
        headers=entetes("eleve"),
    )
    assert r.status_code == 200
    assert [ligne["id"] for ligne in r.json()] == [
        EXPERIENCE_ID,
        "titrage_acide_base",
    ]


def test_detail_normal(client):
    r = client.get(f"/experiences/{EXPERIENCE_ID}", headers=entetes("enseignant"))
    assert r.status_code == 200
    assert r.json()["parametres"] == {"volume_ml": 20}
    assert "CORRIGE" not in r.text


def test_detail_identifiant_simulation_slug(client, base):
    base.ajouter(
        "experience",
        {
            "id": "titrage_acide_base",
            "matiere": "chimie",
            "titre": "Dosage acide-base",
            "niveau": "terminale",
            "version": 1,
            "parametres": {"calcul": "titrage"},
        },
    )
    r = client.get("/experiences/titrage_acide_base", headers=entetes("eleve"))
    assert r.status_code == 200
    assert r.json()["id"] == "titrage_acide_base"


def test_detail_introuvable_404(client):
    verifier_erreur(client.get(f"/experiences/{nouvel_uuid()}", headers=entetes("eleve")), 404, "introuvable")


def test_detail_identifiant_invalide_422(client):
    verifier_erreur(client.get("/experiences/pas-un-uuid", headers=entetes("eleve")), 422, "donnees_invalides")

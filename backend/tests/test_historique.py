import pytest
from fastapi.testclient import TestClient

from app.auth import fournir_verificateur
from app.erreurs import ErreurApi
from app.main import app
from app.routers.tentatives_lecture import fournir_depot_historique
from app.services.historique import retirer_corrige

ELEVE = "11111111-1111-1111-1111-111111111111"
UTILISATEURS = {
    "jeton_eleve": {"id": ELEVE, "app_metadata": {"role": "eleve"}},
    "jeton_prof": {"id": "33333333-3333-3333-3333-333333333333", "app_metadata": {"role": "enseignant"}},
}

T1 = "5b1f0c2e-8a41-4d0e-9c3a-2f6e7a1d9b10"
T2 = "6c2a1d3f-9b52-4e1f-8d4b-3a7f8c2e0b21"
T_SANS_BILAN = "7d3b2e40-0c63-4f20-9e5c-4b809d3f1c32"
T_AUTRE_ELEVE = "8e4c3f51-1d74-4a31-8f6d-5c91ae402d43"

TENTATIVES = [
    {"id": T1, "experience_id": "titrage_acide_base", "version_experience": 1, "debut": "2026-11-08T07:30:00+00:00",
     "fin": "2026-11-08T07:45:00+00:00", "statut": "terminee", "score": 82, "resultat": {"volume_equivalent_ml": 16.0}},
    {"id": T2, "experience_id": "pendule_simple", "version_experience": 1, "debut": "2026-11-07T09:00:00+00:00",
     "fin": None, "statut": "en_cours", "score": None, "resultat": None},
]

BILANS = {
    T1: {
        "tentative_id": T1,
        "erreurs": ["debit_trop_rapide", "lecture_burette"],
        "quiz": {"score": 2, "questions": [{"texte": "Pourquoi ralentir ?", "reponse_eleve": "a", "corrige": "b"}]},
        "exercice": {"enonce": "Refais le dosage avec 25 mL.", "corrige_exercice": 20.0, "indices": ["Pense a la formule"]},
    },
}


def faux_verificateur(jeton):
    if jeton not in UTILISATEURS:
        raise ErreurApi(401, "non_authentifie", "Jeton absent ou invalide.")
    return UTILISATEURS[jeton]


class FauxDepot:
    def __init__(self):
        self.appels = []

    def lister_tentatives(self, profil_id, page, taille):
        self.appels.append(("lister", profil_id, page, taille))
        debut = (page - 1) * taille
        return TENTATIVES[debut:debut + taille], len(TENTATIVES)

    def lire_bilan(self, profil_id, tentative_id):
        self.appels.append(("bilan", profil_id, tentative_id))
        return BILANS.get(tentative_id)  # T_AUTRE_ELEVE et T_SANS_BILAN : absents


depot = FauxDepot()
client = TestClient(app, raise_server_exceptions=False)


@pytest.fixture(autouse=True)
def installer_overrides():
    avant = dict(app.dependency_overrides)
    app.dependency_overrides[fournir_verificateur] = lambda: faux_verificateur
    app.dependency_overrides[fournir_depot_historique] = lambda: depot
    depot.appels = []
    yield
    app.dependency_overrides.clear()
    app.dependency_overrides.update(avant)


def appeler(chemin, jeton="jeton_eleve"):
    entetes = {"Authorization": f"Bearer {jeton}"} if jeton else {}
    return client.get(f"/api/v1{chemin}", headers=entetes)


def test_liste_des_tentatives_de_l_eleve():
    reponse = appeler("/tentatives")
    assert reponse.status_code == 200
    corps = reponse.json()
    assert (corps["page"], corps["taille"], corps["total"]) == (1, 50, 2)
    assert corps["elements"][0] == {
        "id": T1, "experience_id": "titrage_acide_base", "version_experience": 1,
        "debut": "2026-11-08T07:30:00Z", "fin": "2026-11-08T07:45:00Z",
        "statut": "terminee", "score": 82, "resultat": {"volume_equivalent_ml": 16.0},
    }
    assert corps["elements"][1]["statut"] == "en_cours" and corps["elements"][1]["fin"] is None
    assert depot.appels == [("lister", ELEVE, 1, 50)]


def test_pagination_est_transmise():
    corps = appeler("/tentatives?page=2&taille=1").json()
    assert [t["id"] for t in corps["elements"]] == [T2]
    assert (corps["page"], corps["taille"], corps["total"]) == (2, 1, 2)


def test_bilan_normal_sans_le_corrige():
    reponse = appeler(f"/tentatives/{T1}/bilan")
    assert reponse.status_code == 200
    corps = reponse.json()
    assert corps["tentative_id"] == T1
    assert corps["erreurs"] == ["debit_trop_rapide", "lecture_burette"]
    assert corps["quiz"]["questions"] == [{"texte": "Pourquoi ralentir ?", "reponse_eleve": "a"}]
    assert corps["exercice"] == {"enonce": "Refais le dosage avec 25 mL.", "indices": ["Pense a la formule"]}
    assert "corrige" not in reponse.text.lower()
    assert depot.appels == [("bilan", ELEVE, T1)]


def test_bilan_absent_ou_d_un_autre_eleve_donne_404():
    for tentative in (T_SANS_BILAN, T_AUTRE_ELEVE):
        reponse = appeler(f"/tentatives/{tentative}/bilan")
        assert reponse.status_code == 404
        assert reponse.json()["code"] == "introuvable"


def test_sans_droit_enseignant_donne_403():
    for chemin in ("/tentatives", f"/tentatives/{T1}/bilan"):
        reponse = appeler(chemin, jeton="jeton_prof")
        assert reponse.status_code == 403
        assert reponse.json()["code"] == "interdit"


def test_sans_jeton_donne_401():
    for chemin in ("/tentatives", f"/tentatives/{T1}/bilan"):
        reponse = appeler(chemin, jeton=None)
        assert reponse.status_code == 401
        assert reponse.json()["code"] == "non_authentifie"


def test_parametres_invalides_donnent_422():
    for chemin in ("/tentatives?taille=101", "/tentatives?taille=0", "/tentatives?page=0", "/tentatives/pas-un-uuid/bilan"):
        reponse = appeler(chemin)
        assert reponse.status_code == 422, chemin
        assert reponse.json()["code"] == "donnees_invalides"


def test_retirer_corrige_a_tous_les_niveaux():
    donnees = {"a": 1, "Corrige": 2, "b": [{"corrige_final": 3, "c": 4}, 5], "d": {"x": {"corrige": 6, "y": 7}}}
    assert retirer_corrige(donnees) == {"a": 1, "b": [{"c": 4}, 5], "d": {"x": {"y": 7}}}
    assert retirer_corrige(None) is None and retirer_corrige("texte") == "texte"
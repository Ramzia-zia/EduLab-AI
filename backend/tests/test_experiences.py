import pytest
from fastapi.testclient import TestClient

from app.auth import fournir_verificateur
from app.erreurs import ErreurApi
from app.main import app
from app.routers.experiences import fournir_depot_experiences

UTILISATEURS = {
    "jeton_eleve": {"id": "11111111-1111-1111-1111-111111111111", "app_metadata": {"role": "eleve"}},
    "jeton_prof": {"id": "33333333-3333-3333-3333-333333333333", "app_metadata": {"role": "enseignant"}},
}

EXPERIENCES = [
    {"id": "essai_affaissement", "matiere": "genie_civil", "niveau": "terminale", "titre": "Essai d'affaissement", "duree_min": 20, "difficulte": "moyen", "version": 2},
    {"id": "mesure_ph", "matiere": "chimie", "niveau": "seconde", "titre": "Mesure du pH", "duree_min": 10, "difficulte": "facile", "version": 1},
    {"id": "pendule_simple", "matiere": "physique", "niveau": "premiere", "titre": "Pendule simple", "duree_min": 15, "difficulte": "facile", "version": 1},
    {"id": "titrage_acide_base", "matiere": "chimie", "niveau": "terminale", "titre": "Dosage acide-base", "duree_min": 15, "difficulte": "moyen", "version": 1},
]
DEFINITION = {"id": "titrage_acide_base", "matiere": "chimie", "niveau": "terminale", "calcul": "titrage"}


def faux_verificateur(jeton):
    if jeton not in UTILISATEURS:
        raise ErreurApi(401, "non_authentifie", "Jeton absent ou invalide.")
    return UTILISATEURS[jeton]


class FauxDepot:
    def __init__(self):
        self.tentatives = []
        self.appels = []

    def lister_publiees(self, matiere, niveau, page, taille):
        self.appels.append((matiere, niveau, page, taille))
        lignes = [e for e in EXPERIENCES if (not matiere or e["matiere"] == matiere) and (not niveau or e["niveau"] == niveau)]
        debut = (page - 1) * taille
        return lignes[debut:debut + taille], len(lignes)

    def statuts_tentatives(self, profil_id, experience_ids):
        return [t for t in self.tentatives if t["experience_id"] in experience_ids]

    def lire_experience(self, experience_id):
        if experience_id == "titrage_acide_base":
            return {"id": "titrage_acide_base", "version": 1, "definition": DEFINITION}
        return None


depot = FauxDepot()
client = TestClient(app, raise_server_exceptions=False)


@pytest.fixture(autouse=True)
def installer_overrides():
    avant = dict(app.dependency_overrides)
    app.dependency_overrides[fournir_verificateur] = lambda: faux_verificateur
    app.dependency_overrides[fournir_depot_experiences] = lambda: depot
    depot.tentatives = []
    depot.appels = []
    yield
    app.dependency_overrides.clear()
    app.dependency_overrides.update(avant)


def appeler(chemin, jeton="jeton_eleve"):
    entetes = {"Authorization": f"Bearer {jeton}"} if jeton else {}
    return client.get(f"/api/v1{chemin}", headers=entetes)


def test_liste_normale_avec_pagination_par_defaut():
    reponse = appeler("/experiences")
    assert reponse.status_code == 200
    corps = reponse.json()
    assert (corps["page"], corps["taille"], corps["total"]) == (1, 50, 4)
    assert [e["id"] for e in corps["elements"]] == [e["id"] for e in EXPERIENCES]
    assert corps["elements"][0] == {**EXPERIENCES[0], "etat": "a_commencer"}


def test_etat_vient_des_tentatives_de_l_eleve():
    depot.tentatives = [
        {"experience_id": "mesure_ph", "statut": "en_cours"},
        {"experience_id": "titrage_acide_base", "statut": "abandonnee"},
        {"experience_id": "titrage_acide_base", "statut": "en_cours"},
        {"experience_id": "titrage_acide_base", "statut": "terminee"},
        {"experience_id": "pendule_simple", "statut": "abandonnee"},
    ]
    etats = {e["id"]: e["etat"] for e in appeler("/experiences").json()["elements"]}
    assert etats == {
        "essai_affaissement": "a_commencer",
        "mesure_ph": "en_cours",
        "pendule_simple": "a_commencer",
        "titrage_acide_base": "terminee",
    }


def test_filtres_et_pagination_sont_transmis():
    reponse = appeler("/experiences?matiere=chimie&niveau=terminale&page=1&taille=10")
    assert depot.appels == [("chimie", "terminale", 1, 10)]
    assert [e["id"] for e in reponse.json()["elements"]] == ["titrage_acide_base"]
    assert reponse.json()["total"] == 1


def test_deuxieme_page():
    corps = appeler("/experiences?page=2&taille=3").json()
    assert [e["id"] for e in corps["elements"]] == ["titrage_acide_base"]
    assert (corps["page"], corps["taille"], corps["total"]) == (2, 3, 4)


def test_sans_droit_enseignant_donne_403():
    for chemin in ("/experiences", "/experiences/titrage_acide_base/pack"):
        reponse = appeler(chemin, jeton="jeton_prof")
        assert reponse.status_code == 403
        assert reponse.json()["code"] == "interdit"


def test_sans_jeton_donne_401():
    for chemin in ("/experiences", "/experiences/titrage_acide_base/pack"):
        reponse = appeler(chemin, jeton=None)
        assert reponse.status_code == 401
        assert reponse.json()["code"] == "non_authentifie"


def test_parametres_invalides_donnent_422():
    for chemin in (
        "/experiences?taille=101",
        "/experiences?taille=0",
        "/experiences?page=0",
        "/experiences?matiere=cuisine",
        "/experiences?niveau=cm2",
        "/experiences/TITRAGE!/pack",
    ):
        reponse = appeler(chemin)
        assert reponse.status_code == 422, chemin
        assert reponse.json()["code"] == "donnees_invalides"


def test_pack_normal():
    reponse = appeler("/experiences/titrage_acide_base/pack")
    assert reponse.status_code == 200
    assert reponse.json() == {"id": "titrage_acide_base", "version": 1, "definition": DEFINITION}


def test_pack_inexistant_donne_404():
    reponse = appeler("/experiences/nexiste_pas/pack")
    assert reponse.status_code == 404
    assert reponse.json()["code"] == "introuvable"
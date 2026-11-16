import pytest
from fastapi.testclient import TestClient

from app.auth import fournir_verificateur
from app.erreurs import ErreurApi
from app.main import app
from app.routers.moi import fournir_depot_profil

ID_ELEVE = "11111111-1111-1111-1111-111111111111"
ID_MINISTERE = "44444444-4444-4444-4444-444444444444"
ID_ETAB = "99999999-9999-9999-9999-999999999999"

UTILISATEURS = {
    "jeton_eleve": {"id": ID_ELEVE, "app_metadata": {"role": "eleve"}},
    "jeton_ministere": {"id": ID_MINISTERE, "app_metadata": {"role": "ministere"}},
    "jeton_incoherent": {"id": "55555555-5555-5555-5555-555555555555", "app_metadata": {"role": "enseignant"}},
    "jeton_sans_profil": {"id": "66666666-6666-6666-6666-666666666666", "app_metadata": {"role": "eleve"}},
}

PROFILS = {
    ID_ELEVE: {"id": ID_ELEVE, "nom": "Ama Koffi", "role": "eleve", "etablissement_id": ID_ETAB},
    ID_MINISTERE: {"id": ID_MINISTERE, "nom": "Direction", "role": "ministere", "etablissement_id": None},
    # role different de celui du jeton (enseignant) : doit etre refuse
    "55555555-5555-5555-5555-555555555555": {
        "id": "55555555-5555-5555-5555-555555555555", "nom": "Kossi", "role": "eleve", "etablissement_id": ID_ETAB,
    },
}


def faux_verificateur(jeton: str) -> dict:
    if jeton not in UTILISATEURS:
        raise ErreurApi(401, "non_authentifie", "Jeton absent ou invalide.")
    return UTILISATEURS[jeton]


class FauxDepot:
    def __init__(self):
        self.ids_demandes = []

    def lire_profil(self, profil_id):
        self.ids_demandes.append(profil_id)
        return PROFILS.get(profil_id)


depot = FauxDepot()
client = TestClient(app, raise_server_exceptions=False)


@pytest.fixture(autouse=True)
def installer_overrides():
    app.dependency_overrides[fournir_verificateur] = lambda: faux_verificateur
    app.dependency_overrides[fournir_depot_profil] = lambda: depot
    yield


def appeler(jeton):
    entetes = {"Authorization": f"Bearer {jeton}"} if jeton else {}
    return client.get("/api/v1/moi", headers=entetes)


def test_eleve_obtient_son_profil():
    reponse = appeler("jeton_eleve")
    assert reponse.status_code == 200
    assert reponse.json() == {"id": ID_ELEVE, "nom": "Ama Koffi", "role": "eleve", "etablissement_id": ID_ETAB}


def test_ministere_n_a_pas_d_etablissement():
    reponse = appeler("jeton_ministere")
    assert reponse.status_code == 200
    assert reponse.json()["etablissement_id"] is None


def test_le_profil_lu_est_celui_du_jeton():
    depot.ids_demandes.clear()
    appeler("jeton_eleve")
    assert depot.ids_demandes == [ID_ELEVE]


def test_sans_jeton_donne_401():
    reponse = appeler(None)
    assert reponse.status_code == 401
    assert reponse.json()["code"] == "non_authentifie"


def test_role_du_jeton_different_du_profil_donne_403():
    reponse = appeler("jeton_incoherent")
    assert reponse.status_code == 403
    assert reponse.json()["code"] == "interdit"


def test_profil_absent_donne_404():
    reponse = appeler("jeton_sans_profil")
    assert reponse.status_code == 404
    assert reponse.json()["code"] == "introuvable"
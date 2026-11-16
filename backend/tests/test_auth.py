from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient

from app.auth import Utilisateur, exige, fournir_verificateur
from app.erreurs import ErreurApi, installer_gestion_erreurs

UTILISATEURS = {
    "jeton_eleve": {"id": "11111111-1111-1111-1111-111111111111", "app_metadata": {"role": "eleve"}},
    "jeton_enseignant": {"id": "22222222-2222-2222-2222-222222222222", "app_metadata": {"role": "enseignant"}},
    "jeton_sans_role": {"id": "33333333-3333-3333-3333-333333333333", "app_metadata": {"role": "pirate"}},
}


def faux_verificateur(jeton: str) -> dict:
    if jeton not in UTILISATEURS:
        raise ErreurApi(401, "non_authentifie", "Jeton absent ou invalide.")
    return UTILISATEURS[jeton]


def creer_app_de_test() -> FastAPI:
    app = FastAPI()
    installer_gestion_erreurs(app)
    app.dependency_overrides[fournir_verificateur] = lambda: faux_verificateur

    @app.get("/prive")
    def prive(utilisateur: Utilisateur = Depends(exige("eleve"))):
        return {"id": utilisateur.id, "role": utilisateur.role}

    return app


client = TestClient(creer_app_de_test(), raise_server_exceptions=False)


def appeler(jeton: str | None):
    entetes = {"Authorization": f"Bearer {jeton}"} if jeton else {}
    return client.get("/prive", headers=entetes)


def test_bon_role_passe():
    reponse = appeler("jeton_eleve")
    assert reponse.status_code == 200
    assert reponse.json()["role"] == "eleve"


def test_sans_jeton_donne_401():
    reponse = appeler(None)
    assert reponse.status_code == 401
    assert reponse.json()["code"] == "non_authentifie"


def test_jeton_invalide_donne_401():
    reponse = appeler("n_importe_quoi")
    assert reponse.status_code == 401
    assert reponse.json()["code"] == "non_authentifie"


def test_mauvais_role_donne_403():
    reponse = appeler("jeton_enseignant")
    assert reponse.status_code == 403
    assert reponse.json()["code"] == "interdit"


def test_role_inconnu_donne_403():
    reponse = appeler("jeton_sans_role")
    assert reponse.status_code == 403
    assert reponse.json()["code"] == "interdit"
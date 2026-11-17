import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.auth import fournir_verificateur
from app.erreurs import ErreurApi

UTILISATEURS = {
    "jeton_prof": {"id": "33333333-3333-3333-3333-333333333333", "app_metadata": {"role": "enseignant"}},
    "jeton_etab": {"id": "44444444-4444-4444-4444-444444444444", "app_metadata": {"role": "etablissement"}},
    "jeton_eleve": {"id": "11111111-1111-1111-1111-111111111111", "app_metadata": {"role": "eleve"}},
}

def faux_verificateur(jeton):
    if jeton not in UTILISATEURS:
        raise ErreurApi(401, "non_authentifie", "Jeton absent ou invalide.")
    return UTILISATEURS[jeton]

client = TestClient(app, raise_server_exceptions=False)

@pytest.fixture(autouse=True)
def setup():
    avant = dict(app.dependency_overrides)
    app.dependency_overrides[fournir_verificateur] = lambda: faux_verificateur
    yield
    app.dependency_overrides.clear()
    app.dependency_overrides.update(avant)

def test_classes_enseignant_ok():
    reponse = client.get("/api/v1/classes", headers={"Authorization": "Bearer jeton_prof"})
    assert reponse.status_code == 200

def test_classes_eleve_403():
    reponse = client.get("/api/v1/classes", headers={"Authorization": "Bearer jeton_eleve"})
    assert reponse.status_code == 403
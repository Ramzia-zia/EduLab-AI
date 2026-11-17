import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.auth import fournir_verificateur
from app.erreurs import ErreurApi

UTILISATEURS = {
    "jeton_etab": {"id": "44444444-4444-4444-4444-444444444444", "app_metadata": {"role": "etablissement"}},
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

def test_import_csv_ok():
    csv_content = "nom,role,classe,email\nJean,eleve,Terminale D,jean@test.com"
    reponse = client.post(
        "/api/v1/etablissements/44444444-4444-4444-4444-444444444444/import",
        headers={"Authorization": "Bearer jeton_etab"},
        files={"fichier": ("test.csv", csv_content, "text/csv")}
    )
    assert reponse.status_code == 200
    assert reponse.json()["crees"] == 1
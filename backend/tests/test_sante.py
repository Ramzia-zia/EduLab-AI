from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_sante_repond_ok():
    reponse = client.get("/api/v1/sante")
    assert reponse.status_code == 200
    assert reponse.json() == {"etat": "ok"}
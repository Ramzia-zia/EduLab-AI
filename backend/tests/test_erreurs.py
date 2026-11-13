from fastapi import APIRouter, FastAPI
from fastapi.testclient import TestClient
from pydantic import BaseModel

from app.erreurs import ErreurApi, installer_gestion_erreurs


class Entree(BaseModel):
    volume_ml: float


def creer_app_de_test() -> FastAPI:
    app = FastAPI()
    installer_gestion_erreurs(app)
    routeur = APIRouter()

    @routeur.post("/essai")
    def essai(entree: Entree):
        return {"volume_ml": entree.volume_ml}

    @routeur.get("/interdit")
    def interdit():
        raise ErreurApi(403, "interdit", "Role non autorise.")

    @routeur.get("/panne")
    def panne():
        raise RuntimeError("boum")

    app.include_router(routeur)
    return app


client = TestClient(creer_app_de_test(), raise_server_exceptions=False)


def test_donnees_invalides_donne_422_au_bon_format():
    reponse = client.post("/essai", json={"volume_ml": "abc"})
    assert reponse.status_code == 422
    corps = reponse.json()
    assert corps["code"] == "donnees_invalides"
    assert set(corps) == {"code", "message", "details"}
    assert corps["details"]["champ"] == "body.volume_ml"


def test_erreur_metier_donne_403_au_bon_format():
    reponse = client.get("/interdit")
    assert reponse.status_code == 403
    assert reponse.json() == {"code": "interdit", "message": "Role non autorise.", "details": {}}


def test_route_inconnue_donne_404_au_bon_format():
    reponse = client.get("/nexiste_pas")
    assert reponse.status_code == 404
    assert reponse.json()["code"] == "introuvable"


def test_erreur_imprevue_donne_500_au_bon_format():
    reponse = client.get("/panne")
    assert reponse.status_code == 500
    assert reponse.json()["code"] == "erreur_serveur"


def test_corps_trop_gros_donne_413():
    gros = "x" * (257 * 1024)
    reponse = client.post("/essai", content=gros, headers={"content-type": "application/json"})
    assert reponse.status_code == 413
    assert reponse.json()["code"] == "corps_trop_gros"
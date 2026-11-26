from fastapi.routing import APIRoute

from app.config import TAILLE_MAX_CORPS_OCTETS
from app.main import app
from tests.conftest import entetes, verifier_erreur


def test_sans_jeton_401(client):
    verifier_erreur(client.get("/experiences"), 401, "non_authentifie")


def test_jeton_invalide_401(client):
    r = client.get("/experiences", headers={"Authorization": "Bearer nimporte_quoi"})
    verifier_erreur(r, 401, "non_authentifie")


def test_compte_sans_profil_403(client, base):
    base.jetons["jeton_orphelin"] = {"id": "99999999-0000-4000-8000-000000000009"}
    r = client.get("/experiences", headers={"Authorization": "Bearer jeton_orphelin"})
    verifier_erreur(r, 403, "acces_refuse")


def test_profil_courant(client):
    r = client.get("/moi", headers=entetes("eleve"))
    assert r.status_code == 200
    assert r.json() == {
        "id": "10000000-0000-4000-8000-000000000001",
        "nom": "eleve",
        "role": "eleve",
        "etablissement_id": "00000000-0000-4000-8000-0000000000e1",
        "etablissement_nom": "Lycée de test",
        "etablissement_actif": True,
    }


def test_route_inconnue_meme_format(client):
    verifier_erreur(client.get("/nexiste-pas"), 404, "introuvable")


def test_corps_trop_gros_413_par_content_length(client):
    r = client.post("/tentatives/sync", content=b"x" * (TAILLE_MAX_CORPS_OCTETS + 1), headers=entetes("eleve"))
    verifier_erreur(r, 413, "corps_trop_gros")


def test_corps_trop_gros_413_sans_content_length(client):
    def morceaux():
        for _ in range(3):
            yield b"x" * (TAILLE_MAX_CORPS_OCTETS // 2)

    r = client.post("/tentatives/sync", content=morceaux(), headers=entetes("eleve"))
    verifier_erreur(r, 413, "corps_trop_gros")


def test_chaque_route_a_response_model_et_description():
    for route in app.routes:
        if isinstance(route, APIRoute):
            assert route.response_model is not None, route.path
            assert route.description, route.path

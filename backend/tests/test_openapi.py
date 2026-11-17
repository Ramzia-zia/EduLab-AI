from app.main import app

METHODES = {"get", "post", "put", "patch", "delete"}


def operations():
    for chemin, methodes in app.openapi()["paths"].items():
        for methode, operation in methodes.items():
            if methode in METHODES:
                yield chemin, methode, operation


def test_toutes_les_routes_sont_sous_api_v1():
    assert all(chemin.startswith("/api/v1/") for chemin, _, _ in operations())


def test_chaque_route_a_une_description():
    sans = [f"{m.upper()} {c}" for c, m, op in operations() if not op.get("description", "").strip()]
    assert sans == [], f"Routes sans description : {sans}"


def test_chaque_route_a_un_response_model():
    sans = []
    for chemin, methode, op in operations():
        schema = op["responses"].get("200", {}).get("content", {}).get("application/json", {}).get("schema", {})
        if not schema:
            sans.append(f"{methode.upper()} {chemin}")
    assert sans == [], f"Routes sans response_model : {sans}"
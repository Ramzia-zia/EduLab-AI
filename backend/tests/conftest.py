import pytest

from app.main import app


@pytest.fixture(autouse=True)
def nettoyer_les_faux_apres_chaque_test():
    yield
    app.dependency_overrides.clear()
from app.config import MODELE_GEMINI_PAR_DEFAUT, lire_reglages


def definir_variables_requises(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", "https://projet.supabase.co")
    monkeypatch.setenv("SUPABASE_CLE_ANON", "cle_anon")
    monkeypatch.setenv("GEMINI_API_KEY", "cle_gemini")


def test_modele_gemini_gratuit_par_defaut(monkeypatch):
    definir_variables_requises(monkeypatch)
    monkeypatch.delenv("GEMINI_MODEL", raising=False)
    lire_reglages.cache_clear()
    try:
        reglages = lire_reglages()
    finally:
        lire_reglages.cache_clear()

    assert reglages.gemini_api_key == "cle_gemini"
    assert reglages.gemini_model == MODELE_GEMINI_PAR_DEFAUT


def test_modele_gemini_personnalisable(monkeypatch):
    definir_variables_requises(monkeypatch)
    monkeypatch.setenv("GEMINI_MODEL", "gemini-modele-personnalise")
    lire_reglages.cache_clear()
    try:
        reglages = lire_reglages()
    finally:
        lire_reglages.cache_clear()

    assert reglages.gemini_model == "gemini-modele-personnalise"

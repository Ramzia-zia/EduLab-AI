import pytest

from app.schemas.assistant import MessageHistorique
from app.services.assistant_ia import limiter_mots, preparer_messages
from app.services.bilans import calculer_bilan
from app.services.limiteur import LimiteurDebit


def test_limiteur_fenetre_glissante():
    heure = [0.0]
    limiteur = LimiteurDebit(maximum=2, fenetre_s=60.0, horloge=lambda: heure[0])
    assert limiteur.verifier("a") is None
    assert limiteur.verifier("a") is None
    assert limiteur.verifier("a") == 60
    assert limiteur.verifier("b") is None  # autre utilisateur : compteur séparé
    heure[0] = 59.0
    assert limiteur.verifier("a") == 1
    heure[0] = 60.0
    assert limiteur.verifier("a") is None


def test_limiter_mots_garde_le_texte_court_et_coupe_le_long():
    assert limiter_mots("un deux trois", 120) == "un deux trois"
    assert limiter_mots("un deux trois quatre", 2) == "un deux…"


def test_preparer_messages_alterne_et_commence_par_user():
    historique = [
        MessageHistorique(role="assistant", contenu="Bonjour"),
        MessageHistorique(role="eleve", contenu="a"),
        MessageHistorique(role="eleve", contenu="b"),
        MessageHistorique(role="assistant", contenu="c"),
    ]
    messages = preparer_messages(historique, "d")
    assert messages == [
        {"role": "user", "content": "a\nb"},
        {"role": "assistant", "content": "c"},
        {"role": "user", "content": "d"},
    ]


def test_bilan_sans_tentative():
    bilan = calculer_bilan("30000000-0000-4000-8000-000000000001", 0, [])
    assert bilan.score_moyen is None and bilan.par_experience == []


def test_select_tout_exige_un_ordre():
    import asyncio

    from app.db import select_tout

    with pytest.raises(ValueError):
        asyncio.run(select_tout(None, "j", "t", {"select": "id"}))

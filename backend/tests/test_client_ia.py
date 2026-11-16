import json

import httpx
import pytest

from app.services.client_ia import ClientAnthropic, ErreurIA


def client_avec(reponse_fn):
    envoyees = []

    def gestionnaire(requete):
        envoyees.append(requete)
        return reponse_fn(requete)

    return ClientAnthropic("cle-secrete", "modele-test", transport=httpx.MockTransport(gestionnaire)), envoyees


def test_requete_bien_formee_et_texte_lu():
    ia, envoyees = client_avec(
        lambda r: httpx.Response(200, json={"content": [{"type": "text", "text": "Bonjour "}, {"type": "text", "text": "élève"}]})
    )
    assert ia.completer("regles", "question") == "Bonjour élève"
    requete = envoyees[0]
    assert str(requete.url) == "https://api.anthropic.com/v1/messages"
    assert requete.headers["x-api-key"] == "cle-secrete"
    assert requete.headers["anthropic-version"] == "2023-06-01"
    corps = json.loads(requete.content)
    assert corps["model"] == "modele-test"
    assert corps["system"] == "regles"
    assert corps["messages"] == [{"role": "user", "content": "question"}]
    assert corps["max_tokens"] == 400


def test_statut_d_erreur_leve_erreur_ia():
    ia, _ = client_avec(lambda r: httpx.Response(529, json={}))
    with pytest.raises(ErreurIA):
        ia.completer("s", "m")


def test_reponse_illisible_leve_erreur_ia():
    ia, _ = client_avec(lambda r: httpx.Response(200, json={"autre": 1}))
    with pytest.raises(ErreurIA):
        ia.completer("s", "m")


def test_reseau_coupe_leve_erreur_ia():
    def panne(requete):
        raise httpx.ConnectError("hors ligne")

    ia, _ = client_avec(panne)
    with pytest.raises(ErreurIA):
        ia.completer("s", "m")
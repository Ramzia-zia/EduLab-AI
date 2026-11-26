"""Les vrais clients HTTP (Supabase, IA), testés avec un faux réseau."""
import json

import httpx
import pytest

from app.db import SupabaseClient
from app.erreurs import ErreurApi
from app.services.assistant_ia import FournisseurGemini

URL = "https://projet.supabase.co"
URL_GEMINI = "https://generativelanguage.googleapis.com/v1beta/models/modele_x:generateContent"


def client_supabase(gestionnaire) -> SupabaseClient:
    http = httpx.AsyncClient(transport=httpx.MockTransport(gestionnaire))
    return SupabaseClient(http, URL, "cle_anon_publique")


@pytest.mark.anyio
async def test_select_utilise_le_jeton_de_l_utilisateur_et_la_cle_anon():
    vu = {}

    def gestionnaire(requete: httpx.Request) -> httpx.Response:
        vu.update(requete.headers)
        vu["url"] = str(requete.url)
        return httpx.Response(200, json=[{"id": "1"}])

    lignes = await client_supabase(gestionnaire).select("jeton_eleve", "experience", {"select": "id"})
    assert lignes == [{"id": "1"}]
    assert vu["authorization"] == "Bearer jeton_eleve"
    assert vu["apikey"] == "cle_anon_publique"
    assert vu["url"].startswith(f"{URL}/rest/v1/experience")


@pytest.mark.anyio
async def test_insert_ignore_les_doublons():
    vu = {}

    def gestionnaire(requete: httpx.Request) -> httpx.Response:
        vu["prefer"] = requete.headers["prefer"]
        vu["url"] = str(requete.url)
        return httpx.Response(201, json=[])

    assert await client_supabase(gestionnaire).insert("j", "evenement_tentative", [{"id": "1"}], ignorer_doublons=True) == []
    assert "ignore-duplicates" in vu["prefer"] and "on_conflict=id" in vu["url"]


@pytest.mark.anyio
async def test_jeton_refuse_donne_none():
    assert await client_supabase(lambda r: httpx.Response(401, json={})).utilisateur("mauvais") is None


@pytest.mark.anyio
@pytest.mark.parametrize(
    "reponse, statut, code",
    [
        (httpx.Response(401, json={}), 401, "non_authentifie"),
        (httpx.Response(403, json={}), 403, "acces_refuse"),
        (httpx.Response(400, json={"code": "42501"}), 403, "acces_refuse"),
        (httpx.Response(409, json={"code": "23503"}), 422, "donnees_invalides"),
        (httpx.Response(500, text="boum"), 502, "base_indisponible"),
    ],
)
async def test_erreurs_de_la_base_traduites(reponse, statut, code):
    with pytest.raises(ErreurApi) as e:
        await client_supabase(lambda r: reponse).select("j", "tentative", {})
    assert (e.value.statut, e.value.code) == (statut, code)


@pytest.mark.anyio
async def test_base_injoignable_503():
    def gestionnaire(requete):
        raise httpx.ConnectError("coupé")

    with pytest.raises(ErreurApi) as e:
        await client_supabase(gestionnaire).select("j", "tentative", {})
    assert (e.value.statut, e.value.code) == (503, "base_indisponible")


def fournisseur(gestionnaire) -> FournisseurGemini:
    return FournisseurGemini(httpx.AsyncClient(transport=httpx.MockTransport(gestionnaire)), "cle_ia", "modele_x")


@pytest.mark.anyio
async def test_ia_reponse_normale():
    vu = {}

    def gestionnaire(requete: httpx.Request) -> httpx.Response:
        vu["cle"] = requete.headers["x-goog-api-key"]
        vu["url"] = str(requete.url)
        vu["corps"] = requete.read().decode()
        return httpx.Response(
            200,
            json={"candidates": [{"content": {"parts": [{"text": "Bonjour "}, {"text": "!"}]}}]},
        )

    messages = [{"role": "user", "content": "salut"}, {"role": "assistant", "content": "Bonjour."}]
    assert await fournisseur(gestionnaire).repondre("systeme", messages) == "Bonjour !"
    corps = json.loads(vu["corps"])
    assert vu["cle"] == "cle_ia"
    assert vu["url"] == URL_GEMINI
    assert corps["systemInstruction"] == {"parts": [{"text": "systeme"}]}
    assert corps["contents"] == [
        {"role": "user", "parts": [{"text": "salut"}]},
        {"role": "model", "parts": [{"text": "Bonjour."}]},
    ]
    assert corps["generationConfig"]["maxOutputTokens"] == 400


@pytest.mark.anyio
@pytest.mark.parametrize(
    "reponse",
    [httpx.Response(500, text="x"), httpx.Response(200, json={"oups": 1}), httpx.Response(200, json={"content": []})],
)
async def test_ia_en_echec_503(reponse):
    with pytest.raises(ErreurApi) as e:
        await fournisseur(lambda r: reponse).repondre("s", [{"role": "user", "content": "x"}])
    assert (e.value.statut, e.value.code) == (503, "assistant_indisponible")


@pytest.mark.anyio
async def test_cle_api_absente_de_l_erreur():
    def gestionnaire(requete: httpx.Request) -> httpx.Response:
        return httpx.Response(403, text="cle_ia invalide")

    with pytest.raises(ErreurApi) as erreur:
        await fournisseur(gestionnaire).repondre("s", [{"role": "user", "content": "x"}])
    assert "cle_ia" not in str(erreur.value)

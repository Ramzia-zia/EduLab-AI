import json
from uuid import uuid4

import httpx
import pytest

from app.erreurs import ErreurApi
from app.schemas.synchronisation import EvenementSync, TentativeSync
from app.services.depot_supabase import DepotSupabase
from app.services.synchronisation import DoublonDepot

URL = "https://exemple.supabase.co"


def depot_avec(reponse_fn):
    envoyees = []

    def gestionnaire(requete: httpx.Request):
        envoyees.append(requete)
        return reponse_fn(requete)

    depot = DepotSupabase(URL, "cle_anon", "jeton_eleve", transport=httpx.MockTransport(gestionnaire))
    return depot, envoyees


def une_tentative():
    return TentativeSync(
        id=uuid4(), experience_id="titrage_acide_base", version_experience=1,
        debut="2026-11-08T07:30:00Z", statut="en_cours",
    )


def test_lecture_utilise_le_jeton_de_l_eleve_et_la_bonne_url():
    tid = uuid4()
    depot, envoyees = depot_avec(lambda r: httpx.Response(200, json=[{"id": str(tid), "profil_id": "p", "statut": "en_cours"}]))
    ligne = depot.lire_tentative(tid)
    assert ligne["statut"] == "en_cours"
    requete = envoyees[0]
    assert requete.method == "GET"
    assert requete.url.path == "/rest/v1/tentative"
    assert requete.url.params["id"] == f"eq.{tid}"
    assert requete.headers["authorization"] == "Bearer jeton_eleve"
    assert requete.headers["apikey"] == "cle_anon"


def test_lecture_vide_renvoie_none():
    depot, _ = depot_avec(lambda r: httpx.Response(200, json=[]))
    assert depot.lire_tentative(uuid4()) is None


def test_creation_envoie_profil_id_et_dates_iso():
    depot, envoyees = depot_avec(lambda r: httpx.Response(201))
    t = une_tentative()
    depot.creer_tentative("profil-1", t)
    corps = json.loads(envoyees[0].content)
    assert envoyees[0].method == "POST"
    assert corps["profil_id"] == "profil-1"
    assert corps["id"] == str(t.id)
    assert corps["debut"].startswith("2026-11-08T07:30:00")


def test_mise_a_jour_n_envoie_que_les_champs_autorises():
    depot, envoyees = depot_avec(lambda r: httpx.Response(204))
    t = une_tentative()
    depot.mettre_a_jour_tentative(t)
    assert envoyees[0].method == "PATCH"
    assert set(json.loads(envoyees[0].content)) == {"fin", "statut", "score", "resultat"}


def test_doublon_409_devient_doublon_depot():
    depot, _ = depot_avec(lambda r: httpx.Response(409, json={"code": "23505"}))
    with pytest.raises(DoublonDepot):
        depot.creer_tentative("p", une_tentative())


def test_refus_rls_devient_403_interdit():
    depot, _ = depot_avec(lambda r: httpx.Response(403, json={"code": "42501"}))
    with pytest.raises(ErreurApi) as erreur:
        depot.creer_tentative("p", une_tentative())
    assert erreur.value.statut == 403 and erreur.value.code == "interdit"


def test_panne_de_la_base_devient_500():
    def panne(requete):
        raise httpx.ConnectError("hors ligne")

    depot, _ = depot_avec(panne)
    with pytest.raises(ErreurApi) as erreur:
        depot.lire_tentative(uuid4())
    assert erreur.value.statut == 500 and erreur.value.code == "erreur_serveur"


def test_creation_evenement_et_rang():
    depot, envoyees = depot_avec(lambda r: httpx.Response(201) if r.method == "POST" else httpx.Response(200, json=[{"id": "x"}]))
    e = EvenementSync(id=uuid4(), tentative_id=uuid4(), rang=1, horodatage="2026-11-08T07:30:05Z", action="verser", valeurs={"volume_ml": 5.0})
    depot.creer_evenement(e)
    assert json.loads(envoyees[0].content)["valeurs"] == {"volume_ml": 5.0}
    assert depot.rang_pris(e.tentative_id, 1) is True
    assert envoyees[1].url.params["rang"] == "eq.1"
from uuid import uuid4

import pytest

from fastapi.testclient import TestClient

from app.auth import fournir_verificateur
from app.erreurs import ErreurApi
from app.main import app
from app.routers.assistant import fournir_client_ia, fournir_limiteur
from app.services.assistant import charger_prompt
from app.services.client_ia import ErreurIA
from app.services.limiteur import LimiteurDebit
from app.services.reponses_secours import GENERIQUE, PAR_ERREUR

UTILISATEURS = {
    "jeton_a": {"id": "11111111-1111-1111-1111-111111111111", "app_metadata": {"role": "eleve"}},
    "jeton_b": {"id": "22222222-2222-2222-2222-222222222222", "app_metadata": {"role": "eleve"}},
    "jeton_prof": {"id": "33333333-3333-3333-3333-333333333333", "app_metadata": {"role": "enseignant"}},
}


def faux_verificateur(jeton: str) -> dict:
    if jeton not in UTILISATEURS:
        raise ErreurApi(401, "non_authentifie", "Jeton absent ou invalide.")
    return UTILISATEURS[jeton]


class FauxClientIA:
    def __init__(self, texte="Pense à ralentir près de la fin.", erreur=False):
        self.texte = texte
        self.erreur = erreur
        self.appels = []

    def completer(self, systeme, message):
        self.appels.append((systeme, message))
        if self.erreur:
            raise ErreurIA("panne")
        return self.texte


client = TestClient(app, raise_server_exceptions=False)


@pytest.fixture(autouse=True)
def installer_overrides():
    app.dependency_overrides[fournir_verificateur] = lambda: faux_verificateur
    yield


def poser(corps, jeton="jeton_a", ia=None, limiteur=None):
    app.dependency_overrides[fournir_client_ia] = lambda: ia
    app.dependency_overrides[fournir_limiteur] = lambda: limiteur or LimiteurDebit()
    return client.post("/api/v1/assistant", json=corps, headers={"Authorization": f"Bearer {jeton}"})


def demande(**champs):
    base = {
        "experience_id": "titrage_acide_base",
        "tentative_id": str(uuid4()),
        "niveau_indice": 1,
        "message": "Pourquoi je dois ralentir ?",
        "historique": [],
        "etat_experience": {"volume_verse_ml": 15.2},
        "derniere_erreur": None,
    }
    base.update(champs)
    return base


def test_question_normale_repond_avec_l_ia():
    ia = FauxClientIA()
    reponse = poser(demande(), ia=ia)
    assert reponse.status_code == 200
    assert reponse.json() == {"reponse": "Pense à ralentir près de la fin.", "niveau_indice": 1, "source": "ia"}


def test_l_ia_recoit_seulement_les_champs_de_la_demande():
    ia = FauxClientIA()
    poser(
        demande(
            niveau_indice=2,
            derniere_erreur="debit_trop_rapide",
            historique=[{"role": "eleve", "contenu": "Bonjour"}, {"role": "assistant", "contenu": "Salut"}],
        ),
        ia=ia,
    )
    systeme, message = ia.appels[0]
    assert "ne donnes jamais la réponse finale" in systeme
    assert "Niveau d'indice demandé pour cette réponse : 2" in systeme
    assert "volume_verse_ml = 15.2" in message
    assert "Dernière erreur : debit_trop_rapide" in message
    assert "- eleve : Bonjour" in message and "- assistant : Salut" in message
    assert "Question de l'élève : Pourquoi je dois ralentir ?" in message
    assert "corrige" not in message.lower()


def test_sans_droit_enseignant_donne_403():
    reponse = poser(demande(), jeton="jeton_prof")
    assert reponse.status_code == 403
    assert reponse.json()["code"] == "interdit"


def test_sans_jeton_donne_401():
    reponse = client.post("/api/v1/assistant", json=demande())
    assert reponse.status_code == 401
    assert reponse.json()["code"] == "non_authentifie"


def test_donnees_invalides_donnent_422():
    cas = [
        demande(message="x" * 1001),
        demande(message="   "),
        demande(niveau_indice=4),
        demande(niveau_indice=0),
        demande(historique=[{"role": "eleve", "contenu": "a"}] * 7),
        demande(historique=[{"role": "pirate", "contenu": "a"}]),
        demande(derniere_erreur="code_inconnu"),
        demande(etat_experience={"corrige_exercice": 16.0}),
        demande(etat_experience={"Volume": 1}),
        demande(etat_experience={"liste": [1, 2]}),
        demande(etat_experience={f"champ_{i}": i for i in range(21)}),
        demande(tentative_id="pas-un-uuid"),
    ]
    for corps in cas:
        reponse = poser(corps, ia=FauxClientIA())
        assert reponse.status_code == 422, corps
        assert reponse.json()["code"] == "donnees_invalides"


def test_message_de_1000_caracteres_et_historique_de_6_passent():
    corps = demande(message="x" * 1000, historique=[{"role": "eleve", "contenu": "a"}] * 6)
    assert poser(corps, ia=FauxClientIA()).status_code == 200


def test_onzieme_question_dans_la_minute_donne_429():
    limiteur = LimiteurDebit()
    for _ in range(10):
        assert poser(demande(), ia=FauxClientIA(), limiteur=limiteur).status_code == 200
    reponse = poser(demande(), ia=FauxClientIA(), limiteur=limiteur)
    assert reponse.status_code == 429
    assert reponse.json()["code"] == "limite_depassee"
    # un autre eleve n'est pas touche
    assert poser(demande(), jeton="jeton_b", ia=FauxClientIA(), limiteur=limiteur).status_code == 200


def test_reponse_trop_longue_est_coupee_a_120_mots():
    long = " ".join(f"mot{i}" for i in range(300))
    reponse = poser(demande(), ia=FauxClientIA(texte=long))
    assert len(reponse.json()["reponse"].split()) == 120
    assert reponse.json()["source"] == "ia"


def test_panne_de_l_ia_donne_reponse_de_secours():
    reponse = poser(demande(derniere_erreur="debit_trop_rapide"), ia=FauxClientIA(erreur=True))
    assert reponse.status_code == 200
    assert reponse.json()["source"] == "regles"
    assert reponse.json()["reponse"] == PAR_ERREUR["debit_trop_rapide"]


def test_sans_ia_configuree_donne_reponse_de_secours_du_bon_niveau():
    reponse = poser(demande(niveau_indice=3), ia=None)
    assert reponse.json() == {"reponse": GENERIQUE[3], "niveau_indice": 3, "source": "regles"}


def test_reponse_vide_de_l_ia_donne_reponse_de_secours():
    reponse = poser(demande(), ia=FauxClientIA(texte="   "))
    assert reponse.json()["source"] == "regles"


def test_textes_en_francais_avec_accents_bien_lus():
    # Si ce test echoue, un fichier a ete enregistre avec un mauvais encodage.
    assert "élèves" in charger_prompt()
    assert "ménisque" in PAR_ERREUR["lecture_burette"]
    assert len([l for l in charger_prompt().splitlines() if l[:2] in {f"{i}." for i in range(1, 9)}]) == 8
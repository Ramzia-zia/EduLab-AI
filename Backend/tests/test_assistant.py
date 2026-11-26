from tests.conftest import EXPERIENCE_ID, entetes, nouvel_uuid, verifier_erreur


def question(**surcharge):
    return {"experience_id": EXPERIENCE_ID, "message": "Je ne comprends pas le virage.", **surcharge}


def poser(client, **surcharge):
    return client.post("/assistant/question", json=question(**surcharge), headers=entetes("eleve"))


def test_question_normale(client, ia, base):
    r = poser(
        client,
        niveau_indice=2,
        etat_experience={"volume_verse_ml": 12.5},
        derniere_erreur="burette_non_rincee",
        historique=[{"role": "eleve", "contenu": "Bonjour"}, {"role": "assistant", "contenu": "Salut !"}],
    )
    assert r.status_code == 200, r.text
    assert r.json()["niveau_indice"] == 2
    systeme, messages = ia.appels[0]
    assert "Dosage acide-base" in systeme and "12.5" in systeme and "burette_non_rincee" in systeme
    assert [m["role"] for m in messages] == ["user", "assistant", "user"]


def test_le_corrige_n_est_jamais_lu_ni_envoye(client, ia, base):
    poser(client)
    assert "corrige_experience" not in base.tables_lues()
    assert all("select" not in p or p["select"] != "*" for (a, _, p) in base.appels if a == "select")
    systeme, messages = ia.appels[0]
    assert "CORRIGE_SECRET" not in systeme + str(messages)


def test_reponse_limitee_a_120_mots(client, ia):
    ia.reponse = " ".join(f"mot{i}" for i in range(300))
    texte = poser(client).json()["reponse"]
    assert len(texte.replace("…", "").split()) == 120


def test_sans_droit_403(client):
    r = client.post("/assistant/question", json=question(), headers=entetes("enseignant"))
    verifier_erreur(r, 403, "acces_refuse")


def test_message_trop_long_422(client):
    verifier_erreur(poser(client, message="a" * 1001), 422, "donnees_invalides")


def test_message_1000_caracteres_accepte(client):
    assert poser(client, message="a" * 1000).status_code == 200


def test_message_vide_422(client):
    verifier_erreur(poser(client, message="   "), 422, "donnees_invalides")


def test_historique_de_7_messages_422(client):
    historique = [{"role": "eleve", "contenu": "x"}] * 7
    verifier_erreur(poser(client, historique=historique), 422, "donnees_invalides")


def test_niveau_indice_invalide_422(client):
    verifier_erreur(poser(client, niveau_indice=4), 422, "donnees_invalides")


def test_experience_inconnue_404(client):
    verifier_erreur(poser(client, experience_id=nouvel_uuid()), 404, "introuvable")


def test_limite_de_10_questions_par_minute_429(client):
    for _ in range(10):
        assert poser(client).status_code == 200
    r = poser(client)
    corps = verifier_erreur(r, 429, "limite_atteinte")
    assert 1 <= corps["details"]["reessayer_dans_s"] <= 60
    assert r.headers["retry-after"] == str(corps["details"]["reessayer_dans_s"])


def test_requetes_invalides_ne_comptent_pas_dans_la_limite(client):
    for _ in range(15):
        poser(client, message="")
    assert poser(client).status_code == 200


def test_ia_en_panne_503(client, ia):
    ia.panne = True
    verifier_erreur(poser(client), 503, "assistant_indisponible")

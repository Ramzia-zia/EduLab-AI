from uuid import uuid4

from fastapi.testclient import TestClient

from app.auth import fournir_verificateur
from app.erreurs import ErreurApi
from app.main import app
from app.routers.tentatives import fournir_depot_sync
from app.services.synchronisation import DoublonDepot

ELEVE_A = "11111111-1111-1111-1111-111111111111"
ELEVE_B = "22222222-2222-2222-2222-222222222222"

UTILISATEURS = {
    "jeton_a": {"id": ELEVE_A, "app_metadata": {"role": "eleve"}},
    "jeton_b": {"id": ELEVE_B, "app_metadata": {"role": "eleve"}},
    "jeton_prof": {"id": "33333333-3333-3333-3333-333333333333", "app_metadata": {"role": "enseignant"}},
}


def faux_verificateur(jeton: str) -> dict:
    if jeton not in UTILISATEURS:
        raise ErreurApi(401, "non_authentifie", "Jeton absent ou invalide.")
    return UTILISATEURS[jeton]


class DepotMemoire:
    """Faux depot : meme comportement que Supabase avec RLS (chaque eleve ne voit que ses lignes)."""

    def __init__(self):
        self.tentatives = {}  # id -> dict
        self.evenements = {}  # id -> dict
        self.utilisateur = None

    def _visible(self, ligne):
        return ligne["profil_id"] == self.utilisateur

    def lire_tentative(self, tentative_id):
        ligne = self.tentatives.get(str(tentative_id))
        return dict(ligne) if ligne and self._visible(ligne) else None

    def creer_tentative(self, profil_id, tentative):
        if str(tentative.id) in self.tentatives:
            raise DoublonDepot()
        self.tentatives[str(tentative.id)] = {
            "profil_id": profil_id,
            "statut": tentative.statut,
            "score": tentative.score,
        }

    def mettre_a_jour_tentative(self, tentative):
        self.tentatives[str(tentative.id)].update(statut=tentative.statut, score=tentative.score)

    def evenement_existe(self, evenement_id):
        ligne = self.evenements.get(str(evenement_id))
        return bool(ligne and ligne["profil_id"] == self.utilisateur)

    def rang_pris(self, tentative_id, rang):
        return any(
            e["tentative_id"] == str(tentative_id) and e["rang"] == rang
            for e in self.evenements.values()
        )

    def creer_evenement(self, evenement):
        if str(evenement.id) in self.evenements:
            raise DoublonDepot()
        self.evenements[str(evenement.id)] = {
            "tentative_id": str(evenement.tentative_id),
            "rang": evenement.rang,
            "profil_id": self.utilisateur,
        }


depot = DepotMemoire()


def fournir_faux_depot(request=None):
    return depot


def installer(jeton_utilisateur_id):
    depot.utilisateur = jeton_utilisateur_id
    return depot


app.dependency_overrides[fournir_verificateur] = lambda: faux_verificateur
app.dependency_overrides[fournir_depot_sync] = fournir_faux_depot
client = TestClient(app, raise_server_exceptions=False)


def nouveau_depot():
    depot.tentatives.clear()
    depot.evenements.clear()


def envoyer(corps, jeton="jeton_a"):
    installer(UTILISATEURS[jeton]["id"] if jeton in UTILISATEURS else None)
    return client.post(
        "/api/v1/tentatives/sync", json=corps, headers={"Authorization": f"Bearer {jeton}"}
    )


def tentative(id_=None, **champs):
    base = {
        "id": id_ or str(uuid4()),
        "experience_id": "titrage_acide_base",
        "version_experience": 1,
        "debut": "2026-11-08T07:30:00Z",
        "fin": None,
        "statut": "en_cours",
        "score": None,
        "resultat": None,
    }
    base.update(champs)
    return base


def evenement(tentative_id, rang=1, id_=None, action="placer_materiel"):
    return {
        "id": id_ or str(uuid4()),
        "tentative_id": tentative_id,
        "rang": rang,
        "horodatage": "2026-11-08T07:30:05Z",
        "action": action,
        "valeurs": {"materiel_id": "lunettes"},
    }


def test_lot_normal_est_accepte():
    nouveau_depot()
    t = tentative()
    e = evenement(t["id"])
    reponse = envoyer({"tentatives": [t], "evenements": [e]})
    assert reponse.status_code == 200
    assert reponse.json() == {
        "resultats": [
            {"id": t["id"], "type": "tentative", "statut": "accepte"},
            {"id": e["id"], "type": "evenement", "statut": "accepte"},
        ]
    }


def test_evenement_deja_recu_n_est_pas_ecrit_deux_fois():
    nouveau_depot()
    t = tentative()
    e = evenement(t["id"])
    envoyer({"tentatives": [t], "evenements": [e]})
    reponse = envoyer({"tentatives": [], "evenements": [e]})
    assert reponse.json()["resultats"][0]["statut"] == "deja_recu"
    assert len(depot.evenements) == 1


def test_tentative_non_terminee_est_mise_a_jour_puis_deja_recue():
    nouveau_depot()
    t = tentative()
    envoyer({"tentatives": [t], "evenements": []})
    terminee = dict(t, statut="terminee", fin="2026-11-08T07:45:00Z", score=82, resultat={"volume_equivalent_ml": 16.0})
    r1 = envoyer({"tentatives": [terminee], "evenements": []})
    assert r1.json()["resultats"][0]["statut"] == "accepte"
    assert depot.tentatives[t["id"]]["statut"] == "terminee"
    r2 = envoyer({"tentatives": [terminee], "evenements": []})
    assert r2.json()["resultats"][0]["statut"] == "deja_recu"


def test_sans_droit_enseignant_donne_403():
    reponse = envoyer({"tentatives": [], "evenements": []}, jeton="jeton_prof")
    assert reponse.status_code == 403
    assert reponse.json()["code"] == "interdit"


def test_sans_jeton_donne_401():
    reponse = client.post("/api/v1/tentatives/sync", json={"tentatives": [], "evenements": []})
    assert reponse.status_code == 401
    assert reponse.json()["code"] == "non_authentifie"


def test_plus_de_50_elements_donne_422():
    nouveau_depot()
    t = tentative()
    evenements = [evenement(t["id"], rang=i + 1) for i in range(50)]
    reponse = envoyer({"tentatives": [t], "evenements": evenements})
    assert reponse.status_code == 422
    assert reponse.json()["code"] == "donnees_invalides"


def test_exactement_50_elements_passe():
    nouveau_depot()
    t = tentative()
    evenements = [evenement(t["id"], rang=i + 1) for i in range(49)]
    reponse = envoyer({"tentatives": [t], "evenements": evenements})
    assert reponse.status_code == 200
    assert len(reponse.json()["resultats"]) == 50


def test_donnees_invalides_donnent_422():
    reponse = envoyer({"tentatives": [tentative(statut="nimporte_quoi")], "evenements": []})
    assert reponse.status_code == 422
    assert reponse.json()["code"] == "donnees_invalides"
    reponse = envoyer({"tentatives": [tentative(id_="pas-un-uuid")], "evenements": []})
    assert reponse.status_code == 422


def test_action_inconnue_est_refusee():
    nouveau_depot()
    t = tentative()
    envoyer({"tentatives": [t], "evenements": []})
    reponse = envoyer({"tentatives": [], "evenements": [evenement(t["id"], action="pirater")]})
    resultat = reponse.json()["resultats"][0]
    assert resultat["type"] == "evenement"
    assert resultat["statut"] == "refuse"
    assert resultat["code"] == "donnees_invalides"


def test_evenement_sur_tentative_inconnue_est_refuse():
    nouveau_depot()
    reponse = envoyer({"tentatives": [], "evenements": [evenement(str(uuid4()))]})
    assert reponse.json()["resultats"][0]["code"] == "introuvable"


def test_un_eleve_ne_peut_pas_ecrire_dans_la_tentative_d_un_autre():
    nouveau_depot()
    t = tentative()
    envoyer({"tentatives": [t], "evenements": []}, jeton="jeton_a")
    # B tente de reprendre l'identifiant de la tentative de A, puis d'y ajouter un evenement
    r1 = envoyer({"tentatives": [t], "evenements": []}, jeton="jeton_b")
    assert r1.json()["resultats"][0] == {"id": t["id"], "type": "tentative", "statut": "refuse", "code": "interdit"}
    r2 = envoyer({"tentatives": [], "evenements": [evenement(t["id"])]}, jeton="jeton_b")
    assert r2.json()["resultats"][0]["code"] == "introuvable"  # RLS : la ligne n'est meme pas visible
    assert len(depot.evenements) == 0


def test_rang_deja_pris_est_en_conflit():
    nouveau_depot()
    t = tentative()
    envoyer({"tentatives": [t], "evenements": [evenement(t["id"], rang=1)]})
    reponse = envoyer({"tentatives": [], "evenements": [evenement(t["id"], rang=1)]})
    assert reponse.json()["resultats"][0]["code"] == "conflit"


def test_tentative_terminee_sans_score_est_refusee():
    nouveau_depot()
    t = tentative(statut="terminee", fin="2026-11-08T07:45:00Z", score=None)
    reponse = envoyer({"tentatives": [t], "evenements": []})
    assert reponse.json()["resultats"][0]["code"] == "donnees_invalides"
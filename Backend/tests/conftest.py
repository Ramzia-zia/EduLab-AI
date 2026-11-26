"""Outils de test : une fausse base en mémoire et une fausse IA (aucun réseau).

Important : la fausse base NE simule PAS les règles RLS. Elles sont testées pour de vrai,
sur PostgreSQL, dans tests/rls/.
"""
import uuid
from typing import Any

import pytest
from fastapi.testclient import TestClient

from app.dependances import get_db, get_fournisseur_ia, get_limiteur
from app.erreurs import ErreurApi
from app.main import creer_app
from app.services.limiteur import LimiteurDebit

ETAB = "00000000-0000-4000-8000-0000000000e1"
UTILISATEURS = {
    "eleve": "10000000-0000-4000-8000-000000000001",
    "enseignant": "10000000-0000-4000-8000-000000000002",
    "etablissement": "10000000-0000-4000-8000-000000000003",
    "ministere": "10000000-0000-4000-8000-000000000004",
}
EXPERIENCE_ID = "20000000-0000-4000-8000-000000000001"
CLASSE_ID = "30000000-0000-4000-8000-000000000001"
TENTATIVE_ID = "40000000-0000-4000-8000-000000000001"


def nouvel_uuid() -> str:
    return str(uuid.uuid4())


def entetes(role: str) -> dict[str, str]:
    return {"Authorization": f"Bearer jeton_{role}"}


class FausseBase:
    def __init__(self) -> None:
        self.tables: dict[str, list[dict[str, Any]]] = {}
        self.jetons: dict[str, dict[str, Any]] = {}
        self.appels: list[tuple[str, str, Any]] = []

    def ajouter(self, table: str, *lignes: dict[str, Any]) -> None:
        self.tables.setdefault(table, []).extend(dict(ligne) for ligne in lignes)

    async def utilisateur(self, jeton: str):
        return self.jetons.get(jeton)

    @staticmethod
    def _correspond(ligne: dict[str, Any], params: dict[str, str]) -> bool:
        for champ, filtre in params.items():
            if champ in ("select", "order", "limit", "offset"):
                continue
            operateur, _, valeur = filtre.partition(".")
            if operateur == "eq" and str(ligne.get(champ)) != valeur:
                return False
            if operateur == "in" and str(ligne.get(champ)) not in valeur.strip("()").split(","):
                return False
        return True

    async def select(self, jeton: str, table: str, params: dict[str, str]):
        self.appels.append(("select", table, dict(params)))
        lignes = [ligne for ligne in self.tables.get(table, []) if self._correspond(ligne, params)]
        if "order" in params:
            champ, _, sens = params["order"].split(",")[0].partition(".")
            lignes.sort(key=lambda ligne: str(ligne.get(champ)), reverse=(sens == "desc"))
        debut = int(params.get("offset", 0))
        fin = debut + int(params["limit"]) if "limit" in params else None
        lignes = lignes[debut:fin]
        colonnes = params.get("select", "*")
        if colonnes != "*":
            voulues = colonnes.split(",")
            lignes = [{c: ligne.get(c) for c in voulues} for ligne in lignes]
        return [dict(ligne) for ligne in lignes]

    async def insert(self, jeton, table, lignes, *, ignorer_doublons=False, cle_unique="id"):
        self.appels.append(("insert", table, lignes))
        inseres = []
        for ligne in lignes:
            existe = any(x[cle_unique] == ligne[cle_unique] for x in self.tables.get(table, []))
            if existe and not ignorer_doublons:
                raise ErreurApi(409, "conflit", "doublon")
            if existe:
                continue
            self.tables.setdefault(table, []).append(dict(ligne))
            inseres.append(dict(ligne))
        return inseres

    def tables_lues(self) -> set[str]:
        return {table for (action, table, _) in self.appels if action == "select"}


class FausseIA:
    def __init__(self) -> None:
        self.reponse = "Regarde la couleur de la solution. Que se passe-t-il quand tu ajoutes une goutte ?"
        self.panne = False
        self.appels: list[tuple[str, list[dict[str, str]]]] = []

    async def repondre(self, systeme: str, messages: list[dict[str, str]]) -> str:
        self.appels.append((systeme, messages))
        if self.panne:
            raise ErreurApi(503, "assistant_indisponible", "panne simulée")
        return self.reponse


@pytest.fixture
def base() -> FausseBase:
    b = FausseBase()
    for role, uid in UTILISATEURS.items():
        b.jetons[f"jeton_{role}"] = {"id": uid}
        b.ajouter(
            "profil",
            {
                "id": uid,
                "role": role,
                "etablissement_id": None if role == "ministere" else ETAB,
                "nom_complet": role,
            },
        )
    b.ajouter("etablissement", {"id": ETAB, "nom": "Lycée de test", "actif": True})
    b.ajouter(
        "experience",
        {
            "id": EXPERIENCE_ID,
            "matiere": "chimie",
            "titre": "Dosage acide-base",
            "niveau": "terminale",
            "version": 1,
            "parametres": {"volume_ml": 20},
        },
    )
    # Le corrigé vit dans une table à part : le serveur ne doit jamais la lire.
    b.ajouter("corrige_experience", {"experience_id": EXPERIENCE_ID, "contenu": {"reponse": "CORRIGE_SECRET_0,10"}})
    return b


@pytest.fixture
def ia() -> FausseIA:
    return FausseIA()


@pytest.fixture
def client(base: FausseBase, ia: FausseIA) -> TestClient:
    app = creer_app()
    app.dependency_overrides[get_db] = lambda: base
    app.dependency_overrides[get_fournisseur_ia] = lambda: ia
    limiteur = LimiteurDebit(maximum=10, fenetre_s=60.0)
    app.dependency_overrides[get_limiteur] = lambda: limiteur
    return TestClient(app)


def verifier_erreur(reponse, statut: int, code: str) -> dict:
    assert reponse.status_code == statut, reponse.text
    corps = reponse.json()
    assert set(corps) == {"code", "message", "details"}
    assert corps["code"] == code
    return corps


@pytest.fixture
def anyio_backend():
    return "asyncio"


def pytest_terminal_summary(terminalreporter):
    import os

    if not os.environ.get("RLS_DATABASE_URL"):
        terminalreporter.write_line(
            "ATTENTION : les règles RLS n'ont PAS été testées (variable RLS_DATABASE_URL absente).", yellow=True
        )

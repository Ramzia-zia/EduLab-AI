"""Teste les règles RLS de supabase/migrations/*.sql sur un VRAI PostgreSQL.

Lancement : définir RLS_DATABASE_URL (superutilisateur d'un serveur PostgreSQL de test), ex.
  RLS_DATABASE_URL=postgresql://postgres:motdepasse@127.0.0.1:5432/postgres
Une base jetable est créée puis supprimée. Sans cette variable, ces tests sont ignorés (et le disent).
"""
import os
import shutil
import subprocess
import uuid
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

import pytest

URL_ADMIN = os.environ.get("RLS_DATABASE_URL")
RACINE = Path(__file__).resolve().parents[3]
DOSSIER = Path(__file__).resolve().parent

pytestmark = pytest.mark.skipif(
    not URL_ADMIN or not shutil.which("psql"),
    reason="RLS NON TESTE : définir RLS_DATABASE_URL (PostgreSQL de test) et installer psql",
)

U = {n: f"00000000-0000-4000-8000-0000000000{i:02d}" for i, n in
     enumerate(["e1", "e2", "e3", "p1", "p2", "chefA", "chefB", "m"], start=1)}
C1, C2 = "c1c1c1c1-0000-4000-8000-000000000001", "c2c2c2c2-0000-4000-8000-000000000001"
EXP = "eeeeeeee-0000-4000-8000-000000000001"
T1, T2 = "f1f1f1f1-0000-4000-8000-000000000001", "f2f2f2f2-0000-4000-8000-000000000001"
EV1 = "a1a1a1a1-0000-4000-8000-000000000001"


def _psql(url: str, sql: str) -> subprocess.CompletedProcess:
    return subprocess.run(
        ["psql", url, "-X", "-q", "-tA", "-v", "ON_ERROR_STOP=1"], input=sql, text=True, capture_output=True
    )


def _fichier(url: str, chemin: Path) -> None:
    r = subprocess.run(["psql", url, "-X", "-q", "-v", "ON_ERROR_STOP=1", "-f", str(chemin)], capture_output=True, text=True)
    assert r.returncode == 0, f"{chemin.name} : {r.stderr}"


@pytest.fixture(scope="module")
def url():
    nom = f"edulab_rls_{uuid.uuid4().hex[:8]}"
    r = _psql(URL_ADMIN, f"create database {nom};")
    assert r.returncode == 0, r.stderr
    parties = urlsplit(URL_ADMIN)
    url_base = urlunsplit(parties._replace(path=f"/{nom}"))
    try:
        _fichier(url_base, DOSSIER / "bootstrap_supabase.sql")
        for migration in sorted((RACINE / "supabase" / "migrations").glob("*.sql")):
            _fichier(url_base, migration)
        _fichier(url_base, DOSSIER / "donnees_test.sql")
        yield url_base
    finally:
        _psql(URL_ADMIN, f"drop database if exists {nom} with (force);")


def executer(url, qui, sql):
    """Exécute `sql` comme l'utilisateur `qui` (clé de U) ou comme anon (None), puis annule tout."""
    role = "authenticated" if qui else "anon"
    sub = f"set local request.jwt.claim.sub = '{U[qui]}';" if qui else ""
    return _psql(url, f"begin; set local role {role}; {sub} {sql}; rollback;")


def lire(url, qui, sql) -> str:
    r = executer(url, qui, sql)
    assert r.returncode == 0, r.stderr
    return r.stdout.strip()


def refuse(url, qui, sql) -> bool:
    r = executer(url, qui, sql)
    return r.returncode != 0 and ("row-level security" in r.stderr or "permission denied" in r.stderr)


def ids(table, colonne="id"):
    return f"select string_agg(left({colonne}::text, 2), ',' order by {colonne}) from public.{table}"


# ------------------------------------------------------------------ lecture
@pytest.mark.parametrize(
    "qui, attendu",
    [("e1", "f1"), ("e2", "f2"), ("e3", "f3"), ("p1", "f1"), ("p2", ""),
     ("chefA", "f1"), ("chefB", ""), ("m", "")],
)
def test_tentatives_visibles(url, qui, attendu):
    assert lire(url, qui, ids("tentative")) == attendu


@pytest.mark.parametrize(
    "qui, attendu",
    [("e1", "c1"), ("e2", ""), ("e3", ""), ("p1", "c1"), ("p2", "c2"),
     ("chefA", "c1,c2"), ("chefB", ""), ("m", "")],
)
def test_classes_visibles(url, qui, attendu):
    assert lire(url, qui, ids("classe")) == attendu


@pytest.mark.parametrize(
    "qui, attendu",
    [("e1", "a1"), ("e2", "a2"), ("e3", ""), ("p1", "a1"), ("p2", ""), ("chefA", "a1"), ("chefB", ""), ("m", "")],
)
def test_evenements_visibles(url, qui, attendu):
    assert lire(url, qui, ids("evenement_tentative")) == attendu


@pytest.mark.parametrize("qui, attendu", [("e1", "1"), ("e2", "0"), ("p1", "1"), ("p2", "0"), ("chefA", "1"), ("m", "0")])
def test_inscriptions_visibles(url, qui, attendu):
    assert lire(url, qui, "select count(*) from public.inscription") == attendu


@pytest.mark.parametrize("qui, attendu", [("e1", "1"), ("e3", "1"), ("p1", "1"), ("chefA", "5"), ("chefB", "2"), ("m", "1")])
def test_profils_visibles(url, qui, attendu):
    assert lire(url, qui, "select count(*) from public.profil") == attendu


@pytest.mark.parametrize("qui, attendu", [("e1", "0"), ("e2", "0"), ("p1", "1"), ("chefA", "0"), ("m", "0")])
def test_corrige_lisible_par_enseignant_seulement(url, qui, attendu):
    assert lire(url, qui, "select count(*) from public.corrige_experience") == attendu


@pytest.mark.parametrize("qui", ["e1", "p1", "chefA", "m"])
def test_experiences_visibles_par_tous_les_roles(url, qui):
    assert lire(url, qui, "select count(*) from public.experience") == "1"


def test_anon_ne_lit_rien(url):
    for table in ("tentative", "experience", "profil", "corrige_experience", "vue_stats_ministere"):
        assert refuse(url, None, f"select * from public.{table}"), table


# ------------------------------------------------------------------ vues agrégées
@pytest.mark.parametrize(
    "qui, attendu",
    [("chefA", "2"), ("chefB", "1"), ("e1", ""), ("p1", ""), ("m", "")],
)
def test_vue_stats_etablissement(url, qui, attendu):
    assert lire(url, qui, "select string_agg(nombre_tentatives::text, ',') from public.vue_stats_etablissement") == attendu


@pytest.mark.parametrize(
    "qui, attendu",
    [("m", "Lycée A:2,Lycée B:1"), ("chefA", ""), ("p1", ""), ("e1", "")],
)
def test_vue_stats_ministere(url, qui, attendu):
    sql = "select string_agg(nom_etablissement || ':' || nombre_tentatives, ',' order by nom_etablissement) from public.vue_stats_ministere"
    assert lire(url, qui, sql) == attendu


def test_le_ministere_ne_lit_aucune_table_d_eleves(url):
    for table in ("tentative", "evenement_tentative", "inscription", "classe"):
        assert lire(url, "m", f"select count(*) from public.{table}") == "0", table


# ------------------------------------------------------------------ écriture
def nouvelle_tentative(eleve, classe="null", ident="d0d0d0d0-0000-4000-8000-000000000001"):
    cl = f"'{classe}'" if classe != "null" else "null"
    return (f"insert into public.tentative (id, eleve_id, experience_id, classe_id, debut_le) "
            f"values ('{ident}', '{U[eleve]}', '{EXP}', {cl}, now())")


def test_eleve_cree_sa_tentative(url):
    assert not refuse(url, "e1", nouvelle_tentative("e1"))
    assert executer(url, "e1", nouvelle_tentative("e1")).returncode == 0


def test_eleve_cree_une_tentative_dans_sa_classe(url):
    assert executer(url, "e1", nouvelle_tentative("e1", C1)).returncode == 0


def test_eleve_ne_cree_pas_une_tentative_pour_un_autre(url):
    assert refuse(url, "e1", nouvelle_tentative("e2"))


def test_eleve_non_inscrit_ne_peut_pas_utiliser_la_classe(url):
    assert refuse(url, "e2", nouvelle_tentative("e2", C1))


@pytest.mark.parametrize("qui", ["p1", "chefA", "m"])
def test_les_autres_roles_ne_creent_pas_de_tentative(url, qui):
    assert refuse(url, qui, nouvelle_tentative(qui))


def evenement(tentative, ident="d1d1d1d1-0000-4000-8000-000000000001"):
    return (f"insert into public.evenement_tentative (id, tentative_id, type, survenu_le) "
            f"values ('{ident}', '{tentative}', 'mesure', now())")


def test_eleve_ajoute_un_evenement_a_sa_tentative(url):
    assert executer(url, "e1", evenement(T1)).returncode == 0


def test_eleve_ne_peut_pas_ecrire_dans_la_tentative_d_un_autre(url):
    assert refuse(url, "e1", evenement(T2))


@pytest.mark.parametrize("qui", ["p1", "chefA", "m"])
def test_les_autres_roles_n_ajoutent_pas_d_evenement(url, qui):
    assert refuse(url, qui, evenement(T1))


def test_evenement_deja_recu_est_ignore_sans_erreur(url):
    sql = (f"insert into public.evenement_tentative (id, tentative_id, type, survenu_le) "
           f"values ('{EV1}', '{T1}', 'mesure', now()) on conflict (id) do nothing returning id")
    assert lire(url, "e1", sql) == ""


def test_aucune_modification_ni_suppression_possible(url):
    assert refuse(url, "e1", f"update public.tentative set score = 100 where id = '{T1}'")
    assert refuse(url, "e1", f"delete from public.evenement_tentative where id = '{EV1}'")
    assert refuse(url, "p1", f"update public.classe set nom = 'x' where id = '{C1}'")


def test_personne_n_ecrit_le_corrige(url):
    for qui in ("e1", "p1", "chefA", "m"):
        assert refuse(url, qui, f"insert into public.corrige_experience values ('{EXP}', '{{}}')"), qui

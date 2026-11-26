# Serveur EduLab AI (FastAPI)

## Lancer
    cd backend
    pip install -r requirements-dev.txt
    cp .env.example .env      # puis remplir (ne jamais commiter .env)
    export $(grep -v '^#' .env | xargs)
    python -m uvicorn app.main:app --reload
Documentation interactive : http://localhost:8000/docs

## Assistant Gemini
Créer une clé API dans [Google AI Studio](https://aistudio.google.com/apikey),
puis la définir dans `GEMINI_API_KEY` dans le `.env` du backend. Le modèle par
défaut est `gemini-3.5-flash-lite`, accessible dans le niveau gratuit selon les
quotas et les disponibilités de Google ; `GEMINI_MODEL` permet de le remplacer.
La clé doit rester côté serveur et ne jamais être ajoutée au frontend.
Le niveau gratuit peut utiliser les contenus soumis pour améliorer les produits
Google : ne transmettez pas de données personnelles ou sensibles d'élèves.

## Préparer Supabase
Dans le SQL Editor de Supabase, exécuter une seule fois
[`20261125140000_schema_rls.sql`](../supabase/migrations/20261125140000_schema_rls.sql).
Le script crée les tables, les règles RLS et les vues statistiques utilisées par l'API.
Il publie aussi les dix définitions de `Simulations/packages/labo_core` dans
`public.experience`, avec leurs règles de sécurité et conseils, et réserve
`tentative.resultat` aux comptes rendus des simulations.
Créer ensuite chaque utilisateur dans Supabase Auth, puis enregistrer son profil.
Exemple pour un responsable d'établissement (remplacer les valeurs) :

```sql
insert into public.etablissement (id, nom, commune, region)
values ('<uuid-etablissement>', 'Lycée Exemple', 'Lomé', 'Maritime');

insert into public.profil (id, role, etablissement_id, nom_complet)
select id, 'etablissement', '<uuid-etablissement>', 'Nom du responsable'
from auth.users
where email = 'responsable@example.tg';
```

Les autres rôles valides sont `eleve`, `enseignant` et `ministere` (ce dernier
doit avoir `etablissement_id = null`). Le profil doit être inséré par un
administrateur de base de données, jamais depuis le client public.
Ne jamais placer la clé `service_role` dans Flutter : le serveur vérifie le jeton
utilisateur et les politiques RLS restent actives.
En production, définir `CORS_ORIGINES` dans `.env` avec les origines exactes du
back-office et du mobile web (séparées par des virgules).

## Vérifier : une seule commande
    make check
Lance les tests et vérifie que `openapi.json` est à jour (sinon : `make openapi`).

## Tester les règles RLS (obligatoire avant de livrer une migration)
Il faut un PostgreSQL de test (superutilisateur) et le programme `psql` :
    RLS_DATABASE_URL=postgresql://postgres:motdepasse@127.0.0.1:5432/postgres make check
Une base jetable est créée puis supprimée. Sans cette variable, `make check` affiche un avertissement.

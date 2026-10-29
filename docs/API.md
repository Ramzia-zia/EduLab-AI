# Contrat d'API attendu par le front-end

> ⚠ **Ce sont des HYPOTHÈSES.** Les routes réelles ne sont pas encore définies. Elles sont toutes centralisées dans
> `js/services/endpoints.js` : il suffit de corriger ce fichier (et les formes de réponse ci-dessous si besoin).
> Adresse de base (exemple) : `http://localhost:3000/api` (réglée dans `js/config.js`).

## Règles générales
- Échanges en **JSON**. Erreurs : code HTTP adapté et, si possible, `{ "message": "texte lisible en français" }`.
- **Session** : le front suppose un **cookie `httpOnly`** posé par le backend (`credentials: 'include'`), donc le
  JavaScript ne manipule jamais le jeton. Si l'équipe choisit un autre mécanisme (ex. en-tête `Authorization`), seul
  `js/services/api-client.js` est à adapter.
- **Le rôle vient du serveur** (`GET /me`). Le backend doit **lui-même** vérifier sessions, rôles et autorisations :
  les protections du front ne servent qu'à l'affichage.
- **CORS** : le backend doit autoriser l'origine du front et les cookies (`Access-Control-Allow-Credentials`).
- Le front ne se connecte **jamais** directement à PostgreSQL.

## Routes

| Fonction | Méthode et route (hypothèse) | Envoi | Réponse attendue |
|---|---|---|---|
| Connexion | `POST /auth/login` | `{ email, password, role, remember }` | 200 + cookie de session |
| Inscription | `POST /auth/register` | `{ role, firstName, lastName, email, password, level?, school?, acceptTerms }` | 201 + cookie de session |
| Déconnexion | `POST /auth/logout` | — | 204 |
| Mot de passe oublié | `POST /auth/forgot-password` | `{ email }` | 204 (même réponse si l'adresse n'existe pas) |
| Profil | `GET /me` | — | `{ id, firstName, lastName, email, role: "student"\|"teacher", level? }` |
| Modifier le profil | `PATCH /me` | `{ firstName, lastName, email }` | profil mis à jour |
| Changer le mot de passe | `POST /me/password` | `{ currentPassword, newPassword }` | 204 |
| Exporter mes données | `GET /me/export` | — | JSON (ou fichier) |
| Tableau de bord élève | `GET /me/dashboard` | — | `{ simulationsDone, simulationsTotal, levelLabel, levelSubject, progressPercent, nextActivity:{simulationId,title}\|null, subjects:[{subject,count}], recent:[Result], quote }` |
| Suivi | `GET /me/progress` | — | `{ globalPercent, bySubject:[{subject,percent}], scoreEvolution:[{label,score}], completed:[Result], history:[Result] }` |
| Catalogue | `GET /simulations` | — | `[{ id, title, subject, level, durationMin, description, objectives:[], available }]` |
| Détail simulation | `GET /simulations/:id` | — | une simulation (même forme) |
| Enregistrer un résultat | `POST /simulations/:id/results` | `{ simulationId, score, measures:[{label,value,unit}], durationSec }` | 201 |
| Cours et exercices | `GET /courses` | — | `{ courses:[...], exercises:[...], resources:[...] }` (formes : voir `js/data/demo-data.js`) |
| Assistant IA | `POST /assistant/messages` | `{ message, intent: "question"\|"explain"\|"hint"\|"restart", simulationId? }` | `{ role:"assistant", content }` |
| Discussions | `GET /community/posts?q=&category=&sort=` | — | `[{ id, category, title, body, author, createdAt, likes, repliesCount? }]` |
| Publier | `POST /community/posts` | `{ title, body, category }` | la discussion créée |
| Réponses | `GET /community/posts/:id/replies` · `POST` | `{ body }` | `[{ id, postId, author, body, createdAt }]` |
| Espace enseignant | `GET /teacher/overview` | — | `{ classes:[{id,name}], students:[{id,name,classId,averageScore,progress,subject}], activities:[{id,title,simulationId,classId,dueDate}], difficulties:[{topic,studentsAffected}] }` |
| Détail élève | `GET /teacher/students/:id` | — | élève + `email` + `results:[Result]` |
| Activités | `POST /teacher/activities` · `PUT/DELETE /teacher/activities/:id` | `{ title, simulationId, classId, dueDate }` | l'activité |

`Result` = `{ id, simulationId, title, subject, score, date }` (date ISO 8601).

## Pour remplacer les données fictives
1. Mettre `MODE: 'api'` dans `js/config.js`.
2. Corriger `js/services/endpoints.js` selon les vraies routes.
3. Si une réponse n'a pas la forme ci-dessus, adapter **uniquement** la fonction du service concerné.
4. Signaler à l'équipe front-end toute route manquante : ne pas inventer de données.

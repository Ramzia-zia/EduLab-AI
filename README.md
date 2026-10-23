# EduLab AI  : backend, IA et mode hors ligne

Ce dossier contient tout le travail de la **Personne 3** :

| Livrable demandé | Où le trouver |
|---|---|
| Base de données des cours, exercices et résultats | `supabase/migrations/…_initial_schema.sql` + `supabase/seed.sql` |
| Comptes élèves et enseignants, classes | Supabase Auth + tables `profiles`, `classes`, `class_members` (règles RLS) |
| Assistant IA qui explique et donne des indices | `server/src/ai/` et `server/src/services/assistantService.js` |
| Sauvegarde locale + synchronisation des résultats | `client/src/storage/`, `client/src/results/`, `client/src/sync/` |
| Fonctionnement hors ligne | `client/public/sw.js` + contenu en IndexedDB + FAQ locale de l'assistant |

```
Élève (navigateur / téléphone)                       Serveur Node                 Supabase
┌───────────────────────────────┐   HTTPS + JWT    ┌─────────────────┐   JWT    ┌─────────────┐
│ Interface (Personne 1 et 2)   │ ───────────────► │ /api/content    │ ───────► │ PostgreSQL  │
│        │                      │                  │ /api/sync       │          │ + RLS       │
│ client/ (couche de données)   │                  │ /api/classes    │          │ + Auth      │
│  ├─ IndexedDB (contenu,       │                  │ /api/assistant ─┼─► API d'IA          └─────────────┘
│  │   résultats, FAQ)          │                  └─────────────────┘
│  ├─ file de synchronisation   │
│  └─ service worker (coque)    │
└───────────────────────────────┘
```

**Idée directrice : hors ligne d'abord.** L'élève travaille toujours sur des données
locales. Le réseau sert seulement à envoyer les résultats et à recevoir du nouveau contenu.

---

## 1. Mise en route

Prérequis : Node.js ≥ 20.6, un projet Supabase gratuit, une clé d'API d'IA.

### Base de données
1. Dans Supabase : **SQL Editor** → colle et exécute `supabase/migrations/20261021000000_initial_schema.sql`, puis `supabase/seed.sql`.
2. **Authentication → Providers → Email** : pour tester, désactive « Confirm email ».
3. Pour créer un compte administrateur (qui peut modifier le contenu) : inscris-toi normalement, puis dans le SQL Editor :
   `update public.profiles set role = 'admin' where id = '<ton id utilisateur>';`

### Serveur
```bash
cd server
cp .env.example .env      # renseigne SUPABASE_URL, SUPABASE_ANON_KEY, ANTHROPIC_API_KEY
npm install
npm test                  # 16 tests
npm run dev               # http://localhost:3000/api/health
```

### Banc d'essai (tester sans attendre le site de la Personne 1)
```bash
cd client
cp .env.example .env      # mêmes URL et clé Supabase ; VITE_API_URL=http://localhost:3000/api
npm install
npm run dev               # http://localhost:5173
```
`npm run build` puis `npm run preview` (http://localhost:4173) active aussi le service worker.

### Couche client (à intégrer dans le site de la Personne 1)
```bash
cd client && npm test     # 15 tests
```
Copie `client/src/` dans le projet front (par exemple `src/edulab/`) et `client/public/*` dans son dossier `public/`. Puis, au démarrage de l'application :

```js
import { configureEduLab, registerServiceWorker, startAutoSync } from './edulab';

configureEduLab({
  apiUrl: 'http://localhost:3000/api',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
});
registerServiceWorker();
startAutoSync(); // envoie les résultats et met à jour le contenu tout seul
```
Dans `index.html`, ajoute `<link rel="manifest" href="/manifest.webmanifest">` et place les icônes `icon-192.png` / `icon-512.png` dans `public/icons/`.

---

## 2. Guide d'intégration pour l'équipe

### Personne 1 — interface
```js
import { signIn, getProfile, getSubjects, getCoursesBySubject, joinClass, getClassProgress,
         subscribeSyncStatus, isOnline } from './edulab';

await signIn({ email, password });
const subjects = await getSubjects();                 // lit IndexedDB : marche hors ligne
const courses  = await getCoursesBySubject(subjects[0].id);
subscribeSyncStatus(({ state, pendingCount }) => { /* « 3 résultats à envoyer » */ });
```
- Classes : l'élève utilise `joinClass(code)` ; l'enseignant `createClass`, `listClasses`, `getClassProgress(classId)` (renvoie un `status` : `on_track`, `watch`, `struggling`, `inactive`).
- Toutes les données ont les noms de colonnes de la base (`subject_id`, `body_md`, `grade_level`…).

### Personne 2 — simulations
```js
import { getSimulation, getExercisesForSimulation, getExercise, gradeExercise, recordAttempt } from './edulab';

const simulation = await getSimulation(id);   // simulation.config : tes paramètres (JSON libre)

// Quand l'élève termine une expérience ou répond à un exercice :
const { correct, score } = gradeExercise(exercise, answerFromStudent);
await recordAttempt({
  simulationId: simulation.id,          // et/ou exerciseId
  score,                                // 0 à 100
  durationSeconds: 95,
  payload: { volume_verse_ml: 24.8, indicateur: 'phenolphtaleine' }, // tes mesures, forme libre
});
```
`recordAttempt` écrit immédiatement en local, puis la synchronisation se charge du reste. Ne jamais afficher `exercise.answer_key` à l'élève.

### Assistant (tout le monde)
```js
const { answer, source } = await askAssistant({
  message: 'Pourquoi la solution est devenue rose ?',
  exerciseId,            // facultatif : l'assistant connaît alors l'énoncé
  hintLevel: 1,          // 1 = question de relance, 2 = rappel de méthode, 3 = étapes
  history,               // derniers messages [{ role: 'student' | 'assistant', content }]
});
// source : 'online' | 'offline' | 'offline-no-match'
```

---

## 3. Décisions de conception

- **RLS d'abord.** Les droits sont écrits dans la base. Le serveur appelle Supabase avec le jeton de l'élève et n'utilise aucune clé « service role » : une faille dans le code Node ne donne pas accès aux données des autres. Les règles ont été vérifiées sur une base PostgreSQL de test (élève qui écrit au nom d'un autre, changement de rôle, lecture entre élèves, etc. : tous refusés comme prévu).
- **Synchronisation idempotente.** Chaque essai a un UUID créé sur l'appareil. Renvoyer un lot ne crée jamais de doublon, donc une coupure réseau en plein envoi est sans danger. Un essai refusé par le serveur est mis de côté (`REJECTED`) au lieu de bloquer tous les suivants.
- **Appareils partagés.** Chaque essai local porte l'identifiant de son propriétaire : un téléphone prêté à plusieurs élèves n'envoie jamais le résultat de l'un sous le nom d'un autre.
- **Contenu léger.** `/api/content/version` renvoie une empreinte (quelques octets) ; le contenu complet n'est téléchargé que s'il a changé, et les réponses sont compressées.
- **Assistant qui guide, pas qui répond.** Le message système impose des indices progressifs et interdit la réponse finale. L'énoncé est relu en base côté serveur (le client ne peut pas le falsifier) et la clé de correction n'est jamais envoyée à l'IA. Limite de 10 questions par minute et par élève.
- **Assistant hors ligne.** Une FAQ locale (table `faq_entries`) répond aux questions fréquentes du programme par correspondance de mots-clés. Si rien ne correspond, il le dit honnêtement.
- **Fournisseur d'IA remplaçable.** `server/src/ai/provider.js` expose une seule fonction, `complete({ system, messages })`. Le modèle se change avec `AI_MODEL`.

## 4. Limites connues (à dire honnêtement au jury)

- **La clé de correction est téléchargée sur l'appareil** pour que la correction marche hors ligne. Un élève technique pourrait la lire. Acceptable pour de l'entraînement ; pour un examen noté, il faudrait corriger côté serveur.
- **Un enseignant s'auto-déclare à l'inscription.** Avant un déploiement réel, il faut une vérification (validation par un administrateur ou un code d'établissement).
- **Un service worker demande une première visite en ligne.** L'installation par clé USB ou partage de fichier annoncée dans le pitch suppose un emballage en application Android (par exemple Capacitor) qui embarque ces fichiers : ce n'est pas encore fait.
- **L'assistant hors ligne n'est pas une IA** : c'est une recherche dans une FAQ. L'IA « légère sur téléphone » du pitch reste à prototyper.
- **Hors ligne longtemps :** la session Supabase expire si elle ne peut pas être renouvelée ; l'élève garde ses données locales mais doit se reconnecter une fois en ligne pour synchroniser.

## 5. Structure

```
supabase/   schéma SQL (tables, RLS, fonctions) et données de démonstration
server/     API Express : routes → services → Supabase ; ai/ (prompts, fournisseur) ; tests
client/     couche de données : storage/ (IndexedDB), content/, results/, sync/, assistant/, public/sw.js
```

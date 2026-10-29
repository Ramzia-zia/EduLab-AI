# EduLab AI — Laboratoires virtuels intelligents (Togo)

Site web en **HTML5, CSS3 et JavaScript natif** (aucun framework, aucune dépendance) pour les élèves et
enseignants de l'enseignement secondaire au Togo. Ce dépôt contient la partie **front-end**.

> **État actuel : mode démonstration.** Les données affichées sont **fictives** (bandeau jaune visible sur le site).
> Le backend et les moteurs de simulation sont développés par les deux autres membres de l'équipe.
> La liste précise de ce qui est terminé / simulé / en attente est dans [`docs/STATUT.md`](docs/STATUT.md).

## Pages

| Page | Fichier |
|---|---|
| Accueil | `index.html` |
| Connexion · Inscription | `pages/connexion.html` · `pages/inscription.html` |
| Tableau de bord élève | `pages/tableau-bord.html` |
| Catalogue des simulations (recherche, filtres matière et niveau) | `pages/simulations.html` |
| Interface d'une simulation | `pages/simulation-detail.html?id=...` |
| Assistant IA | `pages/assistant-ia.html` |
| Cours et exercices | `pages/cours-exercices.html` |
| Espace enseignant | `pages/espace-enseignant.html` |
| Suivi de progression | `pages/progression.html` |
| Communauté | `pages/communaute.html` |
| Paramètres | `pages/parametres.html` |

## Lancer le site

Les scripts utilisent les **modules JavaScript ES** : il faut un petit serveur local (double-cliquer sur le fichier ne suffit pas).

1. Installer **Visual Studio Code** puis l'extension **Live Server**.
2. Ouvrir le dossier du projet dans VS Code.
3. Clic droit sur `index.html` → **Open with Live Server**.

Autre possibilité (Python installé) : `python -m http.server 5500` dans le dossier, puis ouvrir `http://localhost:5500`.

**Comptes d'essai (démonstration uniquement)** : `eleve@demo.tg` ou `enseignant@demo.tg`, mot de passe `demo1234`.
Ce n'est **pas** une authentification réelle : voir `js/services/auth-service.js`.

## Arborescence

```
edulab-ai/
├── index.html                 page d'accueil
├── manifest.webmanifest, sw.js    structure PWA (voir plus bas)
├── pages/                     les 11 autres pages HTML
├── css/
│   ├── main.css               regroupe reset, variables, global, layout, components
│   ├── responsive.css         adaptations téléphone / tablette (chargé en dernier)
│   └── pages/                 un fichier CSS par page
├── js/
│   ├── config.js              ⚙ configuration centrale (mode démo/API, adresse du backend)
│   ├── app.js                 démarrage commun + protection des pages
│   ├── utils/                 dom, validation, notifications, icônes, graphiques SVG, préférences
│   ├── components/            modal, sidebar, navigation, bouton mot de passe
│   ├── services/              appels API (un fichier par domaine) + api-client.js + endpoints.js
│   ├── data/demo-data.js      données FICTIVES du mode démonstration
│   ├── simulations/           registre + simulation de démonstration (contrat d'intégration)
│   └── pages/                 un fichier JavaScript par page
├── assets/                    images, icônes, polices
└── docs/                      API.md · SIMULATIONS.md · STATUT.md
```

Règle simple : **les pages (HTML/CSS/JS de `pages/`) ne parlent jamais directement au backend**. Elles appellent
les fonctions de `js/services/`. Quand le backend change, on modifie seulement les services.

## Passer du mode démonstration au mode API

Dans `js/config.js` :

```js
MODE: 'api',                              // au lieu de 'demo'
API_BASE_URL: 'http://localhost:3000/api' // EXEMPLE : mettre l'adresse réelle du backend
```

En mode API, les erreurs du serveur sont **affichées** : le site ne les remplace jamais par des données fictives.
Les routes attendues sont dans [`docs/API.md`](docs/API.md) (ce sont des **hypothèses** à confirmer avec le backend).

## Ajouter une simulation

Voir [`docs/SIMULATIONS.md`](docs/SIMULATIONS.md) : une ligne dans `js/simulations/registry.js` et un module qui respecte le contrat.

## Hors ligne (PWA)

`manifest.webmanifest` et `sw.js` préparent une Progressive Web App. Le service worker met en cache les fichiers
déjà visités pour que l'**interface** puisse se charger avec une connexion faible. Il ne fonctionne que sur
`localhost` ou en **HTTPS** (pas en ouvrant un fichier). Ce n'est **pas** un fonctionnement hors ligne complet :
les simulations hors ligne, les données locales et la synchronisation après retour du réseau restent à développer.

## Travailler en équipe avec Git et GitHub

```bash
git clone https://github.com/Ramzia-zia/EduLab-AI-.git
cd EduLab-AI-
git checkout -b frontend            # ta branche de travail (ou celle choisie par l'équipe)
# ... modifier les fichiers, tester avec Live Server ...
git add .
git commit -m "Décris ce que tu as fait"
git push -u origin frontend
```
Puis ouvrir une **Pull Request** sur GitHub : la responsable du dépôt relit et fusionne dans `main`.
Ne jamais pousser directement sur `main`. Avant de reprendre : `git checkout main && git pull`.

Organisation proposée : `main` (version stable) · `frontend` (interface) · `backend` · `simulations`.
Chacun travaille dans ses dossiers : `js/services/` (backend), `js/simulations/` (simulations), le reste (front-end).

**GitHub Pages** : le site utilise des chemins relatifs, il peut être publié tel quel (Settings → Pages → branche `main`).
En mode démonstration seulement : GitHub Pages ne fournit pas de backend.

**Sécurité** : ne jamais publier de mot de passe, de clé d'API ou d'identifiant de base de données (voir `.gitignore`).
Le navigateur ne doit jamais se connecter directement à la base de données : tout passe par l'API.

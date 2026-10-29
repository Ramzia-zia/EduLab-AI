// ============================================================================
// CONFIGURATION CENTRALE DU FRONT-END
// Un navigateur ne lit pas le fichier ".env" : la configuration vit donc dans ce fichier JavaScript.
// ⚠ Ne JAMAIS écrire ici de mot de passe, de clé API ou d'identifiant de base de données.
// ============================================================================
export const CONFIG = {
  // "demo" : données FICTIVES (js/data/demo-data.js), bandeau d'avertissement visible.
  // "api"  : vraies requêtes vers le backend. Les erreurs sont affichées, jamais remplacées par des données fictives.
  MODE: 'demo',
  // EXEMPLE : à remplacer par l'adresse réelle du backend donnée par l'équipe.
  API_BASE_URL: 'http://localhost:3000/api',
  REQUEST_TIMEOUT_MS: 15000,
};

export const isDemoMode = () => CONFIG.MODE === 'demo';

export const SUBJECTS = ['Physique', 'Chimie', 'SVT', 'Mathématiques'];
export const LEVELS = ['6e', '5e', '4e', '3e', 'Seconde', 'Première', 'Terminale'];

// Icône et classe CSS de chaque matière
export const SUBJECT_META = {
  Physique: { slug: 'physique', icon: 'atom' },
  Chimie: { slug: 'chimie', icon: 'flask' },
  SVT: { slug: 'svt', icon: 'leaf' },
  Mathématiques: { slug: 'mathematiques', icon: 'sigma' },
};

// Page d'accueil de chaque profil après la connexion
export const HOME_BY_ROLE = { student: 'tableau-bord.html', teacher: 'espace-enseignant.html' };

// ============================================================================
// REGISTRE DES SIMULATIONS
// Pour brancher une nouvelle simulation de l'équipe : 1) ajouter une ligne ici,
// 2) mettre "available: true" pour cette expérience dans le catalogue (data/API).
// Aucune page HTML ni page JavaScript n'est à modifier. Mode d'emploi : docs/SIMULATIONS.md
// ============================================================================
export const SIMULATIONS_REGISTRY = {
  // Démonstration : DONNÉES FICTIVES, pas un vrai moteur scientifique.
  'titrage-acide-base': () => import('./demo-titrage.js'),
};

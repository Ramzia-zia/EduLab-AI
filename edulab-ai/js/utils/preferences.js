// Préférences d'affichage de l'utilisateur. localStorage convient ici : ce ne sont pas des données sensibles.
const KEY = 'edulab.preferences';
const DEFAULTS = { textSize: 'normal', reduceMotion: false };

export function getPreferences() {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY)) }; } catch { return { ...DEFAULTS }; }
}
export function savePreferences(prefs) {
  try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch { /* stockage indisponible : on ignore */ }
  applyPreferences();
}
export function applyPreferences() {
  const prefs = getPreferences();
  document.documentElement.dataset.textSize = prefs.textSize;
  document.documentElement.dataset.reduceMotion = String(prefs.reduceMotion);
}

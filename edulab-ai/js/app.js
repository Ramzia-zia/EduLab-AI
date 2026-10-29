// Point d'entrée commun à toutes les pages : préférences, bandeau démo, protection des pages, menu.
import { HOME_BY_ROLE } from './config.js';
import { renderLayout } from './components/sidebar.js';
import { getCurrentUser } from './services/auth-service.js';
import { applyPreferences } from './utils/preferences.js';
import { renderDemoBanner } from './utils/notifications.js';

function registerServiceWorker() {
  // Ne marche que sur http(s) (localhost ou serveur sécurisé), pas en ouvrant un fichier directement.
  if (!('serviceWorker' in navigator) || !location.protocol.startsWith('http')) return;
  navigator.serviceWorker.register(new URL('../sw.js', import.meta.url)).catch(() => {});
}

// Si le serveur répond « non connecté », on renvoie vers la page de connexion.
window.addEventListener('edulab:unauthorized', () => { location.href = new URL('../pages/connexion.html', import.meta.url).href; });

// roles : liste des profils autorisés (ex. ['student']). Sans "roles", la page est publique.
// RAPPEL : cette vérification ne sert qu'à l'affichage. Le backend doit protéger les vraies données.
export async function bootstrap({ roles, active } = {}) {
  applyPreferences();
  renderDemoBanner();
  registerServiceWorker();
  if (!roles) return null;

  let user = null;
  try { user = await getCurrentUser(); } catch { /* serveur injoignable : on traite comme non connecté */ }
  const here = location.pathname.split('/').pop();
  if (!user) { location.replace(`connexion.html?next=${encodeURIComponent(here)}`); return null; }
  if (!roles.includes(user.role)) { location.replace(HOME_BY_ROLE[user.role]); return null; }
  renderLayout(user, active);
  return user;
}

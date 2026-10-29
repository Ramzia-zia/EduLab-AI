// Authentification et profil.
// MODE API : la session est un cookie httpOnly géré par le backend. Le rôle vient TOUJOURS du serveur (/me).
// MODE DÉMO : un faux "utilisateur de démonstration" est gardé dans sessionStorage. Ce n'est PAS une
// authentification : n'importe qui peut modifier cette valeur. Elle ne protège aucune donnée réelle.
import { isDemoMode } from '../config.js';
import { DEMO_ACCOUNTS, demoDelay, newDemoId } from '../data/demo-data.js';
import { ApiError, get, post, patch } from './api-client.js';
import { ENDPOINTS } from './endpoints.js';

const DEMO_SESSION_KEY = 'edulab.demo.session';
const readDemoUser = () => { try { return JSON.parse(sessionStorage.getItem(DEMO_SESSION_KEY)); } catch { return null; } };
const writeDemoUser = (user) => sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(user));

export async function login({ email, password, role, remember }) {
  if (isDemoMode()) {
    await demoDelay(null);
    const account = DEMO_ACCOUNTS.find((a) => a.user.email === email.trim().toLowerCase() && a.password === password);
    if (!account) throw new ApiError('E-mail ou mot de passe incorrect. (Démonstration : eleve@demo.tg ou enseignant@demo.tg, mot de passe demo1234)');
    writeDemoUser(account.user);
    return account.user;
  }
  await post(ENDPOINTS.login, { email, password, role, remember: Boolean(remember) }); // le backend décide de la durée de la session
  return getCurrentUser(); // on relit le profil auprès du serveur : c'est lui qui donne le rôle
}

export async function register(input) {
  if (isDemoMode()) {
    await demoDelay(null);
    // Démo : aucun mot de passe n'est conservé. On crée seulement un profil de démonstration temporaire.
    const user = { id: newDemoId('demo-user'), firstName: input.firstName, lastName: input.lastName, email: input.email.trim().toLowerCase(), role: input.role, level: input.level };
    writeDemoUser(user);
    return user;
  }
  await post(ENDPOINTS.register, input);
  return getCurrentUser();
}

export async function getCurrentUser() {
  if (isDemoMode()) return readDemoUser();
  try { return await get(ENDPOINTS.me); } catch (error) { if (error.status === 401) return null; throw error; }
}

export async function logout() {
  if (isDemoMode()) { sessionStorage.removeItem(DEMO_SESSION_KEY); return; }
  try { await post(ENDPOINTS.logout); } catch { /* on quitte quand même la page */ }
}

export async function requestPasswordReset(email) {
  if (isDemoMode()) return demoDelay({ ok: true });
  return post(ENDPOINTS.forgotPassword, { email });
}

export async function updateProfile(input) {
  if (isDemoMode()) { const user = { ...readDemoUser(), ...input }; writeDemoUser(user); return demoDelay(user); }
  return patch(ENDPOINTS.me, input);
}

export async function changePassword({ currentPassword, newPassword }) {
  if (isDemoMode()) {
    await demoDelay(null);
    const user = readDemoUser();
    const account = DEMO_ACCOUNTS.find((a) => a.user.id === user?.id);
    if (account && account.password !== currentPassword) throw new ApiError('Le mot de passe actuel est incorrect.');
    return { ok: true, local: true }; // démo : rien n'est réellement modifié
  }
  return post(ENDPOINTS.changePassword, { currentPassword, newPassword });
}

// Export des données personnelles. Démo : fichier local de démonstration. API : route à confirmer.
export async function exportMyData() {
  if (isDemoMode()) return { avertissement: 'Données de DÉMONSTRATION, non réelles.', profil: readDemoUser() };
  return get(ENDPOINTS.exportMyData);
}

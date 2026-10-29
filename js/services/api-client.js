// Client HTTP UNIQUE : toutes les requêtes vers le backend passent par ici.
// - adresse du serveur lue dans config.js
// - délai d'attente (timeout), erreurs réseau et erreurs HTTP transformées en messages clairs
// - la session est portée par un cookie "httpOnly" posé par le backend (hypothèse, voir docs/API.md) :
//   le navigateur l'envoie tout seul (credentials: 'include'), JavaScript n'a jamais accès au jeton.
import { CONFIG } from '../config.js';

export class ApiError extends Error {
  constructor(message, { status = null, details = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export async function request(method, path, { body, params } = {}) {
  const url = new URL(CONFIG.API_BASE_URL.replace(/\/$/, '') + path);
  Object.entries(params ?? {}).forEach(([key, value]) => value !== undefined && value !== '' && url.searchParams.set(key, value));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(url, {
      method,
      headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw new ApiError('Le serveur met trop de temps à répondre. Réessaie dans un instant.');
    throw new ApiError('Impossible de joindre le serveur. Vérifie ta connexion internet.');
  } finally {
    clearTimeout(timer);
  }

  // Lecture sécurisée de la réponse JSON
  const text = await response.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); } catch { if (response.ok) throw new ApiError('Réponse inattendue du serveur (JSON attendu).', { status: response.status }); }
  }

  if (!response.ok) {
    const serverMessage = data?.message;
    if (response.status === 401) {
      window.dispatchEvent(new Event('edulab:unauthorized')); // l'application renvoie vers la connexion
      throw new ApiError(serverMessage ?? 'Ta session a expiré. Reconnecte-toi.', { status: 401 });
    }
    if (response.status === 403) throw new ApiError('Tu n’as pas le droit d’effectuer cette action.', { status: 403 });
    if (response.status === 404) throw new ApiError('Contenu introuvable.', { status: 404 });
    if (response.status >= 500) throw new ApiError('Le serveur a rencontré un problème. Réessaie plus tard.', { status: response.status });
    throw new ApiError(serverMessage ?? 'La requête a été refusée.', { status: response.status, details: data });
  }
  return data;
}

export const get = (path, options) => request('GET', path, options);
export const post = (path, body) => request('POST', path, { body });
export const put = (path, body) => request('PUT', path, { body });
export const patch = (path, body) => request('PATCH', path, { body });
export const del = (path) => request('DELETE', path);

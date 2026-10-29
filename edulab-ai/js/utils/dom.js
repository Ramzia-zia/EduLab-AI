// Petites fonctions pour manipuler la page.
export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// SÉCURITÉ : on "échappe" tout texte venant d'un utilisateur ou de l'API avant de l'insérer dans du HTML.
export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Pour la recherche : "Réaction" et "reaction" doivent être considérés comme identiques.
export function normalize(text) {
  return String(text ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function debounce(fn, delay = 250) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}

export const getParam = (name) => new URLSearchParams(location.search).get(name);

export function getInitials(user) {
  return `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase();
}

export const slugify = (text) => normalize(text).replace(/[^a-z0-9]+/g, '-');

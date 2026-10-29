// Messages affichés à l'utilisateur : bandeau démo, petites notifications, états des boutons.
import { isDemoMode } from '../config.js';
import { escapeHtml } from './dom.js';

// Bandeau toujours visible en mode démonstration : les données ne sont pas réelles.
export function renderDemoBanner() {
  if (!isDemoMode() || document.querySelector('.demo-banner')) return;
  const banner = document.createElement('div');
  banner.className = 'demo-banner';
  banner.textContent = 'MODE DÉMONSTRATION : les données affichées sont fictives. Aucune information réelle n’est enregistrée.';
  document.body.prepend(banner);
}

// Petite notification qui disparaît seule (ex. « Profil enregistré »)
export function toast(message, kind = 'info', duration = 4000) {
  let zone = document.querySelector('.toast-zone');
  if (!zone) {
    zone = document.createElement('div');
    zone.className = 'toast-zone';
    zone.setAttribute('role', 'status');
    zone.setAttribute('aria-live', 'polite');
    document.body.appendChild(zone);
  }
  const item = document.createElement('div');
  item.className = `toast toast--${kind}`;
  item.textContent = message;
  zone.appendChild(item);
  setTimeout(() => item.remove(), duration);
}

// Message dans un formulaire (succès, erreur ou information)
export function showMessage(container, message, kind = 'info') {
  container.hidden = false;
  container.className = `form-message form-message--${kind}`;
  container.setAttribute('role', kind === 'error' ? 'alert' : 'status');
  container.innerHTML = escapeHtml(message);
}
export function clearMessage(container) { container.hidden = true; container.textContent = ''; }

// Bouton "en cours de chargement" : désactivé et avec une roue qui tourne
export function setLoading(button, isLoading, loadingLabel) {
  if (isLoading) {
    button.dataset.label = button.textContent;
    button.disabled = true;
    button.classList.add('is-loading');
    if (loadingLabel) button.textContent = loadingLabel;
  } else {
    button.disabled = false;
    button.classList.remove('is-loading');
    if (button.dataset.label) button.textContent = button.dataset.label;
  }
}

export const loadingHtml = (label = 'Chargement…') => `<div class="loading" role="status">${escapeHtml(label)}</div>`;
export const errorHtml = (message) => `<div class="form-message form-message--error" role="alert">${escapeHtml(message)}</div>`;
export const emptyHtml = (title, text = '', actionHtml = '') => `<div class="empty-state"><h3>${escapeHtml(title)}</h3><p class="text-muted">${escapeHtml(text)}</p>${actionHtml}</div>`;

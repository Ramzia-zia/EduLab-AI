// Menu de la page d'accueil publique (menu déroulant sur téléphone).
import { $ } from '../utils/dom.js';

export function initPublicNav() {
  const toggle = $('[data-nav-toggle]');
  const menu = $('[data-nav-menu]');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) { menu.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }
  });
}

// Barre latérale + barre du haut des pages connectées. Le menu dépend du rôle.
import { $ } from '../utils/dom.js';
import { escapeHtml, getInitials } from '../utils/dom.js';
import { icon } from '../utils/icons.js';
import { confirmModal } from './modal.js';
import { logout } from '../services/auth-service.js';

const BOTH = ['student', 'teacher'];
const ITEMS = [
  { id: 'dashboard', label: 'Accueil', icon: 'home', href: 'tableau-bord.html', roles: ['student'] },
  { id: 'teacher', label: 'Tableau de bord', icon: 'home', href: 'espace-enseignant.html', roles: ['teacher'] },
  { id: 'simulations', label: 'Simulations', icon: 'flask', href: 'simulations.html', roles: BOTH },
  { id: 'courses', label: 'Cours & Exercices', icon: 'book', href: 'cours-exercices.html', roles: BOTH },
  { id: 'progress', label: 'Mon suivi', icon: 'chart', href: 'progression.html', roles: ['student'] },
  { id: 'assistant', label: 'Assistant IA', icon: 'bot', href: 'assistant-ia.html', roles: ['student'] },
  { id: 'community', label: 'Communauté', icon: 'users', href: 'communaute.html', roles: BOTH },
  { id: 'settings', label: 'Paramètres', icon: 'settings', href: 'parametres.html', roles: BOTH },
];

export function renderLayout(user, activeId) {
  const sidebar = $('[data-sidebar]');
  const topbar = $('[data-topbar]');
  const backdrop = $('[data-sidebar-backdrop]');

  sidebar.innerHTML = `
    <a class="sidebar__brand" href="../index.html"><img src="../assets/images/logo.svg" alt="" width="34" height="34">EduLab AI</a>
    <nav class="sidebar__nav" aria-label="Navigation principale">
      ${ITEMS.filter((i) => i.roles.includes(user.role)).map((i) =>
        `<a class="nav-item" href="${i.href}" ${i.id === activeId ? 'aria-current="page"' : ''}>${icon(i.icon)}${i.label}</a>`).join('')}
    </nav>
    <button type="button" class="nav-item" data-logout>${icon('logout')}Se déconnecter</button>`;

  topbar.innerHTML = `
    <button type="button" class="btn btn--ghost topbar__menu" data-menu-toggle aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="sidebar">${icon('menu')}</button>
    <div class="topbar__user">
      <span class="topbar__name">${escapeHtml(user.firstName)} ${escapeHtml(user.lastName)}<span class="topbar__role">${user.role === 'teacher' ? 'Enseignant' : 'Élève'}</span></span>
      <span class="avatar" aria-hidden="true">${escapeHtml(getInitials(user))}</span>
    </div>`;

  // Menu mobile : ouverture / fermeture
  const toggle = $('[data-menu-toggle]');
  const setOpen = (open) => {
    sidebar.classList.toggle('is-open', open);
    backdrop.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  };
  toggle.addEventListener('click', () => setOpen(!sidebar.classList.contains('is-open')));
  backdrop.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });

  // Déconnexion : on demande une confirmation
  $('[data-logout]').addEventListener('click', async () => {
    const ok = await confirmModal({ title: 'Se déconnecter ?', message: 'Tu devras te reconnecter pour accéder à ton espace.', confirmLabel: 'Se déconnecter' });
    if (ok) { await logout(); location.href = 'connexion.html'; }
  });
}

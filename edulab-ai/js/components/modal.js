// Fenêtres modales accessibles : Échap pour fermer, focus gardé dans la fenêtre.
import { escapeHtml } from '../utils/dom.js';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

// actions : [{ label, variant, onClick(handle) }]  (onClick peut renvoyer false pour garder la fenêtre ouverte)
export function openModal({ title, bodyHtml = '', actions = [{ label: 'Fermer', variant: 'secondary' }], onOpen }) {
  const previousFocus = document.activeElement;
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <h2 class="modal__title" id="modal-title">${escapeHtml(title)}</h2>
    <div class="modal__body">${bodyHtml}</div>
    <div class="modal__actions"></div></div>`;
  const root = backdrop.querySelector('.modal');
  const handle = { root, close };

  actions.forEach((action) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `btn btn--${action.variant ?? 'secondary'}`;
    btn.textContent = action.label;
    btn.addEventListener('click', async () => { if ((await action.onClick?.(handle)) !== false) close(); });
    backdrop.querySelector('.modal__actions').appendChild(btn);
  });

  function onKey(e) {
    if (e.key === 'Escape') return close();
    if (e.key !== 'Tab') return;
    const items = [...root.querySelectorAll(FOCUSABLE)];
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  function close() {
    document.removeEventListener('keydown', onKey);
    backdrop.remove();
    previousFocus?.focus?.();
  }
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  document.addEventListener('keydown', onKey);
  document.body.appendChild(backdrop);
  (root.querySelector('input, select, textarea') ?? root.querySelector('.btn'))?.focus();
  onOpen?.(handle);
  return handle;
}

// Confirmation d'une action importante. Renvoie une promesse : true si l'utilisateur confirme.
export function confirmModal({ title, message, confirmLabel = 'Confirmer', danger = false }) {
  return new Promise((resolve) => {
    openModal({
      title,
      bodyHtml: `<p>${escapeHtml(message)}</p>`,
      actions: [
        { label: 'Annuler', variant: 'secondary', onClick: () => resolve(false) },
        { label: confirmLabel, variant: danger ? 'danger' : 'primary', onClick: () => resolve(true) },
      ],
    });
  });
}

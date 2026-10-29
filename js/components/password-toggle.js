// Bouton « afficher / masquer le mot de passe » (utilisé dans la connexion et l'inscription).
import { $$ } from '../utils/dom.js';
import { icon } from '../utils/icons.js';

export function initPasswordToggles(root = document) {
  $$('[data-toggle-password]', root).forEach((button) => {
    const input = root.querySelector(`#${button.dataset.togglePassword}`);
    button.innerHTML = icon('eye');
    button.addEventListener('click', () => {
      const visible = input.type === 'password';
      input.type = visible ? 'text' : 'password';
      button.innerHTML = icon(visible ? 'eyeOff' : 'eye');
      button.setAttribute('aria-pressed', String(visible));
      button.setAttribute('aria-label', visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe');
    });
  });
}

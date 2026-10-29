// Page de connexion : validation, état de chargement, appel au service d'authentification.
import { bootstrap } from '../app.js';
import { openModal } from '../components/modal.js';
import { initPasswordToggles } from '../components/password-toggle.js';
import { HOME_BY_ROLE, isDemoMode } from '../config.js';
import { ApiError } from '../services/api-client.js';
import { login, logout, requestPasswordReset } from '../services/auth-service.js';
import { $, getParam } from '../utils/dom.js';
import { clearMessage, setLoading, showMessage } from '../utils/notifications.js';
import { rules, validateForm } from '../utils/validation.js';

bootstrap();
initPasswordToggles();

const form = $('#login-form');
const message = $('#form-message');
const submit = $('button[type="submit"]', form);

if (isDemoMode()) {
  showMessage($('[data-demo-note]'), 'Mode démonstration : ce n’est PAS une vraie connexion. Comptes d’essai : eleve@demo.tg ou enseignant@demo.tg, mot de passe demo1234.', 'info');
}

// Page demandée avant la connexion : on n'accepte qu'un simple nom de fichier (évite les redirections dangereuses)
function destinationFor(user) {
  const next = getParam('next');
  return next && /^[a-z-]+\.html$/.test(next) ? next : HOME_BY_ROLE[user.role];
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearMessage(message);
  const { valid, values } = validateForm(form, {
    email: [rules.required('Entre ton adresse e-mail.'), rules.email()],
    password: [rules.required('Entre ton mot de passe.')],
  });
  if (!valid) return;

  setLoading(submit, true, 'Connexion…');
  try {
    const user = await login(values);
    if (user.role !== values.role) { // le profil choisi doit correspondre au compte
      await logout();
      throw new ApiError(`Ce compte n’est pas un compte ${values.role === 'teacher' ? 'Enseignant' : 'Élève'}.`);
    }
    showMessage(message, 'Connexion réussie. Redirection…', 'success');
    location.href = destinationFor(user);
  } catch (error) {
    showMessage(message, error.message, 'error');
    setLoading(submit, false);
  }
});

// Fenêtre « Mot de passe oublié ? »
$('#forgot-link').addEventListener('click', () => {
  openModal({
    title: 'Mot de passe oublié',
    bodyHtml: `<form id="forgot-form" novalidate class="stack"><div class="field"><label class="field__label" for="forgot-email">Adresse e-mail</label><input class="field__input" id="forgot-email" name="email" type="email" autocomplete="email"></div><div id="forgot-message" hidden></div></form>`,
    actions: [
      { label: 'Annuler', variant: 'secondary' },
      {
        label: 'Envoyer le lien', variant: 'primary',
        async onClick({ root }) {
          const f = root.querySelector('#forgot-form');
          const out = root.querySelector('#forgot-message');
          const { valid, values } = validateForm(f, { email: [rules.required('Entre ton adresse e-mail.'), rules.email()] });
          if (!valid) return false;
          try {
            await requestPasswordReset(values.email);
            showMessage(out, isDemoMode() ? 'Démonstration : aucun e-mail n’a été envoyé.' : 'Si cette adresse existe, un lien de réinitialisation vient d’être envoyé.', 'success');
          } catch (error) { showMessage(out, error.message, 'error'); }
          return false; // on laisse la fenêtre ouverte pour lire le message
        },
      },
    ],
  });
});

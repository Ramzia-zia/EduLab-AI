// Page d'inscription. Les champs propres à chaque profil sont décrits dans EXTRA_FIELDS :
// pour en ajouter un, il suffit d'ajouter une ligne dans cette liste.
import { bootstrap } from '../app.js';
import { openModal } from '../components/modal.js';
import { initPasswordToggles } from '../components/password-toggle.js';
import { HOME_BY_ROLE, LEVELS, isDemoMode } from '../config.js';
import { register } from '../services/auth-service.js';
import { $, escapeHtml } from '../utils/dom.js';
import { clearMessage, setLoading, showMessage } from '../utils/notifications.js';
import { rules, validateForm } from '../utils/validation.js';

const EXTRA_FIELDS = [
  { name: 'level', label: 'Niveau scolaire', roles: ['student'], options: LEVELS },
  { name: 'school', label: 'Établissement', roles: ['teacher'], placeholder: 'Nom de votre établissement' },
];

bootstrap();
initPasswordToggles();

const form = $('#register-form');
const message = $('#form-message');
const submit = $('button[type="submit"]', form);
const extraBox = $('[data-extra-fields]');
const currentRole = () => form.elements.role.value;

if (isDemoMode()) showMessage($('[data-demo-note]'), 'Mode démonstration : aucun compte réel n’est créé et aucun mot de passe n’est conservé.', 'info');

// Affiche les champs supplémentaires du profil choisi
function renderExtraFields() {
  extraBox.innerHTML = EXTRA_FIELDS.filter((f) => f.roles.includes(currentRole())).map((f) => {
    const control = f.options
      ? `<select class="field__input" id="${f.name}" name="${f.name}"><option value="">Choisir…</option>${f.options.map((o) => `<option>${escapeHtml(o)}</option>`).join('')}</select>`
      : `<input class="field__input" id="${f.name}" name="${f.name}" type="text" placeholder="${escapeHtml(f.placeholder ?? '')}">`;
    return `<div class="field"><label class="field__label" for="${f.name}">${escapeHtml(f.label)} (facultatif)</label>${control}</div>`;
  }).join('');
}
form.querySelectorAll('input[name="role"]').forEach((radio) => radio.addEventListener('change', renderExtraFields));
renderExtraFields();

$('#terms-link').addEventListener('click', () => openModal({
  title: 'Conditions d’utilisation',
  bodyHtml: '<p>Le texte officiel des conditions d’utilisation reste à rédiger par l’équipe du projet. Cette fenêtre est prête à l’afficher.</p>',
}));

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearMessage(message);
  const { valid, values } = validateForm(form, {
    lastName: [rules.required('Entre ton nom.'), rules.minLength(2, 'Le nom est trop court.')],
    firstName: [rules.required('Entre ton prénom.'), rules.minLength(2, 'Le prénom est trop court.')],
    email: [rules.required('Entre ton adresse e-mail.'), rules.email()],
    password: [rules.required('Choisis un mot de passe.'), rules.minLength(8, 'Le mot de passe doit contenir au moins 8 caractères.')],
    confirmPassword: [rules.required('Confirme ton mot de passe.'), rules.matches('password', 'Les deux mots de passe sont différents.')],
    acceptTerms: [rules.checked('Tu dois accepter les conditions d’utilisation.')],
  });
  if (!valid) return;

  setLoading(submit, true, 'Inscription…');
  try {
    const { confirmPassword, acceptTerms, ...data } = values; // on n'envoie pas ces deux champs
    const user = await register({ ...data, acceptTerms: true });
    showMessage(message, 'Inscription réussie. Redirection…', 'success');
    location.href = HOME_BY_ROLE[user.role];
  } catch (error) {
    showMessage(message, error.message, 'error');
    setLoading(submit, false);
  }
});

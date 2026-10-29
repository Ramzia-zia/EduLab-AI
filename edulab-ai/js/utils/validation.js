// Validation des formulaires. Chaque règle renvoie un message d'erreur, ou '' si tout va bien.
import { escapeHtml } from './dom.js';

export const rules = {
  required: (msg = 'Ce champ est obligatoire.') => (v) => (String(v ?? '').trim() ? '' : msg),
  email: (msg = 'Cette adresse e-mail n’est pas valide.') => (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim()) ? '' : msg),
  minLength: (n, msg) => (v) => (String(v ?? '').length >= n ? '' : msg ?? `Au moins ${n} caractères.`),
  matches: (otherField, msg) => (v, values) => (v === values[otherField] ? '' : msg),
  checked: (msg) => (v) => (v ? '' : msg),
};

// Lit toutes les valeurs d'un formulaire dans un objet { nomDuChamp: valeur }
export function getFormValues(form) {
  const values = {};
  for (const el of form.elements) {
    if (!el.name) continue;
    if (el.type === 'checkbox') values[el.name] = el.checked;
    else if (el.type === 'radio') { if (el.checked) values[el.name] = el.value; }
    else values[el.name] = el.value;
  }
  return values;
}

export function showFieldError(field, message) {
  const box = field.closest('.field');
  let error = box.querySelector('.field__error');
  if (!error) {
    error = document.createElement('p');
    error.className = 'field__error';
    error.id = `${field.id}-error`;
    error.setAttribute('role', 'alert');
    box.appendChild(error);
  }
  error.innerHTML = escapeHtml(message);
  field.setAttribute('aria-invalid', 'true');
  field.setAttribute('aria-describedby', error.id);
}

export function clearFieldError(field) {
  field.closest('.field')?.querySelector('.field__error')?.remove();
  field.removeAttribute('aria-invalid');
  field.removeAttribute('aria-describedby');
}

// Vérifie le formulaire selon un "schéma" : { nomDuChamp: [règle1, règle2] }
// Affiche les erreurs sous les champs et place le curseur sur le premier champ incorrect.
export function validateForm(form, schema) {
  const values = getFormValues(form);
  let firstInvalid = null;
  for (const [name, validators] of Object.entries(schema)) {
    const field = form.elements[name];
    if (!field || field instanceof RadioNodeList) continue;
    const message = validators.map((check) => check(values[name], values)).find(Boolean);
    if (message) { showFieldError(field, message); firstInvalid ??= field; } else clearFieldError(field);
  }
  firstInvalid?.focus();
  return { valid: !firstInvalid, values };
}

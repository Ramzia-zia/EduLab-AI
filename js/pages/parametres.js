// Paramètres : profil, mot de passe, préférences d'affichage, export des données, déconnexion.
import { bootstrap } from '../app.js';
import { confirmModal } from '../components/modal.js';
import { isDemoMode } from '../config.js';
import { changePassword, exportMyData, logout, updateProfile } from '../services/auth-service.js';
import { $ } from '../utils/dom.js';
import { clearMessage, showMessage, toast } from '../utils/notifications.js';
import { getPreferences, savePreferences } from '../utils/preferences.js';
import { rules, validateForm } from '../utils/validation.js';

const user = await bootstrap({ roles: ['student', 'teacher'], active: 'settings' });
if (user) init();

function init() {
  const profileForm = $('#profile-form'), passwordForm = $('#password-form'), prefsForm = $('#prefs-form');
  $('#mode-label').textContent = isDemoMode() ? 'Démonstration (données fictives)' : 'API (backend)';
  $('#data-note').textContent = isDemoMode()
    ? 'Démonstration : le fichier contient uniquement des données fictives de cet appareil.'
    : 'L’export est fourni par le backend (route à confirmer avec l’équipe).';

  // Profil
  profileForm.firstName.value = user.firstName; profileForm.lastName.value = user.lastName; profileForm.email.value = user.email;
  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const out = $('#profile-message'); clearMessage(out);
    const { valid, values } = validateForm(profileForm, { firstName: [rules.required('Entre ton prénom.')], lastName: [rules.required('Entre ton nom.')], email: [rules.required('Entre ton adresse e-mail.'), rules.email()] });
    if (!valid) return;
    try { await updateProfile(values); showMessage(out, isDemoMode() ? 'Profil mis à jour localement (démonstration, temporaire).' : 'Profil enregistré.', 'success'); }
    catch (error) { showMessage(out, error.message, 'error'); }
  });

  // Mot de passe
  passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const out = $('#password-message'); clearMessage(out);
    const { valid, values } = validateForm(passwordForm, {
      currentPassword: [rules.required('Entre ton mot de passe actuel.')],
      newPassword: [rules.required('Choisis un nouveau mot de passe.'), rules.minLength(8, 'Au moins 8 caractères.')],
      confirmPassword: [rules.required('Confirme le nouveau mot de passe.'), rules.matches('newPassword', 'Les deux mots de passe sont différents.')],
    });
    if (!valid) return;
    try {
      await changePassword(values);
      passwordForm.reset();
      showMessage(out, isDemoMode() ? 'Démonstration : aucun mot de passe réel n’a été modifié.' : 'Mot de passe modifié.', 'success');
    } catch (error) { showMessage(out, error.message, 'error'); }
  });

  // Préférences : appliquées tout de suite et gardées sur l'appareil
  const prefs = getPreferences();
  prefsForm.textSize.value = prefs.textSize; prefsForm.reduceMotion.checked = prefs.reduceMotion;
  prefsForm.addEventListener('change', () => { savePreferences({ textSize: prefsForm.textSize.value, reduceMotion: prefsForm.reduceMotion.checked }); toast('Préférences enregistrées.', 'success'); });

  // Téléchargement des données
  $('#download-data').addEventListener('click', async () => {
    try {
      const blob = new Blob([JSON.stringify(await exportMyData(), null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob); link.download = 'mes-donnees-edulab.json'; link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) { toast(error.message, 'error'); }
  });

  // Déconnexion (avec confirmation)
  $('#logout-button').addEventListener('click', async () => {
    if (await confirmModal({ title: 'Se déconnecter ?', message: 'Tu devras te reconnecter pour accéder à ton espace.', confirmLabel: 'Se déconnecter' })) { await logout(); location.href = 'connexion.html'; }
  });
}

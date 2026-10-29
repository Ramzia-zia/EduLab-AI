// Assistant IA : interface de conversation. Les réponses viennent du service (démo ou backend).
import { bootstrap } from '../app.js';
import { isDemoMode } from '../config.js';
import { getSuggestions, sendMessage } from '../services/assistant-service.js';
import { $, escapeHtml } from '../utils/dom.js';
import { clearMessage, errorHtml, showMessage } from '../utils/notifications.js';

const user = await bootstrap({ roles: ['student'], active: 'assistant' });
if (user) init();

function init() {
  const log = $('#chat-log'), input = $('#chat-input'), typing = $('#typing'), errorBox = $('#chat-error');
  let lastRequest = null;

  if (isDemoMode()) showMessage($('[data-assistant-note]'), 'Mode démonstration : les réponses ci-dessous sont des exemples écrits à l’avance. Aucun modèle d’IA n’est connecté.', 'info');

  function addMessage({ role, content, demo, link }) {
    const bubble = document.createElement('div');
    bubble.className = `bubble bubble--${role}`;
    bubble.innerHTML = `${demo ? '<span class="bubble__tag">Réponse de démonstration</span><br>' : ''}${escapeHtml(content)}${link ? `<br><a href="${link.href}">${escapeHtml(link.label)}</a>` : ''}`;
    log.appendChild(bubble);
    log.scrollTop = log.scrollHeight;
  }
  function setBusy(busy) {
    typing.hidden = !busy;
    document.querySelectorAll('#chat-send, [data-intent], #suggestions button').forEach((b) => { b.disabled = busy; });
  }

  async function send(text, intent = 'question') {
    if (!text.trim()) return;
    lastRequest = { text, intent };
    clearMessage(errorBox);
    addMessage({ role: 'user', content: text });
    setBusy(true);
    try {
      const reply = await sendMessage({ message: text, intent });
      addMessage({ ...reply, link: intent === 'restart' ? { href: 'simulation-detail.html?id=titrage-acide-base', label: 'Rouvrir l’expérience' } : null });
    } catch (error) {
      errorBox.hidden = false;
      errorBox.innerHTML = `${errorHtml(error.message)}<p><button class="btn btn--secondary btn--sm" id="retry-send" type="button">Réessayer</button></p>`;
      $('#retry-send').addEventListener('click', () => { errorBox.hidden = true; log.lastElementChild?.remove(); send(lastRequest.text, lastRequest.intent); });
    } finally { setBusy(false); }
  }

  addMessage({ role: 'assistant', content: 'Bonjour ! Pose-moi une question sur ton expérience ou utilise les boutons ci-dessous.', demo: isDemoMode() });
  $('#suggestions').innerHTML = getSuggestions().map((s) => `<button type="button" class="chip">${escapeHtml(s)}</button>`).join('');
  $('#suggestions').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) send(b.textContent); });
  document.querySelectorAll('[data-intent]').forEach((b) => b.addEventListener('click', () => send(b.textContent, b.dataset.intent)));
  $('#chat-form').addEventListener('submit', (e) => { e.preventDefault(); const text = input.value; input.value = ''; send(text); });
}

// Catalogue : recherche et filtres (matière, niveau) appliqués en JavaScript sur des données structurées.
import { bootstrap } from '../app.js';
import { LEVELS, SUBJECTS, SUBJECT_META } from '../config.js';
import { listSimulations } from '../services/simulation-service.js';
import { $, debounce, escapeHtml, getParam, normalize } from '../utils/dom.js';
import { icon } from '../utils/icons.js';
import { emptyHtml, errorHtml, loadingHtml } from '../utils/notifications.js';

const user = await bootstrap({ roles: ['student', 'teacher'], active: 'simulations' });
const grid = $('#catalog-grid');
const filters = { q: '', subject: SUBJECTS.includes(getParam('matiere')) ? getParam('matiere') : '', level: '' };
let simulations = [];

function radioList(name, values, label) {
  const items = [['', label], ...values.map((v) => [v, v])];
  return items.map(([value, text]) => `<label class="radio"><input type="radio" name="${name}" value="${escapeHtml(value)}" ${filters[name] === value ? 'checked' : ''}>${escapeHtml(text)}</label>`).join('');
}
const matches = (s) =>
  (!filters.subject || s.subject === filters.subject) &&
  (!filters.level || s.level === filters.level) &&
  (!filters.q || normalize(`${s.title} ${s.description}`).includes(normalize(filters.q)));

function card(s) {
  const meta = SUBJECT_META[s.subject];
  return `<article class="card sim-card">
    <div class="sim-card__thumb sim-card__thumb--${meta.slug}">${icon(meta.icon)}</div>
    <h3>${escapeHtml(s.title)}</h3>
    <div class="sim-card__meta"><span class="badge">${escapeHtml(s.subject)}</span><span class="badge">${escapeHtml(s.level)}</span><span class="badge">${icon('clock')}&nbsp;${s.durationMin} min</span></div>
    <p>${escapeHtml(s.description)}</p>
    <ul class="bullet-list">${s.objectives.slice(0, 2).map((o) => `<li>${escapeHtml(o)}</li>`).join('')}</ul>
    ${s.available ? `<a class="btn btn--primary btn--sm" href="simulation-detail.html?id=${encodeURIComponent(s.id)}">Commencer</a>` : '<button class="btn btn--secondary btn--sm" type="button" disabled>Bientôt disponible</button>'}
  </article>`;
}

function render() {
  const results = simulations.filter(matches);
  $('#result-count').textContent = `${results.length} expérience${results.length > 1 ? 's' : ''} disponible${results.length > 1 ? 's' : ''}`;
  grid.innerHTML = results.length ? results.map(card).join('') : emptyHtml('Aucune simulation ne correspond', 'Essaie un autre mot ou retire un filtre.', '<button class="btn btn--secondary btn--sm" type="button" data-reset>Réinitialiser les filtres</button>');
}

function resetFilters() {
  Object.assign(filters, { q: '', subject: '', level: '' });
  $('#search').value = '';
  $('#subject-filters').innerHTML = radioList('subject', SUBJECTS, 'Toutes');
  $('#level-filters').innerHTML = radioList('level', LEVELS, 'Tous');
  render();
}

if (user) {
  $('#search').addEventListener('input', debounce((e) => { filters.q = e.target.value; render(); }, 200));
  $('#filters').addEventListener('change', (e) => { if (e.target.name) { filters[e.target.name] = e.target.value; render(); } });
  $('#reset-filters').addEventListener('click', resetFilters);
  grid.addEventListener('click', (e) => { if (e.target.closest('[data-reset]')) resetFilters(); });
  $('#subject-filters').innerHTML = radioList('subject', SUBJECTS, 'Toutes');
  $('#level-filters').innerHTML = radioList('level', LEVELS, 'Tous');
  grid.innerHTML = loadingHtml('Chargement du catalogue…');
  try { simulations = await listSimulations(); render(); } catch (error) { grid.innerHTML = errorHtml(error.message); $('#result-count').textContent = ''; }
}

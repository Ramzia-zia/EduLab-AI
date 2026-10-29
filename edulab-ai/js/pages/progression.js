// Suivi de progression : graphiques en SVG natif.
import { bootstrap } from '../app.js';
import { SUBJECT_META } from '../config.js';
import { getProgress } from '../services/progress-service.js';
import { renderBarChart, renderDonut, renderLabeledLine } from '../utils/charts.js';
import { $, escapeHtml, formatDate } from '../utils/dom.js';
import { icon } from '../utils/icons.js';
import { emptyHtml, errorHtml, loadingHtml } from '../utils/notifications.js';

const user = await bootstrap({ roles: ['student'], active: 'progress' });
if (user) load();

async function load() {
  const state = $('#progress-state');
  state.innerHTML = loadingHtml('Chargement de ton suivi…');
  try {
    const p = await getProgress();
    state.innerHTML = '';
    $('#progress-body').hidden = false;
    renderDonut($('#donut'), p.globalPercent);
    renderBarChart($('#subject-chart'), p.bySubject.map((s) => ({ label: s.subject, value: s.percent })), { title: 'Résultats par matière' });
    renderLabeledLine($('#evolution-chart'), p.scoreEvolution, { title: 'Évolution des scores' });
    $('#completed-list').innerHTML = p.completed.length ? p.completed.map((r) => `<li><span class="subject-icon subject-icon--${SUBJECT_META[r.subject]?.slug ?? ''}">${icon(SUBJECT_META[r.subject]?.icon ?? 'flask')}</span><div class="activity-list__main"><strong>${escapeHtml(r.title)}</strong><span class="text-muted text-small">${escapeHtml(r.subject)}</span></div><span class="badge badge--success">${r.score ?? '—'} %</span></li>`).join('') : emptyHtml('Aucune simulation terminée');
    $('#history-body').innerHTML = p.history.map((r) => `<tr><td>${escapeHtml(r.title)}</td><td>${r.score ?? '—'} %</td><td>${formatDate(r.date)}</td></tr>`).join('');
  } catch (error) {
    state.innerHTML = `${errorHtml(error.message)}<p><button class="btn btn--secondary" id="retry" type="button">Réessayer</button></p>`;
    $('#retry').addEventListener('click', load);
  }
}

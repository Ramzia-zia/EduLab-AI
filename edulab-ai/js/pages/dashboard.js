// Tableau de bord de l'élève.
import { bootstrap } from '../app.js';
import { SUBJECT_META } from '../config.js';
import { getDashboard } from '../services/progress-service.js';
import { $, escapeHtml, formatDate } from '../utils/dom.js';
import { icon } from '../utils/icons.js';
import { emptyHtml, errorHtml, loadingHtml } from '../utils/notifications.js';

const user = await bootstrap({ roles: ['student'], active: 'dashboard' });
if (user) { $('#student-name').textContent = user.firstName; load(); }

async function load() {
  const state = $('#dashboard-state');
  state.innerHTML = loadingHtml('Chargement de ton tableau de bord…');
  try {
    render(await getDashboard());
    state.innerHTML = '';
    $('#dashboard-body').hidden = false;
  } catch (error) {
    state.innerHTML = `${errorHtml(error.message)}<p><button class="btn btn--secondary" id="retry" type="button">Réessayer</button></p>`;
    $('#retry').addEventListener('click', load);
  }
}

function render(d) {
  $('#stat-done').textContent = `${d.simulationsDone}/${d.simulationsTotal}`;
  $('#stat-done-bar').style.width = `${(d.simulationsDone / d.simulationsTotal) * 100}%`;
  $('#stat-level').textContent = d.levelLabel;
  $('#stat-level-sub').textContent = d.levelSubject ?? '';
  $('#stat-next').textContent = d.nextActivity ? d.nextActivity.title : 'Aucune activité';
  const link = $('#stat-next-link');
  if (d.nextActivity) link.href = `simulation-detail.html?id=${encodeURIComponent(d.nextActivity.simulationId)}`; else link.hidden = true;

  // Cartes cliquables des matières : elles ouvrent le catalogue filtré
  $('#subjects-grid').innerHTML = d.subjects.map(({ subject, count }) => {
    const meta = SUBJECT_META[subject];
    return `<a class="subject-tile" href="simulations.html?matiere=${encodeURIComponent(subject)}">
      <span class="subject-icon subject-icon--${meta.slug}">${icon(meta.icon)}</span>
      <strong>${escapeHtml(subject)}</strong><span class="text-muted">${count} expérience${count > 1 ? 's' : ''}</span></a>`;
  }).join('');

  $('#quote-text').textContent = `« ${d.quote} »`;

  $('#recent-list').innerHTML = d.recent.length
    ? d.recent.map((r) => `<li><span class="subject-icon subject-icon--${SUBJECT_META[r.subject]?.slug ?? ''}">${icon(SUBJECT_META[r.subject]?.icon ?? 'flask')}</span>
        <div class="activity-list__main"><strong>${escapeHtml(r.title)}</strong><span class="text-muted text-small">${escapeHtml(r.subject)} · ${formatDate(r.date)}</span></div>
        ${r.score === null ? '' : `<span class="badge ${r.score >= 70 ? 'badge--success' : 'badge--warning'}">${r.score} %</span>`}</li>`).join('')
    : emptyHtml('Aucune activité pour l’instant', 'Lance ta première simulation pour voir apparaître ton historique.');
}

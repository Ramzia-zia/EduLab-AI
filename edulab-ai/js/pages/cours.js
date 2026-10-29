// Cours et exercices : onglets accessibles, filtre par matière, actions avec fenêtres modales.
import { bootstrap } from '../app.js';
import { SUBJECTS, SUBJECT_META } from '../config.js';
import { confirmModal, openModal } from '../components/modal.js';
import { getCoursesOverview } from '../services/course-service.js';
import { $, $$, escapeHtml } from '../utils/dom.js';
import { icon } from '../utils/icons.js';
import { emptyHtml, errorHtml, loadingHtml } from '../utils/notifications.js';

const user = await bootstrap({ roles: ['student', 'teacher'], active: 'courses' });
const DIFFICULTY_TONE = { Facile: 'badge--success', Moyen: 'badge--warning', Difficile: 'badge--danger' };
let data = null;
let subject = '';

const progressBar = (value) => `<div class="progress" role="progressbar" aria-label="Progression" aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="100"><div class="progress__bar" style="width:${value}%"></div></div>`;
const bySubject = (list) => list.filter((x) => !subject || x.subject === subject);

function renderCourses() {
  const list = bySubject(data.courses);
  $('#panel-courses').innerHTML = list.length ? list.map((c) => `<article class="card course-card">
    <div class="meta"><span class="subject-icon subject-icon--${SUBJECT_META[c.subject].slug}">${icon(SUBJECT_META[c.subject].icon)}</span><span class="badge">${escapeHtml(c.subject)}</span><span class="badge">${escapeHtml(c.level)}</span><span class="badge">${c.durationMin} min</span></div>
    <h3>${escapeHtml(c.title)}</h3><p>${escapeHtml(c.description)}</p>${progressBar(c.progress)}<span class="text-small text-muted">${c.progress} % terminé</span>
    <div><button class="btn btn--primary btn--sm" type="button" data-course="${escapeHtml(c.id)}">Consulter le cours</button></div></article>`).join('') : emptyHtml('Aucun cours pour cette matière');
}
function renderExercises() {
  const list = bySubject(data.exercises);
  $('#panel-exercises').innerHTML = list.length ? list.map((x) => `<article class="card exercise-row">
    <div class="exercise-row__main"><strong>${escapeHtml(x.title)}</strong><div class="meta"><span class="badge">${escapeHtml(x.subject)}</span><span class="badge ${DIFFICULTY_TONE[x.difficulty]}">${escapeHtml(x.difficulty)}</span><span class="text-small text-muted">${x.durationMin} min</span></div></div>
    ${progressBar(x.progress)}<button class="btn btn--primary btn--sm" type="button" data-exercise="${escapeHtml(x.id)}">${x.progress > 0 ? 'Reprendre' : 'Commencer'}</button></article>`).join('') : emptyHtml('Aucun exercice pour cette matière');
}
function renderResources() {
  const list = bySubject(data.resources);
  const ICONS = { PDF: 'file', 'Vidéo': 'video', Lien: 'link' };
  $('#panel-resources').innerHTML = list.length ? list.map((r) => `<article class="card exercise-row"><span class="subject-icon">${icon(ICONS[r.type])}</span>
    <div class="exercise-row__main"><strong>${escapeHtml(r.title)}</strong><span class="text-small text-muted">${escapeHtml(r.subject)} · ${escapeHtml(r.type)}</span></div>
    <button class="btn btn--secondary btn--sm" type="button" data-resource="${escapeHtml(r.id)}">Ouvrir</button></article>`).join('') : emptyHtml('Aucune ressource pour cette matière');
}
const renderAll = () => { renderCourses(); renderExercises(); renderResources(); };

// Onglets : clic et flèches du clavier
function selectTab(tab) {
  $$('[role="tab"]').forEach((t) => { const on = t === tab; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; $(`#${t.getAttribute('aria-controls')}`).hidden = !on; });
  tab.focus();
}

if (user) {
  $('#subject-filter').innerHTML = `<option value="">Toutes les matières</option>${SUBJECTS.map((s) => `<option>${escapeHtml(s)}</option>`).join('')}`;
  $('#subject-filter').addEventListener('change', (e) => { subject = e.target.value; renderAll(); });
  const tabs = $$('[role="tab"]');
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') selectTab(tabs[(i + 1) % tabs.length]); if (e.key === 'ArrowLeft') selectTab(tabs[(i + tabs.length - 1) % tabs.length]); });
  });

  $('#courses-state').innerHTML = loadingHtml();
  try { data = await getCoursesOverview(); $('#courses-state').innerHTML = ''; renderAll(); } catch (error) { $('#courses-state').innerHTML = errorHtml(error.message); }

  document.addEventListener('click', async (e) => {
    const course = e.target.closest('[data-course]'), exercise = e.target.closest('[data-exercise]'), resource = e.target.closest('[data-resource]');
    if (course) {
      const c = data.courses.find((x) => x.id === course.dataset.course);
      openModal({ title: c.title, bodyHtml: `<p>${escapeHtml(c.description)}</p><p class="text-small">Le contenu détaillé du cours sera fourni par le backend. Cette fenêtre est le point d’intégration.</p>` });
    } else if (exercise) {
      const x = data.exercises.find((y) => y.id === exercise.dataset.exercise);
      if (!x.simulationId) return openModal({ title: x.title, bodyHtml: '<p>Cet exercice n’est pas encore disponible. Il sera ajouté avec le contenu du backend.</p>' });
      if (await confirmModal({ title: 'Démarrer l’exercice ?', message: `${x.title} (${x.durationMin} min). La simulation va s’ouvrir.`, confirmLabel: 'Démarrer' })) location.href = `simulation-detail.html?id=${encodeURIComponent(x.simulationId)}`;
    } else if (resource) {
      const r = data.resources.find((y) => y.id === resource.dataset.resource);
      openModal({ title: r.title, bodyHtml: `<p>Ressource de type ${escapeHtml(r.type)} : le fichier sera fourni par le backend.</p>` });
    }
  });
}

// Espace enseignant : classes, élèves, activités (création / modification / suppression) et difficultés.
import { bootstrap } from '../app.js';
import { isDemoMode } from '../config.js';
import { confirmModal, openModal } from '../components/modal.js';
import { listSimulations } from '../services/simulation-service.js';
import { createActivity, deleteActivity, getStudent, getTeacherOverview, updateActivity } from '../services/teacher-service.js';
import { $, escapeHtml, formatDate } from '../utils/dom.js';
import { errorHtml, loadingHtml, emptyHtml, showMessage, toast } from '../utils/notifications.js';
import { rules, validateForm } from '../utils/validation.js';

const user = await bootstrap({ roles: ['teacher'], active: 'teacher' });
let overview = null, simulations = [], classFilter = '';
const className = (id) => overview.classes.find((c) => c.id === id)?.name ?? '—';
const simTitle = (id) => simulations.find((s) => s.id === id)?.title ?? id;

async function load() {
  const state = $('#teacher-state');
  state.innerHTML = loadingHtml('Chargement de ton espace…');
  try {
    [overview, simulations] = await Promise.all([getTeacherOverview(), listSimulations()]);
    state.innerHTML = '';
    $('#teacher-body').hidden = false;
    render();
  } catch (error) {
    state.innerHTML = `${errorHtml(error.message)}<p><button class="btn btn--secondary" id="retry" type="button">Réessayer</button></p>`;
    $('#retry').addEventListener('click', load);
  }
}

function render() {
  $('#stat-classes').textContent = overview.classes.length;
  $('#stat-students').textContent = overview.students.length;
  $('#stat-struggling').textContent = overview.students.filter((s) => s.progress < 50).length;

  // Filtres par classe
  $('#class-filters').innerHTML = [['', 'Toutes'], ...overview.classes.map((c) => [c.id, c.name])]
    .map(([id, label]) => `<button type="button" class="chip" data-class="${escapeHtml(id)}" aria-pressed="${classFilter === id}">${escapeHtml(label)}</button>`).join('');

  const students = overview.students.filter((s) => !classFilter || s.classId === classFilter);
  $('#students-body').innerHTML = students.map((s) => `<tr>
    <td><button type="button" class="student-name" data-student="${escapeHtml(s.id)}">${escapeHtml(s.name)}</button></td>
    <td>${escapeHtml(className(s.classId))}</td><td>${escapeHtml(s.subject)}</td>
    <td><div class="progress" role="progressbar" aria-label="Progression de ${escapeHtml(s.name)}" aria-valuenow="${s.progress}" aria-valuemin="0" aria-valuemax="100"><div class="progress__bar" style="width:${s.progress}%"></div></div><span class="text-small">${s.progress} %</span></td>
    <td><span class="badge ${s.progress < 50 ? 'badge--warning' : 'badge--success'}">${s.progress < 50 ? 'À suivre' : 'Bien'}</span></td>
    <td><button type="button" class="btn btn--secondary btn--sm" data-student="${escapeHtml(s.id)}">Détails</button></td></tr>`).join('');

  $('#activities-list').innerHTML = overview.activities.length ? overview.activities.map((a) => `<li class="activity-item">
    <div class="activity-item__main"><strong>${escapeHtml(a.title)}</strong><span class="text-small text-muted">${escapeHtml(simTitle(a.simulationId))} · ${escapeHtml(className(a.classId))} · à rendre le ${formatDate(a.dueDate)}</span></div>
    <button type="button" class="btn btn--secondary btn--sm" data-edit="${escapeHtml(a.id)}">Modifier</button>
    <button type="button" class="btn btn--ghost btn--sm" data-delete="${escapeHtml(a.id)}">Supprimer</button></li>`).join('')
    : emptyHtml('Aucune activité attribuée', 'Crée une activité pour l’attribuer à une classe.');
  $('#difficulties-list').innerHTML = overview.difficulties.map((d) => `<li class="difficulty"><span>${escapeHtml(d.topic)}</span><span>${d.studentsAffected} élèves</span></li>`).join('');
}

// Formulaire de création / modification d'une activité (fenêtre modale)
function openActivityForm(activity = null) {
  const opts = (list, sel, label) => list.map((x) => `<option value="${escapeHtml(x.id)}" ${x.id === sel ? 'selected' : ''}>${escapeHtml(x[label])}</option>`).join('');
  openModal({
    title: activity ? 'Modifier l’activité' : 'Nouvelle activité',
    bodyHtml: `<form id="activity-form" novalidate class="stack">
      <div class="field"><label class="field__label" for="title">Titre</label><input class="field__input" id="title" name="title" value="${escapeHtml(activity?.title ?? '')}"></div>
      <div class="field"><label class="field__label" for="simulationId">Simulation</label><select class="field__input" id="simulationId" name="simulationId">${opts(simulations.filter((s) => s.available), activity?.simulationId, 'title')}</select></div>
      <div class="field"><label class="field__label" for="classId">Classe</label><select class="field__input" id="classId" name="classId">${opts(overview.classes, activity?.classId, 'name')}</select></div>
      <div class="field"><label class="field__label" for="dueDate">Date limite</label><input class="field__input" id="dueDate" name="dueDate" type="date" value="${escapeHtml(activity?.dueDate ?? '')}"></div>
      <div id="activity-message" hidden></div></form>`,
    actions: [
      { label: 'Annuler', variant: 'secondary' },
      {
        label: 'Enregistrer', variant: 'primary',
        async onClick({ root }) {
          const form = root.querySelector('#activity-form');
          const { valid, values } = validateForm(form, { title: [rules.required('Donne un titre.')], simulationId: [rules.required('Choisis une simulation.')], classId: [rules.required('Choisis une classe.')], dueDate: [rules.required('Choisis une date limite.')] });
          if (!valid) return false;
          try {
            if (activity) await updateActivity(activity.id, values); else await createActivity(values);
            toast(isDemoMode() ? 'Enregistré localement (démonstration, temporaire).' : 'Activité enregistrée.', 'success');
            await load();
          } catch (error) { showMessage(root.querySelector('#activity-message'), error.message, 'error'); return false; }
        },
      },
    ],
  });
}

async function showStudent(id) {
  const box = $('#student-detail');
  box.hidden = false;
  box.innerHTML = loadingHtml('Chargement de l’élève…');
  try {
    const s = await getStudent(id);
    box.innerHTML = `<div class="detail-head"><h2>${escapeHtml(s.name)} · ${escapeHtml(className(s.classId))}</h2><button type="button" class="btn btn--secondary btn--sm" id="close-detail">Fermer</button></div>
      <p class="text-muted text-small">${escapeHtml(s.email)} · Moyenne ${s.averageScore} % · Progression ${s.progress} %</p>
      <ul class="activity-list">${s.results.map((r) => `<li><div class="activity-list__main"><strong>${escapeHtml(r.title)}</strong><span class="text-muted text-small">${escapeHtml(r.subject)} · ${formatDate(r.date)}</span></div><span class="badge">${r.score ?? '—'} %</span></li>`).join('')}</ul>`;
    $('#close-detail').addEventListener('click', () => { box.hidden = true; });
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (error) { box.innerHTML = errorHtml(error.message); }
}

if (user) {
  if (isDemoMode()) showMessage($('[data-teacher-note]'), 'Démonstration : les créations, modifications et suppressions sont locales et temporaires (propres à cet onglet).', 'info');
  $('#new-activity').addEventListener('click', () => overview && openActivityForm());
  $('#teacher-body').addEventListener('click', async (e) => {
    const chip = e.target.closest('[data-class]'), student = e.target.closest('[data-student]'), edit = e.target.closest('[data-edit]'), del = e.target.closest('[data-delete]');
    if (chip) { classFilter = chip.dataset.class; render(); }
    else if (student) showStudent(student.dataset.student);
    else if (edit) openActivityForm(overview.activities.find((a) => a.id === edit.dataset.edit));
    else if (del && await confirmModal({ title: 'Supprimer l’activité ?', message: 'Cette action est définitive.', confirmLabel: 'Supprimer', danger: true })) {
      try { await deleteActivity(del.dataset.delete); toast('Activité supprimée.', 'success'); await load(); } catch (error) { toast(error.message, 'error'); }
    }
  });
  load();
}

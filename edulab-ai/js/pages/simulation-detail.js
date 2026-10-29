// CONTENEUR D'INTERFACE d'une simulation. Il n'effectue aucun calcul scientifique :
// il charge le module de la simulation (voir js/simulations/registry.js) et lui parle avec le contrat
// décrit dans docs/SIMULATIONS.md (commandes : start / reset / goToStep ; événements : onEvent).
import { bootstrap } from '../app.js';
import { isDemoMode } from '../config.js';
import { SIMULATIONS_REGISTRY } from '../simulations/registry.js';
import { getSimulation, saveResult } from '../services/simulation-service.js';
import { $, escapeHtml, getParam } from '../utils/dom.js';
import { renderLineChart } from '../utils/charts.js';
import { emptyHtml, errorHtml, loadingHtml, showMessage } from '../utils/notifications.js';

const user = await bootstrap({ roles: ['student', 'teacher'], active: 'simulations' });
if (user) init();

async function init() {
  const id = getParam('id');
  const state = $('#sim-state');
  state.innerHTML = loadingHtml('Chargement de la simulation…');
  let simulation;
  try { simulation = await getSimulation(id); } catch (error) { state.innerHTML = errorHtml(error.message); return; }

  $('#sim-title').textContent = simulation.title;
  $('#sim-meta').textContent = `${simulation.subject} · ${simulation.level} · ${simulation.durationMin} min`;
  document.title = `${simulation.title} – EduLab AI`;

  const loadModule = SIMULATIONS_REGISTRY[simulation.id];
  if (!simulation.available || !loadModule) {
    state.innerHTML = emptyHtml('Simulation pas encore intégrée', 'Le moteur de cette expérience n’a pas encore été ajouté par l’équipe simulations (voir docs/SIMULATIONS.md).');
    return;
  }
  let module;
  try { module = await loadModule(); } catch { state.innerHTML = errorHtml('Impossible de charger cette simulation.'); return; }
  state.innerHTML = module.definition.isDemo
    ? '<div class="form-message form-message--info">Simulation de <strong>démonstration</strong> : les mesures sont fictives, aucun calcul scientifique réel n’est effectué.</div>' : '';
  $('#lab').hidden = false;
  runLab(simulation, module);
}

function runLab(simulation, { definition, mount }) {
  const stage = $('#sim-stage');
  let step = 0, measures = [], points = [], finished = null, controller = null;

  // Panneaux d'information (matériel, consignes)
  $('#instruments-list').innerHTML = definition.instruments.map((i) => `<li>${escapeHtml(i.name)}${i.description ? `<small>${escapeHtml(i.description)}</small>` : ''}</li>`).join('');
  $('#instructions-list').innerHTML = definition.instructions.map((c) => `<li>${escapeHtml(c)}</li>`).join('');
  $('#chart-card').hidden = !definition.chart;

  const renderSteps = () => {
    $('#steps-list').innerHTML = definition.steps.map((s, i) => `<li class="step ${i === step ? 'is-current' : ''} ${i < step ? 'is-done' : ''}" ${i === step ? 'aria-current="step"' : ''}>
      <span class="step__num">${i < step ? '✓' : i + 1}</span><span><strong>${escapeHtml(s.title)}</strong>${i === step ? `<small>${escapeHtml(s.instruction)}</small>` : ''}</span></li>`).join('');
    $('[data-action="prev"]').disabled = step === 0;
    $('[data-action="next"]').disabled = step >= definition.steps.length - 1;
  };
  const renderResults = () => {
    $('#measures-list').innerHTML = measures.length ? measures.map((m) => `<li>${escapeHtml(m.label)} : <strong>${escapeHtml(m.value)} ${escapeHtml(m.unit ?? '')}</strong></li>`).join('') : '<li class="text-muted">Aucune mesure pour l’instant.</li>';
    $('#save-result').disabled = !(measures.length || finished);
    const last = measures[measures.length - 1];
    $('#live-label').textContent = last ? last.label : 'Mesure en cours';
    $('#live-value').textContent = last ? last.value : '–';
    if (definition.chart && points.length) renderLineChart($('#sim-chart'), points, { ...definition.chart, title: `${definition.chart.yLabel} en fonction de ${definition.chart.xLabel}` });
  };

  // Réception des événements envoyés par la simulation
  const onEvent = (e) => {
    if (e.type === 'step-changed') step = e.step;
    else if (e.type === 'measurement') measures.push(e.measurement);
    else if (e.type === 'chart-point') points.push(e.point);
    else if (e.type === 'finished') finished = e.result;
    renderSteps(); renderResults();
  };
  const onError = (error) => { const box = $('#sim-error'); showMessage(box, error.message ?? 'Erreur de la simulation.', 'error'); };

  controller = mount(stage, { params: definition.defaultParams, onEvent, onError });
  renderSteps(); renderResults();

  $('[data-action="start"]').addEventListener('click', () => { controller.start(); $('[data-action="start"]').disabled = true; });
  $('[data-action="reset"]').addEventListener('click', () => {
    controller.reset(); step = 0; measures = []; points = []; finished = null;
    $('[data-action="start"]').disabled = false; $('#sim-chart').innerHTML = ''; $('#save-status').textContent = ''; $('#sim-error').hidden = true;
    renderSteps(); renderResults();
  });
  const go = (n) => { step = Math.max(0, Math.min(definition.steps.length - 1, n)); controller.goToStep(step); renderSteps(); };
  $('[data-action="prev"]').addEventListener('click', () => go(step - 1));
  $('[data-action="next"]').addEventListener('click', () => go(step + 1));

  $('#save-result').addEventListener('click', async () => {
    const button = $('#save-result'), status = $('#save-status');
    button.disabled = true; status.textContent = 'Enregistrement…';
    try {
      await saveResult(finished ?? { simulationId: simulation.id, score: null, measures, durationSec: 0 });
      status.textContent = isDemoMode() ? 'Enregistré localement et temporairement (démonstration).' : 'Résultat enregistré.';
      status.className = 'text-small text-success';
    } catch (error) { status.textContent = error.message; status.className = 'text-small text-danger'; button.disabled = false; }
  });
}

// ============================================================================
// SIMULATION DE DÉMONSTRATION — DONNÉES FICTIVES
// Ce module ne fait AUCUN calcul scientifique : il rejoue des valeurs écrites à la main pour montrer
// comment le conteneur (simulation-detail.js) et un moteur de simulation se parlent.
// C'est aussi un MODÈLE à copier pour une vraie simulation (voir docs/SIMULATIONS.md).
//
// CONTRAT : un module de simulation exporte
//   - definition : description de l'expérience (instruments, étapes, consignes, graphique)
//   - mount(container, { params, onEvent, onError }) -> { start(), reset(), goToStep(i), destroy() }
// Événements envoyés au conteneur avec onEvent({ type, ... }) :
//   ready | started | step-changed {step} | measurement {measurement:{label,value,unit}}
//   | chart-point {point:{x,y}} | finished {result:{simulationId,score,measures,durationSec}}
// ============================================================================
export const definition = {
  id: 'titrage-acide-base',
  isDemo: true,
  instruments: [
    { name: 'Burette graduée', description: 'Contient la solution de soude.' },
    { name: 'Erlenmeyer', description: 'Contient l’acide à doser.' },
    { name: 'Solution acide' },
    { name: 'Solution basique' },
    { name: 'Indicateur coloré' },
  ],
  steps: [
    { title: 'Préparer le montage', instruction: 'Place l’acide dans l’erlenmeyer et la soude dans la burette.' },
    { title: 'Ajouter l’indicateur', instruction: 'Ajoute quelques gouttes d’indicateur coloré.' },
    { title: 'Verser la soude', instruction: 'Verse la soude progressivement et relève le pH.' },
    { title: 'Observer le changement', instruction: 'Repère le saut de pH et le changement de couleur.' },
  ],
  instructions: ['Verse la soude par petits volumes.', 'Ralentis près du saut de pH.', 'Note le volume à l’équivalence.'],
  chart: { xLabel: 'Volume de soude (mL)', yLabel: 'pH' },
};

// Valeurs FICTIVES écrites à la main
const FAKE_POINTS = [
  { v: 0, ph: 1.1 }, { v: 5, ph: 1.3 }, { v: 10, ph: 1.6 }, { v: 15, ph: 2.0 }, { v: 19, ph: 2.8 },
  { v: 20, ph: 7.0 }, { v: 21, ph: 11.0 }, { v: 25, ph: 11.8 }, { v: 30, ph: 12.1 },
];

export function mount(container, { onEvent }) {
  let index = -1;
  let running = false;

  container.innerHTML = `
    <div class="form-message form-message--info"><strong>DONNÉES FICTIVES</strong> : cette zone est un exemple. Le vrai moteur de titrage sera fourni par l'équipe simulations.</div>
    <div class="demo-sim">
      <svg viewBox="0 0 120 180" class="demo-sim__svg" role="img" aria-label="Schéma fictif d'une burette et d'un erlenmeyer">
        <rect x="52" y="6" width="16" height="80" rx="3" fill="#fff" stroke="#8aa0b4" stroke-width="2"/>
        <rect data-liquid x="54" y="6" width="12" height="80" fill="#9CC3E6"/>
        <path d="M44 100h32l30 62q5 10-6 10H20q-11 0-6-10z" fill="#fff" stroke="#8aa0b4" stroke-width="2"/>
        <path data-flask d="M30 140h60l16 32H14z" fill="#BBD9EE"/>
      </svg>
      <div>
        <p class="text-muted text-small">pH (valeur fictive)</p><p class="demo-sim__ph" data-ph>–</p>
        <p class="text-muted text-small">Volume : <span data-volume>0</span> mL</p>
        <button type="button" class="btn btn--primary" data-pour disabled>Verser (étape suivante fictive)</button>
        <p class="text-muted text-small" data-hint>Clique sur « Démarrer » pour commencer.</p>
      </div>
    </div>`;

  const pourButton = container.querySelector('[data-pour]');
  const draw = () => {
    const point = FAKE_POINTS[index];
    container.querySelector('[data-ph]').textContent = point ? point.ph.toFixed(1) : '–';
    container.querySelector('[data-volume]').textContent = point ? point.v : 0;
    container.querySelector('[data-liquid]').setAttribute('y', point ? 6 + point.v * 2.4 : 6);
    container.querySelector('[data-liquid]').setAttribute('height', point ? 80 - point.v * 2.4 : 80);
    container.querySelector('[data-flask]').setAttribute('fill', point && point.ph > 8 ? '#E879B9' : '#BBD9EE');
  };

  pourButton.addEventListener('click', () => {
    if (!running || index >= FAKE_POINTS.length - 1) return;
    index += 1;
    const { v, ph } = FAKE_POINTS[index];
    draw();
    onEvent({ type: 'chart-point', point: { x: v, y: ph } });
    onEvent({ type: 'measurement', measurement: { label: 'pH (fictif)', value: ph } });
    if (index === FAKE_POINTS.length - 1) {
      pourButton.disabled = true;
      onEvent({ type: 'finished', result: { simulationId: definition.id, score: null, measures: [{ label: 'Volume final (fictif)', value: v, unit: 'mL' }], durationSec: 0 } });
    }
  });

  onEvent({ type: 'ready' });
  return {
    start() { running = true; pourButton.disabled = false; container.querySelector('[data-hint]').textContent = ''; onEvent({ type: 'started' }); },
    reset() { running = false; index = -1; pourButton.disabled = true; container.querySelector('[data-hint]').textContent = 'Clique sur « Démarrer » pour commencer.'; draw(); },
    goToStep() { /* la démonstration n'a pas de comportement lié aux étapes */ },
    destroy() { container.innerHTML = ''; },
  };
}

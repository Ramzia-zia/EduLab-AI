import { isDemoMode } from '../config.js';
import { DEMO_PROGRESS, DEMO_QUOTE, DEMO_RESULTS, DEMO_SIMULATIONS, demoDelay, getDemoState } from '../data/demo-data.js';
import { get } from './api-client.js';
import { ENDPOINTS } from './endpoints.js';

// Données du tableau de bord élève
export async function getDashboard() {
  if (!isDemoMode()) return get(ENDPOINTS.dashboard);
  const results = getDemoState('results', DEMO_RESULTS);
  return demoDelay({
    simulationsDone: new Set(results.map((r) => r.simulationId)).size,
    simulationsTotal: DEMO_SIMULATIONS.length,
    levelLabel: 'Intermédiaire',
    levelSubject: 'en chimie',
    progressPercent: DEMO_PROGRESS.globalPercent,
    nextActivity: { simulationId: 'titrage-acide-base', title: 'Titrage acide-base', when: 'Aujourd’hui' },
    subjects: ['Physique', 'Chimie', 'SVT', 'Mathématiques'].map((subject) => ({ subject, count: DEMO_SIMULATIONS.filter((s) => s.subject === subject).length })),
    recent: results.slice(0, 4),
    quote: DEMO_QUOTE,
  });
}

// Données de la page de suivi
export async function getProgress() {
  if (!isDemoMode()) return get(ENDPOINTS.progress);
  const results = getDemoState('results', DEMO_RESULTS);
  return demoDelay({ ...DEMO_PROGRESS, completed: results, history: results });
}

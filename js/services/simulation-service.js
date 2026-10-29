import { isDemoMode } from '../config.js';
import { DEMO_RESULTS, DEMO_SIMULATIONS, demoDelay, getDemoState, newDemoId, setDemoState } from '../data/demo-data.js';
import { ApiError, get, post } from './api-client.js';
import { ENDPOINTS } from './endpoints.js';

export async function listSimulations() {
  return isDemoMode() ? demoDelay(DEMO_SIMULATIONS) : get(ENDPOINTS.simulations);
}

export async function getSimulation(id) {
  if (!isDemoMode()) return get(ENDPOINTS.simulation(id));
  const found = DEMO_SIMULATIONS.find((s) => s.id === id);
  if (!found) throw new ApiError('Simulation introuvable.', { status: 404 });
  return demoDelay(found, 200);
}

// Enregistre le résultat d'une simulation. Démo : copie locale TEMPORAIRE. API : sauvegarde définitive.
export async function saveResult(result) {
  if (!isDemoMode()) return post(ENDPOINTS.simulationResults(result.simulationId), result);
  const sim = DEMO_SIMULATIONS.find((s) => s.id === result.simulationId);
  const results = getDemoState('results', DEMO_RESULTS);
  results.unshift({ id: newDemoId('r'), simulationId: result.simulationId, title: sim?.title ?? result.simulationId, subject: sim?.subject ?? 'Chimie', score: result.score, date: new Date().toISOString() });
  setDemoState('results', results);
  return demoDelay({ ok: true, local: true });
}

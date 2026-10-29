// L'assistant IA est joint via le BACKEND. Aucune clé d'un fournisseur d'IA ne doit exister dans le navigateur.
import { isDemoMode } from '../config.js';
import { DEMO_ASSISTANT, demoDelay } from '../data/demo-data.js';
import { post } from './api-client.js';
import { ENDPOINTS } from './endpoints.js';

export const getSuggestions = () => DEMO_ASSISTANT.suggestions; // en mode API : à fournir par le backend

// intent : 'question' | 'explain' | 'hint' | 'restart'
export async function sendMessage({ message, intent = 'question', simulationId = null }) {
  if (isDemoMode()) {
    const text = DEMO_ASSISTANT.replies[intent] ?? DEMO_ASSISTANT.replies.question;
    return demoDelay({ role: 'assistant', content: text, demo: true }, 900);
  }
  return post(ENDPOINTS.assistant, { message, intent, simulationId });
}

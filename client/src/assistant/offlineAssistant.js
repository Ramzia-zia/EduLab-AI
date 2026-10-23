import { tokenize } from './text.js';

const KEYWORD_POINTS = 2;
const QUESTION_WORD_POINTS = 1;
const MIN_SCORE = 0.4;

/**
 * Score d'une entrée de FAQ pour une question, entre 0 et 1.
 * Un mot-clé reconnu vaut 2 points, un simple mot de l'intitulé 1 point ;
 * le total est rapporté au maximum possible pour cette question.
 */
function scoreEntry(queryTokens, entry) {
  const keywordTokens = new Set((entry.keywords ?? []).flatMap(tokenize));
  const questionTokens = new Set(tokenize(entry.question));

  let points = 0;
  for (const token of queryTokens) {
    if (keywordTokens.has(token)) points += KEYWORD_POINTS;
    else if (questionTokens.has(token)) points += QUESTION_WORD_POINTS;
  }
  return points / (KEYWORD_POINTS * queryTokens.size);
}

/**
 * Cherche dans la FAQ locale la réponse la plus proche de la question.
 * @returns {{ answer: string, score: number, entryId: string } | null}
 */
export function findBestAnswer(question, entries, { minScore = MIN_SCORE } = {}) {
  const queryTokens = new Set(tokenize(question));
  if (queryTokens.size === 0) return null;

  let best = null;
  for (const entry of entries) {
    const score = scoreEntry(queryTokens, entry);
    if (!best || score > best.score) best = { entry, score };
  }
  if (!best || best.score < minScore) return null;
  return { answer: best.entry.answer, score: best.score, entryId: best.entry.id };
}

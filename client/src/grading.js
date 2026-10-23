/**
 * Correction automatique des exercices, 100 % locale (donc utilisable hors ligne).
 * Les formes de `answer_key` sont décrites dans le schéma SQL (table `exercises`).
 */

/** Compare des équations : sans accents, sans espaces, flèche et « = » unifiés. */
function canonicalEquation(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/-->|->|=>|→|=/g, '->')
    .replace(/\s+/g, '');
}

/** Lit « 10,5 », « 10.5 mL » ou « 10 » ; renvoie null si aucun nombre. */
export function parseDecimal(value) {
  const match = String(value ?? '').match(/-?\d+(?:[.,]\d+)?/);
  return match ? Number(match[0].replace(',', '.')) : null;
}

const graders = {
  qcm: (key, answer) => Number(answer) === key.correct,

  numeric: (key, answer) => {
    const value = parseDecimal(answer);
    return value !== null && Math.abs(value - key.value) <= (key.tolerance ?? 0);
  },

  text: (key, answer) => {
    const given = canonicalEquation(answer);
    return given.length > 0 && key.accepted.some((accepted) => canonicalEquation(accepted) === given);
  },
};

/**
 * @param {{ kind: 'qcm'|'numeric'|'text', answer_key: object }} exercise
 * @param {number|string} answer  qcm : indice du choix · numeric/text : saisie de l'élève
 * @returns {{ correct: boolean, score: 0|100 }}
 */
export function gradeExercise(exercise, answer) {
  const grader = graders[exercise.kind];
  if (!grader) throw new Error(`Type d'exercice inconnu : ${exercise.kind}`);
  const correct = grader(exercise.answer_key, answer);
  return { correct, score: correct ? 100 : 0 };
}

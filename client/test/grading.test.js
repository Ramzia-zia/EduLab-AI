import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { gradeExercise, parseDecimal } from '../src/grading.js';
import { summarizeAttempts } from '../src/results/attemptsRepository.js';

describe('parseDecimal', () => {
  it('accepte la virgule française et les unités', () => {
    assert.equal(parseDecimal('10,5 mL'), 10.5);
    assert.equal(parseDecimal('abc'), null);
  });
});

describe('gradeExercise', () => {
  const numeric = { kind: 'numeric', answer_key: { value: 10, tolerance: 0.1 } };
  const qcm = { kind: 'qcm', answer_key: { correct: 1 } };
  const text = { kind: 'text', answer_key: { accepted: ['2H2 + O2 -> 2H2O'] } };

  it('numérique : dans la tolérance', () => {
    assert.deepEqual(gradeExercise(numeric, '10,05'), { correct: true, score: 100 });
  });
  it('numérique : hors tolérance ou illisible', () => {
    assert.equal(gradeExercise(numeric, '12').correct, false);
    assert.equal(gradeExercise(numeric, '').correct, false);
  });
  it('qcm : compare l\'indice du choix', () => {
    assert.equal(gradeExercise(qcm, 1).correct, true);
    assert.equal(gradeExercise(qcm, '1').correct, true);
    assert.equal(gradeExercise(qcm, 0).correct, false);
  });
  it('texte : ignore espaces, casse et style de flèche', () => {
    assert.equal(gradeExercise(text, '2h2+o2 → 2h2o').correct, true);
    assert.equal(gradeExercise(text, 'H2 + O2 -> H2O').correct, false);
  });
  it('type inconnu : lève une erreur explicite', () => {
    assert.throws(() => gradeExercise({ kind: 'dessin', answer_key: {} }, 'x'), /inconnu/);
  });
});

describe('summarizeAttempts', () => {
  it('résume un historique vide', () => {
    assert.deepEqual(summarizeAttempts([]), { attemptsCount: 0, activitiesDone: 0, averageScore: null });
  });
  it('compte les activités distinctes et la moyenne', () => {
    const attempts = [
      { exercise_id: 'a', score: 50 },
      { exercise_id: 'a', score: 100 },
      { simulation_id: 's', score: 90 },
    ];
    assert.deepEqual(summarizeAttempts(attempts), { attemptsCount: 3, activitiesDone: 2, averageScore: 80 });
  });
});

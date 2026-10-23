import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { assistantRequestSchema } from '../src/schemas/assistant.js';
import { syncAttemptsBodySchema } from '../src/schemas/attempts.js';

const validAttempt = {
  id: '0b6f0f0e-6c0e-4b7e-9d5e-2f6f3f1d9a11',
  exercise_id: '5d0f6b0a-2f3c-4f1c-8a77-0d3c1b2a9e10',
  score: 80,
  completed_at: '2026-10-21T10:00:00.000Z',
};

describe('syncAttemptsBodySchema', () => {
  it('accepte un essai valide et complète le payload', () => {
    const parsed = syncAttemptsBodySchema.parse({ attempts: [validAttempt] });
    assert.deepEqual(parsed.attempts[0].payload, {});
  });
  it('refuse un score hors limites', () => {
    assert.throws(() => syncAttemptsBodySchema.parse({ attempts: [{ ...validAttempt, score: 120 }] }));
  });
  it('refuse un essai sans exercice ni simulation', () => {
    const { exercise_id: _omit, ...withoutTarget } = validAttempt;
    assert.throws(() => syncAttemptsBodySchema.parse({ attempts: [withoutTarget] }));
  });
  it('refuse un lot vide', () => {
    assert.throws(() => syncAttemptsBodySchema.parse({ attempts: [] }));
  });
});

describe('assistantRequestSchema', () => {
  it('applique les valeurs par défaut', () => {
    const parsed = assistantRequestSchema.parse({ message: '  Pourquoi ?  ' });
    assert.equal(parsed.message, 'Pourquoi ?');
    assert.equal(parsed.hint_level, 1);
    assert.deepEqual(parsed.history, []);
  });
  it('refuse un message vide', () => {
    assert.throws(() => assistantRequestSchema.parse({ message: '   ' }));
  });
});

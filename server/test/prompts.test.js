import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildSystemPrompt, toProviderMessages } from '../src/ai/prompts.js';

describe('toProviderMessages', () => {
  it('ajoute le message courant en dernier, avec le rôle user', () => {
    const result = toProviderMessages([], 'Bonjour');
    assert.deepEqual(result, [{ role: 'user', content: 'Bonjour' }]);
  });

  it('convertit student en user et garde l\'alternance', () => {
    const history = [
      { role: 'student', content: 'Pourquoi rose ?' },
      { role: 'assistant', content: 'Observe l\'indicateur.' },
    ];
    const result = toProviderMessages(history, 'Et après ?');
    assert.deepEqual(result.map((m) => m.role), ['user', 'assistant', 'user']);
  });

  it('fusionne les messages consécutifs du même rôle', () => {
    const history = [{ role: 'student', content: 'A' }];
    const result = toProviderMessages(history, 'B');
    assert.deepEqual(result, [{ role: 'user', content: 'A\nB' }]);
  });

  it('retire les messages assistant en tête d\'historique', () => {
    const history = [{ role: 'assistant', content: 'Salut' }];
    const result = toProviderMessages(history, 'Question');
    assert.equal(result[0].role, 'user');
  });
});

describe('buildSystemPrompt', () => {
  it('contient les règles de base sans contexte', () => {
    const prompt = buildSystemPrompt();
    assert.match(prompt, /JAMAIS la réponse finale/);
    assert.doesNotMatch(prompt, /Exercice en cours/);
  });

  it('décrit l\'exercice et le niveau d\'indice demandé', () => {
    const prompt = buildSystemPrompt({
      hintLevel: 3,
      context: { exercise: { title: 'T', statement: 'Énoncé', kind: 'qcm', options: ['a', 'b'] } },
    });
    assert.match(prompt, /Niveau d'indice 3/);
    assert.match(prompt, /Énoncé/);
    assert.match(prompt, /1\) a ; 2\) b/);
  });
});
